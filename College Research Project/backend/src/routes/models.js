import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

let models = [];

router.get('/', (req, res) => {
    res.json(models);
})

router.post('/', (req, res) => {
    const { name, provider, apiKey, endpoint, modelId, appType } = req.body;

    if (!name || !provider) {
        return res.status(400).json({ error: 'Name and provider are required' });
    }

    const newModel = {
        id: uuidv4(),
        name,
        provider,
        apiKey: apiKey || '',
        endpoint: endpoint || '',
        modelId: modelId || '',
        appType: appType || 'chatbot',
        createdAt: new Date().toISOString(),
        status: 'pending'
    };

    models.push(newModel);
    res.status(201).json(newModel);
});

router.post('/:id/test', async (req, res) => {
    const model = models.find(m => m.id === req.params.id);

    if (!model) {
        return res.status(404).json({ error: 'Model not found' });
    }

    try {
        const testResult = await testModelConnection(model);
        model.status = testResult.success ? 'connected' : 'error';
        res.json({ success: testResult.success, message: testResult.message });
    } catch (error) {
        model.status = 'error';
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', (req, res) => {
    models = models.filter(m => m.id !== req.params.id);
    res.json({ success: true, message: 'Model deleted successfully' });
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

export default router;