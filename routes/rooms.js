import { Router } from "express";
import { getAllRooms } from "../repositories/roomRepository.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rooms = await getAllRooms();
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

export default router;
