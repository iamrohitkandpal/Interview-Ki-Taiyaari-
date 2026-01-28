import { useState } from "react";
import { BarChart3, Menu, Settings, Shield, Target, X, Zap } from "lucide-react";
import useStore from "./store/useStore";
import Dashboard from "./components/Dashboard";
import ModelsPage from "./components/ModelsPage";
import AttacksPage from "./components/AttacksPage";
import TestPage from "./components/TestPage";
import ResultsPage from "./components/ResultsPage";
import './index.css';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'models', label: 'Models', icon: Settings },
  { id: 'attacks', label: 'Attacks', icon: Target },
  { id: 'test', label: 'Run Test', icon: Zap },
  { id: 'results', label: 'Results', icon: Shield },
];

function App() {
  const { activeTab, setActiveTab } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'models': return <ModelsPage />;
      case 'attacks': return <AttacksPage />;
      case 'test': return <TestPage />;
      case 'results': return <ResultsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1e293b] border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-white">PromptShield</h1>
              <p className="text-xs text-slate-400">LLM Security Testing</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {sidebarOpen && <span>{tab.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;