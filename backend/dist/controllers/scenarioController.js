"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScenario = exports.updateScenario = exports.getScenarioById = exports.getPublishedScenarios = exports.getAllScenarios = exports.createScenario = void 0;
const models_1 = require("../models");
const createScenario = async (req, res) => {
    try {
        const { title, description, levels, status } = req.body;
        const scenario = await models_1.Scenario.create({
            title,
            description,
            levels: levels || [1, 2, 3],
            status: status || 'published'
        });
        res.status(201).json({ success: true, data: scenario });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createScenario = createScenario;
const getAllScenarios = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const scenarios = await models_1.Scenario.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: scenarios });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllScenarios = getAllScenarios;
const getPublishedScenarios = async (req, res) => {
    try {
        const scenarios = await models_1.Scenario.find({ status: 'published' }).sort({ createdAt: -1 });
        res.json({ success: true, data: scenarios });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getPublishedScenarios = getPublishedScenarios;
const getScenarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const scenario = await models_1.Scenario.findById(id);
        if (!scenario) {
            res.status(404).json({ error: 'Scenario not found' });
            return;
        }
        res.json({ success: true, data: scenario });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getScenarioById = getScenarioById;
const updateScenario = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const scenario = await models_1.Scenario.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        if (!scenario) {
            res.status(404).json({ error: 'Scenario not found' });
            return;
        }
        res.json({ success: true, data: scenario });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateScenario = updateScenario;
const deleteScenario = async (req, res) => {
    try {
        const { id } = req.params;
        const scenario = await models_1.Scenario.findByIdAndDelete(id);
        if (!scenario) {
            res.status(404).json({ error: 'Scenario not found' });
            return;
        }
        await models_1.LevelPrompt.deleteMany({ scenarioId: id });
        await models_1.MediaJob.deleteMany({ scenarioId: id });
        res.json({ success: true, message: 'Scenario and related data deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteScenario = deleteScenario;
//# sourceMappingURL=scenarioController.js.map