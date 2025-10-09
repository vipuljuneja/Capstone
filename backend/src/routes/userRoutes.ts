import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import {
  addUserAchievement,
  createUser,
  deleteUser,
  getUserByAuthUid,
  updateUserProfile,
  updateUserStreak
} from '../controllers/userController';

const router = express.Router();

router.post('/', verifyFirebaseToken, createUser);
router.get('/:authUid', verifyFirebaseToken, getUserByAuthUid);
router.put('/:authUid/profile', verifyFirebaseToken, updateUserProfile);
router.patch('/:authUid/streak', verifyFirebaseToken, updateUserStreak);
router.post('/:authUid/achievements', verifyFirebaseToken, addUserAchievement);
router.delete('/:authUid', verifyFirebaseToken, deleteUser);

export default router;
