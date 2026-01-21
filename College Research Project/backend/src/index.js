import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import modelsRouter from './routes/models.js'
import attacksRouter from './routes/attacks.js'
import testsRouter from './routes/tests.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({status: "ok", message: "PromptShield API is running"});
});

app.use('/models', modelsRouter);
app.use('/attacks', attacksRouter);
app.use('/tests', testsRouter);

app.listen(PORT, () => {
    console.log(`PromptShield API running on port ${PORT}`);
});