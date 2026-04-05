import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
  });
}

export function captureError(error: unknown, context?: string) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, context ? { tags: { context } } : undefined);
  } else {
    console.error(`[${context ?? 'error'}]`, error);
  }
}
