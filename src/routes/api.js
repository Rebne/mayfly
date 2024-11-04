import express from "express";
import { getNotesAndRemoveOldDB } from "../models/models.js";

const router = express.Router();

router.get("/notes/:userId", async (req, res) => {
  try {
    const userID = req.params.userId;
    const notes = await getNotesAndRemoveOldDB(userID, req.app.locals.pool);
    res.status(200).send(notes.map((note) => note.content).join(", "));
  } catch (error) {
    console.error("Error getting notes or deleting old notes", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/notes/:userId", async (req, res) => {
  try {
    const { content } = req.body;
    const userID = req.params.userId;
    const newNote = await insertNoteDB(content, userID, req.app.locals.pool);
    res.status(201).send(newNote);
  } catch (error) {
    console.error("Error inserting new note", error);
    res.status(500).send("Internal server error");
  }
});

router.delete("/notes/:noteId", async (req, res) => {
  try {
    const noteID = req.params.noteId;
    await deleteNote(noteID, req.app.locals.pool);
  } catch (error) {
    console.error("Error deleting note", error);
    res.code(500).send("Internal server error");
  }
});

export default router;
