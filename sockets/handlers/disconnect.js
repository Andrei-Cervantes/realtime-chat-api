import {
  removeUserFromRoom,
  getRoomUsers,
} from "../../services/roomPresence.js";

export function registerDisconnect(io, socket, state) {
  socket.on("disconnect", () => {
    if (state.currentRoomId && state.currentUsername) {
      removeUserFromRoom(state.currentRoomId, state.currentUsername);
      io.to(`room-${state.currentRoomId}`).emit(
        "room-users",
        getRoomUsers(state.currentRoomId),
      );
    }

    console.log("User disconnected:", socket.id);
  });
}
