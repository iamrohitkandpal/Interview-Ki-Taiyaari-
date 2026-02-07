import { useState } from 'react';
import { FileText, Trash2, Eye, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Shield } from 'lucide-react';
import useStore from '../store/useStore';

function ResultsPage() {
  const { testResults, setTestResults } = useStore();
  const [selectedResult, setSelectedResult] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const deleteResult = (id) => {
    if (confirm('Delete this test result?')) {
      setTestResults(testResults.filter(t => t.id !== id));
      if (selectedResult?.id === id) setSelectedResult(null);
    }
  };

  const toggleRow = (idx) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const expandAll = () => {
    if (selectedResult?.results) {
      const allExpanded = {};
      selectedResult.results.forEach((_, idx) => { allExpanded[idx] = true; });
      setExpandedRows(allExpanded);
    }
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <h1 className="text-3xl font-bold text-white">Test Results</h1>
        <p className="text-slate-400 mt-1">View detailed attack prompts and model responses</p>
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-1 space-y-3">
          {testResults.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No test results yet</p>
              <p className="text-slate-500 text-sm mt-1">Run some tests to see results here</p>
            </div>
          ) : (
            testResults.map((result) => (
              <div
                key={result.id}
                onClick={() => { setSelectedResult(result); setExpandedRows({}); }}
                className={`glass-card p-4 cursor-pointer ${selectedResult?.id === result.id
                    ? 'bg-indigo-500/20 border-indigo-500'
                    : ''
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{result.modelName}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteResult(result.id); }}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{result.totalAttacks} attacks</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${result.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      result.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        result.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                    }`}>
                    {result.riskScore}% Risk
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Result Details */}
        <div className="lg:col-span-2">
          {selectedResult ? (
            <div className="glass-panel p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedResult.modelName}</h2>
                  <p className="text-slate-400 text-sm">{selectedResult.provider} • {new Date(selectedResult.timestamp).toLocaleString()}</p>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${selectedResult.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 glow-red' :
                    selectedResult.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      selectedResult.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400 glow-green'
                  }`}>
                  {selectedResult.riskLevel}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Stat label="Risk Score" value={`${selectedResult.riskScore}%`} />
                <Stat label="Total" value={selectedResult.totalAttacks} />
                <Stat label="Passed" value={selectedResult.passed} color="text-green-400" icon={Shield} />
                <Stat label="Failed" value={selectedResult.failed} color="text-red-400" icon={AlertTriangle} />
              </div>

              {/* Expand/Collapse Buttons */}
              <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                <h3 className="text-white font-medium">Attack Details</h3>
                <div className="flex gap-2">
                  <button onClick={expandAll} className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1 rounded-lg bg-indigo-500/10">
                    Expand All
                  </button>
                  <button onClick={collapseAll} className="text-xs text-slate-400 hover:text-slate-300 px-3 py-1 rounded-lg bg-slate-700/50">
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Results with Expandable Rows */}
              <div className="space-y-3 max-h-[500px] overflow-auto pr-2">
                {selectedResult.results?.map((r, idx) => (
                  <div key={idx} className="glass-card overflow-hidden">
                    {/* Row Header - Clickable */}
                    <div
                      onClick={() => toggleRow(idx)}
                      className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${r.vulnerable ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <div>
                          <p className="text-white font-medium">{r.attackName}</p>
                          <p className="text-slate-400 text-sm">{r.category} • {r.severity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${r.vulnerable ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                          {r.vulnerable ? 'VULNERABLE' : 'SAFE'}
                        </span>
                        <span className="text-slate-400 text-sm">{r.confidence}%</span>
                        {expandedRows[idx] ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content - Prompt & Response */}
                    {expandedRows[idx] && (
                      <div className="border-t border-slate-700 p-4 space-y-4 bg-slate-800/30">
                        {/* Attack Prompt */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-500 uppercase font-medium">Attack Prompt</span>
                            <button
                              onClick={() => copyToClipboard(r.prompt, `prompt-${idx}`)}
                              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                            >
                              {copiedId === `prompt-${idx}` ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <pre className="text-sm text-slate-300 bg-slate-900/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-48 border border-slate-700">
                            {r.prompt || 'Prompt not available'}
                          </pre>
                        </div>

                        {/* Model Response */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-500 uppercase font-medium">Model Response</span>
                            <button
                              onClick={() => copyToClipboard(r.response, `response-${idx}`)}
                              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                            >
                              {copiedId === `response-${idx}` ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <pre className={`text-sm p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-64 border ${r.vulnerable
                              ? 'bg-red-500/5 border-red-500/30 text-red-200'
                              : 'bg-green-500/5 border-green-500/30 text-green-200'
                            }`}>
                            {r.response || 'Response not available'}
                          </pre>
                        </div>

                        {/* Analysis Reason */}
                        {r.reason && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-700/30">
                            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-300">{r.reason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center">
              <Eye className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Select a test result to view details</p>
              <p className="text-slate-500 text-sm mt-1">Click on any result to see prompts and responses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'text-white', icon: Icon }) {
  return (
    <div className="stat-card p-4 text-center">
      <div className="flex items-center justify-center gap-2">
        {Icon && <Icon className={`w-5 h-5 ${color}`} />}
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <p className="text-slate-400 text-sm mt-1">{label}</p>
    </div>
  );
}

export default ResultsPage;