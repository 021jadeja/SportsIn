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
      isRead: false,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Fetch messages and mark them as read
export const fetchMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const threadId = [req.user._id.toString(), userId].sort().join("_");

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

// ✅ Get total unread message count
export const getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("getUnreadMessageCount error:", error);
    res.status(500).json({ message: "Failed to fetch unread message count" });
  }
};
