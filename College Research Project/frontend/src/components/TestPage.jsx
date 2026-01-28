import { useState } from 'react';
import { Play, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { testsAPI, attacksAPI } from '../services/api';
import useStore from '../store/useStore';

function TestPage() {
  const { models, selectedAttacks, attacks, setCurrentTest, setIsRunning, isRunning, testResults, setTestResults } = useStore();
  const [selectedModel, setSelectedModel] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState(null);

  const runTest = async () => {
    if (!selectedModel || selectedAttacks.length === 0) {
      alert('Please select a model and at least one attack');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCurrentResult(null);

    try {
      const attacksToRun = attacks.filter(a => selectedAttacks.includes(a.id));
      
      const result = await testsAPI.run({
        modelId: selectedModel.id,
        modelConfig: selectedModel,
        attacks: attacksToRun
      });

      setCurrentResult(result.data);
      setTestResults([result.data, ...testResults]);
      setProgress(100);
    } catch (error) {
      alert('Test failed: ' + error.message);
    }
    
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Run Security Test</h1>
        <p className="text-slate-400 mt-1">Execute attacks against your selected model</p>
      </div>

      {/* Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Model Selection */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">1. Select Model</h2>
          {models.length === 0 ? (
            <p className="text-slate-400">No models added. Go to Models page first.</p>
          ) : (
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedModel?.id === model.id
                      ? 'bg-indigo-500/20 border-2 border-indigo-500'
                      : 'bg-slate-800 border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <p className="text-white font-medium">{model.name}</p>
                  <p className="text-slate-400 text-sm">{model.provider} • {model.modelId}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attack Summary */}
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">2. Selected Attacks</h2>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-indigo-400">{selectedAttacks.length}</p>
            <p className="text-slate-400 mt-1">attacks selected</p>
          </div>
          <button
            onClick={() => useStore.getState().setActiveTab('attacks')}
            className="w-full py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            Modify Selection
          </button>
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={runTest}
        disabled={isRunning || !selectedModel || selectedAttacks.length === 0}
        className="w-full py-4 bg-indigo-500 text-white rounded-xl font-semibold text-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Running Tests...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Run Security Test
          </>
        )}
      </button>

      {/* Results Preview */}
      {currentResult && (
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
          
          {/* Risk Score */}
          <div className="text-center mb-6">
            <div className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${
              currentResult.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
              currentResult.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
              currentResult.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {currentResult.riskLevel} - {currentResult.riskScore}/100
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-white">{currentResult.totalAttacks}</p>
              <p className="text-slate-400 text-sm">Total</p>
            </div>
            <div className="text-center p-4 bg-green-500/20 rounded-lg">
              <p className="text-2xl font-bold text-green-400">{currentResult.passed}</p>
              <p className="text-green-400 text-sm">Passed</p>
            </div>
            <div className="text-center p-4 bg-red-500/20 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{currentResult.failed}</p>
              <p className="text-red-400 text-sm">Failed</p>
            </div>
          </div>

          {/* Individual Results */}
          <div className="space-y-2 max-h-96 overflow-auto">
            {currentResult.results?.map((result, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {result.vulnerable ? (
                    <XCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  <span className="text-white">{result.attackName}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.vulnerable ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {result.vulnerable ? 'VULNERABLE' : 'SAFE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TestPage;