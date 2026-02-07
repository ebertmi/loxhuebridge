import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { DiagnosticDevice } from '../../../../core/models';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-device-status-table',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatIconModule, BadgeComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon matCardAvatar>{{ icon() }}</mat-icon>
        <mat-card-title>{{ title() }}</mat-card-title>
        <mat-card-subtitle>{{ devices().length }} devices</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="devices()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let device">{{ device.name }}</td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let device">{{ device.type }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let device">
                <app-badge
                  [variant]="device.reachable ? 'on' : 'unreachable'"
                  [text]="device.reachable ? 'Connected' : 'Unreachable'" />
              </td>
            </ng-container>

            <ng-container matColumnDef="battery">
              <th mat-header-cell *matHeaderCellDef>Battery</th>
              <td mat-cell *matCellDef="let device">
                @if (device.battery !== undefined) {
                  <app-badge
                    variant="battery"
                    [text]="device.battery + '%'"
                    [lowBattery]="device.battery < 20" />
                } @else {
                  <span class="na">N/A</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="firmware">
              <th mat-header-cell *matHeaderCellDef>Firmware</th>
              <td mat-cell *matCellDef="let device">
                {{ device.firmware || '-' }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.unreachable]="!row.reachable"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .na {
      opacity: 0.4;
    }

    .unreachable {
      opacity: 0.6;
      background: rgba(244, 67, 54, 0.05);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceStatusTableComponent {
  readonly title = input.required<string>();
  readonly icon = input.required<string>();
  readonly devices = input.required<DiagnosticDevice[]>();

  readonly displayedColumns = ['name', 'type', 'status', 'battery', 'firmware'];
}
