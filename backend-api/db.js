import pg from "pg";

const { Pool } = pg;

export const requiredDbEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
];

for (const key of requiredDbEnv) {
  if (!process.env[key]) {
    console.error(`FATAL: ${key} environment variable is required`);
    process.exit(1);
  }
}

const useSsl = process.env.DB_SSL === "true";

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: useSsl
    ? {
        rejectUnauthorized: true,
      }
    : false,
});

export async function testDbConnection() {
  const result = await pool.query(
    "SELECT current_database() AS database, current_user AS user, now() AS time",
  );

  return result.rows[0];
}
