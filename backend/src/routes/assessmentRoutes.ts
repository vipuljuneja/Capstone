import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware';
import {
  createAssessmentTemplate,
  deleteAssessmentTemplate,
  getAllAssessmentTemplates,
  getAssessmentTemplateById,
  updateAssessmentTemplate
} from '../controllers/assessmentTemplateController';
import {
  getLatestAssessmentResponse,
  getUserAssessmentResponses,
  submitAssessmentResponse
} from '../controllers/assessmentController';

const router = express.Router();

// Template management
router.post('/templates', verifyFirebaseToken, createAssessmentTemplate);
router.get('/templates', verifyFirebaseToken, getAllAssessmentTemplates);
router.get('/templates/:id', verifyFirebaseToken, getAssessmentTemplateById);
router.put('/templates/:id', verifyFirebaseToken, updateAssessmentTemplate);
router.delete('/templates/:id', verifyFirebaseToken, deleteAssessmentTemplate);

// Assessment responses
router.post('/responses', verifyFirebaseToken, submitAssessmentResponse);
router.get('/responses/:userId', verifyFirebaseToken, getUserAssessmentResponses);
router.get('/responses/:userId/latest', verifyFirebaseToken, getLatestAssessmentResponse);

export default router;
