import { Server } from "socket.io";

export function createSocketServer(httpServer) {
  return new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
    },
  });
}
