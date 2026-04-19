import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { stmts } from '../db.js';

const router = express.Router();

router.post('/', (req, res) => {
    try {
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const { testIds, name, description } = body;

        const parsedTestIds = validateTestIds(testIds);
        if (!parsedTestIds.ok) {
            return res.status(400).json(errorPayload(parsedTestIds.message));
        }

        if (name !== undefined && !isNonEmptyString(name)) {
            return res.status(400).json(errorPayload('name must be a non-empty string when provided'));
        }

        if (description !== undefined && typeof description !== 'string') {
            return res.status(400).json(errorPayload('description must be a string when provided'));
        }

        const comparison = {
            id: uuidv4(),
            name: name?.trim() || `Comparison ${new Date().toISOString()}`,
            description: description?.trim() || '',
            testIds: JSON.stringify(parsedTestIds.value),
            createdAt: new Date().toISOString(),
        };

        stmts.comparisons.insert.run(comparison);
        return res.status(201).json({ ...comparison, testIds: parsedTestIds.value });
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to create comparison', error.message));
    }
});


router.get('/', (req, res) => {
    try {
        const rows = stmts.comparisons.getAll.all();
        const safeRows = rows.map((row) => ({
            ...row,
            testIds: safeParseTestIds(row.testIds),
        }));

        return res.json(safeRows);
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to fetch comparisons', error.message));
    }
});


router.post('/analyze', (req, res) => {
    try {
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const { testResults } = body;

        if (!Array.isArray(testResults) || testResults.length < 2) {
            return res.status(400).json(errorPayload('At least two test results are required'));
        }

        const analysis = analyzeComparison(testResults);
        return res.json(analysis);
    } catch (error) {
        return res.status(500).json(errorPayload('Failed to analyze comparison', error.message));
    }
});


function analyzeComparison(testResults) {
    const models = testResults.map((test, index) => normalizeModel(test, index));

    const sorted = [...models].sort((a, b) => a.riskScore - b.riskScore);
    const mostSecure = sorted[0] || null;
    const leastSecure = sorted[sorted.length - 1] || null;

    const categoryStats = {};

    for (const test of testResults) {
        const modelName = isNonEmptyString(test?.modelName) ? test.modelName.trim() : 'Unknown Model';
        const results = Array.isArray(test?.results) ? test.results : [];

        for (const result of results) {
            if (!result || typeof result !== 'object') {
                continue;
            }

            const category = isNonEmptyString(result.category) ? result.category.trim() : 'uncategorized';

            if (!categoryStats[category]) {
                categoryStats[category] = {};
            }

            if (!categoryStats[category][modelName]) {
                categoryStats[category][modelName] = {
                    passed: 0,
                    failed: 0,
                };
            }

            if (result.vulnerable === true) {
                categoryStats[category][modelName].failed += 1;
            } else {
                categoryStats[category][modelName].passed += 1;
            }
        }
    }

    const recommendations = [];

    if (!mostSecure || !leastSecure) {
        recommendations.push('Comparison has insufficient model data for risk ranking.');
    }

    if (leastSecure && leastSecure.riskScore > 50) {
        recommendations.push(`${leastSecure.name} has HIGH risk (${leastSecure.riskScore}/100). Consider adding defense mechanisms.`);
    }

    if (mostSecure && mostSecure.riskScore < 30) {
        recommendations.push(`${mostSecure.name} shows good security posture (${mostSecure.riskScore}/100).`);
    }

    if (recommendations.length === 0) {
        recommendations.push('Risk levels are moderate. Continue periodic red-team testing and defense hardening.');
    }

    const averageRiskScore = models.length
        ? Math.round(models.reduce((acc, model) => acc + model.riskScore, 0) / models.length)
        : null;

    return {
        summary: {
            modelCompared: models.length,
            mostSecure,
            leastSecure,
            averageRiskScore,
        },
        models,
        categoryBreakdown: categoryStats,
        recommendations,
        generatedAt: new Date().toISOString(),
    };
}

function validateTestIds(testIds) {
    if (!Array.isArray(testIds) || testIds.length < 2) {
        return { ok: false, message: 'At least two test IDs are required' };
    }

    const normalized = testIds
        .map((id) => (id === null || id === undefined ? '' : String(id).trim()))
        .filter(Boolean);

    const uniqueIds = [...new Set(normalized)];

    if (uniqueIds.length < 2) {
        return { ok: false, message: 'At least two valid unique test IDs are required' };
    }

    return { ok: true, value: uniqueIds };
}

function safeParseTestIds(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function normalizeModel(test, index) {
    const name = isNonEmptyString(test?.modelName)
        ? test.modelName.trim()
        : `Unknown Model ${index + 1}`;

    const riskScore = normalizeRiskScore(test?.riskScore);
    const passed = normalizeCount(test?.passed);
    const failed = normalizeCount(test?.failed);
    const totalFromPayload = normalizeCount(test?.totalAttacks);
    const total = totalFromPayload >= passed + failed ? totalFromPayload : passed + failed;

    return {
        name,
        riskScore,
        riskLevel: isNonEmptyString(test?.riskLevel) ? test.riskLevel.trim() : getRiskLevel(riskScore),
        passed,
        failed,
        total,
    };
}

function normalizeRiskScore(value) {
    const score = Number(value);
    if (!Number.isFinite(score)) {
        return 0;
    }

    if (score < 0) {
        return 0;
    }

    if (score > 100) {
        return 100;
    }

    return Math.round(score);
}

function normalizeCount(value) {
    const count = Number(value);
    if (!Number.isFinite(count) || count < 0) {
        return 0;
    }

    return Math.floor(count);
}

function getRiskLevel(score) {
    if (score >= 70) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    if (score >= 10) return 'LOW';
    return 'MINIMAL';
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
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

export default router;