import express from 'express';

const router = express.Router();

const secret_key = process.env.SECRET_KEY;

router.post('/login', loginHandler);
router.post('/refresh-token', refreshHandler);
router.post('/login', logoutHandler);

const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserIdentificationDB(
    username,
    password,
    req.app.locals.pool,
  );
  if (!user)
    return res.status(401).json({ error: 'Invalid username or password' });
  const accessToken = jwt.sign({ id: user.id }, secret_key, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id: user.id }, secret_key, {
    expiresIn: '30d',
  });
  res.status(200).json({
    accessToken,
    refreshToken,
  });
};

const refreshHandler = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  // Need hashing! Also for passwords
  // Verify the refresh token
  // Check the refresh token in DB, update and delete if expired
  // Generate new access token
  // Generate a new refresh token
  
}

export default router;
