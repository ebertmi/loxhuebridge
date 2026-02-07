import { Injectable, inject, computed } from '@angular/core';
import { LightsStateService } from '../../lights/services/lights-state.service';
import { MappingWithStatus } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class SensorsStateService {
  private readonly lightsState = inject(LightsStateService);

  readonly loading = this.lightsState.loading;
  readonly error = this.lightsState.error;
  readonly targets = this.lightsState.targets;
  readonly detected = this.lightsState.detected;
  readonly status = this.lightsState.status;

  readonly sensorMappings = computed(() =>
    this.lightsState.mappings().filter(m => m.hue_type === 'sensor')
  );

  readonly availableSensorTargets = computed(() => {
    const mappedIds = new Set(this.sensorMappings().map(m => m.hue_id));
    return this.targets().filter(t => t.type === 'sensor' && !mappedIds.has(t.uuid));
  });

  readonly mappingsWithStatus = computed<MappingWithStatus[]>(() => {
    const statusMap = this.status();
    return this.sensorMappings().map(m => ({
      ...m,
      currentStatus: statusMap[m.loxone_name]
    }));
  });

  loadAll(): void {
    this.lightsState.loadAll();
  }

  startPolling(intervalMs = 2000): void {
    this.lightsState.startPolling(intervalMs);
  }

  stopPolling(): void {
    this.lightsState.stopPolling();
  }

  addMapping = this.lightsState.addMapping.bind(this.lightsState);
  updateMapping = this.lightsState.updateMapping.bind(this.lightsState);
  deleteMapping = this.lightsState.deleteMapping.bind(this.lightsState);
  clearDetected = this.lightsState.clearDetected.bind(this.lightsState);
}
