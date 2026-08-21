const colors = ["bg-signal-positive", "bg-signal-negative", "bg-signal-neutral", "bg-ink"];

function hashColor(name = "") {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

function Avatar({ name, size = "h-9 w-9" }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "?";
  return (
    <div
      className={`${size} ${hashColor(name)} rounded-full flex items-center justify-center text-paper text-xs font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}

export default Avatar;