/**
 * Privacy-First Analytics Utility
 * 
 * focuses on essential metrics without tracking personally identifiable information (PII).
 * - No IP tracking
 * - No fingerprinting
 * - No cross-site tracking
 * 
 * Features:
 * - Page views
 * - Custom events (e.g., "Export PDF", "Bulk Update")
 * - Role-based usage stats (aggregate)
 */

// ============================================================
// Types
// ============================================================

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, string | number | boolean>;
    timestamp?: number;
}

// ============================================================
// Implementation
// ============================================================

const ANALYTICS_ENDPOINT = '/api/analytics/collect';

/**
 * Track a page view
 */
export function trackPageView(path: string): void {
    // Respect Do Not Track
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
        return;
    }

    sendEvent({
        name: 'page_view',
        properties: {
            path,
            title: typeof document !== 'undefined' ? document.title : '',
        },
    });
}

/**
 * Track a custom event
 */
export function trackEvent(
    name: string,
    properties?: Record<string, string | number | boolean>
): void {
    // Respect Do Not Track
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
        return;
    }

    sendEvent({ name, properties });
}

/**
 * Internal sender
 */
async function sendEvent(event: AnalyticsEvent): Promise<void> {
    const payload = {
        ...event,
        timestamp: Date.now(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] 📊', payload);
        return;
    }

    try {
        // Send to our own API functionality (to be implemented or integrated with external privacy tool)
        // For now, we stub it or send to a placeholder
        // await fetch(ANALYTICS_ENDPOINT, {
        //   method: 'POST',
        //   body: JSON.stringify(payload),
        //   keepalive: true,
        // });

        // Or integrate with Plausible / Matomo here
    } catch (error) {
        // Fail silently, metrics aren't critical
    }
}

// ============================================================
// Hooks
// ============================================================

// A hook would be implemented in a separate file (e.g., useAnalytics.ts) 
// to avoid React dependency in this utility if it's used elsewhere.

export const analytics = {
    pageView: trackPageView,
    event: trackEvent,
};

export default analytics;
