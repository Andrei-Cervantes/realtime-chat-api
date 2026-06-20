import pool from "../db/pool.js";

export async function getAllRooms() {
  const result = await pool.query("SELECT * FROM rooms ORDER BY id");
  return result.rows;
}
