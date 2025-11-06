import { Router } from 'express';
import * as controllers from '../controllers/controllers';
import simpleScenarioRoutes from './simpleScenarioRoutes';
import userScenarioOverridesRoutes from './userScenarioOverridesRoutes';
import { verifyFirebaseToken, optionalAuth, verifyUserOwnership } from '../middleware/authMiddleware';

const router = Router();

// ============================================
// USER ROUTES
// ============================================

// POST /api/users - Create new user (public - signup endpoint)
router.post('/users', controllers.createUser);

// Alias for signup used by some clients/docs
router.post('/users/register', controllers.createUser);

// GET /api/users/:authUid - Get user by Firebase authUid
router.get('/users/:authUid', verifyFirebaseToken, verifyUserOwnership, controllers.getUserByAuthUid);

// GET /api/users/me - Get current user based on Firebase token
router.get('/users/me', verifyFirebaseToken, controllers.getMe);

// PUT /api/users/:authUid - Update user profile
router.put('/users/:authUid', verifyFirebaseToken, verifyUserOwnership, controllers.updateUserProfile);

// PUT /api/users/:authUid/onboarding - Update onboarding completion flag
router.put('/users/:authUid/onboarding', verifyFirebaseToken, verifyUserOwnership, controllers.updateOnboardingStatus);

// PUT /api/users/:authUid/seen-tour - Update hasSeenTour flag
router.put('/users/:authUid/seen-tour', verifyFirebaseToken, verifyUserOwnership, controllers.updateHasSeenTour);

// PUT /api/users/:authUid/severity - Update user severity level
router.put('/users/:authUid/severity', verifyFirebaseToken, verifyUserOwnership, controllers.updateSeverityLevel);

// PUT /api/users/:authUid/streak - Update user streak
router.put('/users/:authUid/streak', verifyFirebaseToken, verifyUserOwnership, controllers.updateUserStreak);

// POST /api/users/:authUid/achievements - Add achievement to user
router.post('/users/:authUid/achievements', verifyFirebaseToken, verifyUserOwnership, controllers.addUserAchievement);

// DELETE /api/users/:authUid - Delete user and cascade related data
router.delete('/users/:authUid', verifyFirebaseToken, verifyUserOwnership, controllers.deleteUser);

// ============================================
// ASSESSMENT TEMPLATE ROUTES
// ============================================

// POST /api/assessment-templates - Create new assessment template
router.post('/assessment-templates', verifyFirebaseToken, controllers.createAssessmentTemplate);

// GET /api/assessment-templates - Get all assessment templates
router.get('/assessment-templates', verifyFirebaseToken, controllers.getAllAssessmentTemplates);

// GET /api/assessment-templates/:id - Get assessment template by ID
router.get('/assessment-templates/:id', verifyFirebaseToken, controllers.getAssessmentTemplateById);

// PUT /api/assessment-templates/:id - Update assessment template
router.put('/assessment-templates/:id', verifyFirebaseToken, controllers.updateAssessmentTemplate);

// DELETE /api/assessment-templates/:id - Delete assessment template
router.delete('/assessment-templates/:id', verifyFirebaseToken, controllers.deleteAssessmentTemplate);

// ============================================
// ASSESSMENT RESPONSE ROUTES
// ============================================

// POST /api/assessment-responses - Submit new assessment response
router.post('/assessment-responses', verifyFirebaseToken, controllers.submitAssessmentResponse);

// GET /api/assessment-responses/user/:userId - Get all responses for a user
router.get('/assessment-responses/user/:userId', verifyFirebaseToken, controllers.getUserAssessmentResponses);

// GET /api/assessment-responses/user/:userId/latest - Get latest response for user
router.get('/assessment-responses/user/:userId/latest', verifyFirebaseToken, controllers.getLatestAssessmentResponse);

// ============================================
// LEVEL PROMPT ROUTES
// ============================================

// POST /api/level-prompts - Create new level prompt
router.post('/level-prompts', verifyFirebaseToken, controllers.createLevelPrompt);

// GET /api/level-prompts/scenario/:scenarioId/level/:level - Get specific level prompt
router.get('/level-prompts/scenario/:scenarioId/level/:level', verifyFirebaseToken, controllers.getLevelPromptByScenarioAndLevel);

