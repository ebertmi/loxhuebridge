import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MappingWithStatus, SyncMode } from '../../../../core/models';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ColorDotComponent } from '../../../../shared/components/color-dot/color-dot.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LightsStateService } from '../../services/lights-state.service';
import { SystemStateService } from '../../../system/services/logs-state.service';

@Component({
  selector: 'app-mapping-item',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    BadgeComponent,
    ColorDotComponent
  ],
  template: `
    <div class="mapping-item">
      <div class="mapping-info">
        <div class="mapping-header">
          <span class="type-emoji">{{ mapping().hue_type === 'light' ? '💡' : '🏠' }}</span>
          <span class="loxone-name">{{ mapping().loxone_name }}</span>
          <span class="arrow">→</span>
          <span class="hue-name">{{ mapping().hue_name }}</span>
          <span class="type-label" [class]="mapping().hue_type">{{ mapping().hue_type }}</span>
        </div>
        <div class="mapping-meta">
          @if (mapping().loxone_format) {
            <span class="format-badge">{{ formatLabel }}</span>
          }
        </div>
      </div>

      <div class="mapping-status">
        @if (mapping().currentStatus; as status) {
          @if (status.on !== undefined) {
            <app-badge
              [variant]="status.on ? 'on' : 'off'"
              [text]="status.on ? 'On' : 'Off'" />
          }
          @if (status.brightness !== undefined && status.on) {
            <app-badge
              variant="brightness"
              [text]="status.brightness + '%'" />
          }
          @if (status.color?.xy; as xy) {
            <app-color-dot
              [xy]="xy"
              [size]="20"
              title="Current color" />
          }
        }
      </div>

      <div class="mapping-actions">
        @if (canSelectBidirectional) {
          <mat-select
            class="sync-mode-select"
            [value]="mapping().sync_mode || 'http'"
            (selectionChange)="onSyncModeChange($event.value)">
            <mat-option value="http">HTTP</mat-option>
            <mat-option value="bidirectional">Bidirectional</mat-option>
          </mat-select>
        } @else if (isBidirectionalGloballyDisabled) {
          <span class="sync-mode-chip" [matTooltip]="'Bidirectional sync is globally disabled in settings'">
            {{ (mapping().sync_mode || 'http') === 'bidirectional' ? 'Bidirectional' : 'HTTP' }}
          </span>
        } @else {
          <span class="sync-mode-chip">HTTP</span>
        }
        <button mat-icon-button color="warn" (click)="confirmDelete()" matTooltip="Delete mapping">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mapping-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.02);
    }

    :host-context(html.dark) .mapping-item {
      background: rgba(255, 255, 255, 0.05);
    }

    .mapping-info {
      flex: 1;
      min-width: 0;
    }

    .mapping-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .type-emoji {
      font-size: 1.1em;
      width: 24px;
      text-align: center;
    }

    .loxone-name {
      font-weight: 500;
    }

    .arrow {
      opacity: 0.4;
    }

    .hue-name {
      opacity: 0.7;
    }

    .type-label {
      font-size: 0.7em;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      margin-left: 4px;
    }

    .type-label.light {
      background: rgba(255, 193, 7, 0.2);
      color: #f9a825;
    }

    .type-label.group {
      background: rgba(33, 150, 243, 0.2);
      color: #1976d2;
    }

    .mapping-meta {
      display: flex;
      gap: 8px;
      padding-left: 32px;
    }

    .format-badge {
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.08);
    }

    :host-context(html.dark) .format-badge {
      background: rgba(255, 255, 255, 0.1);
    }

    .mapping-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mapping-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sync-mode-select {
      width: 130px;
    }

    .sync-mode-chip {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.08);
      letter-spacing: 0.5px;
      cursor: default;
    }

    :host-context(html.dark) .sync-mode-chip {
      background: rgba(255, 255, 255, 0.1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingItemComponent {
  private readonly dialog = inject(MatDialog);
  private readonly lightsState = inject(LightsStateService);
  private readonly systemState = inject(SystemStateService);

  readonly mapping = input.required<MappingWithStatus>();

  get canSelectBidirectional(): boolean {
    const settings = this.systemState.settings();
    return !!(settings?.loxone_connection_configured && settings?.bidirectional_sync);
  }

  get isBidirectionalGloballyDisabled(): boolean {
    const settings = this.systemState.settings();
    return !!(settings?.loxone_connection_configured && !settings?.bidirectional_sync);
  }

  get formatLabel(): string {
    const format = this.mapping().loxone_format;
    switch (format) {
      case 'smart_actuator': return 'Dimmer';
      case 'rgb': return 'RGB';
      case 'switch': return 'Switch';
      default: return format || '';
    }
  }

  onSyncModeChange(mode: SyncMode): void {
    this.lightsState.updateMapping(this.mapping().loxone_name, {
      sync_mode: mode
    });
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Mapping',
        message: `Are you sure you want to delete the mapping "${this.mapping().loxone_name}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.lightsState.deleteMapping(this.mapping().loxone_name);
      }
    });
  }
}
