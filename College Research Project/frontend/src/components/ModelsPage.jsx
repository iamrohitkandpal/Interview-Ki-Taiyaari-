import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { modelsAPI } from '../services/api';
import useStore from '../store/useStore';

function ModelsPage() {
    const { models, setModels, addModel } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        provider: 'groq',
        apiKey: '',
        modelId: ''
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
            setFormData({ name: '', provider: 'groq', apiKey: '', modelId: '' });
            setShowForm(false);
        } catch (error) {
            alert('Failed to add model: ' + error.message);
        }
        setLoading(false);
    };

    const handleTest = async (id) => {
        try {
            const res = await modelsAPI.update(id);
            loadModels();
            alert(res.data.success ? '✅ Connection successful!' : '❌ Connection failed');
        } catch (error) {
            alert('Connection test failed: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this model?')) return;
        try {
            await modelsAPI.delete(id);
            loadModels();
        } catch (error) {
            alert('Failed to delete: ' + error.message);
        }
    };

    const providers = [
        { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
        { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'] },
        { id: 'ollama', name: 'Ollama (Local)', models: ['llama2', 'mistral', 'codellama'] },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Models</h1>
                    <p className="text-slate-400 mt-1">Connect and manage your LLM models</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Model
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-xl p-6 border border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Model Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="My GPT-4 Model"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Provider</label>
                            <select
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                {providers.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">API Key</label>
                            <input
                                type="password"
                                value={formData.apiKey}
                                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                placeholder="sk-..."
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Model ID</label>
                            <select
                                value={formData.modelId}
                                onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">Select model...</option>
                                {providers.find(p => p.id === formData.provider)?.models.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Add Model
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {models.length === 0 ? (
                    <div className="bg-[#1e293b] rounded-xl p-12 border border-slate-700 text-center">
                        <p className="text-slate-400">No models connected yet. Add one to start testing!</p>
                    </div>
                ) : (
                    models.map((model) => (
                        <div key={model.id} className="bg-[#1e293b] rounded-xl p-6 border border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${model.status === 'connected' ? 'bg-green-500' : model.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                <div>
                                    <h3 className="text-white font-medium">{model.name}</h3>
                                    <p className="text-slate-400 text-sm">{model.provider} • {model.modelId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleTest(model.id)} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm">
                                    Test Connection
                                </button>
                                <button onClick={() => handleDelete(model.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ModelsPage;