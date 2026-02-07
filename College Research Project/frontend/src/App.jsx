import { useState } from "react";
import { BarChart3, Lock, Menu, Settings, Shield, Target, X, Zap, GitCompare } from "lucide-react";
import useStore from "./store/useStore";
import Dashboard from "./components/Dashboard";
import ModelsPage from "./components/ModelsPage";
import AttacksPage from "./components/AttacksPage";
import TestPage from "./components/TestPage";
import ResultsPage from "./components/ResultsPage";
import DefensesPage from "./components/DefensesPage";
import ComparePage from "./components/ComparePage";
import './index.css';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'models', label: 'Models', icon: Settings },
  { id: 'attacks', label: 'Attacks', icon: Target },
  { id: 'defenses', label: 'Defenses', icon: Lock },
  { id: 'test', label: 'Run Test', icon: Zap },
  { id: 'results', label: 'Results', icon: Shield },
  { id: 'compare', label: 'Compare', icon: GitCompare },
];

function App() {
  const { activeTab, setActiveTab } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'models': return <ModelsPage />;
      case 'attacks': return <AttacksPage />;
      case 'defenses': return <DefensesPage />;
      case 'test': return <TestPage />;
      case 'results': return <ResultsPage />;
      case 'compare': return <ComparePage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <div className="bg-orb bg-orb-1" aria-hidden="true"></div>
      <div className="bg-orb bg-orb-2" aria-hidden="true"></div>

      {/* Sidebar Navigation */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} glass-sidebar transition-all duration-300 flex flex-col`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center" aria-hidden="true">
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
        <nav className="flex-1 p-4" aria-label="Primary">
          <ul className="space-y-2" role="menubar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id} role="none">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={sidebarOpen ? undefined : tab.label}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
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
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </aside>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 p-6 overflow-auto"
        role="main"
        aria-label="Main content"
      >
        {renderPage()}
      </main>
    </div>
  );
}

export default App;