// GET /api/level-prompts/scenario/:scenarioId - Get all level prompts for a scenario
router.get('/level-prompts/scenario/:scenarioId', verifyFirebaseToken, controllers.getAllLevelPromptsForScenario);

// PUT /api/level-prompts/:id - Update level prompt
router.put('/level-prompts/:id', verifyFirebaseToken, controllers.updateLevelPrompt);

// DELETE /api/level-prompts/:id - Delete level prompt
router.delete('/level-prompts/:id', verifyFirebaseToken, controllers.deleteLevelPrompt);

// ============================================
// MEDIA JOB ROUTES
// ============================================

// POST /api/media-jobs - Create new media job
router.post('/media-jobs', verifyFirebaseToken, controllers.createMediaJob);

// GET /api/media-jobs/:id - Get media job by MongoDB ID
router.get('/media-jobs/:id', verifyFirebaseToken, controllers.getMediaJobById);

// GET /api/media-jobs/job/:jobId - Get media job by provider jobId
router.get('/media-jobs/job/:jobId', verifyFirebaseToken, controllers.getMediaJobByJobId);

// PUT /api/media-jobs/job/:jobId/status - Update media job status
router.put('/media-jobs/job/:jobId/status', verifyFirebaseToken, controllers.updateMediaJobStatus);

// GET /api/media-jobs/status/:status - Get all jobs by status
router.get('/media-jobs/status/:status', verifyFirebaseToken, controllers.getMediaJobsByStatus);

// GET /api/media-jobs/scenario/:scenarioId - Get all jobs for a scenario
router.get('/media-jobs/scenario/:scenarioId', verifyFirebaseToken, controllers.getMediaJobsForScenario);

// ============================================
// PRACTICE SESSION ROUTES
// ============================================

// POST /api/practice-sessions - Start new practice session
router.post('/practice-sessions', verifyFirebaseToken, controllers.startPracticeSession);

// POST /api/practice-sessions/complete - Create complete session in one go
router.post('/practice-sessions/complete', verifyFirebaseToken, controllers.createCompleteSession);

// POST /api/practice-sessions/:sessionId/steps - Add step to active session
router.post('/practice-sessions/:sessionId/steps', verifyFirebaseToken, controllers.addStepToSession);

// PUT /api/practice-sessions/:sessionId/complete - Complete session
router.put('/practice-sessions/:sessionId/complete', verifyFirebaseToken, controllers.completeSession);

// PUT /api/practice-sessions/:sessionId/abandon - Abandon session
router.put('/practice-sessions/:sessionId/abandon', verifyFirebaseToken, controllers.abandonSession);

// GET /api/practice-sessions/user/:userId - Get all sessions for user
router.get('/practice-sessions/user/:userId', verifyFirebaseToken, controllers.getUserSessions);

// GET /api/practice-sessions/:sessionId - Get session by ID
router.get('/practice-sessions/:sessionId', verifyFirebaseToken, controllers.getSessionById);

// DELETE /api/practice-sessions/:sessionId - Delete session
router.delete('/practice-sessions/:sessionId', verifyFirebaseToken, controllers.deleteSession);

// ============================================
// PROGRESS ROUTES
// ============================================

// POST /api/progress - Initialize progress for user-scenario pair
router.post('/progress', verifyFirebaseToken, controllers.initializeProgress);

// GET /api/progress/user/:userId - Get all progress for user
router.get('/progress/user/:userId', verifyFirebaseToken, controllers.getUserProgress);

// GET /api/progress/user/:userId/scenario/:scenarioId - Get progress for specific scenario
router.get('/progress/user/:userId/scenario/:scenarioId', verifyFirebaseToken, controllers.getProgressForScenario);

// PUT /api/progress/user/:userId/scenario/:scenarioId/unlock - Manually unlock a level
router.put('/progress/user/:userId/scenario/:scenarioId/unlock', verifyFirebaseToken, controllers.unlockLevel);

// ============================================
// ENCOURAGEMENT NOTE ROUTES
// ============================================

// POST /api/encouragement-notes - Create new note
router.post('/encouragement-notes', verifyFirebaseToken, controllers.createEncouragementNote);

