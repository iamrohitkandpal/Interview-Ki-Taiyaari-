import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { stmts } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const models = stmts.models.getAll.all();
        return res.json(models);
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to fetch models', error.message));
    }
});

router.post('/', (req, res) => {
    try {
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const { name, provider, apiKey, endpoint, modelId, appType } = body;

        if (!isNonEmptyString(name) || !isNonEmptyString(provider)) {
            return res.status(400).json(errorPayload('Name and provider are required'));
        }

        const normalizedProvider = provider.trim().toLowerCase();
        if (!['groq', 'openai', 'ollama', 'custom'].includes(normalizedProvider)) {
            return res.status(400).json(errorPayload('provider must be one of: groq, openai, ollama, custom'));
        }

        const newModel = {
            id: uuidv4(),
            name: name.trim(),
            provider: normalizedProvider,
            apiKey: normalizeString(apiKey),
            endpoint: normalizeString(endpoint),
            modelId: normalizeString(modelId),
            appType: isNonEmptyString(appType) ? appType.trim() : 'chatbot',
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        stmts.models.insert.run(newModel);
        return res.status(201).json(newModel);
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to create model', error.message));
    }
});

router.post('/:id/test', async (req, res) => {
    try {
        const id = normalizeString(req.params.id);
        if (!id) {
            return res.status(400).json(errorPayload('Model id is required'));
        }

        const model = stmts.models.getById.get(id);

        if (!model) {
            return res.status(404).json(errorPayload('Model not found'));
        }

        const testResult = await testModelConnection(model);
        const newStatus = testResult.success ? 'connected' : 'error';
        stmts.models.updateStatus.run(newStatus, model.id);
        return res.json({ success: testResult.success, message: testResult.message });
    } catch (error) {
        if (isNonEmptyString(req.params.id)) {
            stmts.models.updateStatus.run('error', req.params.id);
        }
        return res.status(500).json({ success: false, ...errorPayload('Failed to test model connection', error.message) });
    }
});

router.get('/available-providers', (req, res) => {
    try {
        const providers = [
            { name: 'groq', description: 'Groq Cloud API', status: 'active' },
            { name: 'openai', description: 'OpenAI API', status: 'active' },
            { name: 'ollama', description: 'Local Ollama Server', status: 'active' },
            { name: 'custom', description: 'Custom LLM Endpoint', status: 'active' }
        ];
        return res.json({ providers, total: providers.length });
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to fetch providers', error.message));
    }
});

router.get('/stats', (req, res) => {
    try {
        const models = stmts.models.getAll.all();
        const stats = {
            total: models.length,
            byProvider: {},
            byStatus: {},
            byAppType: {}
        };

        models.forEach(model => {
            stats.byProvider[model.provider] = (stats.byProvider[model.provider] || 0) + 1;
            stats.byStatus[model.status] = (stats.byStatus[model.status] || 0) + 1;
            stats.byAppType[model.appType] = (stats.byAppType[model.appType] || 0) + 1;
        });

        return res.json(stats);
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to fetch statistics', error.message));
    }
});

router.get('/count', (req, res) => {
    try {
        const models = stmts.models.getAll.all();
        return res.json({ count: models.length, timestamp: new Date().toISOString() });
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to count models', error.message));
    }
});

router.get('/provider/:provider', (req, res) => {
    try {
        const provider = normalizeString(req.params.provider).toLowerCase();
        if (!provider) {
            return res.status(400).json(errorPayload('Provider parameter is required'));
        }

        const models = stmts.models.getAll.all();
        const filtered = models.filter(m => m.provider === provider);
        
        return res.json({ provider, models: filtered, count: filtered.length });
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to fetch models by provider', error.message));
    }
});

router.get('/:id', (req, res) => {
    try {
        const id = normalizeString(req.params.id);
        if (!id) {
            return res.status(400).json(errorPayload('Model id is required'));
        }

        const model = stmts.models.getById.get(id);
        if (!model) {
            return res.status(404).json(errorPayload('Model not found'));
        }

        return res.json(model);
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to fetch model', error.message));
    }
});

router.get('/:id/status', (req, res) => {
    try {
        const id = normalizeString(req.params.id);
        if (!id) {
            return res.status(400).json(errorPayload('Model id is required'));
        }

        const model = stmts.models.getById.get(id);
        if (!model) {
            return res.status(404).json(errorPayload('Model not found'));
        }

        return res.json({
            id: model.id,
            name: model.name,
            status: model.status,
            provider: model.provider,
            lastUpdated: model.createdAt
        });
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to fetch model status', error.message));
    }
});

router.put('/:id', (req, res) => {
    try {
        const id = normalizeString(req.params.id);
        if (!id) {
            return res.status(400).json(errorPayload('Model id is required'));
        }

        const model = stmts.models.getById.get(id);
        if (!model) {
            return res.status(404).json(errorPayload('Model not found'));
        }

        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const { name, apiKey, endpoint, modelId, appType } = body;

        const updatedModel = {
            ...model,
            name: isNonEmptyString(name) ? name.trim() : model.name,
            apiKey: isNonEmptyString(apiKey) ? apiKey.trim() : model.apiKey,
            endpoint: isNonEmptyString(endpoint) ? endpoint.trim() : model.endpoint,
            modelId: isNonEmptyString(modelId) ? modelId.trim() : model.modelId,
            appType: isNonEmptyString(appType) ? appType.trim() : model.appType
        };

        stmts.models.update.run(updatedModel.name, updatedModel.apiKey, updatedModel.endpoint, updatedModel.modelId, updatedModel.appType, id);
        
        return res.json({ success: true, message: 'Model updated successfully', model: updatedModel });
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to update model', error.message));
    }
});

router.post('/:id/test-prompt', async (req, res) => {
    try {
        const id = normalizeString(req.params.id);
        if (!id) {
            return res.status(400).json(errorPayload('Model id is required'));
        }

        const model = stmts.models.getById.get(id);
        if (!model) {
            return res.status(404).json(errorPayload('Model not found'));
        }

        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const customPrompt = normalizeString(body.prompt) || "Say 'Hello' in one word.";

        if (!customPrompt) {
            return res.status(400).json(errorPayload('Prompt is required'));
        }

        const testResult = await testModelConnectionWithPrompt(model, customPrompt);
        
        return res.json({
            success: testResult.success,
            message: testResult.message,
            prompt: customPrompt,
            response: testResult.response || null
        });
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to test model with custom prompt', error.message));
    }
});

// ============================================
// ADVANCED TESTING APIs (Fast Showcase)
// ============================================

// API 1: Test Consistency (same prompt multiple times)
router.post('/:id/consistency-test', async (req, res) => {
    try {
        const id = normalizeString(req.params.id);
        if (!id) return res.status(400).json(errorPayload('Model id is required'));

        const model = stmts.models.getById.get(id);
        if (!model) return res.status(404).json(errorPayload('Model not found'));

        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const prompt = normalizeString(body.prompt) || "What is 2+2?";
        const iterations = Math.min(body.iterations || 3, 5);

        const results = [];
        const timings = [];
        let successCount = 0;

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            const testResult = await testModelConnectionWithPrompt(model, prompt);
            const responseTime = Date.now() - startTime;
            
            timings.push(responseTime);
            if (testResult.success) successCount++;
            results.push({
                iteration: i + 1,
                success: testResult.success,
                response: testResult.response,
                responseTime: `${responseTime}ms`
            });
        }

        const avgResponseTime = (timings.reduce((a, b) => a + b, 0) / timings.length).toFixed(2);
        const consistency = ((successCount / iterations) * 100).toFixed(2);

        return res.json({
            modelId: id,
            prompt,
            iterations,
            results,
            analysis: {
                successRate: `${consistency}%`,
                avgResponseTime: `${avgResponseTime}ms`,
                minResponseTime: `${Math.min(...timings)}ms`,
                maxResponseTime: `${Math.max(...timings)}ms`,
                consistency: consistency === '100.00' ? 'Perfect' : consistency >= 70 ? 'Good' : 'Poor'
            }
        });
    } catch (error) {
        return res.status(500).json(errorPayload('Consistency test failed', error.message));
    }
});

