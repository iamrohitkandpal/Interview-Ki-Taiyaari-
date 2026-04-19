import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockApi, mockCreate } = vi.hoisted(() => {
  const api = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  };

  return {
    mockApi: api,
    mockCreate: vi.fn(() => api),
  };
});

vi.mock('axios', () => ({
  default: {
    create: mockCreate,
  },
}));

describe('api service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('creates axios client and configures response interceptor', async () => {
    await import('../src/services/api.js');

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockApi.interceptors.response.use).toHaveBeenCalledTimes(1);
  });

  it('normalizes api errors through response interceptor', async () => {
    await import('../src/services/api.js');

    const [, onRejected] = mockApi.interceptors.response.use.mock.calls[0];
    const error = {
      response: {
        status: 422,
        data: { message: 'Validation failed' },
      },
      message: 'Original error',
    };

    await expect(onRejected(error)).rejects.toMatchObject({
      message: 'Validation failed',
      isApiError: true,
      status: 422,
      data: { message: 'Validation failed' },
    });
  });

  it('calls model endpoints through wrapper methods', async () => {
    const { modelsAPI } = await import('../src/services/api.js');

    await modelsAPI.getAll();
    await modelsAPI.add({ name: 'M1' });
    await modelsAPI.test('model-id');
    await modelsAPI.delete('model-id');

    expect(mockApi.get).toHaveBeenCalledWith('/models');
    expect(mockApi.post).toHaveBeenCalledWith('/models', { name: 'M1' });
    expect(mockApi.post).toHaveBeenCalledWith('/models/model-id/test');
    expect(mockApi.delete).toHaveBeenCalledWith('/models/model-id');
  });

  it('calls attacks endpoint with and without category', async () => {
    const { attacksAPI } = await import('../src/services/api.js');

    await attacksAPI.getAll();
    await attacksAPI.getAll('  jailbreak  ');

    expect(mockApi.get).toHaveBeenCalledWith('/attacks');
    expect(mockApi.get).toHaveBeenCalledWith('/attacks', { params: { category: 'jailbreak' } });
  });

  it('calls tests, defenses, and compare wrappers', async () => {
    const { testsAPI, defensesAPI, compareAPI } = await import('../src/services/api.js');

    await testsAPI.run({ payload: true });
    await testsAPI.autoScan({ payload: true });
    await testsAPI.getAll();
    await testsAPI.getById('test-id');

    await defensesAPI.getAll();
    await defensesAPI.apply({ prompt: 'p' });
    await defensesAPI.scanOutput({ response: 'r' });

    await compareAPI.create({ testIds: ['a', 'b'] });
    await compareAPI.getAll();
    await compareAPI.analyze({ testResults: [] });

    expect(mockApi.post).toHaveBeenCalledWith('/tests/run', { payload: true });
    expect(mockApi.post).toHaveBeenCalledWith('/tests/auto-scan', { payload: true });
    expect(mockApi.get).toHaveBeenCalledWith('/tests');
    expect(mockApi.get).toHaveBeenCalledWith('/tests/test-id');

    expect(mockApi.get).toHaveBeenCalledWith('/defenses');
    expect(mockApi.post).toHaveBeenCalledWith('/defenses/apply', { prompt: 'p' });
    expect(mockApi.post).toHaveBeenCalledWith('/defenses/scan-output', { response: 'r' });

    expect(mockApi.post).toHaveBeenCalledWith('/compare', { testIds: ['a', 'b'] });
    expect(mockApi.get).toHaveBeenCalledWith('/compare');
    expect(mockApi.post).toHaveBeenCalledWith('/compare/analyze', { testResults: [] });
  });
});
