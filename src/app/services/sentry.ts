/**
 * Sentry Error Tracking — initializes Sentry for frontend error monitoring.
 *
 * Set VITE_SENTRY_DSN in .env.local to enable.
 * If the DSN is empty/missing, Sentry is a no-op (app works fine without it).
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

let initialized = false;

export function initSentry(): void {
  if (!SENTRY_DSN || initialized) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance & Distributed Tracing
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/clarifi-ai-backend\.onrender\.com/,
      import.meta.env.VITE_API_BASE_URL || "",
    ].filter(Boolean),
    // Session Replay: capture 10% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });

  initialized = true;
  console.log('[Sentry] Initialized');
}

/**
 * Identify the current user in Sentry for error attribution.
 */
export function setSentryUser(user: { id: string; email?: string } | null): void {
  if (!SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture an error manually (for catch blocks).
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) return;
  Sentry.captureException(error, { extra: context });
}

/**
 * Add a breadcrumb for debugging context.
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  if (!SENTRY_DSN) return;
  Sentry.addBreadcrumb({ category, message, data, level: 'info' });
}

// Re-export ErrorBoundary for use in App.tsx
export const SentryErrorBoundary = Sentry.ErrorBoundary;
