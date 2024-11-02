import express from "express";

const router = express.Router();

app.get("/", async (_, res) => {});

router.get("/messages", async (req, res) => {
  try {
    const notes = await getNotes();
    res.send(notes.map((note) => note.context));
  } catch (error) {
    console.error("Error getting notes");
  }
});

router.post("/messages", async (req, res) => {});

router.delete("/messages", async (req, res) => {});
