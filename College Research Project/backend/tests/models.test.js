import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { db } from '../src/db.js';

describe('Models API', () => {
    beforeEach(() => {
        db.prepare('DELETE FROM models').run();
    });

    it('POST /models — should add a new model', async () => {
        const res = await request(app)
            .post('/models')
            .send({
                name: 'Test Model',
                provider: 'groq',
                apiKey: 'test-key-123',
                modelId: 'llama-3.3-70b-versatile',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Model');
        expect(res.body.provider).toBe('groq');
    });

    it('POST /models — should reject missing required fields', async () => {
        const res = await request(app)
            .post('/models')
            .send({
                name: '',
                provider: 'groq',
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('required');
    });

    it('POST /models — should reject invalid provider', async () => {
        const res = await request(app)
            .post('/models')
            .send({
                name: 'Bad Provider Model',
                provider: 'invalid-provider',
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('provider must be one of');
    });

    it('GET /models — should return all models', async () => {
        await request(app)
            .post('/models')
            .send({
                name: 'Model A',
                provider: 'groq',
                apiKey: 'test-key-123',
            });

        const res = await request(app).get('/models');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /models/:id/test — should fail gracefully for custom model without endpoint', async () => {
        const createRes = await request(app)
            .post('/models')
            .send({
                name: 'Custom Model',
                provider: 'custom',
                modelId: 'local-model',
            });

        const res = await request(app).post(`/models/${createRes.body.id}/test`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(false);
        expect(typeof res.body.message).toBe('string');
    });

    it('POST /models/:id/test — should return 404 for unknown model', async () => {
        const res = await request(app).post('/models/nonexistent-id/test');

        expect(res.status).toBe(404);
        expect(res.body.message).toContain('not found');
    });

    it('DELETE /models/:id — should delete an existing model', async () => {
        const createRes = await request(app)
            .post('/models')
            .send({
                name: 'Model to delete',
                provider: 'groq',
                apiKey: 'test-key-123',
            });

        const res = await request(app).delete(`/models/${createRes.body.id}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('deleted');
    });

    it('DELETE /models/:id — should return 404 for unknown id', async () => {
        const res = await request(app).delete('/models/nonexistent-id');

        expect(res.status).toBe(404);
        expect(res.body.message).toContain('not found');
    });
});
