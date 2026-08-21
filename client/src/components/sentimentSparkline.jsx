const colorMap = {
  positive: "#2F9E7A",
  negative: "#D9536F",
  neutral: "#C9A227",
};

function scoreToY(score, height) {
  const clamped = Math.max(-1, Math.min(1, score || 0));
  const normalized = (clamped + 1) / 2;
  return height - normalized * height;
}

function SentimentSparkline({ messages }) {
  const recent = messages.slice(-12);
  if (recent.length < 2) return null;

  const width = 120;
  const height = 28;
  const step = width / (recent.length - 1);

  const points = recent.map((m, i) => ({
    x: i * step,
    y: scoreToY(m.sentiment?.score, height),
    label: m.sentiment?.label,
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#7A8194" strokeOpacity="0.15" strokeWidth="1" />
      <path d={path} fill="none" stroke="#7A8194" strokeOpacity="0.4" strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 3 : 2}
          fill={colorMap[p.label] || "#7A8194"}
        />
      ))}
    </svg>
  );
}

export default SentimentSparkline;