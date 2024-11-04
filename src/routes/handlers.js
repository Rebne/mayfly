import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {notes: ["test1", "test2", "test3"]})
};

export default router;