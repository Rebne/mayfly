import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  updateRefreshTokenDB,
  deleteRefreshTokenDB,
  storeRefreshTokenDB,
} from '../models/tokens.js';
import { storeUserDB, getUserInfoDB } from '../models/users.js';

dotenv.config();
const secret_key = process.env.SECRET_KEY;
if (!secret_key) {
  throw new Error('SECRET_KEY environment variable is not set');
}

export const logoutHandler = async (req, res) => {
  const { refreshToken } = req.body;
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  try {
    await deleteRefreshTokenDB(hash, req.app.locals.pool);
  } catch (error) {
    console.error('Error deleting refresh token', error);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  return res.status(200).json({ message: 'Successfully logged out' });
};

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
    const accessToken = jwt.sign({ id: newUser.id }, secret_key, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ id: newUser.id }, secret_key, {
      expiresIn: '30d',
    });
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    await storeRefreshTokenDB(
      newUser.id,
      refreshTokenHash,
      req.app.locals.pool
    );
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    return res.status(201).json({ refreshToken: refreshToken });
  } catch (error) {
    console.error('Error registering user', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserInfoDB(username, req.app.locals.pool);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid username or password' });

  const accessToken = jwt.sign({ id: user.id }, secret_key, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id: user.id }, secret_key, {
    expiresIn: '30d',
  });
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  try {
    await storeRefreshTokenDB(user.id, refreshTokenHash, req.app.locals.pool);
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    return res.status(200).json({
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error('Error handling refresh token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshHandler = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'No refresh token' });
  try {
    const decoded = jwt.verify(refreshToken, secret_key);
    const oldHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const newAccessToken = jwt.sign({ id: decoded.id }, secret_key, {
      expiresIn: '15m',
    });
    const newRefreshToken = jwt.sign({ id: decoded.id }, secret_key, {
      expiresIn: '30d',
    });
    const newHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');
    const updated = await updateRefreshTokenDB(
      decoded.id,
      oldHash,
      newHash,
      req.app.locals.pool
    );
    if (!updated) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    return res.status(200).json({
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};
