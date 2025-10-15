process.env.NODE_ENV = 'test';
process.env.ALLOWED_ORIGINS = 'http://localhost';

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
