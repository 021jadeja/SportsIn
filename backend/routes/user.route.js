import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	getSuggestedConnections,
	getPublicProfile,
	getUserById,
	updateProfile,
	searchUnconnectedUsers,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/username/:username", getPublicProfile);
router.get("/search", protectRoute, searchUnconnectedUsers);
router.get("/:id", protectRoute, getUserById);
router.put("/profile", protectRoute, updateProfile);

export default router;
