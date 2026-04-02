/**
 * Sync Loop Guard
 * Tracks the originating source of each device change to prevent bidirectional
 * sync loops. A change echoed back from the opposite system is detected and
 * suppressed within a configurable debounce window.
 */

import Logger from '../utils/logger';

interface ChangeSourceEntry {
  source: string;
  timestamp: number;
  extendedDebounce?: boolean;
}

/**
 * Tracks per-device change sources and detects echo updates.
 *
 * Usage:
 *   guard.mark(deviceId, 'hue')           — before sending a change to Hue
 *   guard.isEcho(deviceId, 'hue')         — true if the update came from Hue itself
 */
export class SyncLoopGuard {
  private logger: Logger;
  private debounceMs: number;
  private moodDebounceMs: number;
  private cleanupIntervalMs: number;

  private changeSource: Map<string, ChangeSourceEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  loopsPrevented = 0;

  constructor(logger: Logger, debounceMs: number, moodDebounceMs: number, cleanupIntervalMs: number) {
    this.logger = logger;
    this.debounceMs = debounceMs;
    this.moodDebounceMs = moodDebounceMs;
    this.cleanupIntervalMs = cleanupIntervalMs;
  }

  /** Start the periodic stale-entry cleanup. Call once when sync starts. */
  start(): void {
    this._stopCleanup();
    this.cleanupInterval = setInterval(() => this._cleanup(), this.cleanupIntervalMs);
  }

  /** Stop the cleanup interval. Call on sync stop/destroy. */
  stop(): void {
    this._stopCleanup();
  }

  /**
   * Record that `deviceId` was just changed by `source`.
   * @param extendedDebounce  Use the longer mood-debounce window (for mood-triggered changes)
   */
  mark(deviceId: string, source: string, extendedDebounce = false): void {
    this.changeSource.set(deviceId, { source, timestamp: Date.now(), extendedDebounce });
    const note = extendedDebounce ? ' [extended debounce]' : '';
    this.logger.debug(`Change source marked: ${deviceId} = ${source}${note}`, 'SYNC');
  }

  /**
   * Returns true if the update for `deviceId` is an echo of a recent change
   * that originated from `expectedSource`.
   */
  isEcho(deviceId: string, expectedSource: string): boolean {
    const entry = this.changeSource.get(deviceId);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    const window = entry.extendedDebounce ? this.moodDebounceMs : this.debounceMs;

    if (age > window) return false;

    if (entry.source === expectedSource) {
      this.loopsPrevented++;
      const note = entry.extendedDebounce ? ' [mood-triggered]' : '';
      this.logger.debug(
        `Echo detected for ${deviceId} (source: ${expectedSource}, age: ${age}ms)${note}`,
        'SYNC'
      );
      return true;
    }

    return false;
  }

  /** Number of active (non-expired) tracking entries. */
  size(): number {
    return this.changeSource.size;
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private _stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private _cleanup(): void {
    const cutoff = Date.now() - this.debounceMs * 5;
    let removed = 0;

    for (const [key, entry] of this.changeSource.entries()) {
      if (entry.timestamp < cutoff) {
        this.changeSource.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`Cleaned up ${removed} old change source entries`, 'SYNC');
    }
  }
}
