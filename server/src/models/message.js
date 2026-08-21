import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    sentiment: {
      label: {
        type: String,
        enum: ["positive", "negative", "neutral", null],
        default: null,
      },
      score: {
        type: Number,
        default: null,
      },
      confidence: {
        type: Number,
        default: null,
      }
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;