import express from 'express';
import {
  getNotesAndRemoveOldDB,
  storeNoteDB,
  deleteNoteDB,
} from '../models/notes.js';

const router = express.Router();

router.get('/notes', async (req, res) => {
  try {
    const userID = req.id;
    const notes = await getNotesAndRemoveOldDB(userID, req.app.locals.pool);
    res.status(200).json({ notes: notes });
    console.log('Successfully retrieved all notes for user: ' + userID);
  } catch (error) {
    console.error('Error getting notes or deleting old notes', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/notes', async (req, res) => {
  try {
    const { content } = req.body;
    const userID = req.id;
    await storeNoteDB(content, userID, req.app.locals.pool);
    res.status(201).end();
    console.log('New note was successfully addedd for user: ' + userID);
  } catch (error) {
    console.error('Error inserting new note', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/notes/:noteId', async (req, res) => {
  try {
    const noteID = req.params.noteId;
    await deleteNoteDB(noteID, req.app.locals.pool);
    res.code(200).end();
    console.log('Note was successfully deleted with id: ' + noteID);
  } catch (error) {
    console.error('Error deleting note', error);
    res.code(500).json({ error: 'Internal server error' });
  }
});

export default router;
