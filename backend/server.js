import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import messageRoutes from "./routes/message.routes.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://sportsin-frontend-rgx5.onrender.com",
    ],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ["http://localhost:5173", "https://sportsin-frontend-rgx5.onrender.com"].includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/messages", messageRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Listen for message send event
  socket.on("send_message", (data) => {
    console.log("Received message:", data);
    // Broadcast the message to all clients
    io.emit("receive_message", data);
  });

  // Listen for message read event
  socket.on("message_read", (messageId) => {
    console.log(`Message with ID ${messageId} has been read`);
    // Broadcast to other users that the message was read
    io.emit("message_read", messageId);
  });

  // Listen for disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  connectDB();
});
