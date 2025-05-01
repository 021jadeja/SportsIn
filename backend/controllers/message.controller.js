import Message from "../models/message.model.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const threadId = [req.user._id.toString(), receiverId].sort().join("_");

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      threadId,
      isRead: false, // New message is unread by default
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Fetch messages in a thread and mark as read
export const fetchMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const threadId = [req.user._id.toString(), userId].sort().join("_");

    // Mark all unread messages as read
    await Message.updateMany(
      { threadId, receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({ threadId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("fetchMessages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Get unread message counts
export const getUnreadCounts = async (req, res) => {
  try {
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender", // Group by sender
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(unreadCounts); // Example: [{ _id: senderId, count: 2 }]
  } catch (error) {
    console.error("getUnreadCounts error:", error);
    res.status(500).json({ message: "Failed to fetch unread counts" });
  }
};
