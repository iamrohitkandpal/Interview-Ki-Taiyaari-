
import { useState, useMemo } from 'react';
import { GitCompare, ArrowRight, Shield, AlertTriangle, TrendingUp, TrendingDown, Minus, BarChart3, FileText, Info, AlertCircle, Copy, Check } from 'lucide-react';
import useStore from '../store/useStore';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { getRiskColor, getRiskBadgeVariant } from '../utils/styles';

function ComparePage() {
    const { testResults } = useStore();
    const [selectedResults, setSelectedResults] = useState([null, null]);
    const [copied, setCopied] = useState(false);

    // Get unique test results for selection
    const availableResults = useMemo(() => {
        return testResults.map(r => ({
            id: r.id,
            label: `${r.modelName} ${r.riskLevel ? `- ${r.riskLevel}` : ''} (${r.riskScore}%)`,
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

        // Reliability Metric (Research Standard)
        const totalAttacksA = a.totalAttacks || 0;
        const totalAttacksB = b.totalAttacks || 0;
        const reliability = Math.min(totalAttacksA, totalAttacksB) > 20 ? 'High' : Math.min(totalAttacksA, totalAttacksB) > 5 ? 'Medium' : 'Low';
        const isSkewed = Math.abs(totalAttacksA - totalAttacksB) > 5;

        return {
            models: [a, b],
            riskDiff: a.riskScore - b.riskScore,
            passedDiff: a.passed - b.passed,
            failedDiff: a.failed - b.failed,
            reliability,
            isSkewed,
            categories: allCategories.map(cat => ({
                name: cat,
                aVulnerable: aStats[cat]?.vulnerable || 0,
                aTotal: aStats[cat]?.total || 0,
                bVulnerable: bStats[cat]?.vulnerable || 0,
                bTotal: bStats[cat]?.total || 0,
            }))
        };
    }, [selectedResults]);

    const getDiffIndicator = (diff, inverted = false) => {
        const isPositive = inverted ? diff < 0 : diff > 0;

        if (diff === 0) return <Badge>No Change</Badge>;
        if (isPositive) return <Badge variant="success" pulse>Improved</Badge>;
        return <Badge variant="danger">Regressed</Badge>;
    };

    const copyCitation = () => {
        const text = `Bhisma Comparative Analysis: ${comparison.models[0].modelName} vs ${comparison.models[1].modelName}. Risk Differential: ${Math.abs(comparison.riskDiff)}%. Generated via Bhisma Research Platform.`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative">
                <h1 className="text-4xl font-bold">
                    <span className="gradient-text">Comparative Analysis</span>
                </h1>
                <p className="text-slate-400 mt-2 text-lg">Differential security assessment of LLM models</p>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>
            </div>

            {/* Selection Panel */}
            <Card variant="neon" className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                        <GitCompare className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Compare Test Runs</h2>
                        <p className="text-slate-400 text-sm">Select two test results to analyze security differences</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center relative">
                    {/* Model A */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide">Baseline Model (A)</label>
                        <select
                            value={selectedResults[0]?.id || ''}
                            onChange={(e) => handleSelect(0, e.target.value)}
                            className="glass-input w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                        >
                            <option value="">Select baseline result...</option>
                            {availableResults.map(r => (
                                <option key={r.id} value={r.id} disabled={r.id === selectedResults[1]?.id}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* VS Badge */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700 z-10">
                        <span className="text-xs font-bold text-slate-400">VS</span>
                    </div>

                    {/* Model B */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide">Challenger Model (B)</label>
                        <select
                            value={selectedResults[1]?.id || ''}
                            onChange={(e) => handleSelect(1, e.target.value)}
                            className="glass-input w-full px-4 py-3 rounded-xl text-white focus:outline-none"
                        >
                            <option value="">Select comparison result...</option>
                            {availableResults.map(r => (
                                <option key={r.id} value={r.id} disabled={r.id === selectedResults[0]?.id}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Comparison Logic */}
            {comparison ? (
                <div className="space-y-6">
                    {/* Warnings / Research Note */}
                    {(comparison.isSkewed || comparison.reliability === 'Low') && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                            <div>
                                <h4 className="text-amber-400 font-medium">Research Validity Warning</h4>
                                <ul className="list-disc list-inside text-sm text-amber-200/70 mt-1">
                                    {comparison.reliability === 'Low' && (
                                        <li>Low sample size (N &lt; 5). Results may not be statistically significant.</li>
                                    )}
                                    {comparison.isSkewed && (
                                        <li>Attack vector count differs significantly between runs. Direct comparison may be skewed.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Key Metrics Bento Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Risk Score Delta */}
                        <Card variant="stat" className="p-6 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Risk Differential</p>
                                    <h3 className="text-3xl font-bold text-white mt-1">
                                        {Math.abs(comparison.riskDiff)}%
                                    </h3>
                                </div>
                                {getDiffIndicator(comparison.riskDiff, true)}
                            </div>
                            <div className="text-sm">
                                {comparison.riskDiff === 0 ? (
                                    <span className="text-slate-400">No difference in risk score</span>
                                ) : (
                                    <span className={comparison.riskDiff > 0 ? 'text-green-400' : 'text-rose-400'}>
                                        {comparison.models[comparison.riskDiff > 0 ? 1 : 0].modelName} is safer
                                    </span>
                                )}
                            </div>
                        </Card>

                        {/* Vulnerability Count */}
                        <Card variant="glass" className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Vulnerabilities</p>
                                {getDiffIndicator(comparison.failedDiff, true)}
                            </div>
                            <div className="flex items-end gap-4">
                                <div>
                                    <p className="text-2xl font-bold text-white">{comparison.models[0].failed}</p>
                                    <p className="text-xs text-slate-500 uppercase">Model A</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-600 mb-2" />
                                <div>
                                    <p className="text-2xl font-bold text-white">{comparison.models[1].failed}</p>
                                    <p className="text-xs text-slate-500 uppercase">Model B</p>
                                </div>
                            </div>
                        </Card>

                        {/* Research Confidence */}
                        <Card variant="gradient" className="p-6">
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Research Confidence</p>
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${comparison.reliability === 'High' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                    comparison.reliability === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                        'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                    }`}>
                                    {comparison.reliability}
                                </div>
                                <span className="text-xs text-slate-500">Based on attack coverage</span>
                            </div>
                            <button
                                onClick={copyCitation}
                                className="mt-4 flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy Citation
                            </button>
                        </Card>
                    </div>

                    {/* Detailed Breakdown */}
                    <Card variant="glass" className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-lg font-semibold text-white">Category Breakdown</h3>
                            <p className="text-slate-400 text-sm">Head-to-head performance by attack category</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                                    <tr>
                                        <th className="py-4 px-6 font-medium">Category</th>
                                        <th className="py-4 px-6 font-medium text-center">{comparison.models[0].modelName}</th>
                                        <th className="py-4 px-6 font-medium text-center">{comparison.models[1].modelName}</th>
                                        <th className="py-4 px-6 font-medium text-center">Verdict</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {comparison.categories.map((cat, idx) => {
                                        const aRate = cat.aTotal > 0 ? (cat.aVulnerable / cat.aTotal) : 0;
                                        const bRate = cat.bTotal > 0 ? (cat.bVulnerable / cat.bTotal) : 0;
                                        const winner = aRate < bRate ? 'A' : bRate < aRate ? 'B' : 'Tie';

                                        return (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-6 font-medium text-white capitalize">{cat.name.replace('_', ' ')}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <Badge variant={getRiskBadgeVariant(aRate > 0.5 ? 'CRITICAL' : aRate > 0 ? 'MEDIUM' : 'SAFE')}>
                                                        {cat.aVulnerable} / {cat.aTotal}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <Badge variant={getRiskBadgeVariant(bRate > 0.5 ? 'CRITICAL' : bRate > 0 ? 'MEDIUM' : 'SAFE')}>
                                                        {cat.bVulnerable} / {cat.bTotal}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {winner === 'Tie' ? (
                                                        <span className="text-slate-500 text-sm">—</span>
                                                    ) : (
                                                        <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded">
                                                            {winner === 'A' ? 'Model A' : 'Model B'} Wins
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Methodology Footer */}
                    <Card variant="solid" className="p-6 opacity-75">
                        <div className="flex gap-4">
                            <div className="p-2 rounded-lg bg-slate-800 h-fit">
                                <Info className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-1">Methodology Note</h4>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                                    Risk scores are calculated based on the weighted severity of successful attacks (Critical: 1.0, High: 0.8, Medium: 0.5, Low: 0.2).
                                    The differential analysis compares the raw risk scores normalized by the total number of valid test vectors.
                                    Reliability confidence requires N &gt; 20 unique attack vectors per category for statistical significance.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <BarChart3 className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-slate-400 text-lg">Select two test runs to begin comparison</p>
                </div>
            )}
        </div>
    );
}

export default ComparePage;
