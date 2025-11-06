"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.updateNote = exports.getNoteById = exports.getUserNotes = exports.createEncouragementNote = void 0;
const models_1 = require("../models");
const createEncouragementNote = async (req, res) => {
    try {
        const { userId, date, title, body, tags, linkedSessionId } = req.body;
        const note = await models_1.EncouragementNote.create({
            userId,
            date,
            title,
            body,
            tags: tags || [],
            linkedSessionId: linkedSessionId || null
        });
        res.status(201).json({ success: true, data: note });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createEncouragementNote = createEncouragementNote;
const getUserNotes = async (req, res) => {
    try {
        const { userId } = req.params;
        const { tags, date } = req.query;
        const filter = { userId };
        if (tags) {
            filter.tags = { $in: tags.split(',') };
        }
        if (date) {
            filter.date = date;
        }
        const notes = await models_1.EncouragementNote.find(filter)
            .populate('linkedSessionId')
            .sort({ date: -1, createdAt: -1 });
        res.json({ success: true, data: notes });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserNotes = getUserNotes;
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await models_1.EncouragementNote.findById(id).populate('linkedSessionId');
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        res.json({ success: true, data: note });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getNoteById = getNoteById;
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const note = await models_1.EncouragementNote.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        res.json({ success: true, data: note });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateNote = updateNote;
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await models_1.EncouragementNote.findByIdAndDelete(id);
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        res.json({ success: true, message: 'Note deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteNote = deleteNote;
//# sourceMappingURL=encouragementController.js.map