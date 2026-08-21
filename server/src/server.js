import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import { socketAuthMiddleware } from "./sockets/socketAuth.js";
import { registerChatHandlers } from "./sockets/chatSocket.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", credentials: false },
});

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.user.username} (${socket.id})`);

  registerChatHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.user.username} (${socket.id})`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});