import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LightsStateService } from '../../services/lights-state.service';
import { MappingFormComponent } from '../mapping-form/mapping-form.component';
import { MappingListComponent } from '../mapping-list/mapping-list.component';
import { DetectedCommandsComponent } from '../detected-commands/detected-commands.component';
import { ExportButtonComponent } from '../export-button/export-button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-lights-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    MappingFormComponent,
    MappingListComponent,
    DetectedCommandsComponent,
    ExportButtonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="lights-page">
      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <app-detected-commands />

        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Add Light Mapping</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-mapping-form
              [targets]="state.availableLightTargets()"
              mappingType="light" />
          </mat-card-content>
        </mat-card>

        @if (state.lightMappings().length > 0) {
          <mat-card class="list-card">
            <mat-card-header>
              <mat-card-title>Mapped Lights</mat-card-title>
              <span class="flex-spacer"></span>
              <app-export-button exportType="outputs" />
            </mat-card-header>
            <mat-card-content>
              <app-mapping-list [mappings]="state.mappingsWithStatus()" />
            </mat-card-content>
          </mat-card>
        } @else {
          <app-empty-state
            icon="lightbulb"
            title="No lights mapped"
            message="Add a mapping above to control Hue lights from Loxone">
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
    .lights-page {
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
export class LightsPageComponent implements OnInit, OnDestroy {
  readonly state = inject(LightsStateService);

  ngOnInit(): void {
    this.state.loadAll();
    this.state.startPolling();
  }

  ngOnDestroy(): void {
    this.state.stopPolling();
  }
}
