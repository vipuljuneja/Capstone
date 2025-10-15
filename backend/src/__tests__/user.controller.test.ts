import { Request, Response } from 'express';
import {
  addUserAchievement,
  createUser,
  deleteUser,
  getUserByAuthUid,
  updateUserProfile,
  updateUserStreak
} from '../controllers/userController';
import { AssessmentResponse, EncouragementNote, PracticeSession, Progress, User } from '../models';

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

const createMockResponse = (): MockResponse => {
  const res = {} as MockResponse;
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

  const mockUserDocument = (overrides: Partial<any> = {}) => ({
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
    jest.spyOn(User, 'findOne').mockResolvedValue(null as any);
    jest.spyOn(User, 'create').mockResolvedValue(mockUserDocument() as any);

    const req = { body: baseUserPayload } as Request;
    const res = createMockResponse();

    await createUser(req, res);

    expect(User.create).toHaveBeenCalledWith({
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
    jest.spyOn(User, 'findOne').mockResolvedValue(mockUserDocument() as any);
    jest.spyOn(User, 'create').mockResolvedValue(mockUserDocument() as any);

    const req = { body: baseUserPayload } as Request;
    const res = createMockResponse();

    await createUser(req, res);

    expect(User.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
  });

  it('returns a user by authUid', async () => {
    const user = mockUserDocument();
    jest.spyOn(User, 'findOne').mockResolvedValue(user as any);

    const req = { params: { authUid: baseUserPayload.authUid } } as unknown as Request;
    const res = createMockResponse();

    await getUserByAuthUid(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: user });
  });

  it('handles missing user on get', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null as any);

    const req = { params: { authUid: 'missing' } } as unknown as Request;
    const res = createMockResponse();

    await getUserByAuthUid(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('updates user profile when found', async () => {
    const updated = mockUserDocument({
      name: 'Updated',
      profile: { severityLevel: 'Mild', focusHints: ['Focus'] }
    });

    jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(updated as any);

    const req = {
      params: { authUid: baseUserPayload.authUid },
      body: { name: 'Updated', profile: updated.profile }
    } as unknown as Request;
    const res = createMockResponse();

    await updateUserProfile(req, res);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { authUid: baseUserPayload.authUid },
      { name: 'Updated', profile: updated.profile },
      { new: true, runValidators: true }
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
  });

  it('returns 404 when updating profile for missing user', async () => {
    jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(null as any);

    const req = {
      params: { authUid: 'missing' },
      body: { name: 'Updated' }
    } as unknown as Request;
    const res = createMockResponse();

    await updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('initializes streak on first update', async () => {
    const user = mockUserDocument();
    jest.spyOn(User, 'findOne').mockResolvedValue(user as any);

    const req = { params: { authUid: baseUserPayload.authUid } } as unknown as Request;
    const res = createMockResponse();

    await updateUserStreak(req, res);

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
    jest.spyOn(User, 'findOne').mockResolvedValue(user as any);

    const req = { params: { authUid: baseUserPayload.authUid } } as unknown as Request;
    const res = createMockResponse();

    await updateUserStreak(req, res);

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
    jest.spyOn(User, 'findOne').mockResolvedValue(user as any);

    const req = { params: { authUid: baseUserPayload.authUid } } as unknown as Request;
    const res = createMockResponse();

    await updateUserStreak(req, res);

    expect(user.streak.current).toBe(1);
    expect(user.streak.longest).toBe(6);
  });

  it('returns 404 when updating streak for missing user', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null as any);

    const req = { params: { authUid: 'missing' } } as unknown as Request;
    const res = createMockResponse();

    await updateUserStreak(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('adds achievement without duplicates', async () => {
    const user = mockUserDocument();
    jest.spyOn(User, 'findOne').mockResolvedValue(user as any);

    const req = {
      params: { authUid: baseUserPayload.authUid },
      body: { achievementKey: 'first-session' }
    } as unknown as Request;
    const res = createMockResponse();

    await addUserAchievement(req, res);
    await addUserAchievement(req, res);

    expect(user.achievements).toEqual(['first-session']);
    expect(res.json).toHaveBeenLastCalledWith({ success: true, data: ['first-session'] });
  });

  it('returns 404 when adding achievement for missing user', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null as any);

    const req = {
      params: { authUid: 'missing' },
      body: { achievementKey: 'missing' }
    } as unknown as Request;
    const res = createMockResponse();

    await addUserAchievement(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('deletes a user and cascades related data', async () => {
    const user = mockUserDocument();
    jest.spyOn(User, 'findOneAndDelete').mockResolvedValue(user as any);
    jest.spyOn(AssessmentResponse, 'deleteMany').mockResolvedValue({ acknowledged: true } as any);
    jest.spyOn(PracticeSession, 'deleteMany').mockResolvedValue({ acknowledged: true } as any);
    jest.spyOn(Progress, 'deleteMany').mockResolvedValue({ acknowledged: true } as any);
    jest.spyOn(EncouragementNote, 'deleteMany').mockResolvedValue({ acknowledged: true } as any);

    const req = { params: { authUid: baseUserPayload.authUid } } as unknown as Request;
    const res = createMockResponse();

    await deleteUser(req, res);

    expect(AssessmentResponse.deleteMany).toHaveBeenCalledWith({ userId: user._id });
    expect(PracticeSession.deleteMany).toHaveBeenCalledWith({ userId: user._id });
    expect(Progress.deleteMany).toHaveBeenCalledWith({ userId: user._id });
    expect(EncouragementNote.deleteMany).toHaveBeenCalledWith({ userId: user._id });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User and related data deleted' });
  });

  it('returns 404 when deleting missing user', async () => {
    jest.spyOn(User, 'findOneAndDelete').mockResolvedValue(null as any);

    const req = { params: { authUid: 'missing' } } as unknown as Request;
    const res = createMockResponse();

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });
});
