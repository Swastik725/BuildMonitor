import { AxiosResponse } from 'axios';

export type HealthCheckStatus = 'UP' | 'DEGRADED' | 'DOWN';

export interface HealthCheckVerdict {
  status: HealthCheckStatus;
  statusCode: number | null;
  message: string | null;
}

interface ParseArgs {
  response: AxiosResponse;
  expectedStatus: number;
  expectedBody?: string | null;
  durationMs: number;
  timeoutMs: number;
}

/**
 * Turns a raw axios response into an UP / DEGRADED / DOWN verdict.
 *
 * Rules (kept simple on purpose):
 * - Wrong status code, or expectedBody set but not found in the response body -> DOWN.
 * - Status code matches (and body matches, if checked) but response took >= 80% of the
 *   configured timeout -> DEGRADED (it "worked" but is clearly struggling).
 * - Otherwise -> UP.
 */
export function parseHealthResponse({
  response,
  expectedStatus,
  expectedBody,
  durationMs,
  timeoutMs,
}: ParseArgs): HealthCheckVerdict {
  const statusCode = response.status;

  if (statusCode !== expectedStatus) {
    return {
      status: 'DOWN',
      statusCode,
      message: `Expected status ${expectedStatus}, got ${statusCode}`,
    };
  }

  if (expectedBody) {
    const bodyText =
      typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data ?? '');

    if (!bodyText.includes(expectedBody)) {
      return {
        status: 'DOWN',
        statusCode,
        message: `Response body did not contain expected text "${expectedBody}"`,
      };
    }
  }

  const degradedThreshold = timeoutMs * 0.8;
  if (durationMs >= degradedThreshold) {
    return {
      status: 'DEGRADED',
      statusCode,
      message: `Responded in ${durationMs}ms, close to the ${timeoutMs}ms timeout`,
    };
  }

  return { status: 'UP', statusCode, message: null };
}

/**
 * Builds a verdict for the case where the request itself failed
 * (timeout, DNS failure, connection refused, etc.) rather than
 * returning an HTTP response at all.
 */
export function parseHealthError(error: unknown): HealthCheckVerdict {
  const message =
    error instanceof Error ? error.message : 'Unknown error during health check';

  return { status: 'DOWN', statusCode: null, message };
}
