import express from "express";
import dotenv from "dotenv";
import initDB from "./config/test_database.js";
import { middlewareLogger } from "./middleware/logger.js";
import apiRoutes from "./routes/api.js";

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
