import { describe, it, expect } from 'vitest';
import { getRiskColor, getRiskBadgeVariant, getCategoryColor, getRiskLabel } from '../src/utils/styles.js';

describe('Style Utilities', () => {
    describe('getRiskColor', () => {
        it('should return rose for scores >= 70', () => {
            expect(getRiskColor(70)).toBe('text-rose-400');
            expect(getRiskColor(100)).toBe('text-rose-400');
        });

        it('should return amber for scores 40-69', () => {
            expect(getRiskColor(40)).toBe('text-amber-400');
            expect(getRiskColor(69)).toBe('text-amber-400');
        });

        it('should return emerald for scores < 40', () => {
            expect(getRiskColor(0)).toBe('text-emerald-400');
            expect(getRiskColor(39)).toBe('text-emerald-400');
        });

        it('should return slate for null/undefined', () => {
            expect(getRiskColor(null)).toBe('text-slate-400');
            expect(getRiskColor(undefined)).toBe('text-slate-400');
        });
    });

    describe('getRiskBadgeVariant', () => {
        it('should handle string levels', () => {
            expect(getRiskBadgeVariant('CRITICAL')).toBe('danger');
            expect(getRiskBadgeVariant('HIGH')).toBe('danger');
            expect(getRiskBadgeVariant('MEDIUM')).toBe('warning');
            expect(getRiskBadgeVariant('LOW')).toBe('success');
            expect(getRiskBadgeVariant('SAFE')).toBe('success');
        });

        it('should handle numeric scores', () => {
            expect(getRiskBadgeVariant(80)).toBe('danger');
            expect(getRiskBadgeVariant(50)).toBe('warning');
            expect(getRiskBadgeVariant(20)).toBe('success');
        });
    });

    describe('getCategoryColor', () => {
        it('should return correct colors for known categories', () => {
            expect(getCategoryColor('injection')).toBe('info');
            expect(getCategoryColor('jailbreak')).toBe('purple');
            expect(getCategoryColor('leakage')).toBe('success');
        });

        it('should return default for unknown categories', () => {
            expect(getCategoryColor('unknown')).toBe('default');
            expect(getCategoryColor('')).toBe('default');
        });
    });

    describe('getRiskLabel', () => {
        it('should return correct labels', () => {
            expect(getRiskLabel(95)).toBe('CRITICAL');
            expect(getRiskLabel(75)).toBe('HIGH RISK');
            expect(getRiskLabel(50)).toBe('MEDIUM RISK');
            expect(getRiskLabel(20)).toBe('LOW RISK');
            expect(getRiskLabel(null)).toBe('UNKNOWN');
        });
    });
});
