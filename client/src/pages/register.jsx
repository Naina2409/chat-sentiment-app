import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-1.5 justify-center mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-positive"></span>
          <span className="h-1.5 w-1.5 rounded-full bg-signal-neutral"></span>
          <span className="h-1.5 w-1.5 rounded-full bg-signal-negative"></span>
        </div>

        <div className="bg-white border border-ink/10 p-8 rounded-xl shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-center text-ink mb-1">Create account</h1>
          <p className="text-sm text-slate text-center mb-6">Join and start chatting</p>

          {error && (
            <div className="mb-4 text-sm text-signal-negative bg-signal-negative/10 border border-signal-negative/20 rounded-md p-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 border border-ink/15 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-ink/15 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-ink/15 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper py-2.5 rounded-md text-sm font-medium hover:bg-ink/85 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-sm text-center text-slate mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-ink font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;