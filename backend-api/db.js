import pg from "pg";

const { Pool } = pg;

export const requiredDbEnv = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];

for (const key of requiredDbEnv) {
  if (!process.env[key]) {
    console.error(`FATAL: ${key} environment variable is required`);
    process.exit(1);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5433),
  database: process.env.DB_NAME || "saratube",
  user: process.env.DB_USER || "saratube",
  password: process.env.DB_PASSWORD,
});

export async function testDbConnection() {
  const result = await pool.query(
    "SELECT current_database() AS database, current_user AS user, now() AS time"
  );

  return result.rows[0];
}
