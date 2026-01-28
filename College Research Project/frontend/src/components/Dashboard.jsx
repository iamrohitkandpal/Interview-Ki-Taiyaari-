import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import { attacksAPI, testsAPI } from "../services/api";
import { AlertTriangle, Shield, Target, Zap } from "lucide-react";

function Dashboard() {
    const [stats, setStats] = useState({
        totalAttacks: 0,
        totalTests: 0,
        modelsConnected: 0,
        avgRiskScore: 0,
    });

    const { models, testResults } = useStore();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [attacksRes, testsRes] = await Promise.all([
                attacksAPI.getCategories(),
                testsAPI.getAll()
            ]);

            const tests = testsRes.data || [];
            const avgRisk = tests.length > 0
                ? Math.round(tests.reduce((sum, test) => sum + test.riskScore, 0) / tests.length)
                : 0;

            setStats({
                totalAttacks: attacksRes.data?.totalAttacks || 0,
                totalTests: tests.length,
                modelsConnected: models.length,
                avgRiskScore: avgRisk,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const statCards = [
        { label: 'Attack Vectors', value: stats.totalAttacks, icon: Target, color: 'bg-red-500' },
        { label: 'Tests Run', value: stats.totalTests, icon: Zap, color: 'bg-blue-500' },
        { label: 'Models Connected', value: models.length, icon: Shield, color: 'bg-green-500' },
        { label: 'Average Risk Score', value: `${stats.avgRiskScore}%`, icon: AlertTriangle, color: 'bg-yellow-500' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Overview of your LLM Security testing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-[#1e293b] rounded-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Start</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickAction
                        title="1. Add Model"
                        description="Connect your LLM (Groq, OpenAI, Ollama)"
                        onClick={() => useStore.getState().setActiveTab('models')}
                    />
                    <QuickAction
                        title="2. Select Attacks"
                        description="Choose from 40+ attack vectors"
                        onClick={() => useStore.getState().setActiveTab('attacks')}
                    />
                    <QuickAction
                        title="3. Run Tests"
                        description="Execute attacks and get security report"
                        onClick={() => useStore.getState().setActiveTab('test')}
                    />
                </div>
            </div>

            {/* Recent Tests */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Tests</h2>
                {testResults.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No tests run yet. Start by adding a model!</p>
                ) : (
                    <div className="space-y-3">
                        {testResults.slice(0, 5).map((test) => (
                            <div key={test.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                                <div>
                                    <p className="text-white font-medium">{test.modelName}</p>
                                    <p className="text-slate-400 text-sm">{test.totalAttacks} attacks tested</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${test.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                        test.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                            test.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-green-500/20 text-green-400'
                                    }`}>
                                    {test.riskLevel} ({test.riskScore}%)
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function QuickAction({ title, description, onClick }) {
    return (
        <button
            onClick={onClick}
            className="p-4 bg-slate-800 rounded-lg text-left hover:bg-slate-700 transition-colors border border-slate-600"
        >
            <h3 className="text-white font-medium">{title}</h3>
            <p className="text-slate-400 text-sm mt-1">{description}</p>
        </button>
    );
}

export default Dashboard;