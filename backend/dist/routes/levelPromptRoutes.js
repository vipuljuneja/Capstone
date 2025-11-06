"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const levelPromptController_1 = require("../controllers/levelPromptController");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.verifyFirebaseToken, levelPromptController_1.createLevelPrompt);
router.get('/:scenarioId', authMiddleware_1.verifyFirebaseToken, levelPromptController_1.getAllLevelPromptsForScenario);
router.get('/:scenarioId/:level', authMiddleware_1.verifyFirebaseToken, levelPromptController_1.getLevelPromptByScenarioAndLevel);
router.put('/:id', authMiddleware_1.verifyFirebaseToken, levelPromptController_1.updateLevelPrompt);
router.delete('/:id', authMiddleware_1.verifyFirebaseToken, levelPromptController_1.deleteLevelPrompt);
exports.default = router;
//# sourceMappingURL=levelPromptRoutes.js.map