import { useState, useMemo } from 'react';
import { GitCompare, ArrowRight, Shield, AlertTriangle, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import useStore from '../store/useStore';

function ComparePage() {
    const { testResults } = useStore();
    const [selectedResults, setSelectedResults] = useState([null, null]);

    // Get unique test results for selection
    const availableResults = useMemo(() => {
        return testResults.map(r => ({
            id: r.id,
            label: `${r.modelName} (${r.riskLevel} - ${r.riskScore}%)`,
            ...r
        }));
    }, [testResults]);

    const handleSelect = (index, resultId) => {
        const result = testResults.find(r => r.id === resultId) || null;
        const newSelection = [...selectedResults];
        newSelection[index] = result;
        setSelectedResults(newSelection);
    };

    const comparison = useMemo(() => {
        if (!selectedResults[0] || !selectedResults[1]) return null;

        const [a, b] = selectedResults;

        // Calculate category breakdown for each
        const getCategoryStats = (results) => {
            const stats = {};
            results?.results?.forEach(r => {
                if (!stats[r.category]) {
                    stats[r.category] = { total: 0, vulnerable: 0 };
                }
                stats[r.category].total++;
                if (r.vulnerable) stats[r.category].vulnerable++;
            });
            return stats;
        };

        const aStats = getCategoryStats(a);
        const bStats = getCategoryStats(b);

        // Get all categories
        const allCategories = [...new Set([...Object.keys(aStats), ...Object.keys(bStats)])];

        return {
            models: [a, b],
            riskDiff: a.riskScore - b.riskScore,
            passedDiff: a.passed - b.passed,
            failedDiff: a.failed - b.failed,
            categories: allCategories.map(cat => ({
                name: cat,
                aVulnerable: aStats[cat]?.vulnerable || 0,
                aTotal: aStats[cat]?.total || 0,
                bVulnerable: bStats[cat]?.vulnerable || 0,
                bTotal: bStats[cat]?.total || 0,
            }))
        };
    }, [selectedResults]);

    const getRiskColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-400 bg-red-500/20';
            case 'HIGH': return 'text-orange-400 bg-orange-500/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
            default: return 'text-green-400 bg-green-500/20';
        }
    };

    const getDiffIndicator = (diff, inverted = false) => {
        const isPositive = inverted ? diff < 0 : diff > 0;
        const isNegative = inverted ? diff > 0 : diff < 0;

        if (diff === 0) return <Minus className="w-4 h-4 text-slate-400" />;
        if (isPositive) return <TrendingUp className="w-4 h-4 text-green-400" />;
        return <TrendingDown className="w-4 h-4 text-red-400" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative">
                <h1 className="text-3xl font-bold text-white">Compare Results</h1>
                <p className="text-slate-400 mt-1">Compare security test results between different models</p>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl" aria-hidden="true"></div>
            </div>

            {/* Selection Panel */}
            <div className="glass-panel p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-purple-400" aria-hidden="true" />
                    Select Results to Compare
                </h2>

                {testResults.length < 2 ? (
                    <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" aria-hidden="true" />
                        <p className="text-slate-400">Run at least 2 tests to compare results</p>
                        <p className="text-slate-500 text-sm mt-1">Go to "Run Test" to test different models</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Model A Selector */}
                        <div>
                            <label htmlFor="model-a" className="block text-sm text-slate-400 mb-2">Model A</label>
                            <select
                                id="model-a"
                                value={selectedResults[0]?.id || ''}
                                onChange={(e) => handleSelect(0, e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                                aria-label="Select first model to compare"
                            >
                                <option value="">Select a test result...</option>
                                {availableResults.map(r => (
                                    <option key={r.id} value={r.id} disabled={r.id === selectedResults[1]?.id}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Model B Selector */}
                        <div>
                            <label htmlFor="model-b" className="block text-sm text-slate-400 mb-2">Model B</label>
                            <select
                                id="model-b"
                                value={selectedResults[1]?.id || ''}
                                onChange={(e) => handleSelect(1, e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                                aria-label="Select second model to compare"
                            >
                                <option value="">Select a test result...</option>
                                {availableResults.map(r => (
                                    <option key={r.id} value={r.id} disabled={r.id === selectedResults[0]?.id}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Comparison Results */}
            {comparison && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Risk Score Comparison */}
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-400 text-sm">Risk Score</span>
                                {getDiffIndicator(comparison.riskDiff, true)}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{comparison.models[0].riskScore}%</p>
                                    <p className="text-xs text-slate-500">{comparison.models[0].modelName}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{comparison.models[1].riskScore}%</p>
                                    <p className="text-xs text-slate-500">{comparison.models[1].modelName}</p>
                                </div>
                            </div>
                            {comparison.riskDiff !== 0 && (
                                <p className={`text-sm mt-3 text-center ${comparison.riskDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {comparison.models[comparison.riskDiff > 0 ? 1 : 0].modelName} is {Math.abs(comparison.riskDiff)}% more secure
                                </p>
                            )}
                        </div>

                        {/* Passed Tests */}
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-400" aria-hidden="true" /> Passed
                                </span>
                                {getDiffIndicator(comparison.passedDiff)}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-400">{comparison.models[0].passed}</p>
                                    <p className="text-xs text-slate-500">Model A</p>
                                </div>
                                <span className="text-slate-500">vs</span>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-400">{comparison.models[1].passed}</p>
                                    <p className="text-xs text-slate-500">Model B</p>
                                </div>
                            </div>
                        </div>

                        {/* Failed Tests */}
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400" aria-hidden="true" /> Vulnerable
                                </span>
                                {getDiffIndicator(comparison.failedDiff, true)}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-400">{comparison.models[0].failed}</p>
                                    <p className="text-xs text-slate-500">Model A</p>
                                </div>
                                <span className="text-slate-500">vs</span>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-400">{comparison.models[1].failed}</p>
                                    <p className="text-xs text-slate-500">Model B</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full" role="table" aria-label="Category comparison table">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                                        <th className="text-center py-3 px-4 text-slate-400 font-medium">{comparison.models[0].modelName}</th>
                                        <th className="text-center py-3 px-4 text-slate-400 font-medium">{comparison.models[1].modelName}</th>
                                        <th className="text-center py-3 px-4 text-slate-400 font-medium">Winner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparison.categories.map((cat, idx) => {
                                        const aRate = cat.aTotal > 0 ? (cat.aVulnerable / cat.aTotal) * 100 : 0;
                                        const bRate = cat.bTotal > 0 ? (cat.bVulnerable / cat.bTotal) * 100 : 0;
                                        const winner = aRate < bRate ? 'A' : bRate < aRate ? 'B' : 'Tie';

                                        return (
                                            <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                                <td className="py-3 px-4 text-white capitalize">{cat.name.replace('_', ' ')}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-sm ${cat.aVulnerable > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                        {cat.aVulnerable}/{cat.aTotal}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-sm ${cat.bVulnerable > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                        {cat.bVulnerable}/{cat.bTotal}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {winner === 'Tie' ? (
                                                        <span className="text-slate-400">—</span>
                                                    ) : (
                                                        <span className="text-green-400 font-medium">
                                                            {winner === 'A' ? comparison.models[0].modelName : comparison.models[1].modelName}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Verdict */}
                    <div className="glass-panel p-6 text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">Security Verdict</h3>
                        {comparison.riskDiff === 0 ? (
                            <p className="text-slate-400">Both models have equal security scores</p>
                        ) : (
                            <div>
                                <p className="text-slate-400 mb-2">More Secure Model:</p>
                                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${getRiskColor(comparison.models[comparison.riskDiff > 0 ? 1 : 0].riskLevel)}`}>
                                    <Shield className="w-5 h-5" aria-hidden="true" />
                                    <span className="font-semibold text-lg">
                                        {comparison.models[comparison.riskDiff > 0 ? 1 : 0].modelName}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm mt-3">
                                    {Math.abs(comparison.riskDiff)}% lower risk score than {comparison.models[comparison.riskDiff > 0 ? 0 : 1].modelName}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ComparePage;