// API 2: Compare Multiple Models
router.post('/compare-responses', async (req, res) => {
    try {
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const { modelIds, prompt } = body;

        if (!Array.isArray(modelIds) || modelIds.length < 2) {
            return res.status(400).json(errorPayload('Need at least 2 model IDs'));
        }
        if (!normalizeString(prompt)) {
            return res.status(400).json(errorPayload('Prompt is required'));
        }

        const models = [];
        const timings = [];

        for (const modelId of modelIds) {
            const model = stmts.models.getById.get(modelId);
            if (!model) continue;

            const startTime = Date.now();
            const testResult = await testModelConnectionWithPrompt(model, prompt);
            const responseTime = Date.now() - startTime;

            timings.push(responseTime);
            models.push({
                modelId: model.id,
                name: model.name,
                provider: model.provider,
                success: testResult.success,
                response: (testResult.response || '').substring(0, 150),
                responseLength: (testResult.response || '').length,
                responseTime: `${responseTime}ms`,
                wordCount: (testResult.response || '').split(/\s+/).length
            });
        }

        return res.json({
            prompt,
            models,
            summary: {
                fastest: `${Math.min(...timings)}ms`,
                slowest: `${Math.max(...timings)}ms`,
                avgTime: `${(timings.reduce((a, b) => a + b, 0) / timings.length).toFixed(0)}ms`
            }
        });
    } catch (error) {
        return res.status(500).json(errorPayload('Comparison failed', error.message));
    }
});

