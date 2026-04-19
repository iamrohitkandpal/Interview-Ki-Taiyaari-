
import { useState, useEffect } from 'react';
import { Shield, Play, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, Terminal, RefreshCw, Zap } from 'lucide-react';
import { defensesAPI } from '../services/api';
import useStore from '../store/useStore';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { getCategoryColor } from '../utils/styles';

function DefensesPage() {
  const [defenses, setDefenses] = useState([]);
  const [selectedDefenses, setSelectedDefenses] = useState([]);
  const [testPrompt, setTestPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDefenses, setLoadingDefenses] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { addToast } = useStore();
  const [expandedDefense, setExpandedDefense] = useState(null);

  useEffect(() => {
    loadDefenses();
  }, []);

  const loadDefenses = async () => {
    setLoadingDefenses(true);
    setLoadError('');
    try {
      const res = await defensesAPI.getAll();
      setDefenses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      const message = error?.message || 'Failed to load defenses';
      setLoadError(message);
      setDefenses([]);
      addToast(message, 'error');
    } finally {
      setLoadingDefenses(false);
    }
  };

  const toggleDefense = (id) => {
    setSelectedDefenses(prev =>
      prev.includes(id)
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  const applyDefenses = async () => {
    if (loading || loadingDefenses) {
      return;
    }

    if (selectedDefenses.length === 0) {
      addToast('Select at least one defense to execute', 'warning');
      return;
    }

    if (!testPrompt.trim()) {
      addToast('Please enter a test prompt', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await defensesAPI.apply({
        prompt: testPrompt,
        defenceIds: selectedDefenses
      });
      const responseData = res?.data && typeof res.data === 'object' ? res.data : null;

      if (!responseData) {
        throw new Error('Defense API returned an invalid response');
      }

      setResult(responseData);
      addToast('Defense execution completed', 'success');
    } catch (error) {
      addToast('Failed to apply defenses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearTest = () => {
    setTestPrompt('');
    setResult(null);
    setSelectedDefenses([]);
    setExpandedDefense(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <h1 className="text-4xl font-bold">
          <span className="gradient-text">Defense Sandbox</span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Experimental environment for testing defense mechanisms</p>
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" aria-hidden="true"></div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Defense Selection Panel (Left - 4 cols) */}
        <Card variant="glass" className="lg:col-span-5 p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Active Defenses
            </h2>
            <Badge variant="info">{selectedDefenses.length} Active</Badge>
          </div>

          <div className="space-y-3 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            {loadingDefenses ? (
              <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/40 text-slate-400 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading defenses...
              </div>
            ) : loadError ? (
              <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
                Failed to load defenses: {loadError}
              </div>
            ) : defenses.length === 0 ? (
              <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/40 text-slate-400 text-sm">
                No defenses available.
              </div>
            ) : defenses.map((defense) => {
              const isSelected = selectedDefenses.includes(defense.id);
              const isExpanded = expandedDefense === defense.id;

              return (
                <div
                  key={defense.id}
                  className={`rounded-xl border transition-all duration-200 ${isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                    }`}
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleDefense(defense.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500 bg-transparent'
                          }`}>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>{defense.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge variant={getCategoryColor(defense.category)} className="text-[10px] px-1.5 py-0 uppercase">
                              {defense.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedDefense(isExpanded ? null : defense.id); }}
                        className="text-slate-500 hover:text-white transition-colors p-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-700/50 pt-3 bg-black/20 rounded-b-xl">
                      <p className="text-xs text-slate-400 mb-2">{defense.description}</p>

                      {defense.source && (
                        <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1">
                          <span className="font-semibold text-slate-400">Source:</span> {defense.source}
                        </p>
                      )}

                      <div className="space-y-2 mt-3">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Defense Logic</p>
                        {defense.template && (
                          <div className="relative group">
                            <pre className="text-[10px] text-cyan-200/80 bg-slate-900 p-2 rounded border border-slate-700 overflow-x-auto font-mono">
                              {defense.template.length > 200 ? `${defense.template.substring(0, 200)}...` : defense.template}
                            </pre>
                          </div>
                        )}
                        {defense.patterns && (
                          <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-700">
                            <span className="text-slate-500">Regex Patterns:</span> {defense.patterns.length} rules loaded
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Experiment Console (Right - 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="neon" className="p-1 overflow-hidden bg-slate-900 border-slate-800">
            <div className="bg-slate-950 p-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 px-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-mono text-slate-400">experiment_console.sh</span>
              </div>
              <div className="flex gap-1.5 px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-slate-900/50">
              <div>
                <label className="text-xs font-mono text-cyan-400 mb-2 block">{'>'} INPUT_PROMPT:</label>
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="// Enter attack vector to test defenses..."
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 font-mono focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none resize-none transition-all placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={clearTest}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Clear
                </button>
                <button
                  onClick={applyDefenses}
                  disabled={loading || selectedDefenses.length === 0 || !testPrompt.trim()}
                  className="px-6 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(34,211,238,0.4)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  EXECUTE_DEFENSE
                </button>
              </div>
            </div>
          </Card>

          {/* Results Display */}
          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card variant="gradient" className="p-6 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Analysis Result
                  </h3>
                  <Badge variant={result.blocked ? 'success' : 'warning'} className="text-sm px-3 py-1">
                    {result.blocked ? 'BLOCKED - THREAT MITIGATED' : 'PROMPT MODIFIED - SANITIZED'}
                  </Badge>
                </div>

                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Original Input</span>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700/50 text-sm text-slate-400 font-mono max-h-32 overflow-y-auto">
                        {result.original}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-wider text-emerald-500/70 font-semibold">Sanitized Output</span>
                      <div className="bg-emerald-950/10 p-3 rounded-lg border border-emerald-500/20 text-sm text-emerald-300 font-mono max-h-32 overflow-y-auto">
                        {result.modified}
                      </div>
                    </div>
                  </div>

                  {result.appliedDefences?.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-3">Defenses Triggered</span>
                      <div className="flex flex-wrap gap-2">
                        {result.appliedDefences.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-md border border-slate-700">
                            <Shield className="w-3 h-3 text-cyan-400" />
                            <span className="text-xs text-white font-medium">{d.name}</span>
                            <span className="text-[10px] text-slate-400 border-l border-slate-600 pl-2 ml-1">{d.action || d.actions}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DefensesPage;