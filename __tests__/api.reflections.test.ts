import axios from 'axios';

jest.mock(
  '@env',
  () => ({
    BACKEND_URL: 'http://test-backend',
  }),
  { virtual: true },
);

jest.mock('axios');

type Reflection = import('../src/services/api').Reflection;

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Ensure React Native global flag exists
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).__DEV__ = true;

let createReflection: typeof import('../src/services/api').createReflection;
let getReflectionsByUser: typeof import('../src/services/api').getReflectionsByUser;
let getReflectionDates: typeof import('../src/services/api').getReflectionDates;
let getReflectionById: typeof import('../src/services/api').getReflectionById;
let updateReflection: typeof import('../src/services/api').updateReflection;
let deleteReflection: typeof import('../src/services/api').deleteReflection;
let createPipoNoteFromSession: typeof import('../src/services/api').createPipoNoteFromSession;

const consoleErrorSpy = jest
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

const sampleReflection: Reflection = {
  _id: 'reflection-1',
  userId: 'user-1',
  title: 'Sample Reflection',
  description: 'Testing reflection handling',
  date: '2024-10-01T00:00:00.000Z',
  type: 'self',
  createdAt: '2024-10-01T00:00:00.000Z',
  updatedAt: '2024-10-01T00:00:00.000Z',
};

beforeAll(() => {
  mockedAxios.create.mockReturnValue(mockAxiosInstance as never);
  mockedAxios.isAxiosError.mockImplementation(
    (error: unknown): error is { isAxiosError: boolean } =>
      Boolean((error as { isAxiosError?: boolean } | undefined)?.isAxiosError),
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apiModule = require('../src/services/api') as typeof import('../src/services/api');

  createReflection = apiModule.createReflection;
  getReflectionsByUser = apiModule.getReflectionsByUser;
  getReflectionDates = apiModule.getReflectionDates;
  getReflectionById = apiModule.getReflectionById;
  updateReflection = apiModule.updateReflection;
  deleteReflection = apiModule.deleteReflection;
  createPipoNoteFromSession = apiModule.createPipoNoteFromSession;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockAxiosInstance.get.mockReset();
  mockAxiosInstance.post.mockReset();
  mockAxiosInstance.put.mockReset();
  mockAxiosInstance.delete.mockReset();
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe('Reflection API client', () => {
  it('creates a reflection when backend succeeds', async () => {
    mockAxiosInstance.post.mockResolvedValue({
      data: { success: true, data: sampleReflection },
    });

    const payload = {
      userId: 'user-1',
      title: 'New Reflection',
      description: 'Today went great',
      date: '2024-10-02',
      type: 'self' as const,
    };

    const result = await createReflection(payload);

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/reflections', payload);
    expect(result).toEqual(sampleReflection);
  });

  it('throws when backend fails to mark success for createReflection', async () => {
    mockAxiosInstance.post.mockResolvedValue({
      data: { success: false, data: null },
    });

    await expect(
      createReflection({
        userId: 'user-1',
        title: 'Bad Reflection',
        date: '2024-10-03',
      }),
    ).rejects.toThrow('Failed to create reflection');
  });

  it('fetches reflections with provided filters', async () => {
    const reflections = [sampleReflection];
    mockAxiosInstance.get.mockResolvedValue({
      data: { success: true, data: reflections },
    });

    const params = { date: '2024-10-01', type: 'self' as const };
    const result = await getReflectionsByUser('user-1', params);

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/reflections/user/user-1',
      { params },
    );
    expect(result).toEqual(reflections);
  });

  it('throws when fetching reflections returns an invalid envelope', async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: { success: false, data: null },
    });

    await expect(getReflectionsByUser('user-1')).rejects.toThrow(
      'Failed to fetch reflections',
    );
  });

  it('loads reflection dates for calendar markers', async () => {
    const responseData = [
      { date: '2024-10-01', type: 'self' as const },
      { date: '2024-10-02', type: 'pipo' as const },
    ];
    mockAxiosInstance.get.mockResolvedValue({
      data: { success: true, data: responseData },
    });

    const result = await getReflectionDates('user-1', {
      startDate: '2024-10-01',
      endDate: '2024-10-07',
    });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/reflections/user/user-1/dates',
      { params: { startDate: '2024-10-01', endDate: '2024-10-07' } },
    );
    expect(result).toEqual(responseData);
  });

  it('retrieves a single reflection by id', async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: { success: true, data: sampleReflection },
    });

    const result = await getReflectionById('reflection-1');

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/reflections/reflection-1',
    );
    expect(result).toEqual(sampleReflection);
  });

  it('updates a reflection', async () => {
    const updatedReflection: Reflection = {
      ...sampleReflection,
      title: 'Updated Title',
    };
    mockAxiosInstance.put.mockResolvedValue({
      data: { success: true, data: updatedReflection },
    });

    const result = await updateReflection('reflection-1', {
      title: 'Updated Title',
    });

    expect(mockAxiosInstance.put).toHaveBeenCalledWith(
      '/reflections/reflection-1',
      { title: 'Updated Title' },
    );
    expect(result).toEqual(updatedReflection);
  });

  it('throws when deleting reflection fails', async () => {
    mockAxiosInstance.delete.mockResolvedValue({
      data: { success: false, data: null },
    });

    await expect(deleteReflection('reflection-1')).rejects.toThrow(
      'Failed to delete reflection',
    );
  });

  it('deletes a reflection when backend confirms success', async () => {
    mockAxiosInstance.delete.mockResolvedValue({
      data: { success: true, data: { message: 'Deleted' } },
    });

    await deleteReflection('reflection-1');

    expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
      '/reflections/reflection-1',
    );
  });

  it('creates a Pipo note from a session id', async () => {
    mockAxiosInstance.post.mockResolvedValue({
      data: { success: true, data: sampleReflection },
    });

    const result = await createPipoNoteFromSession('session-1');

    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      '/reflections/from-session',
      { sessionId: 'session-1' },
    );
    expect(result).toEqual(sampleReflection);
  });
});
