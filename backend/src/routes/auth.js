import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

const secret_key = process.env.SECRET_KEY;

router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.post('/register', registerHandler);
router.post('/refresh', refreshHandler);

router.post();

const logoutHandler = async (req, res) => {
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

const registerHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await getUserInfoDB(username, req.app.locals.pool);
    if (user) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const newUser = await storeUserDB(
      username,
      hashedPassword,
      req.app.locals.pool,
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
      refreshTokenHash,
      refreshToken,
      req.app.locals.pool,
    );
    return res
      .status(201)
      .json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    console.error('Error registering user', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const loginHandler = async (req, res) => {
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
  await storeRefreshTokenDB(refreshTokenHash, user.id, req.app.locals.pool);
  return res
    .status(200)
    .json({ accessToken: accessToken, refreshToken: refreshToken });
};

const refreshHandler = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.code(400).json({ error: 'No refresh token' });
  const decodedRefreshToken = jwt.verify(
    refreshToken,
    secret_key,
    (err, decode) => {
      if (err) return res.code(400).json({ error: 'Invalid refresh token' });
      return decode;
    },
  );
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  try {
    await updateRefreshTokenDB(hash, req.app.locals.pool);
  } catch (error) {
    return res.code(400).json({ error: 'Invalid refresh token' });
  }
  const newAccessToken = jwt.sign({ id: decodedRefreshToken.id }, secret_key, {
    expiresIn: '15m',
  });
  const newRefreshToken = jwt.sign({ id: decodedRefreshToken.id }, secret_key, {
    expiresIn: '30d',
  });
  return res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};

export default router;
