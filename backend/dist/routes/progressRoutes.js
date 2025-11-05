"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const progressController_1 = require("../controllers/progressController");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.verifyFirebaseToken, progressController_1.initializeProgress);
router.get('/user/:userId', authMiddleware_1.verifyFirebaseToken, progressController_1.getUserProgress);
router.get('/user/:userId/scenario/:scenarioId', authMiddleware_1.verifyFirebaseToken, progressController_1.getProgressForScenario);
router.post('/user/:userId/scenario/:scenarioId/unlock', authMiddleware_1.verifyFirebaseToken, progressController_1.unlockLevel);
exports.default = router;
//# sourceMappingURL=progressRoutes.js.map