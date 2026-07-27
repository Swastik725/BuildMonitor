import { Injectable } from '@nestjs/common';

/**
 * Tracks real HTTP traffic hitting this BuildMonitor instance: how many
 * requests came in, how many of those responded with an error status, and
 * how long they took. MetricsService reads a snapshot of this every
 * collection interval and resets the counters, so REQUESTS / ERROR_RATE /
 * (fallback) LATENCY are derived from actual traffic rather than invented.
 */
@Injectable()
export class RequestTrackerService {
  private requestCount = 0;
  private errorCount = 0;
  private totalDurationMs = 0;

  record(durationMs: number, statusCode: number) {
    this.requestCount += 1;
    this.totalDurationMs += durationMs;
    if (statusCode >= 400) {
      this.errorCount += 1;
    }
  }

  snapshotAndReset() {
    const snapshot = {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      avgDurationMs:
        this.requestCount > 0 ? this.totalDurationMs / this.requestCount : 0,
    };

    this.requestCount = 0;
    this.errorCount = 0;
    this.totalDurationMs = 0;

    return snapshot;
  }
}
