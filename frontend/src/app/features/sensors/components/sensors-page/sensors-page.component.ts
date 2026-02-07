import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SensorsStateService } from '../../services/sensors-state.service';
import { SensorMappingFormComponent } from '../sensor-mapping-form/sensor-mapping-form.component';
import { SensorMappingListComponent } from '../sensor-mapping-list/sensor-mapping-list.component';
import { ExportButtonComponent } from '../../../lights/components/export-button/export-button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-sensors-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    SensorMappingFormComponent,
    SensorMappingListComponent,
    ExportButtonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="sensors-page">
      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Add Sensor Mapping</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-sensor-mapping-form [targets]="state.availableSensorTargets()" />
          </mat-card-content>
        </mat-card>

        @if (state.sensorMappings().length > 0) {
          <mat-card class="list-card">
            <mat-card-header>
              <mat-card-title>Mapped Sensors</mat-card-title>
              <span class="flex-spacer"></span>
              <app-export-button exportType="inputs" />
            </mat-card-header>
            <mat-card-content>
              <app-sensor-mapping-list [mappings]="state.mappingsWithStatus()" />
            </mat-card-content>
          </mat-card>
        } @else {
          <app-empty-state
            icon="sensors"
            title="No sensors mapped"
            message="Add a mapping above to receive sensor data from Hue">
          </app-empty-state>
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
    .sensors-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .form-card, .list-card {
      mat-card-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }
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
export class SensorsPageComponent implements OnInit, OnDestroy {
  readonly state = inject(SensorsStateService);

  ngOnInit(): void {
    this.state.loadAll();
    this.state.startPolling();
  }

  ngOnDestroy(): void {
    this.state.stopPolling();
  }
}
