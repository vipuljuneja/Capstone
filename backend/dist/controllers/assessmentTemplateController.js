"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAssessmentTemplate = exports.updateAssessmentTemplate = exports.getAssessmentTemplateById = exports.getAllAssessmentTemplates = exports.createAssessmentTemplate = void 0;
const models_1 = require("../models");
const createAssessmentTemplate = async (req, res) => {
    try {
        const { title, scale, items } = req.body;
        const template = await models_1.AssessmentTemplate.create({ title, scale, items });
        res.status(201).json({ success: true, data: template });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createAssessmentTemplate = createAssessmentTemplate;
const getAllAssessmentTemplates = async (req, res) => {
    try {
        const templates = await models_1.AssessmentTemplate.find();
        res.json({ success: true, data: templates });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllAssessmentTemplates = getAllAssessmentTemplates;
const getAssessmentTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await models_1.AssessmentTemplate.findById(id);
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        res.json({ success: true, data: template });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAssessmentTemplateById = getAssessmentTemplateById;
const updateAssessmentTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const template = await models_1.AssessmentTemplate.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        res.json({ success: true, data: template });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateAssessmentTemplate = updateAssessmentTemplate;
const deleteAssessmentTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await models_1.AssessmentTemplate.findByIdAndDelete(id);
        if (!template) {
            res.status(404).json({ error: 'Template not found' });
            return;
        }
        res.json({ success: true, message: 'Template deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteAssessmentTemplate = deleteAssessmentTemplate;
//# sourceMappingURL=assessmentTemplateController.js.map