import { analyzeSentiment as analyzeLocal } from "./sentimentAnalyzer.js";

const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest";
  
export const getSentiment = async (text) => {
  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HF API returned status ${res.status}`);

    const data = await res.json();

    // HF returns: [[{label: "positive", score: 0.98}, {label: "neutral", score: 0.01}, ...]]
    const scores = data[0];
    const top = scores.reduce((max, curr) => (curr.score > max.score ? curr : max));

    const label = top.label.toLowerCase();
    const confidence = top.score;
    const signedScore = label === "positive" ? confidence : label === "negative" ? -confidence : 0;

    return {
      label,
      score: signedScore,
      confidence: Number(confidence.toFixed(4)),
    };
  } catch (error) {
    console.warn("HF Inference API unavailable, using local fallback:", error.message);
    return analyzeLocal(text);
  }
};