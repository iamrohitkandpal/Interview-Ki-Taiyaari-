import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ResultsPage from '../src/components/ResultsPage.jsx';
import useStore from '../src/store/useStore.js';

function makeResult(overrides = {}) {
  return {
    id: overrides.id || 'r-1',
    modelName: overrides.modelName || 'Model One',
    riskScore: overrides.riskScore ?? 30,
    riskLevel: overrides.riskLevel || 'MEDIUM',
    totalAttacks: overrides.totalAttacks ?? 2,
    passed: overrides.passed ?? 1,
    failed: overrides.failed ?? 1,
    createdAt: overrides.createdAt || '2026-03-20T00:00:00.000Z',
    results: overrides.results || [
      {
        attackName: 'Attack A',
        category: 'jailbreak',
        severity: 'high',
        prompt: 'Prompt A',
        response: 'Response A',
        vulnerable: true,
        confidence: 70,
      },
    ],
  };
}

describe('ResultsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.setState({
      testResults: [],
      toasts: [],
      setTestResults: useStore.getState().setTestResults,
      addToast: vi.fn(),
    });
  });

  it('shows empty-state message when no test records exist', () => {
    render(<ResultsPage />);

    expect(screen.getByText('No test records found')).toBeInTheDocument();
    expect(screen.getByText('Select a Test Record')).toBeInTheDocument();
  });

  it('auto-selects first result and updates selection when store changes', async () => {
    const first = makeResult({ id: 'r-1', modelName: 'Model Alpha', createdAt: '2026-03-20T00:00:00.000Z' });
    const second = makeResult({ id: 'r-2', modelName: 'Model Beta', createdAt: '2026-03-19T00:00:00.000Z' });

    act(() => {
      useStore.getState().setTestResults([first, second]);
    });

    render(<ResultsPage />);

    expect(screen.getAllByText('Model Alpha').length).toBeGreaterThan(0);

    const replacement = makeResult({ id: 'r-3', modelName: 'Model Gamma', createdAt: '2026-03-21T00:00:00.000Z' });

    act(() => {
      useStore.getState().setTestResults([replacement]);
    });

    const matches = await screen.findAllByText('Model Gamma');
    expect(matches.length).toBeGreaterThan(0);
  });
});
