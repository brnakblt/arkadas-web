/**
 * Monitoring Utility Unit Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    trackMetric,
    getMetrics,
    startSpan,
    addBreadcrumb,
    captureError,
    captureMessage,
    setUser,
    getUser,
} from '@/lib/monitoring';

describe('monitoring', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('trackMetric', () => {
        it('should track a metric', () => {
            trackMetric({ name: 'test_metric', value: 100, unit: 'ms' });

            const metrics = getMetrics(1);
            expect(metrics).toHaveLength(1);
            expect(metrics[0].name).toBe('test_metric');
            expect(metrics[0].value).toBe(100);
            expect(metrics[0].unit).toBe('ms');
        });

        it('should add timestamp automatically', () => {
            trackMetric({ name: 'timed_metric', value: 50, unit: 'ms' });

            const metrics = getMetrics(1);
            expect(metrics[0].timestamp).toBeInstanceOf(Date);
        });
    });

    describe('startSpan', () => {
        it('should measure operation duration', async () => {
            const endSpan = startSpan('test_operation');

            // Wait a bit
            await new Promise((r) => setTimeout(r, 100));

            endSpan();

            const metrics = getMetrics(10);
            const spanMetric = metrics.find((m) => m.name === 'test_operation');
            expect(spanMetric).toBeDefined();
            expect(spanMetric!.value).toBeGreaterThan(50); // At least 50ms
            expect(spanMetric!.unit).toBe('ms');
        });
    });

    describe('addBreadcrumb', () => {
        it('should log breadcrumb', async () => {
            await addBreadcrumb('User clicked button', 'ui', { buttonId: 'submit' });

            expect(console.log).toHaveBeenCalledWith(
                '[Monitoring] Breadcrumb: [ui] User clicked button',
                { buttonId: 'submit' }
            );
        });
    });

    describe('captureError', () => {
        it('should log error', async () => {
            await captureError(new Error('Test error'), { userId: '123' });

            expect(console.error).toHaveBeenCalled();
        });

        it('should handle string errors', async () => {
            await captureError('String error message');

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('captureMessage', () => {
        it('should log info message', async () => {
            await captureMessage('Test message', 'info', { extra: 'data' });

            expect(console.log).toHaveBeenCalledWith(
                '[Monitoring] INFO: Test message',
                { extra: 'data' }
            );
        });

        it('should log warning message', async () => {
            await captureMessage('Warning message', 'warning');

            expect(console.log).toHaveBeenCalledWith(
                '[Monitoring] WARNING: Warning message',
                undefined
            );
        });
    });

    describe('setUser / getUser', () => {
        it('should set and get user context', async () => {
            await setUser({ id: 'user-123', email: 'test@example.com', role: 'admin' });

            const user = getUser();
            expect(user).toEqual({
                id: 'user-123',
                email: 'test@example.com',
                role: 'admin',
            });
        });

        it('should clear user context', async () => {
            await setUser({ id: 'user-123' });
            await setUser(null);

            expect(getUser()).toBeNull();
        });
    });

    describe('getMetrics', () => {
        it('should return specified number of metrics', () => {
            for (let i = 0; i < 10; i++) {
                trackMetric({ name: `metric_${i}`, value: i, unit: 'count' });
            }

            expect(getMetrics(5)).toHaveLength(5);
            expect(getMetrics(3)).toHaveLength(3);
        });

        it('should return most recent metrics', () => {
            trackMetric({ name: 'first', value: 1, unit: 'count' });
            trackMetric({ name: 'second', value: 2, unit: 'count' });
            trackMetric({ name: 'third', value: 3, unit: 'count' });

            const metrics = getMetrics(2);
            expect(metrics[1].name).toBe('third');
        });
    });
});
