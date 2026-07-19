import * as Sentry from "@sentry/react-native";

/**
 * One Sentry project shared across dev/staging/prod (Sentry's own
 * recommended pattern), differentiated by the `environment` tag — mirrors
 * how EXPO_PUBLIC_APP_ENV already drives Firebase project selection. See
 * firebaseSetup/firebaseSetup.ts for the analogous pattern.
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.log(
      "Sentry DSN not set (EXPO_PUBLIC_SENTRY_DSN) — skipping Sentry init.",
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_APP_ENV,
    // Crash/error reporting + console.log capture only — no performance
    // tracing yet, that's a separate decision (event volume against the
    // free-tier quota). See docs/decisions.md.
    enableLogs: true,
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],
    tracesSampleRate: 0,
  });
}
