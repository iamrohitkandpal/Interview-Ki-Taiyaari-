import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Wifi, WifiOff, Server, BookOpen, CircleHelp, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { modelsAPI } from '../services/api';
import useStore from '../store/useStore';

function ModelsPage() {
    const { models, setModels, addToast } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [testingModelId, setTestingModelId] = useState('');
    const [deletingModelId, setDeletingModelId] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showGuide, setShowGuide] = useState(false);
    const [activeGuideProvider, setActiveGuideProvider] = useState('groq');
    const [showTroubleshooting, setShowTroubleshooting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        provider: 'groq',
        apiKey: '',
        modelId: '',
        endpoint: ''
    });

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const res = await modelsAPI.getAll();
            setModels(res.data || []);
        } catch (error) {
            console.error('Failed to load models:', error);
            addToast(`Failed to load models: ${error.message}`, 'error');
        }
    };

    const normalizeFormData = (rawFormData) => {
        const normalized = {
            name: typeof rawFormData.name === 'string' ? rawFormData.name.trim() : '',
            provider: typeof rawFormData.provider === 'string' ? rawFormData.provider.trim() : 'groq',
            apiKey: typeof rawFormData.apiKey === 'string' ? rawFormData.apiKey.trim() : '',
            modelId: typeof rawFormData.modelId === 'string' ? rawFormData.modelId.trim() : '',
            endpoint: typeof rawFormData.endpoint === 'string' ? rawFormData.endpoint.trim() : '',
        };

        if (normalized.provider === 'ollama' && !normalized.endpoint) {
            normalized.endpoint = 'http://localhost:11434/v1';
        }

        if (normalized.provider === 'ollama' && normalized.endpoint) {
            normalized.endpoint = ensureV1Suffix(normalized.endpoint);
        }

        if (normalized.provider === 'custom' && !normalized.endpoint) {
            normalized.endpoint = 'http://localhost:5000/v1';
        }

        return normalized;
    };

    const validateModelForm = (normalizedData) => {
        if (!normalizedData.name) {
            return 'Model name is required';
        }

        if (!normalizedData.provider) {
            return 'Provider is required';
        }

        if ((normalizedData.provider === 'groq' || normalizedData.provider === 'openai') && !normalizedData.apiKey) {
            return `API key is required for ${normalizedData.provider}`;
        }

        if (normalizedData.provider === 'custom' && !normalizedData.modelId) {
            return 'Model ID is required for custom provider';
        }

        if ((normalizedData.provider === 'ollama' || normalizedData.provider === 'custom') && !normalizedData.endpoint) {
            return `Endpoint URL is required for ${normalizedData.provider}`;
        }

        return null;
    };

    const getValidationErrors = (normalizedData) => {
        const errors = {};

        if (!normalizedData.name) {
            errors.name = 'Enter a clear label so you can find this model later.';
        }

        if ((normalizedData.provider === 'groq' || normalizedData.provider === 'openai') && !normalizedData.apiKey) {
            errors.apiKey = `This provider needs an API key before it can connect.`;
        }

        if (normalizedData.provider === 'custom' && !normalizedData.modelId) {
            errors.modelId = 'Enter the exact model ID exposed by your local server.';
        }

        if ((normalizedData.provider === 'ollama' || normalizedData.provider === 'custom') && !normalizedData.endpoint) {
            errors.endpoint = 'Enter a reachable base URL. Include /v1 when your server expects OpenAI-compatible routes.';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const normalizedFormData = normalizeFormData(formData);
        const validationErrors = getValidationErrors(normalizedFormData);
        setFieldErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            addToast('Please fix the highlighted fields, then try again.', 'warning');
            return;
        }

        const validationError = validateModelForm(normalizedFormData);

        if (validationError) {
            addToast(validationError, 'warning');
            return;
        }

        setLoading(true);
        try {
            await modelsAPI.add(normalizedFormData);
            await loadModels();
            addToast('Model added. Next step: click Test Connection to verify access.', 'success');
            setFormData({ name: '', provider: 'groq', apiKey: '', modelId: '', endpoint: '' });
            setFieldErrors({});
            setShowForm(false);
        } catch (error) {
            addToast(`Failed to add model: ${getErrorMessage(error, 'Request failed')}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProviderChange = (provider) => {
        const selectedProvider = providers.find((item) => item.id === provider);

        setFormData((prev) => ({
            ...prev,
            provider,
            endpoint: selectedProvider?.needsEndpoint
                ? (prev.endpoint.trim() || selectedProvider.defaultEndpoint || '')
                : ''
        }));
        setFieldErrors({});
        setActiveGuideProvider(provider);
    };

    const toggleForm = () => {
        setShowForm((prev) => {
            const next = !prev;
            if (next) {
                setFormData({ name: '', provider: 'groq', apiKey: '', modelId: '', endpoint: '' });
                setFieldErrors({});
            }
            return next;
        });
    };

    const handleTest = async (id) => {
        if (!id) {
            addToast('Model id is required to test connection', 'warning');
            return;
        }

        setTestingModelId(id);
        try {
            const res = await modelsAPI.test(id);
            await loadModels();
            addToast(
                res.data.message || (res.data.success ? 'Connection successful. Model is ready for testing.' : 'Connection failed. Review the troubleshooting panel and retry.'),
                res.data.success ? 'success' : 'error'
            );
        } catch (error) {
            addToast(`Connection test failed: ${error.message}. Confirm endpoint, model ID, and API key.`, 'error');
        } finally {
            setTestingModelId('');
        }
    };

    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const handleDelete = async (id) => {
        if (!id) {
            addToast('Model id is required to delete model', 'warning');
            setDeleteConfirmId(null);
            return;
        }

        setDeletingModelId(id);
        try {
            await modelsAPI.delete(id);
            await loadModels();
            addToast('Model deleted successfully', 'success');
        } catch (error) {
            addToast('Failed to delete: ' + error.message, 'error');
        } finally {
            setDeletingModelId('');
            setDeleteConfirmId(null);
        }
    };

    const providers = [
        { id: 'groq', name: 'Groq (Cloud)', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'], needsKey: true, needsEndpoint: false },
        { id: 'openai', name: 'OpenAI (Cloud)', models: ['gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'], needsKey: true, needsEndpoint: false },
        { id: 'ollama', name: 'Ollama (Local)', models: ['llama2', 'llama3', 'mistral', 'codellama', 'gemma', 'phi'], needsKey: false, needsEndpoint: true, defaultEndpoint: 'http://localhost:11434/v1' },
        { id: 'custom', name: 'Custom (OpenAI-Compatible)', models: [], needsKey: false, needsEndpoint: true, defaultEndpoint: 'http://localhost:5000/v1' },
    ];

    const currentProvider = providers.find(p => p.id === formData.provider);

    const providerGuides = {
        groq: {
            endpointExample: 'https://api.groq.com/openai/v1',
            modelExample: 'llama-3.3-70b-versatile',
            requiredFields: ['Model Name', 'Provider', 'API Key'],
            optionalFields: ['Model ID'],
            failures: ['Using an expired or wrong API key', 'Model ID typo', 'No network access to provider API'],
            quickFix: ['Generate a fresh key in Groq console', 'Paste one suggested model ID', 'Retry Test Connection after saving'],
        },
        openai: {
            endpointExample: 'https://api.openai.com/v1',
            modelExample: 'gpt-4o-mini',
            requiredFields: ['Model Name', 'Provider', 'API Key'],
            optionalFields: ['Model ID'],
            failures: ['Invalid API key', 'Model not enabled on your account', 'Proxy/firewall blocks outbound calls'],
            quickFix: ['Regenerate API key', 'Switch to a known available model ID', 'Confirm backend host can reach OpenAI'],
        },
        ollama: {
            endpointExample: 'http://localhost:11434/v1',
            modelExample: 'llama3',
            requiredFields: ['Model Name', 'Provider', 'Endpoint URL'],
            optionalFields: ['Model ID', 'API Key'],
            failures: ['Ollama service is not running', 'Endpoint missing /v1', 'Model is not pulled locally'],
            quickFix: ['Run ollama serve', 'Use endpoint http://localhost:11434/v1', 'Run ollama pull <model-id>'],
        },
        custom: {
            endpointExample: 'http://localhost:5000/v1',
            modelExample: 'my-local-model',
            requiredFields: ['Model Name', 'Provider', 'Endpoint URL', 'Model ID'],
            optionalFields: ['API Key'],
            failures: ['Server route is not OpenAI-compatible', 'Wrong base URL or missing /v1', 'Server expects a different model field'],
            quickFix: ['Expose POST /v1/chat/completions', 'Confirm exact base URL and port', 'Use the model name your server accepts'],
        },
    };

    const activeGuide = providerGuides[activeGuideProvider] || providerGuides.groq;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Models</h1>
                    <p className="text-slate-400 mt-1">Connect your model, test connectivity, and prepare for security scans.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowGuide((prev) => !prev)}
                        className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800/60 flex items-center gap-2"
                    >
                        <CircleHelp className="w-4 h-4" />
                        {showGuide ? 'Hide Guide' : 'Show Guide'}
                    </button>
                    <button
                        onClick={toggleForm}
                        className="glass-button flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Model
                    </button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="solid-card p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Step 1</p>
                    <p className="text-white font-semibold mt-1">Add Model</p>
                    <p className="text-sm text-slate-400 mt-1">Create a model entry with provider, credentials, and model ID.</p>
                </div>
                <div className="solid-card p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Step 2</p>
                    <p className="text-white font-semibold mt-1">Test Connection</p>
                    <p className="text-sm text-slate-400 mt-1">Verify endpoint access and credential validity before running tests.</p>
                </div>
                <div className="solid-card p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Step 3</p>
                    <p className="text-white font-semibold mt-1">Run Security Test</p>
                    <p className="text-sm text-slate-400 mt-1">Go to Run Test and launch manual test or auto-scan.</p>
                </div>
            </div>

            {showGuide && (
                <div className="glass-panel p-6 space-y-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
                        <BookOpen className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">How to Connect a Model</h2>
                        <p className="text-slate-400 text-sm mt-1">Pick a provider, fill required fields, save, then run Test Connection from the model row.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {providers.map((provider) => (
                        <button
                            key={provider.id}
                            type="button"
                            onClick={() => {
                                setActiveGuideProvider(provider.id);
                                setShowForm(true);
                                handleProviderChange(provider.id);
                            }}
                            className={`px-3 py-2 rounded-lg text-sm border transition-colors ${activeGuideProvider === provider.id
                                ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-200'
                                : 'border-slate-700 text-slate-300 hover:border-slate-500'
                                }`}
                        >
                            {provider.name}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                    <div className="solid-card p-4 space-y-2">
                        <h3 className="text-white font-medium">Required fields</h3>
                        <ul className="text-sm text-slate-300 space-y-1">
                            {activeGuide.requiredFields.map((item) => (
                                <li key={item} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" />{item}</li>
                            ))}
                        </ul>
                        <h3 className="text-white font-medium pt-2">Optional fields</h3>
                        <ul className="text-sm text-slate-400 space-y-1">
                            {activeGuide.optionalFields.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="solid-card p-4 space-y-3">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Example endpoint</p>
                            <p className="text-sm text-cyan-300 font-mono mt-1">{activeGuide.endpointExample}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Example model ID</p>
                            <p className="text-sm text-cyan-300 font-mono mt-1">{activeGuide.modelExample}</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                    <div className="solid-card p-4">
                        <h3 className="text-white font-medium mb-2">Common failure reasons</h3>
                        <ul className="text-sm text-slate-300 space-y-1">
                            {activeGuide.failures.map((item) => (
                                <li key={item}>- {item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="solid-card p-4">
                        <h3 className="text-white font-medium mb-2">Quick fixes</h3>
                        <ul className="text-sm text-slate-300 space-y-1">
                            {activeGuide.quickFix.map((item) => (
                                <li key={item}>- {item}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border border-slate-700/80 rounded-xl overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowTroubleshooting((prev) => !prev)}
                        className="w-full px-4 py-3 bg-slate-900/60 text-left flex items-center justify-between"
                    >
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <CircleHelp className="w-4 h-4 text-cyan-300" />
                            Connection troubleshooting
                        </span>
                        {showTroubleshooting ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {showTroubleshooting && (
                        <div className="p-4 bg-slate-950/40 text-sm text-slate-300 space-y-2">
                            <p>- Is the local server running? For Ollama, run <span className="font-mono text-cyan-300">ollama serve</span>.</p>
                            <p>- Is endpoint correct? Include <span className="font-mono text-cyan-300">/v1</span> when required by your server.</p>
                            <p>- Is model ID valid on that server? Try a known model first.</p>
                            <p>- Is API key required and valid? Cloud providers reject blank or invalid keys.</p>
                            <p>- Is backend reachable? Ensure frontend uses the correct API base URL and backend is running.</p>
                        </div>
                    )}
                </div>
                </div>
            )}

            {/* Add Model Form - Glass Panel */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg text-white font-semibold">Add model configuration</h2>
                        <p className="text-xs text-slate-500">Fields marked as required must be valid before saving.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Model Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="My GPT-4 Model"
                                className="glass-input w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                                required
                            />
                            {fieldErrors.name ? (
                                <p className="text-xs text-rose-400 mt-1">{fieldErrors.name}</p>
                            ) : (
                                <p className="text-xs text-slate-500 mt-1">Use a friendly label, for example: Classroom Demo OpenAI.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Provider</label>
                            <select
                                value={formData.provider}
                                onChange={(e) => handleProviderChange(e.target.value)}
                                className="glass-input w-full px-4 py-2.5 rounded-xl text-white focus:outline-none"
                            >
                                {providers.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Provider choice changes which fields are required.</p>
                        </div>
                        {/* API Key - for cloud providers, optional for custom */}
                        {(currentProvider?.needsKey || formData.provider === 'custom') && (
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">
                                    API Key {formData.provider === 'custom' && <span className="text-slate-600">(optional)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.apiKey}
                                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                    placeholder={formData.provider === 'openai' ? 'sk-...' : formData.provider === 'custom' ? 'Leave empty if not needed' : 'gsk_...'}
                                    className="glass-input w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                                    required={currentProvider?.needsKey}
                                />
                                {fieldErrors.apiKey ? (
                                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.apiKey}</p>
                                ) : (
                                    <p className="text-xs text-slate-500 mt-1">Stored for this model entry and used only for connection/test calls.</p>
                                )}
                            </div>
                        )}
                        {/* Endpoint URL - only for providers that need it */}
                        {currentProvider?.needsEndpoint && (
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Endpoint URL</label>
                                <input
                                    type="text"
                                    value={formData.endpoint}
                                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                                    placeholder={currentProvider?.defaultEndpoint || 'http://localhost:5000'}
                                    className="glass-input w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                                />
                                {fieldErrors.endpoint ? (
                                    <p className="text-xs text-rose-400 mt-1">{fieldErrors.endpoint}</p>
                                ) : (
                                    <p className="text-xs text-slate-500 mt-1">Default: {currentProvider?.defaultEndpoint || 'http://localhost:5000/v1'}</p>
                                )}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Model ID</label>
                            <input
                                type="text"
                                value={formData.modelId}
                                onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                                placeholder={formData.provider === 'custom' ? 'my-model' : (currentProvider?.models[0] || 'model-name')}
                                list={`models-${formData.provider}`}
                                className="glass-input w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                                required={formData.provider === 'custom'}
                            />
                            {currentProvider?.models.length > 0 && (
                                <datalist id={`models-${formData.provider}`}>
                                    {currentProvider.models.map((m) => (
                                        <option key={m} value={m} />
                                    ))}
                                </datalist>
                            )}
                            {fieldErrors.modelId ? (
                                <p className="text-xs text-rose-400 mt-1">{fieldErrors.modelId}</p>
                            ) : (
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.provider === 'custom'
                                        ? 'Use the exact model identifier expected by your local endpoint.'
                                        : 'Use a known model ID from your provider account.'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-button px-6 py-2.5 text-white rounded-xl disabled:opacity-50 flex items-center gap-2 font-medium"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Add Model
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setFormData({ name: '', provider: 'groq', apiKey: '', modelId: '', endpoint: '' });
                                setFieldErrors({});
                            }}
                            className="px-6 py-2.5 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600/50 backdrop-blur-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Models List - Glass Cards */}
            <div className="grid gap-4">
                {models.length === 0 ? (
                    <div className="glass-panel p-12 text-center">
                        <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-300 font-medium">No models connected yet.</p>
                        <p className="text-slate-500 text-sm mt-2">Start by adding one provider above, then run Test Connection before continuing to attacks and tests.</p>
                    </div>
                ) : (
                    models.map((model) => (
                        <div
                            key={model.id}
                            className="glass-card p-5 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${model.status === 'connected'
                                    ? 'bg-green-500/20'
                                    : model.status === 'error'
                                        ? 'bg-red-500/20'
                                        : 'bg-yellow-500/20'
                                    }`}>
                                    {model.status === 'connected'
                                        ? <Wifi className="w-5 h-5 text-green-400" />
                                        : <WifiOff className="w-5 h-5 text-yellow-400" />
                                    }
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{model.name}</h3>
                                    <p className="text-slate-400 text-sm">{model.provider} • {model.modelId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleTest(model.id)}
                                    disabled={testingModelId === model.id || deletingModelId === model.id}
                                    className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 text-sm backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {testingModelId === model.id ? 'Testing...' : 'Test Connection'}
                                </button>
                                {deleteConfirmId === model.id ? (
                                    <button
                                        onClick={() => handleDelete(model.id)}
                                        onBlur={() => setDeleteConfirmId(null)}
                                        disabled={deletingModelId === model.id}
                                        className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-all animate-pulse"
                                        autoFocus
                                    >
                                        {deletingModelId === model.id ? 'Deleting...' : 'Sure?'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirmId(model.id)}
                                        disabled={testingModelId === model.id || deletingModelId === model.id}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ModelsPage;

function getErrorMessage(error, fallback = 'Something went wrong') {
    return error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || fallback;
}

function ensureV1Suffix(endpoint) {
    const trimmed = typeof endpoint === 'string' ? endpoint.trim() : '';
    if (!trimmed) {
        return 'http://localhost:11434/v1';
    }

    return /\/v1\/?$/i.test(trimmed)
        ? trimmed.replace(/\/+$/, '')
        : `${trimmed.replace(/\/+$/, '')}/v1`;
}