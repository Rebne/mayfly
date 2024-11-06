import express from 'express';
import {
  loginHandler,
  logoutHandler,
  registerHandler,
  refreshHandler,
} from './handlers.js';

const router = express.Router();

router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.post('/register', registerHandler);
router.post('/refresh', refreshHandler);

export default router;
