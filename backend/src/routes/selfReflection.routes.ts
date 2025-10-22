import { Router } from 'express';
import {
  createReflection,
  getReflectionsByUser,
  getReflectionById,
  updateReflection,
  deleteReflection,
  getReflectionDates,
} from '../controllers/selfReflection.controller';

const router = Router();

// Create a new reflection
router.post('/', createReflection);

// Get reflections by user with optional filters (date, type, date range)
router.get('/user/:userId', getReflectionsByUser);

// Get dates that have reflections (for calendar markers)
router.get('/user/:userId/dates', getReflectionDates);

// Get a single reflection by ID
router.get('/:reflectionId', getReflectionById);

// Update a reflection
router.put('/:reflectionId', updateReflection);

// Delete a reflection
router.delete('/:reflectionId', deleteReflection);

export default router;

