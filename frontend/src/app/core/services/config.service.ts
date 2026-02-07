import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { AppSettings } from '../models';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly api = inject(ApiService);

  private readonly settingsSignal = signal<AppSettings | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly configuredSignal = signal<boolean | null>(null);

  readonly settings = this.settingsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly configured = this.configuredSignal.asReadonly();

  readonly isConfigured = computed(() => {
    const settings = this.settings();
    return settings?.hue_bridge_ip && settings?.hue_api_key;
  });

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

  checkSetupStatus(): void {
    this.api.checkSetupStatus().subscribe({
      next: (status) => {
        this.configuredSignal.set(status.configured);
      },
      error: () => {
        this.configuredSignal.set(false);
      }
    });
  }
}
