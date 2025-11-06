"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userScenarioOverridesController_1 = require("../controllers/userScenarioOverridesController");
const router = express_1.default.Router();
// GET user-aware questions for a level (level1 returns shared defaults)
router.get('/users/:userId/scenarios/:scenarioId/levels/:level/questions', authMiddleware_1.verifyFirebaseToken, userScenarioOverridesController_1.getUserLevelQuestions);
// PUT personalized questions for level2/level3
router.put('/users/:userId/scenarios/:scenarioId/levels/:level/questions', authMiddleware_1.verifyFirebaseToken, userScenarioOverridesController_1.upsertUserLevelQuestions);
exports.default = router;
//# sourceMappingURL=userScenarioOverridesRoutes.js.map