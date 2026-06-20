import pg from "pg";
const { Pool } = pg;

// Connection pool pointing at the Docker PostgreSQL instance
const pool = new Pool({
  user: "chatuser",
  password: "chatpass",
  host: "localhost",
  port: 5433,
  database: "chatdb",
});

export default pool;
