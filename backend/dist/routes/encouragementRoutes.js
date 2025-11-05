"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const encouragementController_1 = require("../controllers/encouragementController");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.verifyFirebaseToken, encouragementController_1.createEncouragementNote);
router.get('/user/:userId', authMiddleware_1.verifyFirebaseToken, encouragementController_1.getUserNotes);
router.get('/:id', authMiddleware_1.verifyFirebaseToken, encouragementController_1.getNoteById);
router.put('/:id', authMiddleware_1.verifyFirebaseToken, encouragementController_1.updateNote);
router.delete('/:id', authMiddleware_1.verifyFirebaseToken, encouragementController_1.deleteNote);
exports.default = router;
//# sourceMappingURL=encouragementRoutes.js.map