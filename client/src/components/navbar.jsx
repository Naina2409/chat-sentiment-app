import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-3.5 bg-paper border-b border-ink/10">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-positive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-positive"></span>
        </span>
        <h1 className="font-display text-lg font-semibold tracking-tight text-ink">
          Chat<span className="text-signal-positive">Sense</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate">
          <span className="text-ink font-medium">{user?.username}</span>
        </span>
        <button
          onClick={logout}
          className="text-xs font-mono uppercase tracking-wide border border-ink/15 text-ink px-3 py-1.5 rounded-md hover:bg-ink hover:text-paper transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;