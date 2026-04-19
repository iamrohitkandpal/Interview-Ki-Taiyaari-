
import { useEffect, useMemo, useState } from 'react';
import { FileText, Trash2, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Shield, Download, FileJson, Printer, Search } from 'lucide-react';
import useStore from '../store/useStore';
import { exportAsJSON, exportAsPDF, exportAllAsJSON } from '../services/reportService';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { getRiskBadgeVariant, getRiskLabel } from '../utils/styles';

function ResultsPage() {
  const { testResults, setTestResults, addToast } = useStore();
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, failed, passed
  const [expandedRows, setExpandedRows] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [operationError, setOperationError] = useState('');
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [isPrintingSingle, setIsPrintingSingle] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getSafeText = (value) => (typeof value === 'string' ? value : '');

  // Filter results in the sidebar by model name
  const filteredHistory = useMemo(() => {
    const safeSearch = historySearch.toLowerCase().trim();
    const sorted = [...testResults].sort((a, b) => {
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return bTime - aTime;
    });

    return sorted.filter((result) => {
      if (!safeSearch) return true;
      return getSafeText(result?.modelName).toLowerCase().includes(safeSearch);
    });
  }, [testResults, historySearch]);

  useEffect(() => {
    if (testResults.length === 0) {
      setSelectedResult(null);
      return;
    }

    setSelectedResult((current) => {
      if (!current?.id) {
        return testResults[0];
      }

      const updated = testResults.find((result) => result.id === current.id);
      return updated || testResults[0];
    });
  }, [testResults]);

  const deleteResult = (id) => {
    if (!id) {
      const message = 'Result id is required to delete the record';
      setOperationError(message);
      addToast(message, 'error');
      return;
    }

    try {
      setDeletingId(id);
      setOperationError('');
      setTestResults(testResults.filter((result) => result.id !== id));
      if (selectedResult?.id === id) {
        setSelectedResult(null);
      }
      addToast('Test result deleted', 'success');
    } catch (error) {
      const message = error?.message || 'Failed to delete test result';
      setOperationError(message);
      addToast(message, 'error');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const toggleRow = (idx) => {
    if (idx === null || idx === undefined) {
      return;
    }
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = async (text, id) => {
    const content = getSafeText(text);
    if (!content) {
      addToast('Nothing to copy', 'warning');
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const temp = document.createElement('textarea');
        temp.value = content;
        temp.setAttribute('readonly', '');
        temp.style.position = 'absolute';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }

      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      addToast('Copied to clipboard', 'success', 1800);
    } catch (error) {
      const message = error?.message || 'Failed to copy text';
      setOperationError(message);
      addToast(message, 'error');
    }
  };

  // Filter logic for the details view
  const filteredDetails = useMemo(() => {
    if (!selectedResult) {
      return [];
    }

    const details = Array.isArray(selectedResult.results) ? selectedResult.results : [];
    const safeSearch = searchTerm.toLowerCase().trim();

    return details.filter((result) => {
      const prompt = getSafeText(result?.prompt);
      const response = getSafeText(result?.response);
      const matchesSearch = !safeSearch
        || prompt.toLowerCase().includes(safeSearch)
        || response.toLowerCase().includes(safeSearch);

      const matchesFilter = filterType === 'all'
        ? true
        : filterType === 'failed'
          ? result?.vulnerable === true
          : result?.vulnerable !== true;

      return matchesSearch && matchesFilter;
    });
  }, [selectedResult, searchTerm, filterType]);

  const handleExportAll = () => {
    if (testResults.length === 0) {
      addToast('No test records available to export', 'warning');
      return;
    }

    try {
      setIsExportingAll(true);
      setOperationError('');
      exportAllAsJSON(testResults);
      addToast('All test results exported', 'success');
    } catch (error) {
      const message = error?.message || 'Failed to export all test results';
      setOperationError(message);
      addToast(message, 'error');
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleExportSelected = () => {
    if (!selectedResult) {
      addToast('Select a test result to export', 'warning');
      return;
    }

    try {
      setIsExportingSingle(true);
      setOperationError('');
      exportAsJSON(selectedResult);
      addToast('Test result exported as JSON', 'success');
    } catch (error) {
      const message = error?.message || 'Failed to export test result';
      setOperationError(message);
      addToast(message, 'error');
    } finally {
      setIsExportingSingle(false);
    }
  };

  const handlePrintSelected = () => {
    if (!selectedResult) {
      addToast('Select a test result to print', 'warning');
      return;
    }

    try {
      setIsPrintingSingle(true);
      setOperationError('');
      exportAsPDF(selectedResult);
      addToast('Print window opened', 'success', 2000);
    } catch (error) {
      const message = error?.message || 'Failed to open print view';
      setOperationError(message);
      addToast(message, 'error');
    } finally {
      setIsPrintingSingle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">Test Registry</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Audit logs for completed scans, with export and investigation tools.</p>
        </div>
        {testResults.length > 0 && (
          <button
            onClick={handleExportAll}
            disabled={isExportingAll}
            className="group flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            aria-label="Export all results"
          >
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span className="text-sm text-slate-300 group-hover:text-white">{isExportingAll ? 'Exporting...' : 'Batch Export'}</span>
          </button>
        )}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>
      </div>

      {operationError && (
        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {operationError}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-150">
        {/* Results List Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          <Card variant="solid" className="p-4 shrink-0">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">History</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by model name..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </Card>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {testResults.length === 0 ? (
              <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center h-40">
                <FileText className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No test records found</p>
                <p className="text-slate-600 text-xs mt-1">Run a test from the Run Test tab to populate this history.</p>
              </Card>
            ) : filteredHistory.length === 0 ? (
              <Card variant="glass" className="p-8 text-center flex flex-col items-center justify-center h-40">
                <Search className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm">No records match your search</p>
              </Card>
            ) : (
              filteredHistory.map((result) => (
                <Card
                  key={result.id || `${result.modelName}-${result.createdAt || 'unknown'}`}
                  variant={selectedResult?.id === result.id ? 'neon' : 'glass'}
                  className={`p-4 cursor-pointer group transition-all duration-200 ${selectedResult?.id === result.id ? 'border-l-4 border-l-indigo-500' : 'hover:bg-white/5'
                    }`}
                  onClick={() => { setSelectedResult(result); setExpandedRows({}); setSearchTerm(''); }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${selectedResult?.id === result.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {getSafeText(result.modelName) || 'Unknown Model'}
                    </h3>
                    {deleteConfirmId === result.id ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResult(result.id); }}
                        onBlur={() => setDeleteConfirmId(null)}
                        disabled={deletingId === result.id}
                        className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-medium transition-all animate-pulse"
                        autoFocus
                      >
                        {deletingId === result.id ? 'Deleting...' : 'Sure?'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(result.id); }}
                        disabled={deletingId === result.id}
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
                      onClick={handlePrintSelected}
                      disabled={isPrintingSingle}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Print Report"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleExportSelected}
                      disabled={isExportingSingle}
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
                          <p className="text-sm font-medium text-slate-200 truncate pr-4">{(getSafeText(item.prompt).slice(0, 60) || 'No prompt')}...</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                              {getSafeText(item.category) || 'uncategorized'}
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
                              {getSafeText(item.prompt) || 'No prompt available'}
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
                              {getSafeText(item.response) || 'No response available'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredDetails.length === 0 && (
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
              <p className="text-slate-600 text-xs max-w-xs mx-auto mt-2">
                Tip: after each scan, come here first to verify vulnerable prompts before moving to Compare or Defenses.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;