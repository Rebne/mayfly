import express from "express";
import dotenv from "dotenv";
import initDB from "./config/test_database.js";
import { middlewareLogger } from "./middleware/logger.js";
import apiRoutes from "./routes/api.js";
import handlerRoutes from "./routes/handlers.js";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(middlewareLogger);
app.use(express.json());
app.use("/api", apiRoutes);
app.use("/", handlerRoutes);

(async () => {
  //const pool = await initDB();
  //app.locals.pool = pool;
  app.listen(port, () => {
    console.log(`Server listening on port:${port}`);
  });
})();
