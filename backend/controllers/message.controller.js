import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const threadId = [req.user._id.toString(), receiverId].sort().join("_");

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      threadId
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

export const fetchMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const threadId = [req.user._id.toString(), userId].sort().join("_");

    const messages = await Message.find({ threadId }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("fetchMessages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
