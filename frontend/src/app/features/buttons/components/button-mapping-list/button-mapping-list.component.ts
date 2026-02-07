import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MappingWithStatus } from '../../../../core/models';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ButtonsStateService } from '../../services/buttons-state.service';

@Component({
  selector: 'app-button-mapping-list',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    BadgeComponent
  ],
  template: `
    <div class="mapping-list">
      @for (mapping of mappings(); track mapping.loxone_name) {
        <div class="mapping-item">
          <div class="mapping-info">
            <div class="mapping-header">
              <mat-icon class="type-icon">radio_button_checked</mat-icon>
              <span class="loxone-name">{{ mapping.loxone_name }}</span>
              <span class="arrow">→</span>
              <span class="hue-name">{{ mapping.hue_name }}</span>
            </div>
          </div>

          <div class="mapping-status">
            @if (mapping.currentStatus; as status) {
              @if (status.button_event !== undefined) {
                <app-badge
                  variant="default"
                  [text]="'Event: ' + status.button_event" />
              }
              @if (status.battery !== undefined) {
                <app-badge
                  variant="battery"
                  [text]="status.battery + '%'"
                  [lowBattery]="status.battery < 20" />
              }
              @if (status.last_updated) {
                <span class="last-updated">{{ status.last_updated }}</span>
              }
            }
          </div>

          <div class="mapping-actions">
            <span class="sync-mode-chip">HTTP</span>
            <button mat-icon-button color="warn" (click)="confirmDelete(mapping.loxone_name)" matTooltip="Delete mapping">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .mapping-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

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
    }

    .type-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      opacity: 0.6;
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

    .mapping-status {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .last-updated {
      font-size: 0.75rem;
      opacity: 0.5;
    }

    .mapping-actions {
      display: flex;
      align-items: center;
      gap: 8px;
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
export class ButtonMappingListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly buttonsState = inject(ButtonsStateService);

  readonly mappings = input.required<MappingWithStatus[]>();

  confirmDelete(loxoneName: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Mapping',
        message: `Are you sure you want to delete the mapping "${loxoneName}"?`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.buttonsState.deleteMapping(loxoneName);
      }
    });
  }
}
