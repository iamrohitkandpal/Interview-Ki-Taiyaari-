import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import modelsRouter from './routes/models.js'
import attacksRouter from './routes/attacks.js'
import testsRouter from './routes/tests.js'
import defencesRouter from './routes/defences.js'
import compareRouter from './routes/compare.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// SECURITY MIDDLEWARE (OWASP Best Practices)
// ============================================

// Helmet - Sets various HTTP headers for security
// Protects against: XSS, clickjacking, MIME sniffing, etc.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for development
}));

// Rate Limiting - Prevents DDoS and brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the 100 requests in 15 minutes limit. Please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to API routes
app.use('/tests', limiter);
app.use('/models', limiter);

// Stricter rate limiting for test execution (resource intensive)
const testLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 test runs per minute
    message: {
        error: 'Rate limit exceeded',
        message: 'Maximum 5 test runs per minute. Please wait before running more tests.',
    }
});
app.use('/tests/run', testLimiter);

// ============================================
// CORS Configuration
// ============================================
const corsOptions = {
    origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Body parser with size limits (prevents payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// REQUEST LOGGING (Security Audit Trail)
// ============================================
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        message: "Bhisma API is running",
        version: '1.0.0',
        security: {
            helmet: true,
            rateLimit: true,
            cors: true
        },
        endpoints: ['/models', '/attacks', '/tests', '/defenses', '/compare']
    });
});

// ============================================
// API ROUTES
// ============================================
app.use('/models', modelsRouter);
app.use('/attacks', attacksRouter);
app.use('/tests', testsRouter);
app.use('/defenses', defencesRouter);
app.use('/compare', compareRouter);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// ============================================
// ERROR HANDLER (OWASP - Don't expose internals)
// ============================================
app.use((err, req, res, next) => {
    // Log error for debugging (server-side only)
    console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);

    // Don't expose error details in production
    const isProd = process.env.NODE_ENV === 'production';

    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: isProd ? 'An unexpected error occurred' : err.message,
        ...(isProd ? {} : { stack: err.stack })
    });
});

// ============================================
// SERVER STARTUP
// ============================================
app.listen(PORT, () => {
    console.log(`\n🛡️  Bhisma API running on port ${PORT}`);
    console.log(`📍 Endpoints: /models, /attacks, /tests, /defenses, /compare`);
    console.log(`🔒 Security: Helmet ✓ | Rate Limiting ✓ | CORS ✓`);
    console.log(`\n`);
});