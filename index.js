import express from "express";
import { createServer } from "http";
import roomsRouter from "./routes/rooms.js";
import { registerSocketHandlers } from "./sockets/index.js";
import { createSocketServer } from "./config/socket.js";

const app = express();
const httpServer = createServer(app);

// Socket.IO server setup
const io = createSocketServer(httpServer);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
});

app.use("/rooms", roomsRouter);

registerSocketHandlers(io);

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
