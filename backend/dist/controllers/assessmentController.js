"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestAssessmentResponse = exports.getUserAssessmentResponses = exports.submitAssessmentResponse = void 0;
const models_1 = require("../models");
const submitAssessmentResponse = async (req, res) => {
    try {
        const { userId, templateId, responses, derived, notes } = req.body;
        const response = await models_1.AssessmentResponse.create({
            userId,
            templateId,
            responses,
            derived,
            notes,
            completedAt: new Date()
        });
        await models_1.User.findByIdAndUpdate(userId, {
            'profile.severityLevel': derived.severityLevel,
            'profile.focusHints': derived.recommendedTracks
        });
        res.status(201).json({ success: true, data: response });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.submitAssessmentResponse = submitAssessmentResponse;
const getUserAssessmentResponses = async (req, res) => {
    try {
        const { userId } = req.params;
        const responses = await models_1.AssessmentResponse.find({ userId })
            .populate('templateId')
            .sort({ completedAt: -1 });
        res.json({ success: true, data: responses });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserAssessmentResponses = getUserAssessmentResponses;
const getLatestAssessmentResponse = async (req, res) => {
    try {
        const { userId } = req.params;
        const response = await models_1.AssessmentResponse.findOne({ userId })
            .populate('templateId')
            .sort({ completedAt: -1 });
        if (!response) {
            res.status(404).json({ error: 'No assessment found' });
            return;
        }
        res.json({ success: true, data: response });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getLatestAssessmentResponse = getLatestAssessmentResponse;
//# sourceMappingURL=assessmentController.js.map