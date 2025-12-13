/**
 * SMS Service Tests
 * 
 * Unit tests for the SMS notification service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SmsService } from '@/lib/smsService';

describe('SmsService', () => {
    let smsService: SmsService;

    beforeEach(() => {
        // Create a mock SMS service
        smsService = new SmsService({ provider: 'mock' });
    });

    // ============================================================
    // Phone Number Validation Tests
    // ============================================================
    describe('Phone Number Validation', () => {
        it('should accept valid Turkish mobile numbers', async () => {
            const result = await smsService.send({ to: '5551234567', text: 'Test' });
            expect(result.success).toBe(true);
        });

        it('should accept numbers with +90 prefix', async () => {
            const result = await smsService.send({ to: '+905551234567', text: 'Test' });
            expect(result.success).toBe(true);
        });

        it('should accept numbers with 0 prefix', async () => {
            const result = await smsService.send({ to: '05551234567', text: 'Test' });
            expect(result.success).toBe(true);
        });

        it('should reject invalid phone numbers', async () => {
            const result = await smsService.send({ to: '123', text: 'Test' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('Geçersiz telefon');
        });

        it('should reject non-Turkish numbers', async () => {
            const result = await smsService.send({ to: '+1234567890', text: 'Test' });
            expect(result.success).toBe(false);
        });
    });

    // ============================================================
    // Template Tests
    // ============================================================
    describe('SMS Templates', () => {
        it('should send attendance alert template', async () => {
            const result = await smsService.sendWithTemplate(
                '5551234567',
                'attendance_alert',
                { studentName: 'Ahmet', status: 'present', time: '08:30' }
            );
            expect(result.success).toBe(true);
        });

        it('should send schedule reminder template', async () => {
            const result = await smsService.sendWithTemplate(
                '5551234567',
                'schedule_reminder',
                { eventTitle: 'Toplantı', date: '2024-01-15', time: '10:00' }
            );
            expect(result.success).toBe(true);
        });

        it('should send emergency template', async () => {
            const result = await smsService.sendWithTemplate(
                '5551234567',
                'emergency',
                { title: 'Okul Kapalı', message: 'Kar yağışı nedeniyle' }
            );
            expect(result.success).toBe(true);
        });

        it('should send verification code template', async () => {
            const result = await smsService.sendWithTemplate(
                '5551234567',
                'verification_code',
                { code: '123456' }
            );
            expect(result.success).toBe(true);
        });

        it('should send payment reminder template', async () => {
            const result = await smsService.sendWithTemplate(
                '5551234567',
                'payment_reminder',
                { period: 'Ocak 2024', dueDate: '2024-01-31', amount: '1500' }
            );
            expect(result.success).toBe(true);
        });

        it('should send parent notification template', async () => {
            const result = await smsService.sendWithTemplate(
                '5551234567',
                'parent_notification',
                { studentName: 'Ayşe', message: 'Bugün çok iyi çalıştı!' }
            );
            expect(result.success).toBe(true);
        });

        it('should fail for invalid template type', async () => {
            const result = await smsService.sendWithTemplate(
                '5551234567',
                'invalid_template' as any,
                {}
            );
            expect(result.success).toBe(false);
            expect(result.error).toContain('Template not found');
        });
    });

    // ============================================================
    // Bulk Send Tests
    // ============================================================
    describe('Bulk SMS', () => {
        it('should send bulk messages', async () => {
            const messages = [
                { to: '5551234567', text: 'Message 1' },
                { to: '5552345678', text: 'Message 2' },
                { to: '5553456789', text: 'Message 3' },
            ];

            const result = await smsService.sendBulk(messages);
            expect(result.sent).toBe(3);
            expect(result.failed).toBe(0);
            expect(result.results).toHaveLength(3);
        });

        it('should report failed messages in bulk', async () => {
            const messages = [
                { to: '5551234567', text: 'Valid' },
                { to: 'invalid', text: 'Invalid' },
                { to: '5553456789', text: 'Valid' },
            ];

            const result = await smsService.sendBulk(messages);
            expect(result.sent).toBe(2);
            expect(result.failed).toBe(1);
        });

        it('should send bulk with template', async () => {
            const recipients = [
                { to: '5551234567', data: { studentName: 'Ahmet', status: 'present', time: '08:30' } },
                { to: '5552345678', data: { studentName: 'Ayşe', status: 'absent', time: '08:30' } },
            ];

            const result = await smsService.sendBulkWithTemplate(recipients, 'attendance_alert');
            expect(result.sent).toBe(2);
            expect(result.failed).toBe(0);
        });
    });

    // ============================================================
    // Configuration Tests
    // ============================================================
    describe('Service Configuration', () => {
        it('should return available template types', () => {
            const types = smsService.getTemplateTypes();
            expect(types).toContain('attendance_alert');
            expect(types).toContain('schedule_reminder');
            expect(types).toContain('emergency');
            expect(types).toContain('verification_code');
            expect(types).toContain('payment_reminder');
            expect(types).toContain('parent_notification');
        });

        it('should report mock provider as configured', () => {
            expect(smsService.isConfigured()).toBe(true);
        });

        it('should report netgsm as not configured without credentials', () => {
            const netgsmService = new SmsService({ provider: 'netgsm' });
            expect(netgsmService.isConfigured()).toBe(false);
        });

        it('should report twilio as not configured without credentials', () => {
            const twilioService = new SmsService({ provider: 'twilio' });
            expect(twilioService.isConfigured()).toBe(false);
        });
    });

    // ============================================================
    // Mock Provider Tests
    // ============================================================
    describe('Mock Provider', () => {
        it('should return mock message ID', async () => {
            const result = await smsService.send({ to: '5551234567', text: 'Test' });
            expect(result.messageId).toMatch(/^mock-\d+$/);
        });

        it('should log mock messages', async () => {
            const consoleSpy = vi.spyOn(console, 'log');
            await smsService.send({ to: '5551234567', text: 'Test message' });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[MOCK SMS]'),
                expect.any(String)
            );

            consoleSpy.mockRestore();
        });
    });
});
