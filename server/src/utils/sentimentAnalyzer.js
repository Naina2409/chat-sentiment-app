import Sentiment from "sentiment";

const sentimentAnalyzer = new Sentiment();

export const analyzeSentiment = (text) => {
  const result = sentimentAnalyzer.analyze(text);

  let label = "neutral";
  if (result.score > 0) label = "positive";
  else if (result.score < 0) label = "negative";

  // Lexicon method has no real probabilistic confidence,
  // so we approximate one from how strong the word-match signal was.
  const confidence = Math.min(1, Math.abs(result.comparative) * 2);

  return {
    label,
    score: result.comparative,
    confidence: Number(confidence.toFixed(2)),
  };
};