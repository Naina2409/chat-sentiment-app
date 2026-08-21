import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Avatar from "./avatar.jsx";
const dotColor = {
  positive: "bg-signal-positive",
  negative: "bg-signal-negative",
  neutral: "bg-signal-neutral",
};

function Sidebar({ onSelectConversation, selectedConversationId }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
    } catch {
      showToast("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
    } catch {
      showToast("Failed to load users");
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startConversation = async (participantId) => {
    try {
      const res = await api.post("/conversations", { participantId });
      setShowUserList(false);
      await fetchConversations();
      onSelectConversation(res.data);
    } catch {
      showToast("Failed to start conversation");
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find((p) => p._id !== user.id);
  };

  return (
    <div className="w-full sm:w-80 border-r border-ink/10 bg-paper flex flex-col h-full">
      <div className="p-4 border-b border-ink/10 flex items-center justify-between">
        <h2 className="font-display font-semibold text-ink text-sm tracking-wide uppercase">Chats</h2>
        <button
          onClick={() => {
            setShowUserList((prev) => !prev);
            if (!showUserList) fetchUsers();
          }}
          className="text-xs font-mono uppercase tracking-wide bg-ink text-paper px-2.5 py-1.5 rounded-md hover:bg-ink/85 transition-colors"
        >
          + New
        </button>
      </div>

      {showUserList && (
        <div className="border-b border-ink/10 max-h-48 overflow-y-auto bg-ink/[0.02]">
          {users.length === 0 ? (
            <p className="text-sm text-slate p-3">No other users found</p>
          ) : (
            users.map((u) => (
              <button
                key={u._id}
                onClick={() => startConversation(u._id)}
                className="w-full text-left px-4 py-2.5 hover:bg-ink/5 text-sm text-ink border-b border-ink/5 transition-colors"
              >
                {u.username}
                <span className="block text-xs text-slate font-mono">{u.email}</span>
              </button>
            ))
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-3 bg-ink/10 rounded w-1/2"></div>
                <div className="h-2 bg-ink/5 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate">No conversations yet</p>
            <p className="text-xs text-slate/70 mt-1">Click "+ New" to start one</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isActive = conv._id === selectedConversationId;
            const sentimentLabel = conv.lastMessage?.sentiment?.label;
            return (
         <button
  key={conv._id}
  onClick={() => onSelectConversation(conv)}
  className={`w-full text-left px-4 py-3.5 border-b border-ink/5 hover:bg-ink/[0.03] transition-colors flex items-start gap-3 ${
    isActive ? "bg-ink/[0.04] border-l-2 border-l-ink" : "border-l-2 border-l-transparent"
  }`}
>
  <Avatar name={other?.username} />
  <div className="min-w-0 flex-1">
    <div className="flex items-center justify-between">
      <p className="font-medium text-ink text-sm">{other?.username || "Unknown"}</p>
      {sentimentLabel && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor[sentimentLabel] || dotColor.neutral}`}></span>
      )}
    </div>
    <p className="text-xs text-slate truncate mt-0.5">
      {conv.lastMessage?.text || "No messages yet"}
    </p>
  </div>
</button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Sidebar;