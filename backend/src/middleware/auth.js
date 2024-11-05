import jwt from 'jsonwebtoken';

const secret_key = process.env.SECRET_KEY;

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
