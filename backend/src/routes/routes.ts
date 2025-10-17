import { Router } from 'express';
import * as controllers from '../controllers/controllers';

const router = Router();

// ============================================
// USER ROUTES
// ============================================

// POST /api/users - Create new user
router.post('/users', controllers.createUser);

// GET /api/users/:authUid - Get user by Firebase authUid
router.get('/users/:authUid', controllers.getUserByAuthUid);

// PUT /api/users/:authUid - Update user profile
router.put('/users/:authUid', controllers.updateUserProfile);

// PUT /api/users/:authUid/streak - Update user streak
router.put('/users/:authUid/streak', controllers.updateUserStreak);

// POST /api/users/:authUid/achievements - Add achievement to user
router.post('/users/:authUid/achievements', controllers.addUserAchievement);

// DELETE /api/users/:authUid - Delete user and cascade related data
router.delete('/users/:authUid', controllers.deleteUser);

// ============================================
// ASSESSMENT TEMPLATE ROUTES
// ============================================

// POST /api/assessment-templates - Create new assessment template
router.post('/assessment-templates', controllers.createAssessmentTemplate);

// GET /api/assessment-templates - Get all assessment templates
router.get('/assessment-templates', controllers.getAllAssessmentTemplates);

// GET /api/assessment-templates/:id - Get assessment template by ID
router.get('/assessment-templates/:id', controllers.getAssessmentTemplateById);

// PUT /api/assessment-templates/:id - Update assessment template
router.put('/assessment-templates/:id', controllers.updateAssessmentTemplate);

// DELETE /api/assessment-templates/:id - Delete assessment template
router.delete('/assessment-templates/:id', controllers.deleteAssessmentTemplate);

// ============================================
// ASSESSMENT RESPONSE ROUTES
// ============================================

// POST /api/assessment-responses - Submit new assessment response
router.post('/assessment-responses', controllers.submitAssessmentResponse);

// GET /api/assessment-responses/user/:userId - Get all responses for a user
router.get('/assessment-responses/user/:userId', controllers.getUserAssessmentResponses);

// GET /api/assessment-responses/user/:userId/latest - Get latest response for user
router.get('/assessment-responses/user/:userId/latest', controllers.getLatestAssessmentResponse);

// ============================================
// SCENARIO ROUTES
// ============================================

// POST /api/scenarios - Create new scenario
router.post('/scenarios', controllers.createScenario);

// GET /api/scenarios - Get all scenarios (with optional status filter)
router.get('/scenarios', controllers.getAllScenarios);

// GET /api/scenarios/published - Get only published scenarios
router.get('/scenarios/published', controllers.getPublishedScenarios);

// GET /api/scenarios/:id - Get scenario by ID
router.get('/scenarios/:id', controllers.getScenarioById);

// PUT /api/scenarios/:id - Update scenario
router.put('/scenarios/:id', controllers.updateScenario);

// DELETE /api/scenarios/:id - Delete scenario and cascade related data
router.delete('/scenarios/:id', controllers.deleteScenario);

// ============================================
// LEVEL PROMPT ROUTES
// ============================================

// POST /api/level-prompts - Create new level prompt
router.post('/level-prompts', controllers.createLevelPrompt);

// GET /api/level-prompts/scenario/:scenarioId/level/:level - Get specific level prompt
router.get('/level-prompts/scenario/:scenarioId/level/:level', controllers.getLevelPromptByScenarioAndLevel);

// GET /api/level-prompts/scenario/:scenarioId - Get all level prompts for a scenario
router.get('/level-prompts/scenario/:scenarioId', controllers.getAllLevelPromptsForScenario);

// PUT /api/level-prompts/:id - Update level prompt
router.put('/level-prompts/:id', controllers.updateLevelPrompt);

// DELETE /api/level-prompts/:id - Delete level prompt
router.delete('/level-prompts/:id', controllers.deleteLevelPrompt);

// ============================================
// MEDIA JOB ROUTES
// ============================================

// POST /api/media-jobs - Create new media job
router.post('/media-jobs', controllers.createMediaJob);

// GET /api/media-jobs/:id - Get media job by MongoDB ID
router.get('/media-jobs/:id', controllers.getMediaJobById);

// GET /api/media-jobs/job/:jobId - Get media job by provider jobId
router.get('/media-jobs/job/:jobId', controllers.getMediaJobByJobId);

