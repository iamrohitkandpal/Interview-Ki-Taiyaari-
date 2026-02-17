import { useState } from "react";
import { BarChart3, Lock, Menu, Settings, Shield, Target, X, Zap, GitCompare, ChevronLeft, ChevronRight } from "lucide-react";
import useStore from "./store/useStore";
import Dashboard from "./components/Dashboard";
import ModelsPage from "./components/ModelsPage";
import AttacksPage from "./components/AttacksPage";
import TestPage from "./components/TestPage";
import ResultsPage from "./components/ResultsPage";
import DefensesPage from "./components/DefensesPage";
import ComparePage from "./components/ComparePage";
import ToastContainer from "./components/Toast";
import './index.css';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'cyan' },
  { id: 'models', label: 'Models', icon: Settings, color: 'purple' },
  { id: 'attacks', label: 'Attacks', icon: Target, color: 'rose' },
  { id: 'defenses', label: 'Defenses', icon: Lock, color: 'cyan' },
  { id: 'test', label: 'Run Test', icon: Zap, color: 'purple' },
  { id: 'results', label: 'Results', icon: Shield, color: 'cyan' },
  { id: 'compare', label: 'Compare', icon: GitCompare, color: 'rose' },
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
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-dark)' }}>
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Animated Background */}
      <div className="bg-orb bg-orb-1" aria-hidden="true"></div>
      <div className="bg-orb bg-orb-2" aria-hidden="true"></div>

      {/* Sidebar Navigation */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} glass-sidebar transition-all duration-300 flex flex-col relative`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20" aria-hidden="true">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white tracking-tight">Bhisma</h1>
              <p className="text-xs text-slate-500">Security Platform</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto" aria-label="Primary">
          <ul className="space-y-1" role="menubar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              const colorStyles = {
                cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
                purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
                rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
              };

              return (
                <li key={tab.id} role="none">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={sidebarOpen ? undefined : tab.label}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                      ? `bg-gradient-to-r ${colorStyles[tab.color]} border`
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? colorStyles[tab.color].split(' ').pop() : ''}`} aria-hidden="true" />
                    {sidebarOpen && (
                      <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{tab.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-800 border border-white/10 rounded-r-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 text-center">
          {sidebarOpen && (
            <p className="text-xs text-slate-600">v1.0.0 • MIT License</p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 p-8 overflow-auto"
        role="main"
        aria-label="Main content"
      >
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
