import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SceneWithStatus } from '../../../../core/models';
import { ScenesStateService } from '../../services/scenes-state.service';
import { ColorDotComponent } from '../../../../shared/components/color-dot/color-dot.component';

@Component({
  selector: 'app-scene-item',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, ColorDotComponent],
  template: `
    <div class="scene-item" [class.active]="scene().isActive">
      <div class="scene-info">
        <div class="scene-name">{{ scene().name }}</div>
        @if (paletteColors().length > 0) {
          <div class="scene-palette">
            @for (color of paletteColors(); track $index) {
              <app-color-dot [xy]="color" [size]="12" />
            }
          </div>
        }
      </div>
      <div class="scene-actions">
        @if (isActivating()) {
          <mat-spinner diameter="24"></mat-spinner>
        } @else {
          <button mat-stroked-button
                  [color]="scene().isActive ? 'warn' : 'primary'"
                  (click)="toggle()">
            <mat-icon>{{ scene().isActive ? 'stop' : 'play_arrow' }}</mat-icon>
            {{ scene().isActive ? 'Deactivate' : 'Activate' }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .scene-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.02);
      transition: background-color 0.2s;
    }

    :host-context(html.dark) .scene-item {
      background: rgba(255, 255, 255, 0.05);
    }

    .scene-item.active {
      background: rgba(133, 196, 64, 0.1);
      border: 1px solid rgba(133, 196, 64, 0.3);
    }

    .scene-info {
      flex: 1;
      min-width: 0;
    }

    .scene-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .scene-palette {
      display: flex;
      gap: 4px;
    }

    .scene-actions {
      flex-shrink: 0;
      margin-left: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SceneItemComponent {
  private readonly scenesState = inject(ScenesStateService);

  readonly scene = input.required<SceneWithStatus>();

  readonly paletteColors = computed(() => {
    const palette = this.scene().palette;
    if (!palette?.color) return [];
    return palette.color.slice(0, 5).map(c => c.color.xy);
  });

  readonly isActivating = computed(() =>
    this.scenesState.activating().has(this.scene().uuid)
  );

  toggle(): void {
    this.scenesState.toggleScene(this.scene().uuid);
  }
}
