import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportAsJSON, exportAllAsJSON, exportAsPDF, copyToClipboard } from '../src/services/reportService.js';

describe('Report Service', () => {
    const sampleResult = {
        id: 'res-1',
        modelName: 'GPT-4',
        provider: 'openai',
        riskScore: 30,
        riskLevel: 'LOW',
        passed: 12,
        failed: 3,
        totalAttacks: 15,
        results: [
            { attackName: 'Attack A', category: 'jailbreak', severity: 'high', vulnerable: true, confidence: 88, reason: 'Matched indicator', prompt: 'Prompt', response: 'Response' },
            { attackName: 'Attack B', category: 'prompt_injection', severity: 'low', vulnerable: false, confidence: 20, reason: 'Refused', prompt: 'Prompt 2', response: 'Response 2' },
        ],
    };

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('exportAsJSON', () => {
        it('should create a downloadable JSON blob', () => {
            const click = vi.fn();
            const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
                href: '',
                download: '',
                click,
                style: {},
            });
            const createObjectURL = vi.fn(() => 'blob:url');
            const revokeObjectURL = vi.fn();
            global.URL.createObjectURL = createObjectURL;
            global.URL.revokeObjectURL = revokeObjectURL;
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => { });
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => { });

            const outputFilename = exportAsJSON(sampleResult, 'custom-name.json');

            expect(createObjectURL).toHaveBeenCalled();
            expect(revokeObjectURL).toHaveBeenCalled();
            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(click).toHaveBeenCalled();
            expect(outputFilename).toBe('custom-name.json');
        });

        it('should throw for invalid result payload', () => {
            expect(() => exportAsJSON(null)).toThrow('A valid test result object is required');
        });
    });

    describe('exportAllAsJSON', () => {
        it('should export all test results to downloadable JSON', () => {
            const click = vi.fn();
            vi.spyOn(document, 'createElement').mockReturnValue({
                href: '',
                download: '',
                click,
                style: {},
            });

            const createObjectURL = vi.fn(() => 'blob:all-results');
            const revokeObjectURL = vi.fn();
            global.URL.createObjectURL = createObjectURL;
            global.URL.revokeObjectURL = revokeObjectURL;
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => { });
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => { });

            const filename = exportAllAsJSON([sampleResult]);

            expect(filename.startsWith('bhisma-all-results-')).toBe(true);
            expect(filename.endsWith('.json')).toBe(true);
            expect(click).toHaveBeenCalled();
        });
    });

    describe('exportAsPDF', () => {
        it('should write printable HTML into new window', () => {
            const write = vi.fn();
            const close = vi.fn();

            const openSpy = vi.spyOn(window, 'open').mockReturnValue({
                document: { write, close },
            });

            const result = exportAsPDF(sampleResult);

            expect(result).toBe(true);
            expect(openSpy).toHaveBeenCalled();
            expect(write).toHaveBeenCalled();
            expect(close).toHaveBeenCalled();
        });

        it('should throw when popup is blocked', () => {
            vi.spyOn(window, 'open').mockReturnValue(null);
            expect(() => exportAsPDF(sampleResult)).toThrow('Unable to open print window. Please allow pop-ups and try again.');
        });
    });

    describe('copyToClipboard', () => {
        it('should write summary text to clipboard', async () => {
            const writeText = vi.fn(() => Promise.resolve());
            Object.assign(navigator, {
                clipboard: { writeText },
            });

            await copyToClipboard(sampleResult);

            expect(writeText).toHaveBeenCalled();
            const text = writeText.mock.calls[0][0];
            expect(text).toContain('GPT-4');
        });

        it('should fallback to document.execCommand when clipboard api is unavailable', async () => {
            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: undefined,
            });

            const select = vi.fn();
            vi.spyOn(document, 'createElement').mockReturnValue({
                value: '',
                style: {},
                setAttribute: vi.fn(),
                select,
            });
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => { });
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => { });
            const execCommand = vi.fn(() => true);
            Object.defineProperty(document, 'execCommand', {
                configurable: true,
                value: execCommand,
            });

            const copied = await copyToClipboard(sampleResult);

            expect(copied).toBe(true);
            expect(select).toHaveBeenCalled();
            expect(execCommand).toHaveBeenCalledWith('copy');
        });
    });
});
