import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

app.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    service: "saratube-api"
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "select current_database() as database, current_user as user, now() as time"
    );

    res.json({
      status: "database connected",
      result: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: "database connection failed",
      error: error.message
    });
  }
});

app.get("/persistence-test", async (req, res) => {
  try {
    const result = await pool.query("select * from test_persistence order by id");
    res.json({
      status: "ok",
      rows: result.rows
    });
  } catch (error) {
    res.status(500).json({
      status: "query failed",
      error: error.message
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Saratube API listening on port ${port}`);
});
