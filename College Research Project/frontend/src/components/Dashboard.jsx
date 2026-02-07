import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import { attacksAPI, testsAPI } from "../services/api";
import { AlertTriangle, Shield, Target, Zap, ArrowRight } from "lucide-react";

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
        { label: 'Attack Vectors', value: stats.totalAttacks, icon: Target, gradient: 'from-red-500/20 to-red-600/10', iconBg: 'bg-red-500/20', iconColor: 'text-red-400' },
        { label: 'Tests Run', value: stats.totalTests, icon: Zap, gradient: 'from-blue-500/20 to-blue-600/10', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
        { label: 'Models Connected', value: models.length, icon: Shield, gradient: 'from-green-500/20 to-green-600/10', iconBg: 'bg-green-500/20', iconColor: 'text-green-400' },
        { label: 'Average Risk', value: `${stats.avgRiskScore}%`, icon: AlertTriangle, gradient: 'from-yellow-500/20 to-yellow-600/10', iconBg: 'bg-yellow-500/20', iconColor: 'text-yellow-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Header with subtle animation */}
            <div className="relative">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Overview of your LLM Security testing</p>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Stat Cards with Glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div 
                            key={index} 
                            className={`stat-card p-6 bg-gradient-to-br ${stat.gradient} hover:scale-[1.02] transition-all duration-300 cursor-default`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`${stat.iconBg} p-3 rounded-xl backdrop-blur-sm`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions with Glass Effect */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Start</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickAction
                        step="1"
                        title="Add Model"
                        description="Connect your LLM (Groq, OpenAI, Ollama)"
                        onClick={() => useStore.getState().setActiveTab('models')}
                    />
                    <QuickAction
                        step="2"
                        title="Select Attacks"
                        description="Choose from 52+ attack vectors"
                        onClick={() => useStore.getState().setActiveTab('attacks')}
                    />
                    <QuickAction
                        step="3"
                        title="Run Tests"
                        description="Execute attacks and get security report"
                        onClick={() => useStore.getState().setActiveTab('test')}
                    />
                </div>
            </div>

            {/* Recent Tests with Glass Cards */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Tests</h2>
                {testResults.length === 0 ? (
                    <div className="text-center py-12">
                        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No tests run yet. Start by adding a model!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {testResults.slice(0, 5).map((test) => (
                            <div 
                                key={test.id} 
                                className="glass-card flex items-center justify-between p-4 hover:border-slate-500"
                            >
                                <div>
                                    <p className="text-white font-medium">{test.modelName}</p>
                                    <p className="text-slate-400 text-sm">{test.totalAttacks} attacks tested</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                                    test.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 glow-red' :
                                    test.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                    test.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400 glow-green'
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

function QuickAction({ step, title, description, onClick }) {
    return (
        <button
            onClick={onClick}
            className="glass-card p-5 text-left group relative overflow-hidden"
        >
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm font-bold">
                {step}
            </div>
            <h3 className="text-white font-semibold mt-4">{title}</h3>
            <p className="text-slate-400 text-sm mt-1">{description}</p>
            <div className="flex items-center gap-1 text-indigo-400 text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Get Started <ArrowRight className="w-4 h-4" />
            </div>
        </button>
    );
}

export default Dashboard;