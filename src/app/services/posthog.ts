/**
 * PostHog Product Analytics — initializes PostHog for feature usage tracking.
 *
 * Set VITE_POSTHOG_KEY in .env.local to enable.
 * If the key is empty/missing, PostHog is a no-op (app works fine without it).
 */

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export function initPostHog(): void {
  if (!POSTHOG_KEY || initialized) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Auto-capture clicks, pageviews, and form submissions
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    // Respect Do Not Track browser setting
    respect_dnt: true,
    // Disable in development to avoid polluting data
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.opt_out_capturing();
        console.log('[PostHog] Opted out in development mode');
      }
    },
  });

  initialized = true;
  console.log('[PostHog] Initialized');
}

/**
 * Identify the current user in PostHog for analytics attribution.
 */
export function identifyUser(user: { id: string; email?: string } | null): void {
  if (!POSTHOG_KEY) return;
  if (user) {
    posthog.identify(user.id, { email: user.email });
  } else {
    posthog.reset();
  }
}

/**
 * Track a custom event.
 */
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
