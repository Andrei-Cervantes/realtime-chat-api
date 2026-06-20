import { registerJoinRoom } from "./handlers/joinRoom.js";
import { registerLeaveRoom } from "./handlers/leaveRoom.js";
import { registerSendMessage } from "./handlers/sendMessage.js";
import { registerDisconnect } from "./handlers/disconnect.js";

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    const state = { currentUsername: null, currentRoomId: null };

    registerJoinRoom(io, socket, state);
    registerLeaveRoom(io, socket, state);
    registerSendMessage(io, socket, state);
    registerDisconnect(io, socket, state);
  });
}
