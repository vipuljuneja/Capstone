"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMediaJobsForScenario = exports.getMediaJobsByStatus = exports.updateMediaJobStatus = exports.getMediaJobByJobId = exports.getMediaJobById = exports.createMediaJob = void 0;
const models_1 = require("../models");
const createMediaJob = async (req, res) => {
    try {
        const { scenarioId, level, questionOrder, provider, jobId, source } = req.body;
        const mediaJob = await models_1.MediaJob.create({
            scenarioId,
            level,
            questionOrder,
            provider,
            jobId,
            status: 'queued',
            requestedAt: new Date(),
            source,
            output: null,
            error: null
        });
        res.status(201).json({ success: true, data: mediaJob });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createMediaJob = createMediaJob;
const getMediaJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const mediaJob = await models_1.MediaJob.findById(id);
        if (!mediaJob) {
            res.status(404).json({ error: 'Media job not found' });
            return;
        }
        res.json({ success: true, data: mediaJob });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMediaJobById = getMediaJobById;
const getMediaJobByJobId = async (req, res) => {
    try {
        const { jobId } = req.params;
        const mediaJob = await models_1.MediaJob.findOne({ jobId });
        if (!mediaJob) {
            res.status(404).json({ error: 'Media job not found' });
            return;
        }
        res.json({ success: true, data: mediaJob });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMediaJobByJobId = getMediaJobByJobId;
const updateMediaJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status, output, error } = req.body;
        const mediaJob = await models_1.MediaJob.findOneAndUpdate({ jobId }, { status, output, error }, { new: true, runValidators: true });
        if (!mediaJob) {
            res.status(404).json({ error: 'Media job not found' });
            return;
        }
        res.json({ success: true, data: mediaJob });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateMediaJobStatus = updateMediaJobStatus;
const getMediaJobsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const mediaJobs = await models_1.MediaJob.find({ status }).sort({ requestedAt: 1 });
        res.json({ success: true, data: mediaJobs });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMediaJobsByStatus = getMediaJobsByStatus;
const getMediaJobsForScenario = async (req, res) => {
    try {
        const { scenarioId } = req.params;
        const mediaJobs = await models_1.MediaJob.find({ scenarioId }).sort({ level: 1, questionOrder: 1 });
        res.json({ success: true, data: mediaJobs });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMediaJobsForScenario = getMediaJobsForScenario;
//# sourceMappingURL=mediaJobController.js.map