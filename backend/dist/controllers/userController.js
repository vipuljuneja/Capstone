"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.addUserAchievement = exports.updateUserStreak = exports.updateSeverityLevel = exports.updateHasSeenTour = exports.updateOnboardingStatus = exports.updateUserProfile = exports.getUserByAuthUid = exports.createUser = void 0;
const models_1 = require("../models");
const createUser = async (req, res) => {
    try {
        const { authUid, email, name, profile } = req.body;
        // Validate required fields
        if (!authUid || !email || !name) {
            res.status(400).json({ error: 'authUid, email, and name are required' });
            return;
        }
        // Check if user already exists
        const existingUser = await models_1.User.findOne({ authUid });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        // Create new user
        const user = await models_1.User.create({
            authUid,
            email,
            name,
            onboarding: { completed: false, completedAt: null },
            profile: profile || { severityLevel: 'Moderate', focusHints: [] },
            streak: { current: 0, longest: 0, lastActiveAt: null },
            achievements: []
        });
        console.log('✅ User created in MongoDB:', user._id);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.createUser = createUser;
const getUserByAuthUid = async (req, res) => {
    try {
        const { authUid } = req.params;
        const user = await models_1.User.findOne({ authUid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserByAuthUid = getUserByAuthUid;
const updateUserProfile = async (req, res) => {
    try {
        const { authUid } = req.params;
        const { name, profile, avatarImage } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (profile !== undefined)
            updateData.profile = profile;
        if (avatarImage !== undefined)
            updateData.avatarImage = avatarImage;
        const user = await models_1.User.findOneAndUpdate({ authUid }, updateData, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateUserProfile = updateUserProfile;
const updateOnboardingStatus = async (req, res) => {
    try {
        const { authUid } = req.params;
        const { completed } = req.body;
        if (typeof completed !== 'boolean') {
            res.status(400).json({ error: 'completed flag must be provided as a boolean' });
            return;
        }
        const update = {
            'onboarding.completed': completed,
            'onboarding.completedAt': completed ? new Date() : null
        };
        const user = await models_1.User.findOneAndUpdate({ authUid }, update, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateOnboardingStatus = updateOnboardingStatus;
const updateHasSeenTour = async (req, res) => {
    try {
        const { authUid } = req.params;
        const { hasSeenTour } = req.body;
        if (typeof hasSeenTour !== 'boolean') {
            res.status(400).json({ error: 'hasSeenTour must be provided as a boolean' });
            return;
        }
        const user = await models_1.User.findOneAndUpdate({ authUid }, { hasSeenTour }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateHasSeenTour = updateHasSeenTour;
const updateSeverityLevel = async (req, res) => {
    try {
        const { authUid } = req.params;
        const { severityLevel } = req.body;
        if (!severityLevel) {
            res.status(400).json({ error: 'severityLevel is required' });
            return;
        }
        const validLevels = ['Minimal', 'Mild', 'Moderate', 'Severe'];
        if (!validLevels.includes(severityLevel)) {
            res.status(400).json({ error: 'Invalid severity level. Must be one of: Minimal, Mild, Moderate, Severe' });
            return;
        }
        const user = await models_1.User.findOneAndUpdate({ authUid }, { 'profile.severityLevel': severityLevel }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateSeverityLevel = updateSeverityLevel;
const updateUserStreak = async (req, res) => {
    try {
        const { authUid } = req.params;
        const user = await models_1.User.findOne({ authUid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const now = new Date();
        const lastActive = user.streak.lastActiveAt;
        if (!lastActive) {
            user.streak.current = 1;
            user.streak.longest = 1;
        }
        else {
            const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceActive === 0) {
                // Already active today
            }
            else if (daysSinceActive === 1) {
                user.streak.current += 1;
                if (user.streak.current > user.streak.longest) {
                    user.streak.longest = user.streak.current;
                }
            }
            else {
                user.streak.current = 1;
            }
        }
        user.streak.lastActiveAt = now;
        await user.save();
        res.json({ success: true, data: user.streak });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateUserStreak = updateUserStreak;
const addUserAchievement = async (req, res) => {
    try {
        const { authUid } = req.params;
        const { achievementKey } = req.body;
        const user = await models_1.User.findOne({ authUid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (!user.achievements.includes(achievementKey)) {
            user.achievements.push(achievementKey);
            await user.save();
        }
        res.json({ success: true, data: user.achievements });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addUserAchievement = addUserAchievement;
const deleteUser = async (req, res) => {
    try {
        const { authUid } = req.params;
        const user = await models_1.User.findOneAndDelete({ authUid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await models_1.AssessmentResponse.deleteMany({ userId: user._id });
        await models_1.PracticeSession.deleteMany({ userId: user._id });
        await models_1.Progress.deleteMany({ userId: user._id });
        await models_1.EncouragementNote.deleteMany({ userId: user._id });
        res.json({ success: true, message: 'User and related data deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map