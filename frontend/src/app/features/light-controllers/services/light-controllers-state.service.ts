import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { LoxoneControl, LoxoneCommandResponse } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class LightControllersStateService {
  private readonly api = inject(ApiService);

  private readonly controlsSignal = signal<LoxoneControl[]>([]);
  private readonly searchTermSignal = signal('');
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly sendingCommandSignal = signal<Set<string>>(new Set());

  readonly controls = this.controlsSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly sendingCommand = this.sendingCommandSignal.asReadonly();

  readonly filteredControls = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const controls = this.controls();

    if (!term) return controls;

    return controls.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.type.toLowerCase().includes(term) ||
      c.room?.toLowerCase().includes(term)
    );
  });

  readonly controlsByType = computed(() => {
    const types = new Map<string, LoxoneControl[]>();
    this.filteredControls().forEach(control => {
      const type = control.type;
      if (!types.has(type)) {
        types.set(type, []);
      }
      types.get(type)!.push(control);
    });
    return types;
  });

  readonly availableTypes = computed(() => {
    const types = new Set<string>();
    this.controls().forEach(c => types.add(c.type));
    return Array.from(types).sort();
  });

  loadControls(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.getLoxoneControls().subscribe({
      next: (controls) => {
        this.controlsSignal.set(controls);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
  }

  sendCommand(uuid: string, command: string): void {
    this.sendingCommandSignal.update(set => new Set([...set, uuid]));

    this.api.sendLoxoneCommand(uuid, command).subscribe({
      next: () => {
        this.sendingCommandSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.sendingCommandSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      }
    });
  }
}
