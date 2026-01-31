import { useState, useEffect } from 'react';
import { Shield, Play, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { defensesAPI } from '../services/api';

function DefensesPage() {
  const [defenses, setDefenses] = useState([]);
  const [selectedDefenses, setSelectedDefenses] = useState([]);
  const [testPrompt, setTestPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedDefense, setExpandedDefense] = useState(null);

  useEffect(() => {
    loadDefenses();
  }, []);

  const loadDefenses = async () => {
    try {
      const res = await defensesAPI.getAll();
      setDefenses(res.data || []);
    } catch (error) {
      console.error('Failed to load defenses:', error);
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
    if (!testPrompt.trim()) {
      alert('Please enter a test prompt');
      return;
    }
    
    setLoading(true);
    try {
      const res = await defensesAPI.apply({
        prompt: testPrompt,
        defenceIds: selectedDefenses
      });
      setResult(res.data);
    } catch (error) {
      alert('Failed to apply defenses: ' + error.message);
    }
    setLoading(false);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'prompt': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'filter': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'output': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'detection': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'limit': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Defense Sandbox</h1>
        <p className="text-slate-400 mt-1">Apply and test defense mechanisms against attack prompts</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Defense Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Available Defenses ({defenses.length})</h2>
          
          <div className="space-y-3 max-h-[500px] overflow-auto pr-2">
            {defenses.map((defense) => {
              const isSelected = selectedDefenses.includes(defense.id);
              const isExpanded = expandedDefense === defense.id;
              
              return (
                <div
                  key={defense.id}
                  className={`rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-indigo-500/20 border-indigo-500' 
                      : 'bg-[#1e293b] border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleDefense(defense.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{defense.name}</h3>
                          <p className="text-slate-400 text-sm mt-1">{defense.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 text-xs rounded border ${getCategoryColor(defense.category)}`}>
                              {defense.category}
                            </span>
                            <span className="text-xs text-slate-500">{defense.source}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedDefense(isExpanded ? null : defense.id); }}
                        className="text-slate-400 hover:text-white"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-700 pt-3">
                      <p className="text-xs text-slate-500 uppercase mb-2">Implementation</p>
                      {defense.template && (
                        <pre className="text-xs text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto">
                          {defense.template.substring(0, 300)}...
                        </pre>
                      )}
                      {defense.patterns && (
                        <div className="text-xs text-slate-300">
                          <p className="mb-1">Blocked Patterns: {defense.patterns.length}</p>
                          {defense.patterns.slice(0, 3).map((p, i) => (
                            <code key={i} className="block bg-slate-800 p-1 rounded mb-1">{p.match}</code>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Test Defense</h2>
          
          <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Test Prompt (paste an attack here)
              </label>
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a potentially malicious prompt to test..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                {selectedDefenses.length} defense(s) selected
              </p>
              <button
                onClick={applyDefenses}
                disabled={loading || selectedDefenses.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Apply Defenses
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Result</h3>
                {result.blocked ? (
                  <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    <Shield className="w-4 h-4" /> Blocked
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                    Modified
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-2">Original Prompt</p>
                <pre className="text-sm text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto max-h-32">
                  {result.original}
                </pre>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-2">Modified Prompt</p>
                <pre className="text-sm text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {result.modified}
                </pre>
              </div>

              {result.appliedDefences?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-2">Applied Defenses</p>
                  <div className="flex flex-wrap gap-2">
                    {result.appliedDefences.map((d, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs">
                        {d.name} ({d.action || d.actions})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DefensesPage;