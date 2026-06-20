import pool from "../db/pool.js";

export async function getRecentMessages(roomId, limit = 50) {
  const result = await pool.query(
    "SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at ASC LIMIT $2",
    [roomId, limit],
  );

  return result.rows;
}

export async function createMessage(roomId, username, content) {
  const result = await pool.query(
    "INSERT INTO messages (room_id, username, content) VALUES ($1, $2, $3) RETURNING *",
    [roomId, username, content],
  );

  return result.rows[0];
}
