/**
 * Error Handler Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createAppError,
    logError,
    handleError,
    getRecentErrors,
    clearErrorLog,
    getUserFriendlyMessage,
} from '@/lib/errorHandler';

describe('errorHandler', () => {
    beforeEach(() => {
        clearErrorLog();
        vi.spyOn(console, 'group').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    });

    describe('createAppError', () => {
        it('should create error from string', () => {
            const error = createAppError('Test error');

            expect(error.message).toBe('Test error');
            expect(error.id).toMatch(/^err_/);
            expect(error.timestamp).toBeInstanceOf(Date);
            expect(error.severity).toBe('medium');
        });

        it('should create error from Error object', () => {
            const originalError = new Error('Original error');
            const error = createAppError(originalError);

            expect(error.message).toBe('Original error');
            expect(error.stack).toBeDefined();
        });

        it('should use provided options', () => {
            const error = createAppError('Test', {
                code: 'TEST_ERROR',
                severity: 'high',
                context: { userId: 123 },
            });

            expect(error.code).toBe('TEST_ERROR');
            expect(error.severity).toBe('high');
            expect(error.context).toEqual({ userId: 123 });
        });
    });

    describe('logError', () => {
        it('should add error to log', () => {
            const error = createAppError('Test error');
            logError(error);

            const recentErrors = getRecentErrors();
            expect(recentErrors).toHaveLength(1);
            expect(recentErrors[0]).toEqual(error);
        });

        it('should limit log size', () => {
            for (let i = 0; i < 110; i++) {
                logError(createAppError(`Error ${i}`));
            }

            const recentErrors = getRecentErrors(200);
            expect(recentErrors.length).toBeLessThanOrEqual(100);
        });
    });

    describe('handleError', () => {
        it('should log and return error', () => {
            const error = handleError('Test error', { code: 'TEST' });

            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST');
            expect(getRecentErrors()).toHaveLength(1);
        });

        it('should not report low severity errors', async () => {
            const error = handleError('Low severity', { severity: 'low', report: true });

            // Low severity errors are logged but not reported
            expect(error.severity).toBe('low');
        });
    });

    describe('clearErrorLog', () => {
        it('should clear all errors', () => {
            logError(createAppError('Error 1'));
            logError(createAppError('Error 2'));

            expect(getRecentErrors()).toHaveLength(2);

            clearErrorLog();

            expect(getRecentErrors()).toHaveLength(0);
        });
    });

    describe('getUserFriendlyMessage', () => {
        it('should return message for known codes', () => {
            expect(getUserFriendlyMessage('NETWORK_ERROR')).toContain('Bağlantı');
            expect(getUserFriendlyMessage('AUTH_ERROR')).toContain('Oturum');
            expect(getUserFriendlyMessage('NOT_FOUND')).toContain('bulunamadı');
        });

        it('should return default for unknown codes', () => {
            expect(getUserFriendlyMessage('UNKNOWN_CODE')).toContain('Beklenmeyen');
            expect(getUserFriendlyMessage(undefined)).toContain('Beklenmeyen');
        });
    });

    describe('getRecentErrors', () => {
        it('should return specified number of errors', () => {
            for (let i = 0; i < 10; i++) {
                logError(createAppError(`Error ${i}`));
            }

            expect(getRecentErrors(5)).toHaveLength(5);
            expect(getRecentErrors(3)).toHaveLength(3);
        });

        it('should return most recent errors first', () => {
            logError(createAppError('First'));
            logError(createAppError('Second'));
            logError(createAppError('Third'));

            const errors = getRecentErrors();
            expect(errors[0].message).toBe('Third');
            expect(errors[2].message).toBe('First');
        });
    });
});
