/**
 * Wraps an async operation and measures how long it took, in milliseconds.
 * Used by HealthChecksService to record `responseTime` on each HealthCheck row.
 */
export async function measureLatency<T>(
  operation: () => Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  const start = process.hrtime.bigint();
  const result = await operation();
  const end = process.hrtime.bigint();

  // bigint nanoseconds -> ms. Number() is safe here since a single HTTP
  // call is never anywhere near Number.MAX_SAFE_INTEGER ns.
  const durationMs = Number(end - start) / 1_000_000;

  return { result, durationMs: Math.round(durationMs) };
}
