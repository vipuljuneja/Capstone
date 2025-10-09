import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import {
  createEncouragementNote,
  deleteNote,
  getNoteById,
  getUserNotes,
  updateNote
} from '../controllers/encouragementController';

const router = express.Router();

router.post('/', verifyFirebaseToken, createEncouragementNote);
router.get('/user/:userId', verifyFirebaseToken, getUserNotes);
router.get('/:id', verifyFirebaseToken, getNoteById);
router.put('/:id', verifyFirebaseToken, updateNote);
router.delete('/:id', verifyFirebaseToken, deleteNote);

export default router;
