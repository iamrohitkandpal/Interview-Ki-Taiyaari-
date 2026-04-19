import { useState, useEffect, useRef } from 'react';
import { Zap, CheckCircle, XCircle, AlertTriangle, Play, Square, Clock, Scan, Shield } from 'lucide-react';
import useStore from '../store/useStore';
import api, { defensesAPI } from '../services/api';

function TestPage() {
    const {
        models,
        attacks,
        selectedAttacks,
        addTestResult,
        isTestRunning,
        setTestRunning,
        testProgress,
        setTestProgress,
        resetTestProgress,
        setActiveTab,
        addToast,
    } = useStore();
    const [selectedModel, setSelectedModel] = useState('');
    const [error, setError] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [isAutoScan, setIsAutoScan] = useState(false);
    const abortRef = useRef(null);
    const [availableDefenses, setAvailableDefenses] = useState([]);
    const [selectedDefenses, setSelectedDefenses] = useState([]);

    // Fetch available defenses
    useEffect(() => {
        defensesAPI.getAll().then(res => {
            setAvailableDefenses(res.data || []);
        }).catch((err) => {
            addToast(getErrorMessage(err, 'Failed to load defenses'), 'warning');
        });
    }, []);

    // Reset when component mounts
    useEffect(() => {
        return () => {
            resetTestProgress();
            abortRef.current?.abort();
        };
    }, []);

    const handleRunTest = async () => {
        if (isTestRunning) {
            return;
        }

        if (!selectedModel) {
            const message = 'Please select a model';
            setError(message);
            addToast(message, 'warning');
            return;
        }
        if (selectedAttacks.length === 0) {
            const message = 'Please select at least one attack';
            setError(message);
            addToast(message, 'warning');
            return;
        }

        // Resolve IDs to full attack objects (backend needs full objects)
        const attacksToRun = selectedAttacks
            .map(id => attacks.find(a => a.id === id))
            .filter(Boolean);

        if (attacksToRun.length === 0) {
            const message = 'Could not resolve selected attacks. Try refreshing the Attacks page.';
            setError(message);
            addToast(message, 'error');
            return;
        }

        const model = models.find((item) => item.id === selectedModel);
        if (!model) {
            const message = 'Selected model was not found. Refresh models and try again.';
            setError(message);
            addToast(message, 'error');
            return;
        }

        setError('');
        setTestRunning(true);
        const controller = new AbortController();
        abortRef.current = controller;
        setTestProgress({ current: 0, total: attacksToRun.length, currentAttack: 'Starting...' });
        let wasCancelled = false;
        let defenseApplyFailed = false;
        const promptMetaByAttackId = {};
        const attacksWithAppliedDefenses = [];

        try {
            for (let i = 0; i < attacksToRun.length; i++) {
                if (controller.signal.aborted) {
                    wasCancelled = true;
                    break;
                }

                const attack = attacksToRun[i];
                setTestProgress({
                    current: i,
                    total: attacksToRun.length,
                    currentAttack: `Preparing: ${attack.name}`
                });

                try {
                    let promptToSend = attack.prompt;
                    let defensesApplied = [];
                    if (selectedDefenses.length > 0) {
                        try {
                            const defRes = await defensesAPI.apply({
                                prompt: attack.prompt,
                                defenceIds: selectedDefenses
                            });
                            promptToSend = defRes.data?.modified || attack.prompt;
                            defensesApplied = Array.isArray(defRes.data?.appliedDefences)
                                ? defRes.data.appliedDefences
                                : [];
                        } catch {
                            defenseApplyFailed = true;
                        }
                    }
                    attacksWithAppliedDefenses.push({ ...attack, prompt: promptToSend });
                    promptMetaByAttackId[attack.id] = {
                        originalPrompt: attack.prompt,
                        hardenedPrompt: selectedDefenses.length > 0 ? promptToSend : undefined,
                        defensesApplied
                    };
                } catch {
                    attacksWithAppliedDefenses.push({ ...attack });
                    promptMetaByAttackId[attack.id] = {
                        originalPrompt: attack.prompt,
                        hardenedPrompt: undefined,
                        defensesApplied: []
                    };
                }

                setTestProgress({
                    current: i + 1,
                    total: attacksToRun.length,
                    currentAttack: `Prepared: ${attack.name}`
                });
            }

            if (wasCancelled) {
                const message = 'Test cancelled by user';
                setError(message);
                addToast(message, 'warning');
                return;
            }

            setTestProgress({
                current: attacksWithAppliedDefenses.length,
                total: attacksWithAppliedDefenses.length,
                currentAttack: 'Executing attacks...'
            });

            const response = await api.post('/tests/run', {
                modelId: model.id,
                modelConfig: {
                    name: model.name,
                    provider: model.provider,
                    apiKey: model.apiKey,
                    modelId: model.modelId,
                    endpoint: model.endpoint
                },
                attacks: attacksWithAppliedDefenses,
                systemPrompt: systemPrompt || undefined
            }, { signal: controller.signal });

            const serverResults = Array.isArray(response.data?.results) ? response.data.results : [];

            if (!response.data?.id || serverResults.length === 0) {
                const message = 'Test execution did not return valid results. Please retry.';
                setError(message);
                addToast(message, 'error');
                return;
            }

            const mergedResults = serverResults.map((result) => {
                const meta = promptMetaByAttackId[result?.attackId] || {};
                return {
                    ...result,
                    originalPrompt: meta.originalPrompt,
                    hardenedPrompt: meta.hardenedPrompt,
                    defensesApplied: Array.isArray(meta.defensesApplied) ? meta.defensesApplied : []
                };
            });

            setTestProgress({
                current: mergedResults.length,
                total: mergedResults.length,
                currentAttack: 'Completed'
            });

            addTestResult({
                ...response.data,
                modelId: response.data?.modelId || model.id,
                modelName: response.data?.modelName || model.name,
                provider: model.provider,
                results: mergedResults
            });

            const failed = Number(response.data?.failed) || mergedResults.filter((result) => result?.vulnerable === true).length;
            const totalAttacks = Number(response.data?.totalAttacks) || mergedResults.length;

            if (defenseApplyFailed) {
                addToast('Some defense preprocessing failed. Original prompts were used for those attacks.', 'warning');
            }

            addToast(`Manual test completed: ${failed} vulnerable out of ${totalAttacks}`, failed > 0 ? 'warning' : 'success');
            setActiveTab('results');
        } catch (err) {
            if (err.name === 'CanceledError' || controller.signal.aborted) {
                const message = 'Test cancelled by user';
                setError(message);
                addToast(message, 'warning');
                return;
            }

            const message = getErrorMessage(err, 'Manual test failed. Please try again.');
            setError(message);
            addToast(message, 'error');
        } finally {
            setTestRunning(false);
            resetTestProgress();
            abortRef.current = null;
        }
    };

    const handleStopTest = () => {
        abortRef.current?.abort();
        setTestRunning(false);
        resetTestProgress();
        setIsAutoScan(false);
        const message = 'Test cancelled by user';
        setError(message);
        addToast(message, 'warning');
        abortRef.current = null;
    };

    // =============================================
    // AUTO-SCAN: Runs curated attacks automatically
    // =============================================
    const handleAutoScan = async () => {
        if (isTestRunning) {
            return;
        }

        if (!selectedModel) {
            const message = 'Please select a model';
            setError(message);
            addToast(message, 'warning');
            return;
        }

        const model = models.find((item) => item.id === selectedModel);
        if (!model) {
            const message = 'Selected model was not found. Refresh models and try again.';
            setError(message);
            addToast(message, 'error');
            return;
        }

        setError('');
        setIsAutoScan(true);
        setTestRunning(true);
        const controller = new AbortController();
        abortRef.current = controller;
        setTestProgress({ current: 0, total: 15, currentAttack: 'Initializing automated scan...' });

        try {
            const response = await api.post('/tests/auto-scan', {
                modelConfig: {
                    name: model.name,
                    provider: model.provider,
                    apiKey: model.apiKey,
                    modelId: model.modelId,
                    endpoint: model.endpoint
                },
                systemPrompt: systemPrompt || undefined
            }, { signal: controller.signal });

            const serverResults = Array.isArray(response.data?.results) ? response.data.results : [];
            if (!response.data?.id || serverResults.length === 0) {
                const message = 'Auto-scan completed without valid results. Please retry.';
                setError(message);
                addToast(message, 'error');
                return;
            }

            const totalAttacks = Number(response.data?.totalAttacks) || 15;
            setTestProgress({ current: totalAttacks, total: totalAttacks, currentAttack: 'Completed' });

            addTestResult({
                modelId: model.id,
                modelName: model.name,
                provider: model.provider,
                ...response.data,
                results: serverResults
            });

            addToast(`Auto-scan completed: ${response.data?.failed || 0} vulnerable out of ${response.data?.totalAttacks || 0}`, (response.data?.failed || 0) > 0 ? 'warning' : 'success');
            setActiveTab('results');
        } catch (err) {
            if (err.name === 'CanceledError' || controller.signal.aborted) {
                const message = 'Auto-scan cancelled by user';
                setError(message);
                addToast(message, 'warning');
            } else {
                const message = getErrorMessage(err, 'Auto-scan failed. Please try again.');
                setError(message);
                addToast(message, 'error');
            }
        } finally {
            setTestRunning(false);
            setIsAutoScan(false);
            resetTestProgress();
            abortRef.current = null;
        }
    };

    const progressPercent = testProgress.total > 0
        ? Math.round((testProgress.current / testProgress.total) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative">
                <h1 className="text-3xl font-bold text-white">Run Security Test</h1>
                <p className="text-slate-400 mt-1">Choose a connected model, select attacks, and run manual test or auto-scan.</p>
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
                                <p className="text-slate-300 text-sm font-medium">No models configured yet</p>
                                <p className="text-slate-500 text-xs mt-1">Add a model and run Test Connection first.</p>
                                <button
                                    onClick={() => setActiveTab('models')}
                                    className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                                >
                                    Go to Models →
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
                                    <p className="text-slate-300 text-sm font-medium">No attacks selected</p>
                                    <p className="text-slate-500 text-xs mt-1">Choose at least one attack to enable test execution.</p>
                                    <button
                                        onClick={() => setActiveTab('attacks')}
                                        className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                                    >
                                        Go to Attacks →
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

                    {/* Defense Selection (Optional) */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">
                            <Shield className="w-4 h-4 inline mr-1" />
                            Active Defenses <span className="text-slate-600">(optional)</span>
                        </label>
                        {availableDefenses.length === 0 ? (
                            <p className="text-xs text-slate-600">No defenses available</p>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-slate-800/50 rounded-lg">
                                {availableDefenses.map(defense => (
                                    <label key={defense.id} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedDefenses.includes(defense.id)}
                                            onChange={(e) => {
                                                setSelectedDefenses(prev =>
                                                    e.target.checked
                                                        ? [...prev, defense.id]
                                                        : prev.filter(id => id !== defense.id)
                                                );
                                            }}
                                            className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
                                            disabled={isTestRunning}
                                        />
                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{defense.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {selectedDefenses.length > 0 && (
                            <p className="text-xs text-emerald-400 mt-1">
                                {selectedDefenses.length} defense(s) will harden attack prompts before testing
                            </p>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Run Button */}
                    <div className="space-y-3">
                        <button
                            onClick={isTestRunning ? handleStopTest : handleRunTest}
                            disabled={!selectedModel || selectedAttacks.length === 0}
                            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${isTestRunning && !isAutoScan
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'glass-button disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {isTestRunning && !isAutoScan ? (
                                <>
                                    <Square className="w-5 h-5" />
                                    Stop Test
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Run Manual Test
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-slate-800/80 text-slate-500">OR</span>
                            </div>
                        </div>

                        {/* Auto Scan Button */}
                        <button
                            onClick={isTestRunning ? handleStopTest : handleAutoScan}
                            disabled={!selectedModel}
                            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${isTestRunning && isAutoScan
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {isTestRunning && isAutoScan ? (
                                <>
                                    <Square className="w-5 h-5" />
                                    Stop Auto-Scan
                                </>
                            ) : (
                                <>
                                    <Scan className="w-5 h-5" />
                                    ⚡ Auto-Scan (15 Attacks)
                                </>
                            )}
                        </button>
                        <p className="text-xs text-slate-500 text-center">Auto-scan runs curated attacks across all categories including context boundary testing</p>
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                        <p className="text-sm text-slate-200 font-medium mb-1">Quick run checklist</p>
                        <p className="text-xs text-slate-400">1) Pick model  2) Confirm attacks  3) Optional defenses  4) Run test  5) Review Results tab.</p>
                    </div>

                    {/* System Prompt (for Auto-Scan) */}
                    <div>
                        <label htmlFor="system-prompt" className="block text-sm text-slate-400 mb-2">
                            <Shield className="w-4 h-4 inline mr-1" />
                            System Prompt / Model Role <span className="text-slate-600">(optional)</span>
                        </label>
                        <textarea
                            id="system-prompt"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="e.g. You are a coding assistant. Only answer programming questions."
                            className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none h-20"
                            disabled={isTestRunning}
                        />
                        <p className="text-xs text-slate-600 mt-1">Used for context boundary testing — checks if model stays in scope</p>
                    </div>
                </div>

                {/* Progress Panel */}
                <div className="glass-panel p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Test Progress</h2>

                    {!isTestRunning && testProgress.current === 0 ? (
                        <div className="text-center py-12">
                            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-300 font-medium">No active test</p>
                            <p className="text-slate-500 text-sm mt-1">Configure inputs on the left, then run manual test or auto-scan.</p>
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
                                        <span>{isAutoScan ? 'Running automated security scan...' : 'Test in progress...'}</span>
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

function getErrorMessage(error, fallback = 'Something went wrong') {
    return error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || fallback;
}

export default TestPage;
