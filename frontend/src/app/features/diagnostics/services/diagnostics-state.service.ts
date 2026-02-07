import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { DiagnosticsData, DiagnosticDevice, BridgeStatus } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class DiagnosticsStateService {
  private readonly api = inject(ApiService);

  private readonly dataSignal = signal<DiagnosticsData | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly data = this.dataSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly lights = computed(() => this.data()?.lights ?? []);
  readonly sensors = computed(() => this.data()?.sensors ?? []);
  readonly buttons = computed(() => this.data()?.buttons ?? []);
  readonly bridge = computed(() => this.data()?.bridge ?? null);

  readonly unreachableCount = computed(() => {
    const data = this.data();
    if (!data) return 0;
    return [...(data.lights ?? []), ...(data.sensors ?? []), ...(data.buttons ?? [])]
      .filter(d => !d.reachable).length;
  });

  readonly lowBatteryDevices = computed(() => {
    const data = this.data();
    if (!data) return [];
    return [...(data.sensors ?? []), ...(data.buttons ?? [])]
      .filter(d => d.battery !== undefined && d.battery < 20);
  });

  loadDiagnostics(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.getDiagnostics().subscribe({
      next: (data) => {
        this.dataSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }
}
