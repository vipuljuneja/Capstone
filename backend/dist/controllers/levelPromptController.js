"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLevelPrompt = exports.updateLevelPrompt = exports.getAllLevelPromptsForScenario = exports.getLevelPromptByScenarioAndLevel = exports.createLevelPrompt = void 0;
const models_1 = require("../models");
const createLevelPrompt = async (req, res) => {
    try {
        const { scenarioId, level, introScript, questionSet, rubric, aiSystemPrompt, aiScoringPrompt } = req.body;
        const levelPrompt = await models_1.LevelPrompt.create({
            scenarioId,
            level,
            introScript,
            questionSet,
            rubric,
            aiSystemPrompt,
            aiScoringPrompt
        });
        res.status(201).json({ success: true, data: levelPrompt });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createLevelPrompt = createLevelPrompt;
const getLevelPromptByScenarioAndLevel = async (req, res) => {
    try {
        const { scenarioId, level } = req.params;
        const levelPrompt = await models_1.LevelPrompt.findOne({
            scenarioId,
            level: parseInt(level, 10)
        }).populate('scenarioId');
        if (!levelPrompt) {
            res.status(404).json({ error: 'Level prompt not found' });
            return;
        }
        res.json({ success: true, data: levelPrompt });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getLevelPromptByScenarioAndLevel = getLevelPromptByScenarioAndLevel;
const getAllLevelPromptsForScenario = async (req, res) => {
    try {
        const { scenarioId } = req.params;
        const levelPrompts = await models_1.LevelPrompt.find({ scenarioId }).sort({ level: 1 });
        res.json({ success: true, data: levelPrompts });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllLevelPromptsForScenario = getAllLevelPromptsForScenario;
const updateLevelPrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const levelPrompt = await models_1.LevelPrompt.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        if (!levelPrompt) {
            res.status(404).json({ error: 'Level prompt not found' });
            return;
        }
        res.json({ success: true, data: levelPrompt });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateLevelPrompt = updateLevelPrompt;
const deleteLevelPrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const levelPrompt = await models_1.LevelPrompt.findByIdAndDelete(id);
        if (!levelPrompt) {
            res.status(404).json({ error: 'Level prompt not found' });
            return;
        }
        res.json({ success: true, message: 'Level prompt deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteLevelPrompt = deleteLevelPrompt;
//# sourceMappingURL=levelPromptController.js.map