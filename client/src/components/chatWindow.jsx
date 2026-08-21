import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { getSocket } from "../socket/socket";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Avatar from "./Avatar.jsx";
import InsightsPanel from "./InsightsPanel.jsx";

const sentimentDot = {
  positive: "bg-signal-positive",
  negative: "bg-signal-negative",
  neutral: "bg-signal-neutral",
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function ChatWindow({ conversation, onBack }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!conversation) return;

    let isMounted = true;
    setLoading(true);

    const loadHistory = async () => {
      try {
        const res = await api.get(`/conversations/${conversation._id}/messages`);
        if (isMounted) setMessages(res.data);
      } catch {
        showToast("Failed to load messages");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistory();
    inputRef.current?.focus();

    const socket = getSocket();
    if (socket) {
      socket.emit("join_conversation", conversation._id);

      const handleReceive = (message) => {
        if (message.conversation === conversation._id) {
          setMessages((prev) => [...prev, message]);
        }
      };

      const handleError = () => showToast("Failed to send message");

      socket.on("receive_message", handleReceive);
      socket.on("message_error", handleError);

      return () => {
        isMounted = false;
        socket.emit("leave_conversation", conversation._id);
        socket.off("receive_message", handleReceive);
        socket.off("message_error", handleError);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const socket = getSocket();
    socket.emit("send_message", {
      conversationId: conversation._id,
      text: text.trim(),
    });

    setText("");
  };

  if (!conversation) return null;

  const otherUser = conversation.participants.find((p) => p._id !== user.id);

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col flex-1 h-full bg-paper min-w-0">
        <div className="px-4 py-3 border-b border-ink/10 bg-paper flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button onClick={onBack} className="sm:hidden text-slate hover:text-ink mr-1">
                ←
              </button>
            )}
            <Avatar name={otherUser?.username} />
            <p className="font-medium text-ink text-sm">{otherUser?.username}</p>
          </div>
          <button
            onClick={() => setShowInsights((prev) => !prev)}
            className="text-xs font-mono uppercase tracking-wide border border-ink/15 text-ink px-2.5 py-1.5 rounded-md hover:bg-ink hover:text-paper transition-colors"
          >
            Insights
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink/[0.015]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`animate-pulse h-10 rounded-2xl bg-ink/10 ${
                    i % 2 === 0 ? "w-1/3 ml-auto" : "w-1/2"
                  }`}
                ></div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-slate">No messages yet — say hi</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender._id === user.id;
              const label = msg.sentiment?.label || "neutral";

              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                >
                  {!isMine && <Avatar name={msg.sender.username} size="h-7 w-7" />}
                  <div
                    className={`max-w-[75%] sm:max-w-sm px-4 py-2.5 text-sm shadow-sm ${
                      isMine
                        ? "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white rounded-2xl rounded-br-md"
                        : "bg-white text-ink border border-ink/10 rounded-2xl rounded-bl-md"
                    }`}
                  >
                    <p className="break-words leading-snug">{msg.text}</p>
                    <div className="flex items-center justify-between mt-1.5 gap-3">
                      <span className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wide ${
  isMine ? "opacity-80" : "opacity-70"
}`}>
  <span className={`h-1.5 w-1.5 rounded-full ${sentimentDot[label]}`}></span>
  {label}
  {msg.sentiment?.confidence != null && (
    <span className="opacity-60">· {Math.round(msg.sentiment.confidence * 100)}%</span>
  )}
</span>
                      <span className={`text-[10px] font-mono ${isMine ? "opacity-70" : "opacity-50"}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-ink/10 bg-paper flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-ink/15 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 bg-white"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-ink text-paper px-5 py-2.5 rounded-full hover:bg-ink/85 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>

      {showInsights && (
        <InsightsPanel
          otherUser={otherUser}
          messages={messages}
          onClose={() => setShowInsights(false)}
        />
      )}
    </div>
  );
}

export default ChatWindow;