import Avatar from "./Avatar.jsx";
import SentimentSparkline from "./SentimentSparkline.jsx";

function InsightsPanel({ otherUser, messages, onClose }) {
  const counts = { positive: 0, negative: 0, neutral: 0 };
  messages.forEach((m) => {
    const label = m.sentiment?.label || "neutral";
    counts[label] = (counts[label] || 0) + 1;
  });
  const total = messages.length || 1;

  const rows = [
    { label: "Positive", key: "positive", color: "bg-signal-positive" },
    { label: "Neutral", key: "neutral", color: "bg-signal-neutral" },
    { label: "Negative", key: "negative", color: "bg-signal-negative" },
  ];

  return (
    <div className="w-72 border-l border-ink/10 bg-paper h-full flex flex-col">
      <div className="p-4 border-b border-ink/10 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink uppercase tracking-wide">
          Insights
        </h3>
        <button onClick={onClose} className="text-slate hover:text-ink text-sm">✕</button>
      </div>

      <div className="p-5 flex flex-col items-center border-b border-ink/10">
        <Avatar name={otherUser?.username} size="h-14 w-14" />
        <p className="mt-2 font-medium text-ink text-sm">{otherUser?.username}</p>
        <p className="text-xs text-slate">{otherUser?.email}</p>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs font-mono uppercase tracking-wide text-slate">
          Sentiment breakdown
        </p>
        {rows.map((r) => {
          const pct = Math.round((counts[r.key] / total) * 100);
          return (
            <div key={r.key}>
              <div className="flex justify-between text-xs text-ink mb-1">
                <span>{r.label}</span>
                <span className="font-mono text-slate">{counts[r.key]}</span>
              </div>
              <div className="h-1.5 rounded-full bg-ink/5 overflow-hidden">
                <div className={`h-full ${r.color}`} style={{ width: `${pct}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {messages.length >= 2 && (
        <div className="p-5 border-t border-ink/10">
          <p className="text-xs font-mono uppercase tracking-wide text-slate mb-2">Mood trend</p>
          <SentimentSparkline messages={messages} />
        </div>
      )}
    </div>
  );
}

export default InsightsPanel;