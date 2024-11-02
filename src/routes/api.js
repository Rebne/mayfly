import express from "express";
import { getNotes } from "../models/models.js";

const router = express.Router();

router.get("/messages", async (req, res) => {
  try {
    const notes = await getNotes();
    res.code(200).send(notes.join(", "));
  } catch (error) {
    console.error("Error getting notes");
    res.code(500).send("Internal server error");
  }
});

router.post("/messages", async (req, res) => {});

// router.delete("/messages", async (req, res) => {
//   try {
//     deleteNote();
//   } catch (error) {
//     res.code(500);
//   }
// });

export default router;
