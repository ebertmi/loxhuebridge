import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { LogEntry, LogCategory, AppSettings } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class SystemStateService {
  private readonly api = inject(ApiService);

  private readonly logsSignal = signal<LogEntry[]>([]);
  private readonly settingsSignal = signal<AppSettings | null>(null);
  private readonly filterSignal = signal<LogCategory | 'ALL'>('ALL');
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly logs = this.logsSignal.asReadonly();
  readonly settings = this.settingsSignal.asReadonly();
  readonly filter = this.filterSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly filteredLogs = computed(() => {
    const filter = this.filter();
    const logs = this.logs();
    if (filter === 'ALL') return logs;
    return logs.filter(log => log.cat === filter);
  });

  readonly logCategories = computed(() => {
    const categories = new Set<LogCategory>();
    this.logs().forEach(log => categories.add(log.cat));
    return Array.from(categories).sort();
  });

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  loadSettings(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.getSettings().subscribe({
      next: (settings) => {
        this.settingsSignal.set(settings);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  updateSettings(settings: Partial<AppSettings>): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.updateSettings(settings).subscribe({
      next: (updated) => {
        this.settingsSignal.set(updated);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  loadLogs(): void {
    this.api.getLogs().subscribe({
      next: (logs) => {
        this.logsSignal.set(logs);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
      }
    });
  }

  clearLogs(): void {
    this.api.clearLogs().subscribe({
      next: () => {
        this.logsSignal.set([]);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
      }
    });
  }

  setFilter(filter: LogCategory | 'ALL'): void {
    this.filterSignal.set(filter);
  }

  startPolling(intervalMs = 2000): void {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      this.loadLogs();
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
