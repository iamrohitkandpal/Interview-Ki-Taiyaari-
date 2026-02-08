import { useState, useEffect } from 'react';
import { Zap, CheckCircle, XCircle, AlertTriangle, Play, Square, Clock } from 'lucide-react';
import useStore from '../store/useStore';
import api from '../services/api';

function TestPage() {
    const { models, selectedAttacks, addTestResult, isTestRunning, setTestRunning, testProgress, setTestProgress, resetTestProgress, setActiveTab } = useStore();
    const [selectedModel, setSelectedModel] = useState('');
    const [error, setError] = useState('');

    // Reset when component mounts
    useEffect(() => {
        return () => resetTestProgress();
    }, []);

    const handleRunTest = async () => {
        if (!selectedModel) {
            setError('Please select a model');
            return;
        }
        if (selectedAttacks.length === 0) {
            setError('Please select at least one attack');
            return;
        }

        setError('');
        setTestRunning(true);
        setTestProgress({ current: 0, total: selectedAttacks.length, currentAttack: 'Starting...' });

        try {
            const model = models.find(m => m.id === selectedModel);

            const response = await api.post('/tests/run', {
                modelConfig: {
                    provider: model.provider,
                    apiKey: model.apiKey,
                    modelId: model.modelId,
                    endpoint: model.endpoint
                },
                attackIds: selectedAttacks,
                onProgress: (progress) => {
                    setTestProgress(progress);
                }
            });

            // Add result to store (persisted to localStorage)
            addTestResult({
                modelId: model.id,
                modelName: model.name,
                provider: model.provider,
                ...response.data
            });

            // Navigate to results
            setActiveTab('results');
        } catch (err) {
            setError(err.response?.data?.message || 'Test failed. Please try again.');
        } finally {
            setTestRunning(false);
            resetTestProgress();
        }
    };

    const handleStopTest = () => {
        setTestRunning(false);
        resetTestProgress();
        setError('Test cancelled by user');
    };

    const progressPercent = testProgress.total > 0
        ? Math.round((testProgress.current / testProgress.total) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative">
                <h1 className="text-3xl font-bold text-white">Run Security Test</h1>
                <p className="text-slate-400 mt-1">Execute attack vectors against your configured models</p>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl" aria-hidden="true"></div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <div className="glass-panel p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Test Configuration</h2>

                    {/* Model Selection */}
                    <div>
                        <label htmlFor="model-select" className="block text-sm text-slate-400 mb-2">
                            Target Model
                        </label>
                        {models.length === 0 ? (
                            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                                <p className="text-slate-400 text-sm">No models configured</p>
                                <button
                                    onClick={() => setActiveTab('models')}
                                    className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                                >
                                    Add a model →
                                </button>
                            </div>
                        ) : (
                            <select
                                id="model-select"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl"
                                disabled={isTestRunning}
                            >
                                <option value="">Select a model...</option>
                                {models.map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.name} ({model.provider})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Selected Attacks Summary */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">
                            Selected Attacks
                        </label>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            {selectedAttacks.length === 0 ? (
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm">No attacks selected</p>
                                    <button
                                        onClick={() => setActiveTab('attacks')}
                                        className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                                    >
                                        Select attacks →
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">{selectedAttacks.length} attacks selected</span>
                                    <button
                                        onClick={() => setActiveTab('attacks')}
                                        className="text-sm text-indigo-400 hover:text-indigo-300"
                                    >
                                        Modify
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Run Button */}
                    <button
                        onClick={isTestRunning ? handleStopTest : handleRunTest}
                        disabled={!selectedModel || selectedAttacks.length === 0}
                        className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${isTestRunning
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'glass-button disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        {isTestRunning ? (
                            <>
                                <Square className="w-5 h-5" />
                                Stop Test
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Run Security Test
                            </>
                        )}
                    </button>
                </div>

                {/* Progress Panel */}
                <div className="glass-panel p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Test Progress</h2>

                    {!isTestRunning && testProgress.current === 0 ? (
                        <div className="text-center py-12">
                            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Configure and run a test to see progress</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Circular Progress */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50" cy="50" r="40"
                                            className="fill-none stroke-slate-700"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            cx="50" cy="50" r="40"
                                            className={`fill-none ${isTestRunning ? 'stroke-indigo-500' : 'stroke-green-500'} transition-all duration-300`}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${progressPercent * 2.51} 251`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold text-white">{progressPercent}%</span>
                                        <span className="text-slate-400 text-sm">Complete</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Details */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Progress</span>
                                    <span className="text-white">{testProgress.current} / {testProgress.total}</span>
                                </div>

                                {testProgress.currentAttack && (
                                    <div className="p-3 bg-slate-800/50 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">Current Attack</p>
                                        <p className="text-white text-sm truncate">{testProgress.currentAttack}</p>
                                    </div>
                                )}

                                {isTestRunning && (
                                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                        <Clock className="w-4 h-4 animate-pulse" />
                                        <span>Test in progress...</span>
                                    </div>
                                )}

                                {!isTestRunning && progressPercent === 100 && (
                                    <div className="flex items-center gap-2 text-green-400 text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Test completed!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TestPage;
