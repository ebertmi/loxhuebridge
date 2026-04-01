import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly http = inject(HttpClient);
  private readonly syncEnabledSignal = signal<boolean>(true);

  readonly syncEnabled = this.syncEnabledSignal.asReadonly();

  loadSyncState(): void {
    this.http.get<{ enabled: boolean }>('/api/sync').subscribe({
      next: ({ enabled }) => this.syncEnabledSignal.set(enabled),
    });
  }

  toggleSync(): void {
    const next = !this.syncEnabledSignal();
    this.syncEnabledSignal.set(next);
    this.http.put('/api/settings', { sync_enabled: next }).subscribe({
      error: () => this.syncEnabledSignal.set(!next),
    });
  }
}
