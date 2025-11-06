"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// User creation doesn't require auth (happens during signup)
router.post('/', userController_1.createUser);
// All other user routes require authentication
router.get('/:authUid', authMiddleware_1.verifyFirebaseToken, userController_1.getUserByAuthUid);
router.put('/:authUid/profile', authMiddleware_1.verifyFirebaseToken, userController_1.updateUserProfile);
router.put('/:authUid/onboarding', authMiddleware_1.verifyFirebaseToken, userController_1.updateOnboardingStatus);
router.put('/:authUid/seen-tour', authMiddleware_1.verifyFirebaseToken, userController_1.updateHasSeenTour);
router.patch('/:authUid/streak', authMiddleware_1.verifyFirebaseToken, userController_1.updateUserStreak);
router.post('/:authUid/achievements', authMiddleware_1.verifyFirebaseToken, userController_1.addUserAchievement);
router.delete('/:authUid', authMiddleware_1.verifyFirebaseToken, userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map