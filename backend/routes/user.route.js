import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	getSuggestedConnections,
	getPublicProfile,
	getUserById,
	updateProfile
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/username/:username", getPublicProfile);
router.get("/:id", protectRoute, getUserById); // <-- this supports /users/:id
router.put("/profile", protectRoute, updateProfile);

export default router;
