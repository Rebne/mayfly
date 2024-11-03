import express from "express";
import { getNotes, deleteExpiredNotes } from "../models/models.js";

const router = express.Router();

router.get("/notes", async (req, res) => {
  try {
    const notes = await getNotes(1, req.app.locals.pool);
    res.status(200).send(notes.map((note) => note.content).join(", "));
  } catch (error) {
    console.error("Error getting notes", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/notes", async (req, res) => {});

router.delete("/messages/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    deleteNote();
  } catch (error) {
    res.code(500);
  }
});

export default router;
