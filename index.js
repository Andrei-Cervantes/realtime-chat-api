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

const roomUsers = new Map();

function addUserToRoom(roomId, username) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set());
  }
  roomUsers.get(roomId).add(username);
}

function removeUserFromRoom(roomId, username) {
  if (roomUsers.has(roomId)) {
    roomUsers.get(roomId).delete(username);
    if (roomUsers.get(roomId).size === 0) {
      roomUsers.delete(roomId);
    }
  }
}

function getRoomUsers(roomId) {
  return roomUsers.has(roomId) ? Array.from(roomUsers.get(roomId)) : [];
}

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
  let currentUsername = null;
  let currentRoomId = null;

  // join room
  socket.on("join-room", async (data) => {
    const { roomId, username } =
      typeof data === "object" ? data : { roomId: data, username: null };

    if (currentRoomId) {
      socket.leave(`room-${currentRoomId}`);
      if (currentUsername) {
        removeUserFromRoom(currentRoomId, currentUsername);
        io.to(`room-${currentRoomId}`).emit(
          "room-users",
          getRoomUsers(currentRoomId),
        );
      }
    }

    currentUsername = username || currentUsername;
    currentRoomId = roomId;

    // Add this socket to the specified room
    socket.join(`room-${roomId}`);

    if (currentUsername) {
      addUserToRoom(roomId, currentUsername);
      io.to(`room-${roomId}`).emit("room-users", getRoomUsers(roomId));
    }

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
    if (currentUsername) {
      removeUserFromRoom(roomId, currentUsername);
      io.to(`room-${roomId}`).emit("room-users", getRoomUsers(roomId));
    }
    currentRoomId = null;
  });

  // send message
  socket.on("send-message", async (data) => {
    const { roomId, username, content } = data;
    currentUsername = username;

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
    if (currentRoomId && currentUsername) {
      removeUserFromRoom(currentRoomId, currentUsername);
      io.to(`room-${currentRoomId}`).emit(
        "room-users",
        getRoomUsers(currentRoomId),
      );
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
