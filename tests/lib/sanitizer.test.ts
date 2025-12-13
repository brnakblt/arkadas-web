/**
 * Sanitizer Unit Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
    sanitize,
    hasDangerousHTML,
    createSafeHTML,
    SanitizePresets,
    initSanitizer,
} from '@/lib/sanitizer';

describe('sanitizer', () => {
    beforeAll(async () => {
        // Try to initialize DOMPurify (may fail in test environment)
        await initSanitizer();
    });

    describe('sanitize', () => {
        it('should return empty string for falsy input', () => {
            expect(sanitize('')).toBe('');
            expect(sanitize(null as unknown as string)).toBe('');
            expect(sanitize(undefined as unknown as string)).toBe('');
        });

        it('should strip dangerous tags', () => {
            const result = sanitize('<script>alert("xss")</script>Hello');
            expect(result).not.toContain('<script>');
            expect(result).toContain('Hello');
        });

        it('should handle text-only mode', () => {
            const result = sanitize('<p>Hello <b>World</b></p>', { textOnly: true });
            expect(result).toBe('Hello World');
        });

        it('should respect allowed tags', () => {
            const result = sanitize('<b>Bold</b><script>bad</script><i>Italic</i>', {
                allowedTags: ['b', 'i'],
            });
            expect(result).toContain('<b>');
            expect(result).toContain('<i>');
            expect(result).not.toContain('<script>');
        });
    });

    describe('hasDangerousHTML', () => {
        it('should detect script tags', () => {
            expect(hasDangerousHTML('<script>alert(1)</script>')).toBe(true);
            expect(hasDangerousHTML('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
        });

        it('should detect javascript: protocol', () => {
            expect(hasDangerousHTML('<a href="javascript:alert(1)">')).toBe(true);
        });

        it('should detect event handlers', () => {
            expect(hasDangerousHTML('<img onerror="alert(1)">')).toBe(true);
            expect(hasDangerousHTML('<div onclick="alert(1)">')).toBe(true);
        });

        it('should detect iframe, object, embed', () => {
            expect(hasDangerousHTML('<iframe src="evil.com">')).toBe(true);
            expect(hasDangerousHTML('<object data="evil.swf">')).toBe(true);
            expect(hasDangerousHTML('<embed src="evil.swf">')).toBe(true);
        });

        it('should return false for safe HTML', () => {
            expect(hasDangerousHTML('<p>Hello World</p>')).toBe(false);
            expect(hasDangerousHTML('<b>Bold text</b>')).toBe(false);
            expect(hasDangerousHTML('<a href="https://example.com">Link</a>')).toBe(false);
        });
    });

    describe('createSafeHTML', () => {
        it('should return object with __html property', () => {
            const result = createSafeHTML('<p>Test</p>');
            expect(result).toHaveProperty('__html');
            expect(typeof result.__html).toBe('string');
        });

        it('should sanitize the HTML', () => {
            const result = createSafeHTML('<script>alert(1)</script><p>Safe</p>');
            expect(result.__html).not.toContain('<script>');
            expect(result.__html).toContain('Safe');
        });
    });

    describe('SanitizePresets', () => {
        it('should have TEXT_ONLY preset', () => {
            const result = sanitize('<b>Bold</b>', SanitizePresets.TEXT_ONLY);
            expect(result).toBe('Bold');
        });

        it('should have BASIC preset with allowed tags', () => {
            expect(SanitizePresets.BASIC.allowedTags).toContain('b');
            expect(SanitizePresets.BASIC.allowedTags).toContain('a');
        });

        it('should have RICH preset with more tags', () => {
            expect(SanitizePresets.RICH.allowedTags).toContain('table');
            expect(SanitizePresets.RICH.allowedTags).toContain('img');
            expect(SanitizePresets.RICH.allowedTags).toContain('h1');
        });
    });
});
