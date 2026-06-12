import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import pool from "./db.js";

const app = express();
const httpServer = createServer(app);

// Socket.IO server setup
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Rooms endpoint
app.get("/rooms", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  try {
    // Query all rooms from the database
    const result = await pool.query("SELECT * FROM rooms ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join room
  socket.on("join-room", async (roomId) => {
    // Add this socket to the specified room
    socket.join(`room-${roomId}`);
    try {
      // Fetch the last 50 messages for this room
      const result = await pool.query(
        "SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at ASC LIMIT 50",
        [roomId],
      );

      // Send chat history to the newly joined user
      socket.emit("room-history", result.rows);
    } catch (err) {
      console.error("Failed to load room history:", err);
    }
  });

  // leave room
  socket.on("leave-room", (roomId) => {
    socket.leave(`room-${roomId}`);
  });

  // send message
  socket.on("send-message", async (data) => {
    const { roomId, username, content } = data;
    try {
      const result = await pool.query(
        "INSERT INTO messages (room_id, username, content) VALUES ($1, $2, $3) RETURNING *",
        [roomId, username, content],
      );

      io.to(`room-${roomId}`).emit("new-message", result.rows[0]);
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
