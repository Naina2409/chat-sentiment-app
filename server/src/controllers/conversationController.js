import Conversation from "../models/conversation.js";

// @route  POST /api/conversations
// @desc   Get existing conversation with a user, or create a new one
export const createOrGetConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const myId = req.user._id;

    if (!participantId) {
      return res.status(400).json({ message: "participantId is required" });
    }

    if (participantId === myId.toString()) {
      return res.status(400).json({ message: "Cannot start a conversation with yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, participantId], $size: 2 },
    }).populate("participants", "username email");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, participantId],
      });
      conversation = await conversation.populate("participants", "username email");
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  GET /api/conversations
// @desc   Get all conversations for the logged-in user
export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "username email")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};