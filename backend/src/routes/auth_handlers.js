import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { storeUserDB, getUserInfoDB } from '../models/users.js';

dotenv.config();
const secret_key = process.env.SECRET_KEY;
if (!secret_key) {
  throw new Error('SECRET_KEY environment variable is not set');
}

export const registerHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await getUserInfoDB(username, req.app.locals.pool);
    if (user) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    if (
      username.length < 3 ||
      username.length > 20 ||
      password.length < 3 ||
      password.length > 20
    ) {
      return res.status(400).json({ error: 'This is not allowed' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await storeUserDB(
      username,
      hashedPassword,
      req.app.locals.pool
    );
    const token = jwt.sign({ id: newUser.id }, secret_key, {
      expiresIn: '5d',
    });
    return res.status(201).json({ token });
  } catch (error) {
    console.error('Error registering user', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginHandler = async (req, res) => {
  const { username, password } = req.body;

  const user = await getUserInfoDB(username, req.app.locals.pool);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, secret_key, {
    expiresIn: '5d',
  });

  return res.status(200).json({ token });
};
