import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Models
  models: [],
  setModels: (models) => set({ models }),
  addModel: (model) => set((state) => ({ models: [...state.models, model] })),
  
  // Attacks
  attacks: [],
  selectedAttacks: [],
  setAttacks: (attacks) => set({ attacks }),
  toggleAttack: (id) => set((state) => {
    const selected = state.selectedAttacks.includes(id)
      ? state.selectedAttacks.filter(a => a !== id)
      : [...state.selectedAttacks, id];
    return { selectedAttacks: selected };
  }),
  selectAllAttacks: () => set((state) => ({ 
    selectedAttacks: state.attacks.map(a => a.id) 
  })),
  clearSelectedAttacks: () => set({ selectedAttacks: [] }),
  
  // Test Results
  testResults: [],
  currentTest: null,
  isRunning: false,
  setTestResults: (results) => set({ testResults: results }),
  setCurrentTest: (test) => set({ currentTest: test }),
  setIsRunning: (running) => set({ isRunning: running }),
  
  // Selected Model for Testing
  selectedModel: null,
  setSelectedModel: (model) => set({ selectedModel: model }),
  
  // UI State
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab })
}));

export default useStore;