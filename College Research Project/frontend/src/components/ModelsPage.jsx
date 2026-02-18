import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Wifi, WifiOff, Server } from 'lucide-react';
import { modelsAPI } from '../services/api';
import useStore from '../store/useStore';

function ModelsPage() {
    const { models, setModels, addModel, addToast } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
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
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await modelsAPI.add(formData);
            addModel(res.data);
            setFormData({ name: '', provider: 'groq', apiKey: '', modelId: '', endpoint: '' });
            setShowForm(false);
        } catch (error) {
            addToast('Failed to add model: ' + error.message, 'error');
        }
        setLoading(false);
    };

    const handleTest = async (id) => {
        try {
            const res = await modelsAPI.update(id);
            loadModels();
            addToast(
                res.data.success ? 'Connection successful!' : 'Connection failed',
                res.data.success ? 'success' : 'error'
            );
        } catch (error) {
            addToast('Connection test failed: ' + error.message, 'error');
        }
    };

    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const handleDelete = async (id) => {
        try {
            await modelsAPI.delete(id);
            loadModels();
            addToast('Model deleted successfully', 'success');
        } catch (error) {
            addToast('Failed to delete: ' + error.message, 'error');
        }
        setDeleteConfirmId(null);
    };

    const providers = [
        { id: 'groq', name: 'Groq (Cloud)', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'], needsKey: true, needsEndpoint: false },
        { id: 'openai', name: 'OpenAI (Cloud)', models: ['gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'], needsKey: true, needsEndpoint: false },
        { id: 'ollama', name: 'Ollama (Local)', models: ['llama2', 'llama3', 'mistral', 'codellama', 'gemma', 'phi'], needsKey: false, needsEndpoint: true, defaultEndpoint: 'http://localhost:11434' },
        { id: 'custom', name: 'Custom (OpenAI-Compatible)', models: [], needsKey: false, needsEndpoint: true, defaultEndpoint: 'http://localhost:5000' },
    ];

    const currentProvider = providers.find(p => p.id === formData.provider);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Models</h1>
                    <p className="text-slate-400 mt-1">Connect and manage your LLM models</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="glass-button flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Model
                </button>
            </div>

            {/* Add Model Form - Glass Panel */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
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
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Provider</label>
                            <select
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                className="glass-input w-full px-4 py-2.5 rounded-xl text-white focus:outline-none"
                            >
                                {providers.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
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
                                <p className="text-xs text-slate-500 mt-1">Default: {currentProvider?.defaultEndpoint || 'http://localhost:5000'}</p>
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
                            <p className="text-xs text-slate-500 mt-1">
                                {formData.provider === 'custom'
                                    ? 'The model name your server expects in the request'
                                    : 'Select from suggestions or type any model name'}
                            </p>
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
                            onClick={() => setShowForm(false)}
                            className="px-6 py-2.5 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600/50 backdrop-blur-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Setup Guide for Custom Provider */}
            {showForm && formData.provider === 'custom' && (
                <div className="glass-panel p-5 border border-indigo-500/20">
                    <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">📋 How to Connect Your Custom Model</h3>
                    <div className="space-y-3 text-sm text-slate-400">
                        <p><span className="text-white font-medium">Step 1:</span> Your server must expose an <span className="text-cyan-400">OpenAI-compatible</span> chat completions endpoint.</p>
                        <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                            <p className="text-slate-500 mb-1"># Minimal FastAPI example:</p>
                            <p className="text-green-400">pip install fastapi uvicorn</p>
                            <p className="mt-2">{"@app.post('/v1/chat/completions')"}</p>
                            <p>{"async def chat(request):"}</p>
                            <p className="pl-4">{"# Parse request.messages"}</p>
                            <p className="pl-4">{"# Return { 'choices': [{ 'message': { 'content': '...' } }] }"}</p>
                        </div>
                        <p><span className="text-white font-medium">Step 2:</span> Start your server (e.g., <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">uvicorn app:app --port 5000</code>)</p>
                        <p><span className="text-white font-medium">Step 3:</span> Enter <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">http://localhost:5000/v1</code> as the Endpoint URL above</p>
                        <p><span className="text-white font-medium">Step 4:</span> Enter the model name your server expects, then click <span className="text-white">Add Model</span> and test the connection</p>
                        <p className="text-xs text-slate-500 border-t border-slate-700/50 pt-2 mt-2">
                            💡 Works with: FastAPI, Flask, vLLM, text-generation-webui, LM Studio, LocalAI — any server that speaks the OpenAI Chat Completions format.
                        </p>
                    </div>
                </div>
            )}

            {/* Models List - Glass Cards */}
            <div className="grid gap-4">
                {models.length === 0 ? (
                    <div className="glass-panel p-12 text-center">
                        <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No models connected yet. Add one to start testing!</p>
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
                                    className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 text-sm backdrop-blur-sm transition-all"
                                >
                                    Test Connection
                                </button>
                                {deleteConfirmId === model.id ? (
                                    <button
                                        onClick={() => handleDelete(model.id)}
                                        onBlur={() => setDeleteConfirmId(null)}
                                        className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-all animate-pulse"
                                        autoFocus
                                    >
                                        Sure?
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirmId(model.id)}
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