"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("../controllers/userController");
const models_1 = require("../models");
const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
describe('userController', () => {
    const baseUserPayload = {
        authUid: 'auth-123',
        email: 'user@example.com',
        name: 'Test User'
    };
    const mockUserDocument = (overrides = {}) => ({
        _id: '507f1f77bcf86cd799439011',
        authUid: baseUserPayload.authUid,
        email: baseUserPayload.email,
        name: baseUserPayload.name,
        profile: {
            severityLevel: 'Moderate',
            focusHints: []
        },
        streak: {
            current: 0,
            longest: 0,
            lastActiveAt: null
        },
        achievements: [],
        save: jest.fn().mockResolvedValue(undefined),
        ...overrides
    });
    it('creates a new user', async () => {
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(null);
        jest.spyOn(models_1.User, 'create').mockResolvedValue(mockUserDocument());
        const req = { body: baseUserPayload };
        const res = createMockResponse();
        await (0, userController_1.createUser)(req, res);
        expect(models_1.User.create).toHaveBeenCalledWith({
            authUid: baseUserPayload.authUid,
            email: baseUserPayload.email,
            name: baseUserPayload.name,
            profile: { severityLevel: 'Moderate', focusHints: [] },
            streak: { current: 0, longest: 0, lastActiveAt: null },
            achievements: []
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    it('rejects creation if user exists', async () => {
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(mockUserDocument());
        jest.spyOn(models_1.User, 'create').mockResolvedValue(mockUserDocument());
        const req = { body: baseUserPayload };
        const res = createMockResponse();
        await (0, userController_1.createUser)(req, res);
        expect(models_1.User.create).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });
    it('returns a user by authUid', async () => {
        const user = mockUserDocument();
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(user);
        const req = { params: { authUid: baseUserPayload.authUid } };
        const res = createMockResponse();
        await (0, userController_1.getUserByAuthUid)(req, res);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: user });
    });
    it('handles missing user on get', async () => {
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(null);
        const req = { params: { authUid: 'missing' } };
        const res = createMockResponse();
        await (0, userController_1.getUserByAuthUid)(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    it('updates user profile when found', async () => {
        const updated = mockUserDocument({
            name: 'Updated',
            profile: { severityLevel: 'Mild', focusHints: ['Focus'] }
        });
        jest.spyOn(models_1.User, 'findOneAndUpdate').mockResolvedValue(updated);
        const req = {
            params: { authUid: baseUserPayload.authUid },
            body: { name: 'Updated', profile: updated.profile }
        };
        const res = createMockResponse();
        await (0, userController_1.updateUserProfile)(req, res);
        expect(models_1.User.findOneAndUpdate).toHaveBeenCalledWith({ authUid: baseUserPayload.authUid }, { name: 'Updated', profile: updated.profile }, { new: true, runValidators: true });
        expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
    });
    it('returns 404 when updating profile for missing user', async () => {
        jest.spyOn(models_1.User, 'findOneAndUpdate').mockResolvedValue(null);
        const req = {
            params: { authUid: 'missing' },
            body: { name: 'Updated' }
        };
        const res = createMockResponse();
        await (0, userController_1.updateUserProfile)(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    it('initializes streak on first update', async () => {
        const user = mockUserDocument();
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(user);
        const req = { params: { authUid: baseUserPayload.authUid } };
        const res = createMockResponse();
        await (0, userController_1.updateUserStreak)(req, res);
        expect(user.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ success: true, data: user.streak });
        expect(user.streak.current).toBe(1);
        expect(user.streak.longest).toBe(1);
    });
    it('increments streak when last active yesterday', async () => {
        const user = mockUserDocument({
            streak: {
                current: 2,
                longest: 3,
                lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        });
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(user);
        const req = { params: { authUid: baseUserPayload.authUid } };
        const res = createMockResponse();
        await (0, userController_1.updateUserStreak)(req, res);
        expect(user.streak.current).toBe(3);
        expect(user.streak.longest).toBe(3);
    });
    it('resets streak when gap is more than a day', async () => {
        const user = mockUserDocument({
            streak: {
                current: 4,
                longest: 6,
                lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
        });
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(user);
        const req = { params: { authUid: baseUserPayload.authUid } };
        const res = createMockResponse();
        await (0, userController_1.updateUserStreak)(req, res);
        expect(user.streak.current).toBe(1);
        expect(user.streak.longest).toBe(6);
    });
    it('returns 404 when updating streak for missing user', async () => {
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(null);
        const req = { params: { authUid: 'missing' } };
        const res = createMockResponse();
        await (0, userController_1.updateUserStreak)(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    it('adds achievement without duplicates', async () => {
        const user = mockUserDocument();
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(user);
        const req = {
            params: { authUid: baseUserPayload.authUid },
            body: { achievementKey: 'first-session' }
        };
        const res = createMockResponse();
        await (0, userController_1.addUserAchievement)(req, res);
        await (0, userController_1.addUserAchievement)(req, res);
        expect(user.achievements).toEqual(['first-session']);
        expect(res.json).toHaveBeenLastCalledWith({ success: true, data: ['first-session'] });
    });
    it('returns 404 when adding achievement for missing user', async () => {
        jest.spyOn(models_1.User, 'findOne').mockResolvedValue(null);
        const req = {
            params: { authUid: 'missing' },
            body: { achievementKey: 'missing' }
        };
        const res = createMockResponse();
        await (0, userController_1.addUserAchievement)(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    it('deletes a user and cascades related data', async () => {
        const user = mockUserDocument();
        jest.spyOn(models_1.User, 'findOneAndDelete').mockResolvedValue(user);
        jest.spyOn(models_1.AssessmentResponse, 'deleteMany').mockResolvedValue({ acknowledged: true });
        jest.spyOn(models_1.PracticeSession, 'deleteMany').mockResolvedValue({ acknowledged: true });
        jest.spyOn(models_1.Progress, 'deleteMany').mockResolvedValue({ acknowledged: true });
        jest.spyOn(models_1.EncouragementNote, 'deleteMany').mockResolvedValue({ acknowledged: true });
        const req = { params: { authUid: baseUserPayload.authUid } };
        const res = createMockResponse();
        await (0, userController_1.deleteUser)(req, res);
        expect(models_1.AssessmentResponse.deleteMany).toHaveBeenCalledWith({ userId: user._id });
        expect(models_1.PracticeSession.deleteMany).toHaveBeenCalledWith({ userId: user._id });
        expect(models_1.Progress.deleteMany).toHaveBeenCalledWith({ userId: user._id });
        expect(models_1.EncouragementNote.deleteMany).toHaveBeenCalledWith({ userId: user._id });
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User and related data deleted' });
    });
    it('returns 404 when deleting missing user', async () => {
        jest.spyOn(models_1.User, 'findOneAndDelete').mockResolvedValue(null);
        const req = { params: { authUid: 'missing' } };
        const res = createMockResponse();
        await (0, userController_1.deleteUser)(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
});
//# sourceMappingURL=user.controller.test.js.map