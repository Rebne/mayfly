import express from "express";
import dotenv from "dotenv";
import initDB from "config/database.js";
import { middlewareLogger } from "middleware/logger.js";
import { apiRoutes } from "";

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(middlewareLogger);

app.use("/api", apiRoutes);

(async () => {
  const pool = await initDB();
  app.locals.pool = pool;
  app.listen(port, () => {
    console.log(`Server listening on port:${port}`);
  });
})();

const insertUsername = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    "INSERT INTO users (username) VALUES ($1) RETURNING *",
    [username]
  );
  console.log(res.rows[0]);
  client.release();
};