// API 3: Health Check (4-point validation)
router.get('/:id/health-check', async (req, res) => {
    try {
        const id = normalizeString(req.params.id);
        if (!id) return res.status(400).json(errorPayload('Model id is required'));

        const model = stmts.models.getById.get(id);
        if (!model) return res.status(404).json(errorPayload('Model not found'));

        const checks = [];

        // Check 1: Can it connect?
        const conn = await testModelConnection(model);
        checks.push({ check: 'Connectivity', passed: conn.success, desc: conn.message });

        // Check 2: Does it return valid response?
        const resp = await testModelConnectionWithPrompt(model, "Say OK");
        const hasResponse = resp.success && resp.response && resp.response.trim().length > 0;
        checks.push({ check: 'Response Valid', passed: hasResponse, desc: hasResponse ? 'Yes' : 'No response' });

        // Check 3: Is it fast? (< 30 sec)
        const start = Date.now();
        await testModelConnectionWithPrompt(model, "Hi");
        const time = Date.now() - start;
        const isFast = time < 30000;
        checks.push({ check: 'Performance', passed: isFast, desc: `${time}ms` });

        // Check 4: Does it give complete answers?
        const full = await testModelConnectionWithPrompt(model, "What is AI?");
        const isComplete = full.response && full.response.length > 15;
        checks.push({ check: 'Completeness', passed: isComplete, desc: isComplete ? 'Detailed' : 'Too short' });

        const passed = checks.filter(c => c.passed).length;
        const health = passed === 4 ? '✓ Excellent' : passed === 3 ? '◐ Good' : passed === 2 ? '◑ Fair' : '✗ Poor';

        return res.json({
            modelId: id,
            modelName: model.name,
            health,
            score: `${(passed / 4 * 100).toFixed(0)}%`,
            checks
        });
    } catch (error) {
        return res.status(500).json(errorPayload('Health check failed', error.message));
    }
});

// API 4: Batch Test Multiple Prompts
router.post('/batch-test', async (req, res) => {
    try {
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const { modelIds, prompts } = body;

        if (!Array.isArray(modelIds) || modelIds.length === 0) {
            return res.status(400).json(errorPayload('modelIds array required'));
        }
        if (!Array.isArray(prompts) || prompts.length === 0) {
            return res.status(400).json(errorPayload('prompts array required'));
        }

        const results = [];

        for (const modelId of modelIds) {
            const model = stmts.models.getById.get(modelId);
            if (!model) continue;

            const promptResults = [];
            for (const prompt of prompts) {
                const startTime = Date.now();
                const testResult = await testModelConnectionWithPrompt(model, prompt);
                const responseTime = Date.now() - startTime;

                promptResults.push({
                    prompt: prompt.substring(0, 40),
                    success: testResult.success,
                    length: (testResult.response || '').length,
                    time: `${responseTime}ms`
                });
            }

            results.push({
                modelId: model.id,
                name: model.name,
                provider: model.provider,
                results: promptResults
            });
        }

        return res.json({
            modelsCount: results.length,
            promptsCount: prompts.length,
            models: results
        });
    } catch (error) {
        return res.status(500).json(errorPayload('Batch test failed', error.message));
    }
});

router.delete('/:id', (req, res) => {
    try {
        const id = normalizeString(req.params.id);
        if (!id) {
            return res.status(400).json(errorPayload('Model id is required'));
        }

        const result = stmts.models.delete.run(id);
        if (!result || result.changes === 0) {
            return res.status(404).json(errorPayload('Model not found'));
        }

        return res.json({ success: true, message: 'Model deleted successfully' });
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to delete model', error.message));
    }
});

