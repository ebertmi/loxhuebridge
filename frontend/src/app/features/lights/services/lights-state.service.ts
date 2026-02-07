import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import {
  DeviceMapping,
  DeviceStatus,
  DetectedItem,
  HueTarget,
  MappingWithStatus
} from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class LightsStateService {
  private readonly api = inject(ApiService);

  private readonly targetsSignal = signal<HueTarget[]>([]);
  private readonly mappingsSignal = signal<DeviceMapping[]>([]);
  private readonly statusSignal = signal<Record<string, DeviceStatus>>({});
  private readonly detectedSignal = signal<DetectedItem[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly targets = this.targetsSignal.asReadonly();
  readonly mappings = this.mappingsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly detected = this.detectedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Filter only light/group mappings
  readonly lightMappings = computed(() =>
    this.mappings().filter(m => m.hue_type === 'light' || m.hue_type === 'group')
  );

  // Available targets (lights and groups not already mapped)
  readonly availableLightTargets = computed(() => {
    const mappedIds = new Set(this.lightMappings().map(m => m.hue_id));
    return this.targets()
      .filter(t => (t.type === 'light' || t.type === 'group') && !mappedIds.has(t.uuid));
  });

  // Mappings with current status merged
  readonly mappingsWithStatus = computed<MappingWithStatus[]>(() => {
    const statusMap = this.status();
    return this.lightMappings().map(m => ({
      ...m,
      currentStatus: statusMap[m.loxone_name]
    }));
  });

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  loadAll(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Load targets (API returns flat array)
    this.api.getTargets().subscribe({
      next: (targets) => {
        this.targetsSignal.set(targets);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
      }
    });

    // Load mappings
    this.api.getMappings().subscribe({
      next: (mappings) => {
        this.mappingsSignal.set(mappings);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });

    // Load status
    this.loadStatus();

    // Load detected
    this.loadDetected();
  }

  loadStatus(): void {
    this.api.getStatus().subscribe({
      next: (status) => {
        this.statusSignal.set(status);
      },
      error: () => {
        // Silently fail for status updates
      }
    });
  }

  loadDetected(): void {
    this.api.getDetected().subscribe({
      next: (detected) => {
        this.detectedSignal.set(detected);
      },
      error: () => {
        // Silently fail
      }
    });
  }

  addMapping(mapping: Partial<DeviceMapping>): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.addMapping(mapping).subscribe({
      next: (newMapping) => {
        this.mappingsSignal.update(mappings => [...mappings, newMapping]);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  updateMapping(loxoneName: string, update: Partial<DeviceMapping>): void {
    this.api.updateMapping(loxoneName, update).subscribe({
      next: (updated) => {
        this.mappingsSignal.update(mappings =>
          mappings.map(m => m.loxone_name === loxoneName ? { ...m, ...updated } : m)
        );
      },
      error: (err) => {
        this.errorSignal.set(err.message);
      }
    });
  }

  deleteMapping(loxoneName: string): void {
    this.api.deleteMapping(loxoneName).subscribe({
      next: () => {
        this.mappingsSignal.update(mappings =>
          mappings.filter(m => m.loxone_name !== loxoneName)
        );
      },
      error: (err) => {
        this.errorSignal.set(err.message);
      }
    });
  }

  clearDetected(): void {
    this.api.clearDetected().subscribe({
      next: () => {
        this.detectedSignal.set([]);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
      }
    });
  }

  startPolling(intervalMs = 2000): void {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      this.loadStatus();
      this.loadDetected();
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
