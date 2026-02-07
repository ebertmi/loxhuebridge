import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { HueScene, SceneWithStatus } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class ScenesStateService {
  private readonly api = inject(ApiService);

  private readonly scenesSignal = signal<HueScene[]>([]);
  private readonly activeScenesSignal = signal<Set<string>>(new Set());
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly activatingSignal = signal<Set<string>>(new Set());

  readonly scenes = this.scenesSignal.asReadonly();
  readonly activeScenes = this.activeScenesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly activating = this.activatingSignal.asReadonly();

  readonly scenesWithStatus = computed<SceneWithStatus[]>(() => {
    const active = this.activeScenes();
    return this.scenes().map(scene => ({
      ...scene,
      isActive: active.has(scene.uuid)
    }));
  });

  readonly scenesByGroup = computed(() => {
    const groups = new Map<string, SceneWithStatus[]>();
    this.scenesWithStatus().forEach(scene => {
      const groupName = scene.group_name || 'Other';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(scene);
    });
    return groups;
  });

  loadScenes(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.getScenes().subscribe({
      next: (scenes) => {
        this.scenesSignal.set(scenes);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  activateScene(uuid: string): void {
    this.activatingSignal.update(set => new Set([...set, uuid]));

    this.api.activateScene(uuid).subscribe({
      next: () => {
        this.activeScenesSignal.update(set => new Set([...set, uuid]));
        this.activatingSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.activatingSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      }
    });
  }

  deactivateScene(uuid: string): void {
    this.activatingSignal.update(set => new Set([...set, uuid]));

    this.api.deactivateScene(uuid).subscribe({
      next: () => {
        this.activeScenesSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
        this.activatingSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.activatingSignal.update(set => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      }
    });
  }

  toggleScene(uuid: string): void {
    if (this.activeScenes().has(uuid)) {
      this.deactivateScene(uuid);
    } else {
      this.activateScene(uuid);
    }
  }
}
