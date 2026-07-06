/** How often the app refetches match data from the source (seconds). */
export const MATCH_REFRESH_INTERVAL_SECONDS = 30;

/** Exponential backoff settings for match JSON fetches. */
export const MATCH_FETCH_RETRY = {
  maxRetries: 2,
  initialDelayMs: 1500,
  maxDelayMs: 12_000,
  multiplier: 2,
  jitter: 0,
  retryStatusCodes: [503],
  retryOnNetworkError: true,
} as const;
