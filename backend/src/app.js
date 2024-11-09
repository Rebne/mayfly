import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import { middlewareLogger } from './middleware/logger.js';
import initDB from './config/test_database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __distpath = path.join(__dirname, '../../frontend/dist');

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(middlewareLogger);
app.use(express.json());
app.use(express.static(__distpath));

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.get('*', (_, res) => {
  res.sendFile(path.join(__distpath, 'index.html'));
});

(async () => {
  const pool = await initDB();
  app.locals.pool = pool;
  app.listen(port, () => {
    console.log(`Server listening on port:${port}`);
  });
})();