async function testModelConnection(model) {
    const testPrompt = "Say 'Hello' in one word."

    try {
        if (model.provider === 'groq') {
            const { default: Groq } = await import('groq-sdk');
            const groq = new Groq({ apiKey: model.apiKey });

            await groq.chat.completions.create({
                model: model.modelId || 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: testPrompt }],
                max_tokens: 10
            });

            return { success: true, message: 'Connected to Groq successfully!' };
        }

        if (model.provider === 'openai') {
            const { default: OpenAI } = await import('openai');
            const openai = new OpenAI({ apiKey: model.apiKey });

            await openai.chat.completions.create({
                model: model.modelId || 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: testPrompt }],
                max_tokens: 10
            });

            return { success: true, message: 'Connected to OpenAI successfully!' };
        }

        if (model.provider === 'ollama') {
            const { default: OpenAI } = await import('openai');
            const ollama = new OpenAI({
                baseURL: model.endpoint || 'http://localhost:11434/v1',
                apiKey: 'ollama', // Ollama doesn't need a real key
            });

            await ollama.chat.completions.create({
                model: model.modelId || 'llama2',
                messages: [{ role: 'user', content: testPrompt }],
                max_tokens: 10
            });

            return { success: true, message: 'Connected to Ollama successfully!' };
        }

        if (model.provider === 'custom') {
            if (!model.endpoint) {
                return { success: false, message: 'Endpoint URL is required for custom models' };
            }
            const { default: OpenAI } = await import('openai');
            const client = new OpenAI({
                baseURL: model.endpoint,
                apiKey: model.apiKey || 'none', // Many local servers don't need a key
            });

            await client.chat.completions.create({
                model: model.modelId || 'default',
                messages: [{ role: 'user', content: testPrompt }],
                max_tokens: 10
            });

            return { success: true, message: 'Connected to custom endpoint successfully!' };
        }

        return { success: false, message: `Unknown provider: ${model.provider}` };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function testModelConnectionWithPrompt(model, customPrompt) {
    try {
        if (model.provider === 'groq') {
            const { default: Groq } = await import('groq-sdk');
            const groq = new Groq({ apiKey: model.apiKey });

            const response = await groq.chat.completions.create({
                model: model.modelId || 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: customPrompt }],
                max_tokens: 150
            });

            return {
                success: true,
                message: 'Groq test successful',
                response: response.choices[0]?.message?.content || 'No response'
            };
        }

        if (model.provider === 'openai') {
            const { default: OpenAI } = await import('openai');
            const openai = new OpenAI({ apiKey: model.apiKey });

            const response = await openai.chat.completions.create({
                model: model.modelId || 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: customPrompt }],
                max_tokens: 150
            });

            return {
                success: true,
                message: 'OpenAI test successful',
                response: response.choices[0]?.message?.content || 'No response'
            };
        }

        if (model.provider === 'ollama') {
            const { default: OpenAI } = await import('openai');
            const ollama = new OpenAI({
                baseURL: model.endpoint || 'http://localhost:11434/v1',
                apiKey: 'ollama',
            });

            const response = await ollama.chat.completions.create({
                model: model.modelId || 'llama2',
                messages: [{ role: 'user', content: customPrompt }],
                max_tokens: 150
            });

            return {
                success: true,
                message: 'Ollama test successful',
                response: response.choices[0]?.message?.content || 'No response'
            };
        }

        if (model.provider === 'custom') {
            if (!model.endpoint) {
                return { success: false, message: 'Endpoint URL is required for custom models' };
            }
            const { default: OpenAI } = await import('openai');
            const client = new OpenAI({
                baseURL: model.endpoint,
                apiKey: model.apiKey || 'none',
            });

            const response = await client.chat.completions.create({
                model: model.modelId || 'default',
                messages: [{ role: 'user', content: customPrompt }],
                max_tokens: 150
            });

            return {
                success: true,
                message: 'Custom endpoint test successful',
                response: response.choices[0]?.message?.content || 'No response'
            };
        }

        return { success: false, message: `Unknown provider: ${model.provider}` };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

function errorPayload(message, details) {
    const payload = {
        error: message,
        message,
    };

    if (isNonEmptyString(details)) {
        payload.details = details;
    }

    return payload;
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function normalizeString(value) {
    return isNonEmptyString(value) ? value.trim() : '';
}

export default router;