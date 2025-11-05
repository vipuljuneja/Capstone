"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers = __importStar(require("../controllers/controllers"));
const simpleScenarioRoutes_1 = __importDefault(require("./simpleScenarioRoutes"));
const userScenarioOverridesRoutes_1 = __importDefault(require("./userScenarioOverridesRoutes"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// ============================================
// USER ROUTES
// ============================================
// POST /api/users - Create new user (public - signup endpoint)
router.post('/users', controllers.createUser);
// GET /api/users/:authUid - Get user by Firebase authUid
router.get('/users/:authUid', authMiddleware_1.verifyFirebaseToken, authMiddleware_1.verifyUserOwnership, controllers.getUserByAuthUid);
// PUT /api/users/:authUid - Update user profile
router.put('/users/:authUid', authMiddleware_1.verifyFirebaseToken, authMiddleware_1.verifyUserOwnership, controllers.updateUserProfile);
// PUT /api/users/:authUid/onboarding - Update onboarding completion flag
router.put('/users/:authUid/onboarding', authMiddleware_1.verifyFirebaseToken, authMiddleware_1.verifyUserOwnership, controllers.updateOnboardingStatus);
// PUT /api/users/:authUid/seen-tour - Update hasSeenTour flag
router.put('/users/:authUid/seen-tour', authMiddleware_1.verifyFirebaseToken, authMiddleware_1.verifyUserOwnership, controllers.updateHasSeenTour);
// PUT /api/users/:authUid/severity - Update user severity level
router.put('/users/:authUid/severity', authMiddleware_1.verifyFirebaseToken, authMiddleware_1.verifyUserOwnership, controllers.updateSeverityLevel);
// PUT /api/users/:authUid/streak - Update user streak
router.put('/users/:authUid/streak', authMiddleware_1.verifyFirebaseToken, authMiddleware_1.verifyUserOwnership, controllers.updateUserStreak);
// POST /api/users/:authUid/achievements - Add achievement to user
router.post('/users/:authUid/achievements', authMiddleware_1.verifyFirebaseToken, authMiddleware_1.verifyUserOwnership, controllers.addUserAchievement);
// DELETE /api/users/:authUid - Delete user and cascade related data
router.delete('/users/:authUid', authMiddleware_1.verifyFirebaseToken, authMiddleware_1.verifyUserOwnership, controllers.deleteUser);
// ============================================
// ASSESSMENT TEMPLATE ROUTES
// ============================================
// POST /api/assessment-templates - Create new assessment template
router.post('/assessment-templates', authMiddleware_1.verifyFirebaseToken, controllers.createAssessmentTemplate);
// GET /api/assessment-templates - Get all assessment templates
router.get('/assessment-templates', authMiddleware_1.verifyFirebaseToken, controllers.getAllAssessmentTemplates);
// GET /api/assessment-templates/:id - Get assessment template by ID
router.get('/assessment-templates/:id', authMiddleware_1.verifyFirebaseToken, controllers.getAssessmentTemplateById);
// PUT /api/assessment-templates/:id - Update assessment template
router.put('/assessment-templates/:id', authMiddleware_1.verifyFirebaseToken, controllers.updateAssessmentTemplate);
// DELETE /api/assessment-templates/:id - Delete assessment template
router.delete('/assessment-templates/:id', authMiddleware_1.verifyFirebaseToken, controllers.deleteAssessmentTemplate);
// ============================================
// ASSESSMENT RESPONSE ROUTES
// ============================================
// POST /api/assessment-responses - Submit new assessment response
router.post('/assessment-responses', authMiddleware_1.verifyFirebaseToken, controllers.submitAssessmentResponse);
// GET /api/assessment-responses/user/:userId - Get all responses for a user
router.get('/assessment-responses/user/:userId', authMiddleware_1.verifyFirebaseToken, controllers.getUserAssessmentResponses);
// GET /api/assessment-responses/user/:userId/latest - Get latest response for user
router.get('/assessment-responses/user/:userId/latest', authMiddleware_1.verifyFirebaseToken, controllers.getLatestAssessmentResponse);
// ============================================
// LEVEL PROMPT ROUTES
// ============================================
// POST /api/level-prompts - Create new level prompt
router.post('/level-prompts', authMiddleware_1.verifyFirebaseToken, controllers.createLevelPrompt);
// GET /api/level-prompts/scenario/:scenarioId/level/:level - Get specific level prompt
router.get('/level-prompts/scenario/:scenarioId/level/:level', authMiddleware_1.verifyFirebaseToken, controllers.getLevelPromptByScenarioAndLevel);
// GET /api/level-prompts/scenario/:scenarioId - Get all level prompts for a scenario
router.get('/level-prompts/scenario/:scenarioId', authMiddleware_1.verifyFirebaseToken, controllers.getAllLevelPromptsForScenario);
// PUT /api/level-prompts/:id - Update level prompt
router.put('/level-prompts/:id', authMiddleware_1.verifyFirebaseToken, controllers.updateLevelPrompt);
// DELETE /api/level-prompts/:id - Delete level prompt
router.delete('/level-prompts/:id', authMiddleware_1.verifyFirebaseToken, controllers.deleteLevelPrompt);
// ============================================
// MEDIA JOB ROUTES
// ============================================
// POST /api/media-jobs - Create new media job
router.post('/media-jobs', authMiddleware_1.verifyFirebaseToken, controllers.createMediaJob);
// GET /api/media-jobs/:id - Get media job by MongoDB ID
router.get('/media-jobs/:id', authMiddleware_1.verifyFirebaseToken, controllers.getMediaJobById);
// GET /api/media-jobs/job/:jobId - Get media job by provider jobId
router.get('/media-jobs/job/:jobId', authMiddleware_1.verifyFirebaseToken, controllers.getMediaJobByJobId);
// PUT /api/media-jobs/job/:jobId/status - Update media job status
router.put('/media-jobs/job/:jobId/status', authMiddleware_1.verifyFirebaseToken, controllers.updateMediaJobStatus);
// GET /api/media-jobs/status/:status - Get all jobs by status
router.get('/media-jobs/status/:status', authMiddleware_1.verifyFirebaseToken, controllers.getMediaJobsByStatus);
// GET /api/media-jobs/scenario/:scenarioId - Get all jobs for a scenario
router.get('/media-jobs/scenario/:scenarioId', authMiddleware_1.verifyFirebaseToken, controllers.getMediaJobsForScenario);
// ============================================
// PRACTICE SESSION ROUTES
// ============================================
// POST /api/practice-sessions - Start new practice session
router.post('/practice-sessions', authMiddleware_1.verifyFirebaseToken, controllers.startPracticeSession);
// POST /api/practice-sessions/complete - Create complete session in one go
router.post('/practice-sessions/complete', authMiddleware_1.verifyFirebaseToken, controllers.createCompleteSession);
// POST /api/practice-sessions/:sessionId/steps - Add step to active session
router.post('/practice-sessions/:sessionId/steps', authMiddleware_1.verifyFirebaseToken, controllers.addStepToSession);
// PUT /api/practice-sessions/:sessionId/complete - Complete session
router.put('/practice-sessions/:sessionId/complete', authMiddleware_1.verifyFirebaseToken, controllers.completeSession);
// PUT /api/practice-sessions/:sessionId/abandon - Abandon session
router.put('/practice-sessions/:sessionId/abandon', authMiddleware_1.verifyFirebaseToken, controllers.abandonSession);
// GET /api/practice-sessions/user/:userId - Get all sessions for user
router.get('/practice-sessions/user/:userId', authMiddleware_1.verifyFirebaseToken, controllers.getUserSessions);
// GET /api/practice-sessions/:sessionId - Get session by ID
router.get('/practice-sessions/:sessionId', authMiddleware_1.verifyFirebaseToken, controllers.getSessionById);
// DELETE /api/practice-sessions/:sessionId - Delete session
router.delete('/practice-sessions/:sessionId', authMiddleware_1.verifyFirebaseToken, controllers.deleteSession);
// ============================================
// PROGRESS ROUTES
// ============================================
// POST /api/progress - Initialize progress for user-scenario pair
router.post('/progress', authMiddleware_1.verifyFirebaseToken, controllers.initializeProgress);
// GET /api/progress/user/:userId - Get all progress for user
router.get('/progress/user/:userId', authMiddleware_1.verifyFirebaseToken, controllers.getUserProgress);
// GET /api/progress/user/:userId/scenario/:scenarioId - Get progress for specific scenario
router.get('/progress/user/:userId/scenario/:scenarioId', authMiddleware_1.verifyFirebaseToken, controllers.getProgressForScenario);
// PUT /api/progress/user/:userId/scenario/:scenarioId/unlock - Manually unlock a level
router.put('/progress/user/:userId/scenario/:scenarioId/unlock', authMiddleware_1.verifyFirebaseToken, controllers.unlockLevel);
// ============================================
// ENCOURAGEMENT NOTE ROUTES
// ============================================
// POST /api/encouragement-notes - Create new note
router.post('/encouragement-notes', authMiddleware_1.verifyFirebaseToken, controllers.createEncouragementNote);
// GET /api/encouragement-notes/user/:userId - Get all notes for user (with optional filters)
router.get('/encouragement-notes/user/:userId', authMiddleware_1.verifyFirebaseToken, controllers.getUserNotes);
// GET /api/encouragement-notes/:id - Get note by ID
router.get('/encouragement-notes/:id', authMiddleware_1.verifyFirebaseToken, controllers.getNoteById);
// PUT /api/encouragement-notes/:id - Update note
router.put('/encouragement-notes/:id', authMiddleware_1.verifyFirebaseToken, controllers.updateNote);
// DELETE /api/encouragement-notes/:id - Delete note
router.delete('/encouragement-notes/:id', authMiddleware_1.verifyFirebaseToken, controllers.deleteNote);
// ============================================
// ACHIEVEMENT ROUTES
// ============================================
// POST /api/achievements - Create new achievement definition
router.post('/achievements', authMiddleware_1.verifyFirebaseToken, controllers.createAchievement);
// GET /api/achievements - Get all achievement definitions
router.get('/achievements', authMiddleware_1.verifyFirebaseToken, controllers.getAllAchievements);
// GET /api/achievements/:id - Get achievement by ID
router.get('/achievements/:id', authMiddleware_1.verifyFirebaseToken, controllers.getAchievementById);
// GET /api/achievements/key/:key - Get achievement by key
router.get('/achievements/key/:key', authMiddleware_1.verifyFirebaseToken, controllers.getAchievementByKey);
// PUT /api/achievements/:id - Update achievement
router.put('/achievements/:id', authMiddleware_1.verifyFirebaseToken, controllers.updateAchievement);
// DELETE /api/achievements/:id - Delete achievement
router.delete('/achievements/:id', authMiddleware_1.verifyFirebaseToken, controllers.deleteAchievement);
// DAILY ARTICLE ROUTES
// Articles use optionalAuth - they work with or without authentication
// If authenticated, bookmark status is included
router.get('/articles/today', authMiddleware_1.optionalAuth, controllers.getTodayArticle);
router.get('/articles/last-7-days', authMiddleware_1.optionalAuth, controllers.getLast7DaysArticles);
router.get('/articles/:id', authMiddleware_1.optionalAuth, controllers.getArticleById);
router.post('/articles/generate', authMiddleware_1.verifyFirebaseToken, controllers.generateTodayArticleManually);
// BOOKMARK ROUTES
router.post('/bookmarks', authMiddleware_1.verifyFirebaseToken, controllers.bookmarkArticle);
router.delete('/bookmarks', authMiddleware_1.verifyFirebaseToken, controllers.removeBookmark);
router.get('/bookmarks/user/:userId', authMiddleware_1.verifyFirebaseToken, controllers.getUserBookmarkedArticles);
// ============================================
// SELF REFLECTION / NOTEBOOK ROUTES
// ============================================
// POST /api/reflections - Create new reflection
router.post('/reflections', authMiddleware_1.verifyFirebaseToken, controllers.createReflection);
// POST /api/reflections/from-session - Create Pipo note from practice session
router.post('/reflections/from-session', authMiddleware_1.verifyFirebaseToken, controllers.createPipoNoteFromSession);
// GET /api/reflections/user/:userId - Get reflections by user (with optional filters)
router.get('/reflections/user/:userId', authMiddleware_1.verifyFirebaseToken, controllers.getReflectionsByUser);
// GET /api/reflections/user/:userId/dates - Get dates that have reflections (for calendar markers)
router.get('/reflections/user/:userId/dates', authMiddleware_1.verifyFirebaseToken, controllers.getReflectionDates);
// GET /api/reflections/:reflectionId - Get reflection by ID
router.get('/reflections/:reflectionId', authMiddleware_1.verifyFirebaseToken, controllers.getReflectionById);
// PUT /api/reflections/:reflectionId - Update reflection
router.put('/reflections/:reflectionId', authMiddleware_1.verifyFirebaseToken, controllers.updateReflection);
// DELETE /api/reflections/:reflectionId - Delete reflection
router.delete('/reflections/:reflectionId', authMiddleware_1.verifyFirebaseToken, controllers.deleteReflection);
// ============================================
// SCENARIO ROUTES (SIMPLE)
// ============================================
// Mount simple scenario routes
router.use('/scenarios', simpleScenarioRoutes_1.default);
// ============================================
// USER SCENARIO OVERRIDES ROUTES
// ============================================
router.use('/', userScenarioOverridesRoutes_1.default);
exports.default = router;
//# sourceMappingURL=routes.js.map