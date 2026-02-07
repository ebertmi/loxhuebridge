import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DiagnosticsStateService } from '../../services/diagnostics-state.service';
import { DeviceStatusTableComponent } from '../device-status-table/device-status-table.component';
import { BridgeStatusCardComponent } from '../bridge-status-card/bridge-status-card.component';

@Component({
  selector: 'app-diagnostics-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DeviceStatusTableComponent,
    BridgeStatusCardComponent
  ],
  template: `
    <div class="diagnostics-page">
      <div class="page-header">
        <h2>System Diagnostics</h2>
        <span class="flex-spacer"></span>
        <button mat-icon-button (click)="refresh()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        @if (state.unreachableCount() > 0 || state.lowBatteryDevices().length > 0) {
          <mat-card class="warning-card">
            <mat-card-content>
              <div class="warnings">
                @if (state.unreachableCount() > 0) {
                  <div class="warning-item">
                    <mat-icon color="warn">warning</mat-icon>
                    <span>{{ state.unreachableCount() }} device(s) unreachable</span>
                  </div>
                }
                @if (state.lowBatteryDevices().length > 0) {
                  <div class="warning-item">
                    <mat-icon color="warn">battery_alert</mat-icon>
                    <span>{{ state.lowBatteryDevices().length }} device(s) with low battery</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }

        @if (state.bridge(); as bridge) {
          <app-bridge-status-card [bridge]="bridge" />
        }

        @if (state.lights().length > 0) {
          <app-device-status-table
            title="Lights"
            icon="lightbulb"
            [devices]="state.lights()" />
        }

        @if (state.sensors().length > 0) {
          <app-device-status-table
            title="Sensors"
            icon="sensors"
            [devices]="state.sensors()" />
        }

        @if (state.buttons().length > 0) {
          <app-device-status-table
            title="Buttons"
            icon="radio_button_checked"
            [devices]="state.buttons()" />
        }
      }

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .diagnostics-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-header h2 {
      margin: 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .warning-card {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    :host-context(html.dark) .warning-card {
      background: linear-gradient(135deg, #3e2723 0%, #4e342e 100%);
    }

    .warnings {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .warning-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-banner {
      background-color: #f44336;
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagnosticsPageComponent implements OnInit {
  readonly state = inject(DiagnosticsStateService);

  ngOnInit(): void {
    this.state.loadDiagnostics();
  }

  refresh(): void {
    this.state.loadDiagnostics();
  }
}
