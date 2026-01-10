export const DEFAULT_GEMINI_MODEL_ID = "gemini-2.5-flash";

export const GEMINI_MODEL_ID =
  process.env.GEMINI_MODEL_ID ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL_ID;

const FALLBACK_MODEL_IDS = ["gemini-2.5-flash-lite"];

export const GEMINI_FALLBACK_MODEL_IDS = process.env.GEMINI_FALLBACK_MODEL_IDS
  ? process.env.GEMINI_FALLBACK_MODEL_IDS.split(",")
      .map((modelId) => modelId.trim())
      .filter(Boolean)
  : FALLBACK_MODEL_IDS;
