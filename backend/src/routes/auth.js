import express from 'express';

const router = express.Router();

router.post('/login', loginHandler);
router.post('/refresh-token', refreshHandler);
router.post('/login', logoutHandler);

cont loginHandler = async (req, res) => {
  const {username, password} = req.body;
  const user = await getUserIdentificationDB(username, password, req.app.locals.pool);
  console.log(user);
}

export default router;