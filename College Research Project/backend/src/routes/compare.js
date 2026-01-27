import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

let comparisons = [];

router.post('/', (req, res) => {
    const { testIds, name, description } = req.body;

    if (!testIds || testIds.length < 2) {
        return res.status(400).json({ message: 'At least two test IDs are required' });
    }

    const comparison = {
        id: uuidv4(),
        name: name || `Comparison ${new Date().toISOString()}`,
        description: description || '',
        testIds,
        createdAt: new Date().toISOString(),
    };

    comparisons.push(comparison);
    res.status(201).json(comparison);
});


router.get('/', (req, res) => {
    res.json(comparisons);
})


router.post('/analyze', (req, res) => {
    const  { testResults } = req.body;
    
    if(!testResults || testResults.length < 2) {
        return res.status(400).json({ message: 'At least two test results are required' });
    }

    const analysis = analyzeComaprison(testResults);
    res.json(analysis);
});


function analyzeComaprison(testResults) {
    const models = testResults.map(t => ({
        name: t.modelName,
        riskScore: t.riskScore,
        riskLevel: t.riskLevel,
        passed: t.passed,
        failed: t.failed,
        total: t.totalAttacks
    }));

    const sorted = [...models].sort((a, b) => a.riskScore - b.riskScore);
    const mostSecure = sorted[0];
    const leastSecure = sorted[sorted.length - 1];

    const categoryStats = {};

    for(const test of testResults) {
        for (const result of test.results || []) {
            if(!categoryStats[result.category]) {
                categoryStats[result.category] = {};
            }

            if(!categoryStats[result.category][test.modelName]) {
                categoryStats[result.category][test.modelName] = {
                    passed: 0, failed: 0
                };
            }

            if(result.vulnerable) {
                categoryStats[result.category][test.modelName].failed++;
            } else {
                categoryStats[result.category][test.modelName].passed++;
            }
        }
    }

    const recommendations = [];

    if(leastSecure.riskScore > 50) {
        recommendations.push(`${leastSecure.name} has HIGH risk (${leastSecure.riskScore}/100). Consider adding defese mechanisms`)
    }

    if(mostSecure.riskScore < 30) {
        recommendations.push(`${mostSecure.name} shows good security posture (${mostSecure.riskScore}/100).`);
    }

    return {
        summary: {
            modelCompared: models.length,
            mostSecure: mostSecure,
            leastSecure: leastSecure,
            averageRiskScore: Math.round(models.reduce((a, b) => a + b.riskScore, 0) / models.length)
        },
        models,
        categoryBreakdown: categoryStats,
        recommendations,
        generatedAt: new Date().toISOString()
    };
}

export default router;