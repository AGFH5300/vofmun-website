// app/api/parse-experience/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GEMINI_FALLBACK_MODEL_IDS,
  GEMINI_MODEL_ID,
} from "@/lib/gemini";

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

function splitIntoExperienceLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) return [];
      return trimmed
        .split(/[;•·]/)
        .map((segment) => segment.trim())
        .filter(Boolean);
    })
    .filter((segment) => {
      return !/^(completed muns|delegate|chairing)\s*:?\s*$/i.test(segment);
    });
}

function buildNumberedExperienceBlock(lines: string[]): string {
  return lines.map((line, index) => `${index + 1}. ${line}`).join("\n");
}

function buildPrompt(roleType: "chair" | "admin", text: string, extraContext?: string) {
  const isChair = roleType === "chair";
  const lines = splitIntoExperienceLines(text);
  const numberedLines = buildNumberedExperienceBlock(lines);
  const userContext =
    extraContext && typeof extraContext === "string"
      ? `\n\nAdditional context (optional):\n${extraContext}`
      : "";

  return `
You extract structured ${isChair ? "chair" : "admin"} experiences.

Return ONLY valid JSON. Return a JSON array and follow this shape exactly.
You are given a numbered list of experience fragments.
Many lines map cleanly to a single experience, but some lines may contain multiple conferences or roles.
Your job is to extract a JSON array of distinct experiences.
Do NOT merge different conferences or roles into a single item.
Whenever a line clearly contains multiple conferences/roles (different conferences, locations, or years),
create multiple array items.
It is OK if the array has more items than there are lines, as long as each item corresponds to
some distinct experience from the text.
If you are unsure, err on the side of extracting more items rather than fewer.
Extract as many experiences as possible; do not summarize.
If a field is missing, use an empty string instead of omitting it.

${
  isChair
    ? `[
  {"conference":"string","position":"string","year":"string","description":"string (optional)"}
]`
    : `[
  {"role":"string","organization":"string","year":"string","description":"string (optional)"}
]`
}

Numbered experience lines:
${numberedLines || "(no valid experience lines found)"}
${userContext}
`.trim();
}

const CHAIR_FIELDS = ["conference", "position", "year", "description"] as const;
const ADMIN_FIELDS = ["role", "organization", "year", "description"] as const;

function coerceString(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeExperience(
  value: unknown,
  roleType: "chair" | "admin"
): ChairExp | AdminExp | null {
  if (!value || typeof value !== "object") return null;
  const fields = roleType === "chair" ? CHAIR_FIELDS : ADMIN_FIELDS;
  const normalized = Object.fromEntries(
    fields.map((field) => [field, coerceString((value as Record<string, unknown>)[field])])
  ) as ChairExp | AdminExp;

  const hasAnyField = fields.some((field) => (normalized as Record<string, string>)[field]);
  return hasAnyField ? normalized : null;
}

function looksLikeExperienceObject(value: unknown, roleType: "chair" | "admin") {
  if (!value || typeof value !== "object") return false;
  const fields = roleType === "chair" ? CHAIR_FIELDS : ADMIN_FIELDS;
  return fields.some((field) => Object.prototype.hasOwnProperty.call(value, field));
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
  prompt?: string;
  text: string;
  expectedCount?: number;
}) {
  const { apiKey, modelName, roleType, prompt, text, expectedCount } = opts;
  const genAI = new GoogleGenerativeAI(apiKey);
  const isChair = roleType === "chair";
  const model = genAI.getGenerativeModel({ model: modelName });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: buildPrompt(roleType, text, prompt) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: makeSchema(isChair),
      },
    });

    const raw = result.response?.text() ?? "";
    const parsed = JSON.parse(raw);
    let candidates: unknown[] = [];

    if (Array.isArray(parsed)) {
      candidates = parsed;
    } else if (parsed && typeof parsed === "object") {
      const parsedObj = parsed as { experiences?: unknown };
      if (Array.isArray(parsedObj.experiences)) {
        candidates = parsedObj.experiences;
      } else if (looksLikeExperienceObject(parsedObj, roleType)) {
        candidates = [parsedObj];
      }
    }

    if (candidates.length === 0) {
      throw new Error("Response did not contain any experience entries");
    }

    const total = candidates.length;
    const experiences = candidates
      .map((exp) => normalizeExperience(exp, roleType))
      .filter((exp): exp is ChairExp | AdminExp => Boolean(exp));
    const discarded = total - experiences.length;

    if (discarded > 0) {
      console.info("Experience parsing: filtered empty entries", {
        modelName,
        total,
        kept: experiences.length,
        discarded,
      });
    }

    if (typeof expectedCount === "number") {
      console.log("Gemini experiences parsed", {
        modelName,
        expectedCount,
        received: experiences.length,
        emptyFiltered: discarded,
      });
    }

    if (experiences.length === 0) throw new Error("No valid experiences found");

    return experiences;
  } catch (error: any) {
    const status = error?.response?.status ?? error?.status;
    const details = error?.response?.data ?? error?.details;
    console.error("Gemini model call failed:", {
      modelName,
      status,
      message: error?.message,
      details,
    });
    throw error;
  }
}

// --- route -----------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, roleType, prompt } = body ?? {};

    // Validate user inputs
    if (!roleType || !text) {
      return NextResponse.json(
        { error: "Missing required fields: roleType and text are required." },
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

    // Prefer a 2.5 model by default; allow override via env (GEMINI_MODEL_ID).
    const preferredModel = GEMINI_MODEL_ID;
    const candidateModels = [preferredModel, ...GEMINI_FALLBACK_MODEL_IDS];

    let lastErr: any = null;

    const experienceLines = splitIntoExperienceLines(String(text));
    const expectedCount = experienceLines.length;

    for (const modelName of candidateModels) {
      try {
        const experiences = await callModelOnce({
          apiKey,
          modelName,
          roleType,
          prompt,
          text: String(text),
          expectedCount,
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
