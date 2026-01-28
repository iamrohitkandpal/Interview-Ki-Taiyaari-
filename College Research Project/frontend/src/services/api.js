import axios from 'axios';

const API_BASE = import.meta.env.PROD
    ? 'https://api.example.com'
    : 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const modelsAPI = {
    getAll: () => api.get('/models'),
    add: (model) => api.post('/models', model),
    update: (id) => api.post(`/models/${id}/test`),
    delete: (id) => api.delete(`/models/${id}`)
}

export const attacksAPI = {
    getAll: (category) => api.get('/attacks', { params: { category } }),
    getCategories: () => api.get('/attacks/categories'),
    getById: (id) => api.get(`/attacks/${id}`),
    create: (attack) => api.post(`/attacks`, attack)
}

export const testsAPI = {
    run: (data) => api.post('/tests/run', data),
    getAll: () => api.get('/tests'),
    getById: (id) => api.get(`/tests/${id}`),
}

export const defensesAPI = {
    getAll: () => api.get('/defenses'),
    apply: (data) => api.post('/defenses/apply', data),
    scanOutput: (data) => api.post('/defenses/scan-output', data),
}

export const compareAPI = {
    analyze: (data) => api.post('/compare/analyze', data),
}

export default api;