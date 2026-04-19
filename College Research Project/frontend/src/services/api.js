import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
    || (import.meta.env.PROD ? '' : 'http://localhost:3001');

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const normalized = error;
        const apiMessage =
            normalized?.response?.data?.message
            || normalized?.response?.data?.error
            || normalized?.message
            || 'Request failed';

        normalized.message = apiMessage;
        normalized.isApiError = true;
        normalized.status = normalized?.response?.status || null;
        normalized.data = normalized?.response?.data || null;

        return Promise.reject(normalized);
    }
);

export const modelsAPI = {
    getAll: () => api.get('/models'),
    add: (model) => api.post('/models', model),
    test: (id) => api.post(`/models/${id}/test`),
    delete: (id) => api.delete(`/models/${id}`)
};

export const attacksAPI = {
    getAll: (category) => {
        const hasCategory = typeof category === 'string' && category.trim().length > 0;
        return hasCategory
            ? api.get('/attacks', { params: { category: category.trim() } })
            : api.get('/attacks');
    },
    getCategories: () => api.get('/attacks/categories'),
    getById: (id) => api.get(`/attacks/${id}`),
    create: (attack) => api.post('/attacks', attack),
    delete: (id) => api.delete(`/attacks/${id}`),
};

export const testsAPI = {
    run: (data) => api.post('/tests/run', data),
    autoScan: (data) => api.post('/tests/auto-scan', data),
    getAll: () => api.get('/tests'),
    getById: (id) => api.get(`/tests/${id}`),
};

export const defensesAPI = {
    getAll: () => api.get('/defenses'),
    apply: (data) => api.post('/defenses/apply', data),
    scanOutput: (data) => api.post('/defenses/scan-output', data),
};

export const compareAPI = {
    create: (data) => api.post('/compare', data),
    getAll: () => api.get('/compare'),
    analyze: (data) => api.post('/compare/analyze', data),
};

export default api;