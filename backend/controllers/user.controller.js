import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import Connection from "../models/connection.model.js"; // make sure this is imported at the top if not already

// 🔍 Search unconnected users by name
export const searchUnconnectedUsers = async (req, res) => {
	try {
		const { term } = req.query;
		const currentUserId = req.user._id;

		// Get all connections related to the user (connected, pending, received)
		const connections = await Connection.find({
			$or: [
				{ requester: currentUserId },
				{ recipient: currentUserId }
			]
		});

		// Get all user IDs involved in connections
		const connectedUserIds = connections.flatMap(conn =>
			[conn.requester.toString(), conn.recipient.toString()]
		);

		// Filter out current user ID
		const excludedUserIds = [...new Set([...connectedUserIds, currentUserId.toString()])];

		// Search users who are NOT connected and match the term
		const users = await User.find({
			_id: { $nin: excludedUserIds },
			name: { $regex: term, $options: "i" }
		}).select("name username profilePicture");

		res.json(users);
	} catch (error) {
		console.error("Error in searchUnconnectedUsers controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ Get suggested connections (not already connected & not self)
export const getSuggestedConnections = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id).select("connections");

		const suggestedUser = await User.find({
			_id: {
				$ne: req.user._id,
				$nin: currentUser.connections,
			},
		})
			.select("name username profilePicture headline")
			.limit(3);

		res.json(suggestedUser);
	} catch (error) {
		console.error("Error in getSuggestedConnections controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ Get user by ID (used in ProfilePage via /users/:id)
export const getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getUserById controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// ✅ Get public profile by username (used for username-based profiles)
export const getPublicProfile = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username }).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getPublicProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};


// ✅ Update user profile (with optional image uploads to Cloudinary)
export const updateProfile = async (req, res) => {
	try {
		const allowedFields = [
			"name",
			"username",
			"headline",
			"about",
			"location",
			"skills",
			"experience",
			"education",
		];

		const updatedData = {};

		for (const field of allowedFields) {
			if (req.body[field]) {
				updatedData[field] = req.body[field];
			}
		}

		// Upload profile picture if present
		if (req.body.profilePicture) {
			const result = await cloudinary.uploader.upload(req.body.profilePicture, {
				folder: "sportsin/profilePictures",
			});
			updatedData.profilePicture = result.secure_url;
		}

		// Upload banner image if present
		if (req.body.bannerImg) {
			const result = await cloudinary.uploader.upload(req.body.bannerImg, {
				folder: "sportsin/bannerImages",
			});
			updatedData.bannerImg = result.secure_url;
		}

		const updatedUser = await User.findByIdAndUpdate(
			req.user._id,
			{ $set: updatedData },
			{ new: true }
		).select("-password");

		res.json(updatedUser);
	} catch (error) {
		console.error("Error in updateProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
