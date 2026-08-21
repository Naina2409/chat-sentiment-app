import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrGetConversation,
  getMyConversations,
} from "../controllers/conversationController.js";
import { getMessages, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrGetConversation);
router.get("/", getMyConversations);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);

export default router;