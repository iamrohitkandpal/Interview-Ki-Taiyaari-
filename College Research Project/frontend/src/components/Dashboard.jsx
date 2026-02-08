import { Shield, AlertTriangle, Clock, Activity, Zap, ArrowRight, Settings, Target, ChevronRight, TrendingUp, Sparkles } from 'lucide-react';
import useStore from '../store/useStore';

function Dashboard() {
    const { models, testResults, selectedAttacks, setActiveTab } = useStore();

    // Calculate stats
    const totalTests = testResults.length;
    const avgRiskScore = totalTests > 0
        ? Math.round(testResults.reduce((acc, r) => acc + r.riskScore, 0) / totalTests)
        : null;
    const totalVulnerabilities = testResults.reduce((acc, r) => acc + (r.failed || 0), 0);
    const totalPassed = testResults.reduce((acc, r) => acc + (r.passed || 0), 0);

    const recentTests = testResults.slice(0, 5);
    const hasModels = models.length > 0;
    const hasAttacks = selectedAttacks.length > 0;
    const hasTests = totalTests > 0;
    const isNewUser = !hasModels && !hasTests;

    return (
        <div className="space-y-8">
            {/* Header with gradient text */}
            <div className="relative">
                <h1 className="text-4xl font-bold">
                    <span className="gradient-text">Security Dashboard</span>
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                    {isNewUser ? 'Welcome! Let\'s set up your first security test' : 'Monitor your LLM security posture'}
                </p>
            </div>

            {/* NEW USER: Onboarding Flow */}
            {isNewUser && (
                <div className="neon-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                            <Sparkles className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Get Started in 3 Steps</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <OnboardingStep
                            step={1}
                            title="Add a Model"
                            description="Configure your LLM (Groq, OpenAI, or Ollama)"
                            icon={Settings}
                            onClick={() => setActiveTab('models')}
                            completed={hasModels}
                            color="cyan"
                        />
                        <OnboardingStep
                            step={2}
                            title="Select Attacks"
                            description="Choose from 52+ attack vectors"
                            icon={Target}
                            onClick={() => setActiveTab('attacks')}
                            completed={hasAttacks}
                            disabled={!hasModels}
                            color="purple"
                        />
                        <OnboardingStep
                            step={3}
                            title="Run Test"
                            description="Execute the security assessment"
                            icon={Zap}
                            onClick={() => setActiveTab('test')}
                            completed={hasTests}
                            disabled={!hasModels || !hasAttacks}
                            color="rose"
                        />
                    </div>
                </div>
            )}

            {/* RETURNING USER: Bento Grid Stats */}
            {!isNewUser && (
                <>
                    {/* Stats Row - Using gradient-card for variety */}
                    <div className="bento-grid bento-grid-4 gap-4">
                        <StatCard
                            icon={Activity}
                            label="Models"
                            value={models.length}
                            color="cyan"
                        />
                        <StatCard
                            icon={Zap}
                            label="Tests Run"
                            value={totalTests}
                            color="purple"
                        />
                        <StatCard
                            icon={Shield}
                            label="Defended"
                            value={totalPassed}
                            color="green"
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Vulnerable"
                            value={totalVulnerabilities}
                            color="rose"
                        />
                    </div>

                    {/* Main Bento Layout */}
                    <div className="grid lg:grid-cols-5 gap-6">
                        {/* Risk Score - Large Card */}
                        <div className="lg:col-span-2 neon-card p-6 flex flex-col items-center justify-center min-h-[320px]">
                            {avgRiskScore !== null ? (
                                <>
                                    <p className="text-slate-400 text-sm mb-4 uppercase tracking-wider">Risk Score</p>
                                    <div className="relative mb-4">
                                        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" className="fill-none stroke-slate-800" strokeWidth="8" />
                                            <circle
                                                cx="50" cy="50" r="42"
                                                className={`fill-none transition-all duration-700 ${avgRiskScore > 70 ? 'stroke-rose-500' : avgRiskScore > 40 ? 'stroke-amber-500' : 'stroke-emerald-500'}`}
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={`${avgRiskScore * 2.64} 264`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`text-5xl font-bold ${avgRiskScore > 70 ? 'text-rose-400' : avgRiskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {avgRiskScore}
                                            </span>
                                            <span className="text-slate-500 text-sm">percent</span>
                                        </div>
                                    </div>
                                    <span className={`badge ${avgRiskScore > 70 ? 'badge-danger' : avgRiskScore > 40 ? 'badge-warning' : 'badge-success'}`}>
                                        <span className={`pulse-dot ${avgRiskScore > 70 ? 'bg-rose-400' : avgRiskScore > 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                                        {avgRiskScore > 70 ? 'HIGH RISK' : avgRiskScore > 40 ? 'MEDIUM RISK' : 'LOW RISK'}
                                    </span>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                                        <Shield className="w-12 h-12 text-slate-600" />
                                    </div>
                                    <p className="text-slate-400 mb-1">No Risk Data</p>
                                    <p className="text-slate-500 text-sm">Run a test to see your score</p>
                                    <button
                                        onClick={() => setActiveTab('test')}
                                        className="mt-4 outline-button text-sm"
                                    >
                                        Run Test <ArrowRight className="w-4 h-4 inline ml-1" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Tests - glass-panel */}
                        <div className="lg:col-span-3 glass-panel p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-cyan-400" />
                                    Recent Tests
                                </h2>
                                {testResults.length > 0 && (
                                    <button onClick={() => setActiveTab('results')} className="ghost-button text-sm">
                                        View All →
                                    </button>
                                )}
                            </div>

                            {recentTests.length === 0 ? (
                                <div className="text-center py-12">
                                    <Zap className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-400">No tests run yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentTests.map((test, idx) => (
                                        <div
                                            key={test.id}
                                            className="solid-card p-4 flex items-center justify-between cursor-pointer"
                                            onClick={() => setActiveTab('results')}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-slate-500 text-sm font-mono w-6">#{idx + 1}</div>
                                                <div>
                                                    <p className="text-white font-medium">{test.modelName}</p>
                                                    <p className="text-slate-500 text-xs">
                                                        {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'Recently'} • {test.totalAttacks} attacks
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className={`font-bold ${test.riskLevel === 'CRITICAL' || test.riskLevel === 'HIGH' ? 'text-rose-400' : test.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        {test.riskScore}%
                                                    </p>
                                                </div>
                                                <span className={`badge badge-${test.riskLevel === 'CRITICAL' || test.riskLevel === 'HIGH' ? 'danger' : test.riskLevel === 'MEDIUM' ? 'warning' : 'success'} text-xs`}>
                                                    {test.riskLevel}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Quick Actions - solid-card style */}
            <div className="solid-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Quick Actions
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    <QuickAction
                        label={hasModels ? "Manage Models" : "Add Model"}
                        description={hasModels ? `${models.length} configured` : "Configure a new LLM"}
                        onClick={() => setActiveTab('models')}
                        highlight={!hasModels}
                        color="cyan"
                    />
                    <QuickAction
                        label="Run Security Test"
                        description={hasAttacks ? `${selectedAttacks.length} attacks ready` : "Test against attacks"}
                        onClick={() => setActiveTab('test')}
                        highlight={hasModels && !hasTests}
                        color="purple"
                    />
                    <QuickAction
                        label="View Results"
                        description={hasTests ? `${totalTests} tests completed` : "Analyze reports"}
                        onClick={() => setActiveTab('results')}
                        disabled={!hasTests}
                        color="rose"
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colorClasses = {
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    };

    return (
        <div className="stat-card p-5">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]?.split(' ').slice(1).join(' ')}`}>
                    <Icon className={`w-5 h-5 ${colorClasses[color]?.split(' ')[0]}`} />
                </div>
                <div>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="text-slate-400 text-sm">{label}</p>
                </div>
            </div>
        </div>
    );
}

function OnboardingStep({ step, title, description, icon: Icon, onClick, completed, disabled, color }) {
    const colorMap = {
        cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500/30', glow: 'hover:shadow-cyan-500/20' },
        purple: { bg: 'bg-purple-500', border: 'border-purple-500/30', glow: 'hover:shadow-purple-500/20' },
        rose: { bg: 'bg-rose-500', border: 'border-rose-500/30', glow: 'hover:shadow-rose-500/20' },
    };
    const clr = colorMap[color] || colorMap.cyan;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-6 rounded-2xl border text-left transition-all ${completed
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : disabled
                        ? 'border-slate-700/50 opacity-40 cursor-not-allowed'
                        : `${clr.border} hover:bg-white/5 ${clr.glow} hover:shadow-lg`
                }`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${completed ? 'bg-emerald-500' : clr.bg}`}>
                    {completed ? <Shield className="w-5 h-5 text-white" /> : <span className="text-white font-bold">{step}</span>}
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        {title}
                        {!completed && !disabled && <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{description}</p>
                </div>
            </div>
        </button>
    );
}

function QuickAction({ label, description, onClick, highlight, disabled, color }) {
    const colorMap = {
        cyan: 'border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10',
        purple: 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10',
        rose: 'border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-5 text-left rounded-xl border transition-all ${disabled
                    ? 'border-slate-700/50 opacity-40 cursor-not-allowed'
                    : highlight
                        ? colorMap[color]
                        : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/30'
                }`}
        >
            <p className={`font-semibold ${highlight ? 'text-white' : 'text-slate-200'}`}>{label}</p>
            <p className="text-slate-500 text-sm mt-1">{description}</p>
        </button>
    );
}

export default Dashboard;
