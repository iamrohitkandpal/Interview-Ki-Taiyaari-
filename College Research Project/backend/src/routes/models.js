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
    const testPrompt = "Sat 'Hello in one word."

    try {
        if (model.provider === 'groq') {
            const { default: Groq } = await import('groq-sdk');
            const groq = new Groq({ apiKey: model.apiKey });

            const response = await groq.chat.completions.create({
                model: model.modelId || 'llma-3.3-70b-versatile',
                messages: [{ role: 'user', content: testPrompt }],
                max_tokens: 10
            });

            return { success: true, message: 'Connected successfully!' };
        }

        return { success: false, message: 'Unknown provider' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export default router;