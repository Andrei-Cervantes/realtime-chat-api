import {
  addUserToRoom,
  getRoomUsers,
  removeUserFromRoom,
} from "../../services/roomPresence.js";
import { getRecentMessages } from "../../repositories/messageRepository.js";

export function registerJoinRoom(io, socket, state) {
  socket.on("join-room", async (data) => {
    const { roomId, username } =
      typeof data === "object" ? data : { roomId: data, username: null };

    if (state.currentRoomId) {
      socket.leave(`room-${state.currentRoomId}`);
      if (state.currentUsername) {
        removeUserFromRoom(state.currentRoomId, state.currentUsername);
        io.to(`room-${state.currentRoomId}`).emit(
          "room-users",
          getRoomUsers(state.currentRoomId),
        );
      }
    }

    state.currentUsername = username || state.currentUsername;
    state.currentRoomId = roomId;

    // Add this socket to the specified room
    socket.join(`room-${roomId}`);

    if (state.currentUsername) {
      addUserToRoom(roomId, state.currentUsername);
      io.to(`room-${roomId}`).emit("room-users", getRoomUsers(roomId));
    }

    try {
      const history = await getRecentMessages(roomId);
      socket.emit("room-history", history);
    } catch (err) {
      console.error("Failed to load room history:", err);
    }
  });
}
