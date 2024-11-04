import express from "express";

const router = express.Router();

const notes = [
  { content: "Note1" },
  { content: "Note2" },
  { content: "Note3" },
];
router.get("/", (req, res) => {
  res.render("index", { title: "Mayfly", notes });
});

export default router;
