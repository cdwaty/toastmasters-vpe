const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export const config = {
  auth: {
    idleTimeoutMs: 1 * HOUR,
    idleCheckIntervalMs: 1 * MINUTE,
    authLinkFallbackMs: 8 * SECOND,
  },
  toast: {
    ttlMs: 3.5 * SECOND,
  },
  connection: {
    healthCheckIntervalMs: 30 * SECOND,
  },
  input: {
    debounceMs: 250,
  },
} as const;
