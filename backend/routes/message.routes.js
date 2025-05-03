import express from "express";
import {
  sendMessage,
  fetchMessages,
  getUnreadMessageCount,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, sendMessage);
router.get("/unread", protectRoute, getUnreadMessageCount); // ✅ New route
router.get("/:userId", protectRoute, fetchMessages);

export default router;
