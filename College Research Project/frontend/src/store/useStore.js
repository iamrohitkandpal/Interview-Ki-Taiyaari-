import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Bhisma Global Store
 * Uses Zustand with persist middleware for localStorage persistence
 * Data survives page refresh and browser closing
 */
const useStore = create(
    persist(
        (set, get) => ({
            // ============================================
            // NAVIGATION STATE
            // ============================================
            activeTab: 'dashboard',
            setActiveTab: (tab) => set({ activeTab: tab }),

            // ============================================
            // MODELS STATE (Persisted)
            // ============================================
            models: [],
            setModels: (models) => set({ models }),
            addModel: (model) => set((state) => ({
                models: [
                    ...state.models,
                    {
                        ...model,
                        id: model?.id || Date.now().toString()
                    }
                ]
            })),
            removeModel: (id) => set((state) => ({
                models: state.models.filter((m) => m.id !== id)
            })),
            updateModel: (id, updates) => set((state) => ({
                models: state.models.map((m) => m.id === id ? { ...m, ...updates } : m)
            })),

            // ============================================
            // ATTACKS STATE (Persisted)
            // ============================================
            attacks: [], // All available attacks from API
            setAttacks: (attacks) => set({ attacks }),
            selectedAttacks: [], // IDs of selected attacks
            setSelectedAttacks: (attacks) => set({ selectedAttacks: attacks }),
            toggleAttack: (attackId) => set((state) => {
                const isSelected = state.selectedAttacks.includes(attackId);
                return {
                    selectedAttacks: isSelected
                        ? state.selectedAttacks.filter((id) => id !== attackId)
                        : [...state.selectedAttacks, attackId]
                };
            }),
            selectAllAttacks: () => set((state) => ({
                selectedAttacks: state.attacks.length > 0
                    ? state.attacks.map((a) => a.id)
                    : state.selectedAttacks
            })),
            clearSelectedAttacks: () => set({ selectedAttacks: [] }),

            // ============================================
            // TEST RESULTS STATE (Persisted)
            // ============================================
            testResults: [],
            addTestResult: (result) => set((state) => ({
                testResults: [
                    {
                        ...result,
                        id: result?.id || Date.now().toString(),
                        createdAt: result?.createdAt || new Date().toISOString()
                    },
                    ...state.testResults
                ].slice(0, 50) // Keep only last 50 results
            })),
            removeTestResult: (id) => set((state) => ({
                testResults: state.testResults.filter((r) => r.id !== id)
            })),
            setTestResults: (results) => set({ testResults: results }),
            clearTestResults: () => set({ testResults: [] }),

            // ============================================
            // TESTING STATE (Not Persisted - Runtime only)
            // ============================================
            isTestRunning: false,
            testProgress: { current: 0, total: 0, currentAttack: '' },
            setTestRunning: (running) => set({ isTestRunning: running }),
            setTestProgress: (progress) => set({ testProgress: progress }),
            resetTestProgress: () => set({
                isTestRunning: false,
                testProgress: { current: 0, total: 0, currentAttack: '' }
            }),

            // ============================================
            // UTILITY FUNCTIONS
            // ============================================
            getModelById: (id) => get().models.find((m) => m.id === id),
            getResultById: (id) => get().testResults.find((r) => r.id === id),

            // ============================================
            // TOAST NOTIFICATIONS (Not Persisted)
            // ============================================
            toasts: [],
            addToast: (message, type = 'info', duration = 4000) => {
                const id = Date.now().toString() + Math.random().toString(36).slice(2);
                set((state) => ({
                    toasts: [...state.toasts, { id, message, type }]
                }));
                // Auto-dismiss
                setTimeout(() => {
                    set((state) => ({
                        toasts: state.toasts.filter((t) => t.id !== id)
                    }));
                }, duration);
            },
            removeToast: (id) => set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id)
            })),

            // Clear all persisted data
            clearAllData: () => set({
                models: [],
                selectedAttacks: [],
                testResults: [],
                activeTab: 'dashboard'
            }),
        }),
        {
            name: 'bhisma-storage', // localStorage key
            storage: createJSONStorage(() => localStorage),
            // Only persist these fields
            partialize: (state) => ({
                models: state.models,
                selectedAttacks: state.selectedAttacks,
                testResults: state.testResults,
                activeTab: state.activeTab,
            }),
            // Version for future migrations
            version: 1,
        }
    )
);

export default useStore;
