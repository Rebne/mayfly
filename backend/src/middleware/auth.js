import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret_key = process.env.SECRET_KEY;
if (!secret_key) {
  throw new Error('SECRET_KEY environment variable is not set');
}

export const authenticateTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, secret_key, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.id = payload.id;
    next();
  });
};
