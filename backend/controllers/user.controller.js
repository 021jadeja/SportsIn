import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import Connection from "../models/connection.model.js";

// 🔍 Search unconnected users by name
export const searchUnconnectedUsers = async (req, res) => {
	try {
		const { term } = req.query;
		const currentUserId = req.user._id;

		const connections = await Connection.find({
			$or: [{ requester: currentUserId }, { recipient: currentUserId }],
		});

		const connectedUserIds = connections.flatMap(conn =>
			[conn.requester.toString(), conn.recipient.toString()]
		);

		const excludedUserIds = [...new Set([...connectedUserIds, currentUserId.toString()])];

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

// ✅ Get suggested connections
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

// ✅ Get user by ID
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

// ✅ Get public profile by username
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

// ✅ Update user profile
export const updateProfile = async (req, res) => {
	try {
		const allowedFields = [
			"name",
			"username",
			"email", // ✅ ADDED email
			"headline",
			"about",
			"location",
			"skills",
			"experience",
			"education",
			"emailVisible",
		];

		const updatedData = {};

		for (const field of allowedFields) {
			if (req.body[field]) {
				updatedData[field] = req.body[field];
			}
		}

		// Upload profile picture
		if (req.body.profilePicture) {
			const result = await cloudinary.uploader.upload(req.body.profilePicture, {
				folder: "sportsin/profilePictures",
			});
			updatedData.profilePicture = result.secure_url;
		}

		// Upload banner image
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
