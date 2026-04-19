import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { db } from '../src/db.js';

describe('Compare API', () => {
    beforeEach(() => {
        db.prepare('DELETE FROM comparisons').run();
    });

    it('POST /compare — should create a comparison', async () => {
        const res = await request(app)
            .post('/compare')
            .send({
                testIds: [' test-1 ', 'test-2', 'test-1'],
                name: 'Test Comparison',
                description: '  baseline analysis  ',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Comparison');
        expect(res.body.testIds).toEqual(['test-1', 'test-2']);
        expect(res.body.description).toBe('baseline analysis');
    });

    it('POST /compare — should reject malformed test ids', async () => {
        const res = await request(app)
            .post('/compare')
            .send({
                testIds: ['one'],
                name: 'Invalid Comparison',
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('At least two');
    });

    it('POST /compare — should reject malformed name type/value', async () => {
        const res = await request(app)
            .post('/compare')
            .send({
                testIds: ['one', 'two'],
                name: '   ',
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('name must be a non-empty string');
    });

    it('GET /compare — should return all comparisons', async () => {
        await request(app)
            .post('/compare')
            .send({
                testIds: ['a', 'b'],
                name: 'Comp A',
            });

        const res = await request(app).get('/compare');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(Array.isArray(res.body[0].testIds)).toBe(true);
    });

    it('POST /compare/analyze — should analyze test results', async () => {
        const mockResults = [
            {
                modelName: 'Model A',
                riskScore: 45,
                riskLevel: 'MEDIUM',
                passed: 8,
                failed: 7,
                totalAttacks: 15,
                results: [
                    { category: 'prompt_injection', vulnerable: true },
                    { category: 'prompt_injection', vulnerable: false },
                ],
            },
            {
                modelName: 'Model B',
                riskScore: 20,
                riskLevel: 'LOW',
                passed: 12,
                failed: 3,
                totalAttacks: 15,
                results: [
                    { category: 'prompt_injection', vulnerable: false },
                    { category: 'prompt_injection', vulnerable: false },
                ],
            },
        ];

        const res = await request(app)
            .post('/compare/analyze')
            .send({ testResults: mockResults });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('summary');
        expect(res.body).toHaveProperty('models');
        expect(res.body).toHaveProperty('categoryBreakdown');
        expect(res.body).toHaveProperty('recommendations');
        expect(res.body.summary.mostSecure.name).toBe('Model B');
        expect(res.body.summary.leastSecure.name).toBe('Model A');
    });

    it('POST /compare/analyze — should return 400 with fewer than 2 results', async () => {
        const res = await request(app)
            .post('/compare/analyze')
            .send({ testResults: [{ modelName: 'Only one' }] });

        expect(res.status).toBe(400);
    });
});
