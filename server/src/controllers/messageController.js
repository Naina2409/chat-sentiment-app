import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { analyzeSentiment } from "../utils/sentimentAnalyzer.js";
import { getSentiment } from "../utils/sentimentService.js";

// @route  GET /api/conversations/:id/messages
export const getMessages = async (req, res) => {
  try {
    const { id: conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not a participant in this conversation" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/conversations/:id/messages
export const sendMessage = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not a participant in this conversation" });
    }

    const trimmedText = text.trim();
   const sentiment = await getSentiment(trimmedText);
   
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text: trimmedText,
      sentiment,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await message.populate("sender", "username email");

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};