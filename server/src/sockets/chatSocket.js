import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { getSentiment } from "../utils/sentimentService.js";

export const registerChatHandlers = (io, socket) => {
  // Join a conversation room
  socket.on("join_conversation", async (conversationId) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === socket.user._id.toString()
      );
      if (!isParticipant) return;

      socket.join(conversationId);
      console.log(`${socket.user.username} joined room ${conversationId}`);
    } catch (error) {
      console.error("join_conversation error:", error.message);
    }
  });

  // Leave a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`${socket.user.username} left room ${conversationId}`);
  });

  // Send a message in real time
  socket.on("send_message", async ({ conversationId, text }) => {
    try {
      if (!text || !text.trim()) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === socket.user._id.toString()
      );
      if (!isParticipant) return;

      const trimmedText = text.trim();
      const sentiment = await getSentiment(trimmedText);

      const message = await Message.create({
        conversation: conversationId,
        sender: socket.user._id,
        text: trimmedText,
        sentiment,
      });

      conversation.lastMessage = message._id;
      await conversation.save();

      const populatedMessage = await message.populate("sender", "username email");

      // Broadcast to everyone in the room, including sender
      io.to(conversationId).emit("receive_message", populatedMessage);
    } catch (error) {
      console.error("send_message error:", error.message);
      socket.emit("message_error", { message: "Failed to send message" });
    }
  });
};