import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import bunkRoutes from "./routes/bunk.route.js";
import userRoutes from "./routes/user.route.js";
import activityRoutes from "./routes/activity.route.js";

import path from "path";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js"; // Import both app and server

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/bunks", bunkRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activity", activityRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("running on port: " + PORT);
  connectDB();
});
