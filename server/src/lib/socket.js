import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId.toString()];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log("User added to socket map:", userId, "->", socket.id);
    console.log("Current online users:", Object.keys(userSocketMap));
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    for (const [uId, sId] of Object.entries(userSocketMap)) {
      if (sId === socket.id) {
        delete userSocketMap[uId];
        console.log("Removed user from socket map:", uId);
        break;
      }
    }

    console.log("Remaining online users:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
