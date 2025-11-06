"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const practiceSessionController_1 = require("../controllers/practiceSessionController");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.verifyFirebaseToken, practiceSessionController_1.startPracticeSession);
router.post('/complete', authMiddleware_1.verifyFirebaseToken, practiceSessionController_1.createCompleteSession); // Create complete session in one go
router.post('/:sessionId/steps', authMiddleware_1.verifyFirebaseToken, practiceSessionController_1.addStepToSession);
router.post('/:sessionId/complete', authMiddleware_1.verifyFirebaseToken, practiceSessionController_1.completeSession);
router.post('/:sessionId/abandon', authMiddleware_1.verifyFirebaseToken, practiceSessionController_1.abandonSession);
router.get('/user/:userId', authMiddleware_1.verifyFirebaseToken, practiceSessionController_1.getUserSessions);
router.get('/:sessionId', authMiddleware_1.verifyFirebaseToken, practiceSessionController_1.getSessionById);
router.delete('/:sessionId', authMiddleware_1.verifyFirebaseToken, practiceSessionController_1.deleteSession);
exports.default = router;
//# sourceMappingURL=practiceSessionRoutes.js.map