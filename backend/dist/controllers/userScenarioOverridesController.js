"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertUserLevelQuestions = exports.getUserLevelQuestions = void 0;
const UserScenarioOverrides_1 = __importDefault(require("../models/UserScenarioOverrides"));
const SimpleScenario_1 = __importDefault(require("../models/SimpleScenario"));
const isValidLevel = (level) => level === 'level1' || level === 'level2' || level === 'level3';
const getUserLevelQuestions = async (req, res) => {
    try {
        const { userId, scenarioId, level } = req.params;
        if (!isValidLevel(level)) {
            res.status(400).json({ success: false, error: 'Invalid level' });
            return;
        }
        // Level 1 is always the shared default
        if (level === 'level1') {
            const scenario = await SimpleScenario_1.default.findById(scenarioId);
            if (!scenario) {
                res.status(404).json({ success: false, error: 'Scenario not found' });
                return;
            }
            res.json({ success: true, data: scenario.level1 });
            return;
        }
        // For level2/3, try user override first, then default
        const override = await UserScenarioOverrides_1.default.findOne({ userId, scenarioId });
        if (override && override[level]) {
            res.json({ success: true, data: override[level] });
            return;
        }
        const scenario = await SimpleScenario_1.default.findById(scenarioId);
        if (!scenario) {
            res.status(404).json({ success: false, error: 'Scenario not found' });
            return;
        }
        res.json({ success: true, data: scenario[level] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getUserLevelQuestions = getUserLevelQuestions;
const upsertUserLevelQuestions = async (req, res) => {
    try {
        const { userId, scenarioId, level } = req.params;
        const { questions } = req.body;
        if (!isValidLevel(level) || level === 'level1') {
            res.status(400).json({ success: false, error: 'Only level2 or level3 can be personalized' });
            return;
        }
        if (!Array.isArray(questions) || questions.length === 0) {
            res.status(400).json({ success: false, error: 'questions array is required' });
            return;
        }
        const update = {};
        update[level] = { questions };
        const saved = await UserScenarioOverrides_1.default.findOneAndUpdate({ userId, scenarioId }, { $set: update }, { new: true, upsert: true });
        console.log('🧠 Saved personalized questions:', {
            userId,
            scenarioId,
            level,
            count: questions.length,
            preview: questions.slice(0, 2)
        });
        res.json({ success: true, data: saved });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.upsertUserLevelQuestions = upsertUserLevelQuestions;
//# sourceMappingURL=userScenarioOverridesController.js.map