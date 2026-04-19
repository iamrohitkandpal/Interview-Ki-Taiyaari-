import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import useStore from '../src/store/useStore.js';

describe('useStore', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset the store before each test
        const { setState } = useStore;
        setState({
            activeTab: 'dashboard',
            models: [],
            attacks: [],
            selectedAttacks: [],
            testResults: [],
            toasts: [],
            isTestRunning: false,
            testProgress: { current: 0, total: 0, currentAttack: '' },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should add a model', () => {
        const { addModel } = useStore.getState();

        act(() => {
            addModel({ id: 'model-1', name: 'GPT-4', provider: 'openai', apiKey: 'k' });
        });

        const { models } = useStore.getState();
        expect(models).toHaveLength(1);
        expect(models[0].name).toBe('GPT-4');
        expect(models[0].id).toBe('model-1');
    });

    it('should toggle an attack selection', () => {
        const { setAttacks, toggleAttack } = useStore.getState();

        act(() => {
            setAttacks([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]);
            toggleAttack('a1');
        });

        expect(useStore.getState().selectedAttacks).toEqual(['a1']);

        act(() => {
            useStore.getState().toggleAttack('a2');
        });

        expect(useStore.getState().selectedAttacks).toEqual(['a1', 'a2']);

        // Toggle off
        act(() => {
            useStore.getState().toggleAttack('a1');
        });

        expect(useStore.getState().selectedAttacks).toEqual(['a2']);
    });

    it('should guard selectAllAttacks when attacks are empty', () => {
        const { selectAllAttacks, setSelectedAttacks } = useStore.getState();

        // Set some pre-existing selections
        act(() => {
            setSelectedAttacks(['existing-1']);
            selectAllAttacks();
        });

        // Should be a no-op because attacks is []
        expect(useStore.getState().selectedAttacks).toEqual(['existing-1']);
    });

    it('should selectAllAttacks when attacks are loaded', () => {
        const { setAttacks, selectAllAttacks } = useStore.getState();

        act(() => {
            setAttacks([{ id: 'a1' }, { id: 'a2' }]);
            selectAllAttacks();
        });

        expect(useStore.getState().selectedAttacks).toEqual(['a1', 'a2']);
    });

    it('should add a test result and cap at 50', () => {
        const { addTestResult } = useStore.getState();

        // Add 51 results
        for (let i = 0; i < 51; i++) {
            act(() => {
                addTestResult({ modelName: `Model-${i}`, riskScore: i });
            });
        }

        const { testResults } = useStore.getState();
        expect(testResults.length).toBeLessThanOrEqual(50);
        // Most recent should be first
        expect(testResults[0].modelName).toBe('Model-50');
    });

    it('should preserve backend id and createdAt when adding test results', () => {
        const { addTestResult } = useStore.getState();

        act(() => {
            addTestResult({
                id: 'server-result-1',
                modelName: 'Model-X',
                createdAt: '2026-03-20T00:00:00.000Z',
                riskScore: 12,
            });
        });

        const { testResults } = useStore.getState();
        expect(testResults[0].id).toBe('server-result-1');
        expect(testResults[0].createdAt).toBe('2026-03-20T00:00:00.000Z');
    });

    it('should manage toasts with addToast / removeToast', () => {
        const { addToast } = useStore.getState();

        act(() => {
            addToast('Test message', 'success');
        });

        let { toasts } = useStore.getState();
        expect(toasts).toHaveLength(1);
        expect(toasts[0].message).toBe('Test message');
        expect(toasts[0].type).toBe('success');

        const toastId = toasts[0].id;
        act(() => {
            useStore.getState().removeToast(toastId);
        });

        expect(useStore.getState().toasts).toHaveLength(0);
    });

    it('should auto-dismiss toasts after duration', () => {
        vi.useFakeTimers();

        act(() => {
            useStore.getState().addToast('Expiring toast', 'info', 1000);
        });

        expect(useStore.getState().toasts).toHaveLength(1);

        act(() => {
            vi.advanceTimersByTime(1001);
        });

        expect(useStore.getState().toasts).toHaveLength(0);
    });

    it('should persist selected state fields to localStorage', () => {
        act(() => {
            useStore.getState().setActiveTab('results');
            useStore.getState().setSelectedAttacks(['a1', 'a2']);
            useStore.getState().setTestResults([{ id: 'r1', modelName: 'Persisted' }]);
            useStore.getState().setModels([{ id: 'm1', name: 'Persisted Model' }]);
            useStore.getState().addToast('Ephemeral toast', 'info');
        });

        const raw = localStorage.getItem('bhisma-storage');
        expect(raw).toBeTruthy();

        const parsed = JSON.parse(raw);
        expect(parsed.state.activeTab).toBe('results');
        expect(parsed.state.selectedAttacks).toEqual(['a1', 'a2']);
        expect(parsed.state.models).toHaveLength(1);
        expect(parsed.state.testResults).toHaveLength(1);
        expect(parsed.state.toasts).toBeUndefined();
    });
});
