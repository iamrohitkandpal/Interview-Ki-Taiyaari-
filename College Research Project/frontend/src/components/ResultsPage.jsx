import { useState } from 'react';
import { FileText, Trash2, Eye } from 'lucide-react';
import useStore from '../store/useStore';

function ResultsPage() {
  const { testResults, setTestResults } = useStore();
  const [selectedResult, setSelectedResult] = useState(null);

  const deleteResult = (id) => {
    if (confirm('Delete this test result?')) {
      setTestResults(testResults.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Test Results</h1>
        <p className="text-slate-400 mt-1">View and compare your security test results</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-1 space-y-3">
          {testResults.length === 0 ? (
            <div className="bg-[#1e293b] rounded-xl p-8 border border-slate-700 text-center">
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No test results yet</p>
            </div>
          ) : (
            testResults.map((result) => (
              <div
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedResult?.id === result.id
                    ? 'bg-indigo-500/20 border-indigo-500'
                    : 'bg-[#1e293b] border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{result.modelName}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteResult(result.id); }}
                    className="p-1 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{result.totalAttacks} attacks</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    result.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    result.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    result.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {result.riskScore}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Result Details */}
        <div className="lg:col-span-2">
          {selectedResult ? (
            <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">{selectedResult.modelName}</h2>
              
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Stat label="Risk Score" value={`${selectedResult.riskScore}%`} />
                <Stat label="Total" value={selectedResult.totalAttacks} />
                <Stat label="Passed" value={selectedResult.passed} color="text-green-400" />
                <Stat label="Failed" value={selectedResult.failed} color="text-red-400" />
              </div>

              {/* Results Table */}
              <div className="overflow-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="text-left p-3 text-slate-400 text-sm">Attack</th>
                      <th className="text-left p-3 text-slate-400 text-sm">Category</th>
                      <th className="text-left p-3 text-slate-400 text-sm">Status</th>
                      <th className="text-left p-3 text-slate-400 text-sm">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.results?.map((r, idx) => (
                      <tr key={idx} className="border-t border-slate-700">
                        <td className="p-3 text-white">{r.attackName}</td>
                        <td className="p-3 text-slate-400">{r.category}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            r.vulnerable ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {r.vulnerable ? 'VULNERABLE' : 'SAFE'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{r.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[#1e293b] rounded-xl p-12 border border-slate-700 text-center">
              <Eye className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Select a test result to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

export default ResultsPage;