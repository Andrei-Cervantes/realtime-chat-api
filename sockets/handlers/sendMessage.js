import { createMessage } from "../../repositories/messageRepository.js";

export function registerSendMessage(io, socket, state) {
  socket.on("send-message", async (data) => {
    const { roomId, username, content } = data;
    state.currentUsername = username;

    try {
      const message = await createMessage(roomId, username, content);

      io.to(`room-${roomId}`).emit("new-message", message);
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  });
}
