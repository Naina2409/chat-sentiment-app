import { useState } from "react";
import Navbar from "../components/navbar.jsx";
import Sidebar from "../components/sidebar.jsx";
import ChatWindow from "../components/chatWindow.jsx";

function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-paper">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className={`${selectedConversation ? "hidden sm:flex" : "flex"} flex-col`}>
          <Sidebar
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?._id}
          />
        </div>

        <div className={`flex-1 ${selectedConversation ? "flex" : "hidden sm:flex"} bg-paper`}>
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex-1 items-center justify-center hidden sm:flex">
              <p className="text-slate text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;