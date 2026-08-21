import { analyzeSentiment as analyzeLocal } from "./sentimentAnalyzer.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000/analyze";

export const getSentiment = async (text) => {
  try {
    const res = await fetch(ML_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) throw new Error("ML service returned non-OK status");

    const data = await res.json();
    return {
      label: data.label,
      score: data.score,
      confidence: data.confidence,
    };
  } catch (error) {
    console.warn("ML sentiment service unavailable, using local fallback:", error.message);
    return analyzeLocal(text);
  }
};