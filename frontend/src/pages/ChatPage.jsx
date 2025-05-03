import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../lib/axios";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns"; // Import date-fns for formatting timestamps

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null); // Ref for emoji picker
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: connectionsData } = useQuery({
    queryKey: ["connections"],
    queryFn: () => axiosInstance.get("/connections/all").then((res) => res.data),
  });

  const connections = Array.isArray(connectionsData) ? connectionsData : [];

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", selectedUser],
    queryFn: () => axiosInstance.get(`/messages/${selectedUser}`).then((res) => res.data),
    enabled: !!selectedUser,
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (newMessage) => axiosInstance.post("/messages", newMessage),
    onSuccess: () => {
      setMessageContent("");
      refetchMessages();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (authUser?._id) {
      socket.emit("join", authUser._id);
    }

    socket.on("typing", ({ from }) => {
      setTypingUser(from);
    });

    socket.on("stopTyping", ({ from }) => {
      if (from === typingUser) setTypingUser(null);
    });

    return () => socket.disconnect();
  }, [authUser]);

  useEffect(() => {
    // Close emoji picker if clicked outside of it
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTyping = () => {
    socket.emit("typing", { to: selectedUser, from: authUser._id });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { to: selectedUser, from: authUser._id });
    }, 1000);
  };

  const handleEmojiClick = (emojiObject) => {
    setMessageContent((prev) => prev + emojiObject.emoji);
  };

  // Function to format the timestamp into a readable format
  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    return format(messageDate, "HH:mm"); // Format like "03:15 pm"
  };

  return (
    <div className="h-screen p-4 bg-gray-100">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Messages</h2>

      <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left: Connections */}
        <div className="w-1/3 bg-gray-50 border-r overflow-y-auto">
          <div className="px-4 py-3 bg-gray-200 text-gray-600 text-lg font-medium">Connections</div>
          {connections.map((conn) => (
            <div
              key={conn._id}
              className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-100 transition-all duration-200 rounded-lg ${
                selectedUser === conn._id ? "bg-blue-200 font-semibold" : ""
              }`}
              onClick={() => setSelectedUser(conn._id)}
            >
              <img
                src={conn.profilePicture || "/default-profile.png"}
                alt={conn.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-lg font-medium text-gray-800">{conn.name}</span>
                <span className="text-sm text-gray-500">{conn.headline}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Messages */}
        <div className="flex flex-col w-2/3 relative">
          {selectedUser ? (
            <>
              <div className="flex-1 p-6 overflow-y-auto bg-gray-100 space-y-4">
                {messages?.length ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender === selectedUser ? "justify-start" : "justify-end"
                      } mb-4`} // Add margin bottom for spacing between messages
                    >
                      <div
                        className={`px-4 py-3 rounded-lg max-w-xs ${
                          msg.sender === selectedUser
                            ? "bg-orange-100 text-black" // Lighter, transparent background for received messages
                            : "bg-blue-400 text-white" // Lighter, transparent background for sent messages
                        }`}
                      >
                        {/* Message content */}
                        <p>{msg.content}</p>
                      </div>

                      {/* Timestamp below the message box */}
                      <div className="text-xs text-gray-500 mt-7 ml-1">
                        {formatTimestamp(msg.createdAt)} {/* Assuming `createdAt` is the timestamp field */}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 mt-20">No messages yet</div>
                )}

                {typingUser === selectedUser && (
                  <div className="text-sm text-gray-500 italic">Typing...</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!messageContent.trim()) return;
                  sendMessage({ receiverId: selectedUser, content: messageContent });
                  setShowEmojiPicker(false);
                }}
                className="flex items-center p-4 bg-white border-t gap-3 relative"
              >
                <button
                  type="button"
                  className="text-2xl text-gray-600 hover:text-blue-600 transition-all"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  😊
                </button>

                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-10">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}

                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => {
                    setMessageContent(e.target.value);
                    handleTyping();
                  }}
                  className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none"
                  placeholder="Type a message..."
                />

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400 transition-all"
                  disabled={isPending}
                >
                  {isPending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
