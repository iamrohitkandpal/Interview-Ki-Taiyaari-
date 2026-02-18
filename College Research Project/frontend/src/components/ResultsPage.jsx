
import { useState } from 'react';
import { FileText, Trash2, Eye, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Shield, Download, FileJson, Printer, Search, Filter } from 'lucide-react';
import useStore from '../store/useStore';
import { exportAsJSON, exportAsPDF, exportAllAsJSON, copyToClipboard as copyReport } from '../services/reportService';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { getRiskColor, getRiskBadgeVariant, getRiskLabel } from '../utils/styles';

function ResultsPage() {
  const { testResults, setTestResults, addToast } = useStore();
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, failed, passed
  const [expandedRows, setExpandedRows] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const deleteResult = (id) => {
    setTestResults(testResults.filter(t => t.id !== id));
    if (selectedResult?.id === id) setSelectedResult(null);
    addToast('Test result deleted', 'success');
    setDeleteConfirmId(null);
  };

  const toggleRow = (idx) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic for the details view
  const filteredDetails = selectedResult?.results?.filter(r => {
    const matchesSearch = r.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.response.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all'
      ? true
      : filterType === 'failed' ? r.vulnerable : !r.vulnerable;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">Test Registry</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Detailed audit logs of all security assessments</p>
        </div>
        {testResults.length > 0 && (
          <button
            onClick={() => exportAllAsJSON(testResults)}
            className="group flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            aria-label="Export all results"
          >
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span className="text-sm text-slate-300 group-hover:text-white">Batch Export</span>
          </button>
        )}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Results List Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          <Card variant="solid" className="p-4 flex-shrink-0">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">History</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search history..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </Card>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {testResults.length === 0 ? (
              <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center h-40">
                <FileText className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No test records found</p>
              </Card>
            ) : (
              testResults.map((result) => (
                <Card
                  key={result.id}
                  variant={selectedResult?.id === result.id ? 'neon' : 'glass'}
                  className={`p-4 cursor-pointer group transition-all duration-200 ${selectedResult?.id === result.id ? 'border-l-4 border-l-indigo-500' : 'hover:bg-white/5'
                    }`}
                  onClick={() => { setSelectedResult(result); setExpandedRows({}); setSearchTerm(''); }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${selectedResult?.id === result.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {result.modelName}
                    </h3>
                    {deleteConfirmId === result.id ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResult(result.id); }}
                        onBlur={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-medium transition-all animate-pulse"
                        autoFocus
                      >
                        Sure?
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(result.id); }}
                        className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(result.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <Badge variant={getRiskBadgeVariant(result.riskScore)}>
                      {result.riskScore}% Risk
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Detail View (8 cols) */}
        <div className="lg:col-span-8 h-full flex flex-col">
          {selectedResult ? (
            <Card variant="glass" className="h-full flex flex-col border-0 p-0 overflow-hidden bg-slate-900/50 backdrop-blur-xl">
              {/* Detail Header */}
              <div className="p-6 border-b border-white/10 bg-white/5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      {selectedResult.modelName}
                      <Badge variant={getRiskBadgeVariant(selectedResult.riskScore)} className="text-sm px-3 py-1">
                        {getRiskLabel(selectedResult.riskScore)}
                      </Badge>
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-slate-500" />
                        {selectedResult.totalAttacks} Vectors Tested
                      </span>
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        {selectedResult.failed} Vulnerabilities
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Print Report"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => exportAsJSON(selectedResult)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Export JSON"
                    >
                      <FileJson className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search prompt or response..."
                      className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Results</option>
                    <option value="failed">Vulnerable Only</option>
                    <option value="passed">Safe Only</option>
                  </select>
                </div>
              </div>

              {/* Detail Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {filteredDetails?.map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${item.vulnerable
                      ? 'bg-rose-500/5 border-rose-500/20'
                      : 'bg-emerald-500/5 border-emerald-500/20'
                      }`}
                  >
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                      onClick={() => toggleRow(idx)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-1.5 rounded-full ${item.vulnerable ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                          {item.vulnerable ? <AlertTriangle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate pr-4">{item.prompt.substring(0, 60)}...</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      {expandedRows[idx] ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>

                    {expandedRows[idx] && (
                      <div className="px-4 pb-4 border-t border-white/5 bg-black/20">
                        <div className="grid gap-4 pt-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Attack Prompt</label>
                              <button
                                onClick={() => copyToClipboard(item.prompt, `p-${idx}`)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                {copiedId === `p-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                              </button>
                            </div>
                            <div className="bg-slate-900 rounded p-3 text-sm text-slate-300 font-mono border border-white/10 whitespace-pre-wrap">
                              {item.prompt}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Model Response</label>
                              <button
                                onClick={() => copyToClipboard(item.response, `r-${idx}`)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                              >
                                {copiedId === `r-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                              </button>
                            </div>
                            <div className={`bg-slate-900 rounded p-3 text-sm font-mono border border-white/10 whitespace-pre-wrap ${item.vulnerable ? 'text-rose-200/90' : 'text-emerald-200/90'
                              }`}>
                              {item.response}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredDetails?.length === 0 && (
                  <div className="text-center py-10 opacity-50">
                    <Search className="w-8 h-8 mx-auto mb-2" />
                    <p>No results match your filter</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card variant="glass" className="h-full flex flex-col items-center justify-center text-center opacity-50 border-dashed">
              <FileText className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-xl font-semibold text-slate-400">Select a Test Record</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                Choose a test from the history sidebar to view detailed audit logs.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;