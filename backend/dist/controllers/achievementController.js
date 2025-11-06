"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAchievement = exports.updateAchievement = exports.getAchievementByKey = exports.getAchievementById = exports.getAllAchievements = exports.createAchievement = void 0;
const models_1 = require("../models");
const createAchievement = async (req, res) => {
    try {
        const { key, title, description, icon, category } = req.body;
        const existingAchievement = await models_1.Achievement.findOne({ key });
        if (existingAchievement) {
            res.status(400).json({ error: 'Achievement with this key already exists' });
            return;
        }
        const achievement = await models_1.Achievement.create({
            key,
            title,
            description,
            icon,
            category
        });
        res.status(201).json({ success: true, data: achievement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createAchievement = createAchievement;
const getAllAchievements = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const achievements = await models_1.Achievement.find(filter).sort({ category: 1, title: 1 });
        res.json({ success: true, data: achievements });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllAchievements = getAllAchievements;
const getAchievementById = async (req, res) => {
    try {
        const { id } = req.params;
        const achievement = await models_1.Achievement.findById(id);
        if (!achievement) {
            res.status(404).json({ error: 'Achievement not found' });
            return;
        }
        res.json({ success: true, data: achievement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAchievementById = getAchievementById;
const getAchievementByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const achievement = await models_1.Achievement.findOne({ key });
        if (!achievement) {
            res.status(404).json({ error: 'Achievement not found' });
            return;
        }
        res.json({ success: true, data: achievement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAchievementByKey = getAchievementByKey;
const updateAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const achievement = await models_1.Achievement.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        if (!achievement) {
            res.status(404).json({ error: 'Achievement not found' });
            return;
        }
        res.json({ success: true, data: achievement });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateAchievement = updateAchievement;
const deleteAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const achievement = await models_1.Achievement.findByIdAndDelete(id);
        if (!achievement) {
            res.status(404).json({ error: 'Achievement not found' });
            return;
        }
        res.json({ success: true, message: 'Achievement deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteAchievement = deleteAchievement;
//# sourceMappingURL=achievementController.js.map