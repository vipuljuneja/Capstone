"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const assessmentTemplateController_1 = require("../controllers/assessmentTemplateController");
const assessmentController_1 = require("../controllers/assessmentController");
const router = express_1.default.Router();
// Template management
router.post('/templates', authMiddleware_1.verifyFirebaseToken, assessmentTemplateController_1.createAssessmentTemplate);
router.get('/templates', authMiddleware_1.verifyFirebaseToken, assessmentTemplateController_1.getAllAssessmentTemplates);
router.get('/templates/:id', authMiddleware_1.verifyFirebaseToken, assessmentTemplateController_1.getAssessmentTemplateById);
router.put('/templates/:id', authMiddleware_1.verifyFirebaseToken, assessmentTemplateController_1.updateAssessmentTemplate);
router.delete('/templates/:id', authMiddleware_1.verifyFirebaseToken, assessmentTemplateController_1.deleteAssessmentTemplate);
// Assessment responses
router.post('/responses', authMiddleware_1.verifyFirebaseToken, assessmentController_1.submitAssessmentResponse);
router.get('/responses/:userId', authMiddleware_1.verifyFirebaseToken, assessmentController_1.getUserAssessmentResponses);
router.get('/responses/:userId/latest', authMiddleware_1.verifyFirebaseToken, assessmentController_1.getLatestAssessmentResponse);
exports.default = router;
//# sourceMappingURL=assessmentRoutes.js.map