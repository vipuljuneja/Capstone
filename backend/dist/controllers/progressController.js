"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlockLevel = exports.getProgressForScenario = exports.getUserProgress = exports.initializeProgress = void 0;
const models_1 = require("../models");
const initializeProgress = async (req, res) => {
    try {
        const { userId, scenarioId } = req.body;
        const existingProgress = await models_1.Progress.findOne({ userId, scenarioId });
        if (existingProgress) {
            res.status(400).json({ error: 'Progress already exists' });
            return;
        }
        const progress = await models_1.Progress.create({
            userId,
            scenarioId,
            levels: {
                '1': {
                    attempts: 0,
                    lastCompletedAt: null,
                    achievements: [],
                    unlockedAt: new Date()
                }
            },
            totalSessions: 0,
            lastPlayedAt: null
        });
        res.status(201).json({ success: true, data: progress });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.initializeProgress = initializeProgress;
const getUserProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        const progress = await models_1.Progress.find({ userId })
            .populate('scenarioId')
            .sort({ lastPlayedAt: -1 });
        res.json({ success: true, data: progress });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserProgress = getUserProgress;
const getProgressForScenario = async (req, res) => {
    try {
        const { userId, scenarioId } = req.params;
        const progress = await models_1.Progress.findOne({ userId, scenarioId }).populate('scenarioId');
        if (!progress) {
            res.status(404).json({ error: 'Progress not found' });
            return;
        }
        res.json({ success: true, data: progress });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProgressForScenario = getProgressForScenario;
const unlockLevel = async (req, res) => {
    try {
        const { userId, scenarioId } = req.params;
        const { level } = req.body;
        const progress = await models_1.Progress.findOne({ userId, scenarioId });
        if (!progress) {
            res.status(404).json({ error: 'Progress not found' });
            return;
        }
        const levelKey = level.toString();
        const levelProgress = progress.levels.get(levelKey) || {
            attempts: 0,
            lastCompletedAt: null,
            achievements: [],
            unlockedAt: null
        };
        if (!levelProgress.unlockedAt) {
            levelProgress.unlockedAt = new Date();
            progress.levels.set(levelKey, levelProgress);
            await progress.save();
        }
        res.json({ success: true, data: progress });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.unlockLevel = unlockLevel;
//# sourceMappingURL=progressController.js.map