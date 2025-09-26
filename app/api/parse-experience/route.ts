// app/api/parse-experience/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Types for clarity (your app can adjust as needed)
type ChairExp = {
  conference: string;
  position: string;
  year: string;
  description?: string;
};

type AdminExp = {
  role: string;
  organization: string;
  year: string;
  description?: string;
};

// Start with 2.0 (per your docs) and include robust fallbacks for AI Studio
const FALLBACK_MODELS = [
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro-001",
] as const;

// --- helpers ---------------------------------------------------------------

function makeSchema(isChair: boolean) {
  // Keep schema SIMPLE for AI Studio (no nullable, no additionalProperties)
  return {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: isChair
        ? {
            conference: { type: "STRING" },
            position: { type: "STRING" },
            year: { type: "STRING" },
            description: { type: "STRING" }, // optional because it's not in "required"
          }
        : {
            role: { type: "STRING" },
            organization: { type: "STRING" },
            year: { type: "STRING" },
            description: { type: "STRING" },
          },
      required: isChair
        ? ["conference", "position", "year"]
        : ["role", "organization", "year"],
    },
  } as const;
}

function buildPrompt(roleType: "chair" | "admin", prompt: string, extraText?: string) {
  const isChair = roleType === "chair";
  const userContext =
    extraText && typeof extraText === "string"
      ? `\n\nAdditional context:\n${extraText}`
      : "";

  return `
You extract structured ${isChair ? "chair" : "admin"} experiences.

Return ONLY a JSON array. Follow this shape exactly.

${
  isChair
    ? `[
  {"conference":"string","position":"string","year":"string","description":"string (optional)"}
]`
    : `[
  {"role":"string","organization":"string","year":"string","description":"string (optional)"}
]`
}

Source text:
${prompt}${userContext}
`.trim();
}

function looksLikePublisherAccess404(err: any) {
  const msg = String(err?.message ?? "");
  // Typical signatures when Google maps aliases to a version you can't access (…-002)
  return (
    msg.includes("Publisher Model") ||
    msg.includes("publishers/google/models/") ||
    (msg.includes("was not found") && msg.includes("models/gemini-")) ||
    msg.includes("does not have access")
  );
}

async function callModelOnce(opts: {
  apiKey: string;
  modelName: string;
  roleType: "chair" | "admin";
  prompt: string;
  text?: string;
}) {
  const { apiKey, modelName, roleType, prompt, text } = opts;
  const genAI = new GoogleGenerativeAI(apiKey);
  const isChair = roleType === "chair";
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: buildPrompt(roleType, prompt, text) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: makeSchema(isChair),
    },
  });

  const raw = result.response?.text() ?? "";
  let experiences: Array<ChairExp | AdminExp> = JSON.parse(raw);

  if (!Array.isArray(experiences)) throw new Error("Response is not an array");

  // runtime guard rails
  experiences = experiences.filter((exp: any) => {
    if (isChair) return exp?.conference && exp?.position && exp?.year;
    return exp?.role && exp?.organization && exp?.year;
  });

  if (experiences.length === 0) throw new Error("No valid experiences found");

  return experiences;
}

// --- route -----------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, roleType, prompt } = body ?? {};

    // Validate user inputs
    if (!roleType || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: roleType and prompt are required." },
        { status: 400 }
      );
    }
    if (roleType !== "chair" && roleType !== "admin") {
      return NextResponse.json(
        { error: "Invalid roleType. Must be 'chair' or 'admin'." },
        { status: 400 }
      );
    }

    // API key (AI Studio key from ai.google.dev)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Prefer your docs’ model first; allow override via env
    // Examples:
    //   GEMINI_MODEL=gemini-2.0-flash
    //   GEMINI_MODEL=gemini-1.5-flash-001
    const preferredModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const candidateModels = [preferredModel, ...FALLBACK_MODELS];

    let lastErr: any = null;

    for (const modelName of candidateModels) {
      try {
        const experiences = await callModelOnce({
          apiKey,
          modelName,
          roleType,
          prompt,
          text,
        });
        return NextResponse.json({
          success: true,
          model: modelName,
          experiences,
          count: experiences.length,
        });
      } catch (err: any) {
        lastErr = err;

        // If the first attempt failed due to publisher access/version mapping, try fallbacks
        if (modelName === preferredModel && looksLikePublisherAccess404(err)) {
          continue;
        }

        // For other parse/schema issues, also continue to next candidate
        continue;
      }
    }

    // Exhausted all models
    console.error("Experience parsing error (all models failed):", lastErr);
    const msg = String(lastErr?.message ?? "");
    if (msg.includes("API key") || msg.includes("API_KEY")) {
      return NextResponse.json(
        { error: "API configuration error. Please contact support." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error:
          "Failed to process experience with available models. Please try again or adjust your API key/project access.",
        details: msg,
      },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("Experience parsing error:", error);
    return NextResponse.json(
      { error: "Failed to process experience. Please try again." },
      { status: 500 }
    );
  }
}
