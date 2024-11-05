import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { middlewareLogger } from './middleware/logger.js';
import { getUserIdentificationDB } from './/models/models.js';'
import jwt from 'jsonwebtoken';
import { userInfo } from 'os';
//import initDB from './config/test_database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __distpath = path.join(__dirname, '../../frontend/dist');

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

const secret_key = process.env.SECRET_KEY;



const createToken = (userID) => {
  const payload = {
    userID: userID
  };
  const options = {
    expiresIn: '7d',
  };
  return jwt.sign(payload, secret_key, options);
}

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secret_key);
    return decoded.userID;
  } catch (error) {
    return null;
  }
}

app.use(middlewareLogger);
app.use(express.json());
app.use(express.static(__distpath));

app.use('/api', apiRoutes);
app.get('*', (_, res) => {
  res.sendFile(path.join(__distpath, 'index.html'));
});
app.post('/login', loginHandler);

(async () => {
  //const pool = await initDB();
  //app.locals.pool = pool;
  app.listen(port, () => {
    console.log(`Server listening on port:${port}`);
  });
})();
