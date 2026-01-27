import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import modelsRouter from './routes/models.js'
import attacksRouter from './routes/attacks.js'
import testsRouter from './routes/tests.js'
import defencesRouter from './routes/defences.js'
import compareRouter from './routes/compare.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        message: "PromptShield API is running",
        version: '1.0.0',
        endpoints: ['/models', '/attacks', '/tests', '/defenses', '/compare']
    });
});

app.use('/models', modelsRouter);
app.use('/attacks', attacksRouter);
app.use('/tests', testsRouter);
app.use('/defenses', defencesRouter);
app.use('/compare', compareRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
})

app.listen(PORT, () => {
    console.log(`PromptShield API running on port ${PORT}`);
    console.log(`Endpoints: /models, /attacks, /tests, /defenses, /compare`);
});