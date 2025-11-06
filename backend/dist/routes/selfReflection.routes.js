"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const selfReflection_controller_1 = require("../controllers/selfReflection.controller");
const router = (0, express_1.Router)();
// Create a new reflection
router.post('/', selfReflection_controller_1.createReflection);
// Get reflections by user with optional filters (date, type, date range)
router.get('/user/:userId', selfReflection_controller_1.getReflectionsByUser);
// Get dates that have reflections (for calendar markers)
router.get('/user/:userId/dates', selfReflection_controller_1.getReflectionDates);
// Get a single reflection by ID
router.get('/:reflectionId', selfReflection_controller_1.getReflectionById);
// Update a reflection
router.put('/:reflectionId', selfReflection_controller_1.updateReflection);
// Delete a reflection
router.delete('/:reflectionId', selfReflection_controller_1.deleteReflection);
exports.default = router;
//# sourceMappingURL=selfReflection.routes.js.map