// PUT /api/media-jobs/job/:jobId/status - Update media job status
router.put('/media-jobs/job/:jobId/status', controllers.updateMediaJobStatus);

// GET /api/media-jobs/status/:status - Get all jobs by status
router.get('/media-jobs/status/:status', controllers.getMediaJobsByStatus);

// GET /api/media-jobs/scenario/:scenarioId - Get all jobs for a scenario
router.get('/media-jobs/scenario/:scenarioId', controllers.getMediaJobsForScenario);

// ============================================
// PRACTICE SESSION ROUTES
// ============================================

// POST /api/practice-sessions - Start new practice session
router.post('/practice-sessions', controllers.startPracticeSession);

// POST /api/practice-sessions/:sessionId/steps - Add step to active session
router.post('/practice-sessions/:sessionId/steps', controllers.addStepToSession);

// PUT /api/practice-sessions/:sessionId/complete - Complete session
router.put('/practice-sessions/:sessionId/complete', controllers.completeSession);

// PUT /api/practice-sessions/:sessionId/abandon - Abandon session
router.put('/practice-sessions/:sessionId/abandon', controllers.abandonSession);

// GET /api/practice-sessions/user/:userId - Get all sessions for user
router.get('/practice-sessions/user/:userId', controllers.getUserSessions);

// GET /api/practice-sessions/:sessionId - Get session by ID
router.get('/practice-sessions/:sessionId', controllers.getSessionById);

// DELETE /api/practice-sessions/:sessionId - Delete session
router.delete('/practice-sessions/:sessionId', controllers.deleteSession);

// ============================================
// PROGRESS ROUTES
// ============================================

// POST /api/progress - Initialize progress for user-scenario pair
router.post('/progress', controllers.initializeProgress);

// GET /api/progress/user/:userId - Get all progress for user
router.get('/progress/user/:userId', controllers.getUserProgress);

// GET /api/progress/user/:userId/scenario/:scenarioId - Get progress for specific scenario
router.get('/progress/user/:userId/scenario/:scenarioId', controllers.getProgressForScenario);

// PUT /api/progress/user/:userId/scenario/:scenarioId/unlock - Manually unlock a level
router.put('/progress/user/:userId/scenario/:scenarioId/unlock', controllers.unlockLevel);

// ============================================
// ENCOURAGEMENT NOTE ROUTES
// ============================================

// POST /api/encouragement-notes - Create new note
router.post('/encouragement-notes', controllers.createEncouragementNote);

// GET /api/encouragement-notes/user/:userId - Get all notes for user (with optional filters)
router.get('/encouragement-notes/user/:userId', controllers.getUserNotes);

// GET /api/encouragement-notes/:id - Get note by ID
router.get('/encouragement-notes/:id', controllers.getNoteById);

// PUT /api/encouragement-notes/:id - Update note
router.put('/encouragement-notes/:id', controllers.updateNote);

// DELETE /api/encouragement-notes/:id - Delete note
router.delete('/encouragement-notes/:id', controllers.deleteNote);

// ============================================
// ACHIEVEMENT ROUTES
// ============================================

// POST /api/achievements - Create new achievement definition
router.post('/achievements', controllers.createAchievement);

// GET /api/achievements - Get all achievement definitions
router.get('/achievements', controllers.getAllAchievements);

// GET /api/achievements/:id - Get achievement by ID
router.get('/achievements/:id', controllers.getAchievementById);

// GET /api/achievements/key/:key - Get achievement by key
router.get('/achievements/key/:key', controllers.getAchievementByKey);

// PUT /api/achievements/:id - Update achievement
router.put('/achievements/:id', controllers.updateAchievement);

// DELETE /api/achievements/:id - Delete achievement
router.delete('/achievements/:id', controllers.deleteAchievement);


// DAILY ARTICLE ROUTES
router.get('/articles/today', controllers.getTodayArticle);
router.get('/articles/last-7-days', controllers.getLast7DaysArticles);
router.get('/articles/:id', controllers.getArticleById);
router.post('/articles/generate', controllers.generateTodayArticleManually);

// BOOKMARK ROUTES
router.post('/bookmarks', controllers.bookmarkArticle);
router.delete('/bookmarks', controllers.removeBookmark);
router.get('/bookmarks/user/:userId', controllers.getUserBookmarkedArticles);

export default router;