// GET /api/encouragement-notes/user/:userId - Get all notes for user (with optional filters)
router.get('/encouragement-notes/user/:userId', verifyFirebaseToken, controllers.getUserNotes);

// GET /api/encouragement-notes/:id - Get note by ID
router.get('/encouragement-notes/:id', verifyFirebaseToken, controllers.getNoteById);

// PUT /api/encouragement-notes/:id - Update note
router.put('/encouragement-notes/:id', verifyFirebaseToken, controllers.updateNote);

// DELETE /api/encouragement-notes/:id - Delete note
router.delete('/encouragement-notes/:id', verifyFirebaseToken, controllers.deleteNote);

// ============================================
// ACHIEVEMENT ROUTES
// ============================================

// POST /api/achievements - Create new achievement definition
router.post('/achievements', verifyFirebaseToken, controllers.createAchievement);

// GET /api/achievements - Get all achievement definitions
router.get('/achievements', verifyFirebaseToken, controllers.getAllAchievements);

// GET /api/achievements/:id - Get achievement by ID
router.get('/achievements/:id', verifyFirebaseToken, controllers.getAchievementById);

// GET /api/achievements/key/:key - Get achievement by key
router.get('/achievements/key/:key', verifyFirebaseToken, controllers.getAchievementByKey);

// PUT /api/achievements/:id - Update achievement
router.put('/achievements/:id', verifyFirebaseToken, controllers.updateAchievement);

// DELETE /api/achievements/:id - Delete achievement
router.delete('/achievements/:id', verifyFirebaseToken, controllers.deleteAchievement);


// DAILY ARTICLE ROUTES
// Articles use optionalAuth - they work with or without authentication
// If authenticated, bookmark status is included
router.get('/articles/today', optionalAuth, controllers.getTodayArticle);
router.get('/articles/last-7-days', optionalAuth, controllers.getLast7DaysArticles);
router.get('/articles/:id', optionalAuth, controllers.getArticleById);
router.post('/articles/generate', verifyFirebaseToken, controllers.generateTodayArticleManually);

// BOOKMARK ROUTES
router.post('/bookmarks', verifyFirebaseToken, controllers.bookmarkArticle);
router.delete('/bookmarks', verifyFirebaseToken, controllers.removeBookmark);
router.get('/bookmarks/user/:userId', verifyFirebaseToken, controllers.getUserBookmarkedArticles);

// ============================================
// SELF REFLECTION / NOTEBOOK ROUTES
// ============================================

// POST /api/reflections - Create new reflection
router.post('/reflections', verifyFirebaseToken, controllers.createReflection);

// POST /api/reflections/from-session - Create Pipo note from practice session
router.post('/reflections/from-session', verifyFirebaseToken, controllers.createPipoNoteFromSession);

// GET /api/reflections/user/:userId - Get reflections by user (with optional filters)
router.get('/reflections/user/:userId', verifyFirebaseToken, controllers.getReflectionsByUser);

// GET /api/reflections/user/:userId/dates - Get dates that have reflections (for calendar markers)
router.get('/reflections/user/:userId/dates', verifyFirebaseToken, controllers.getReflectionDates);

// GET /api/reflections/:reflectionId - Get reflection by ID
router.get('/reflections/:reflectionId', verifyFirebaseToken, controllers.getReflectionById);

// PUT /api/reflections/:reflectionId - Update reflection
router.put('/reflections/:reflectionId', verifyFirebaseToken, controllers.updateReflection);

// PATCH /api/reflections/:reflectionId/read-status - Update reflection read status
router.patch(
  '/reflections/:reflectionId/read-status',
  verifyFirebaseToken,
  controllers.updateReflectionReadStatus
);

// DELETE /api/reflections/:reflectionId - Delete reflection
router.delete('/reflections/:reflectionId', verifyFirebaseToken, controllers.deleteReflection);

// ============================================
// SCENARIO ROUTES (SIMPLE)
// ============================================

// Mount simple scenario routes
router.use('/scenarios', simpleScenarioRoutes);

// ============================================
// USER SCENARIO OVERRIDES ROUTES
// ============================================
router.use('/', userScenarioOverridesRoutes);

export default router;
