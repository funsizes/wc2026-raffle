export type ExponentialBackoffOptions = {
  /** Retry attempts after the first failure (1 = one retry, two requests total). */
  maxRetries: number;
  /** Delay before the first retry (ms). */
  initialDelayMs: number;
  /** Upper cap on computed delay (ms). */
  maxDelayMs: number;
  /** Delay multiplier applied after each failed attempt. */
  multiplier: number;
  /** Optional jitter factor 0–1 applied to each delay. */
  jitter?: number;
};

export type FetchRetryOptions = ExponentialBackoffOptions & {
  /** HTTP status codes that trigger a retry. */
  retryStatusCodes: readonly number[];
  /** Retry when fetch throws (network error, timeout, etc.). Default true. */
  retryOnNetworkError?: boolean;
};

export function exponentialBackoffDelayMs(
  attempt: number,
  { initialDelayMs, maxDelayMs, multiplier }: ExponentialBackoffOptions
): number {
  return Math.min(initialDelayMs * multiplier ** attempt, maxDelayMs);
}

function sleep(ms: number, jitter = 0): Promise<void> {
  const spread = jitter ? ms * jitter * (Math.random() * 2 - 1) : 0;
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms + spread)));
}

/** Fetch with exponential backoff. Returns the final response (may still be non-OK). */
export async function fetchWithExponentialBackoff(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  options: FetchRetryOptions
): Promise<Response> {
  const { maxRetries, retryStatusCodes, retryOnNetworkError = true, jitter = 0 } = options;

  for (let attempt = 0; ; attempt++) {
    let res: Response;

    try {
      res = await fetch(input, init);
    } catch (error) {
      if (!retryOnNetworkError || attempt >= maxRetries) throw error;

      await sleep(exponentialBackoffDelayMs(attempt, options), jitter);
      continue;
    }

    const shouldRetry = retryStatusCodes.includes(res.status);
    if (!shouldRetry || attempt >= maxRetries) return res;

    await sleep(exponentialBackoffDelayMs(attempt, options), jitter);
  }
}
