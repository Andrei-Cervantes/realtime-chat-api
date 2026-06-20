import {
  removeUserFromRoom,
  getRoomUsers,
} from "../../services/roomPresence.js";

export function registerLeaveRoom(io, socket, state) {
  socket.on("leave-room", (roomId) => {
    socket.leave(`room-${roomId}`);

    if (state.currentUsername) {
      removeUserFromRoom(roomId, state.currentUsername);
      io.to(`room-${roomId}`).emit("room-users", getRoomUsers(roomId));
    }

    state.currentRoomId = null;
  });
}
