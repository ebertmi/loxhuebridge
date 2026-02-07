import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonsStateService } from '../../services/buttons-state.service';
import { ButtonMappingFormComponent } from '../button-mapping-form/button-mapping-form.component';
import { ButtonMappingListComponent } from '../button-mapping-list/button-mapping-list.component';
import { ExportButtonComponent } from '../../../lights/components/export-button/export-button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-buttons-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    ButtonMappingFormComponent,
    ButtonMappingListComponent,
    ExportButtonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="buttons-page">
      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Add Button Mapping</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-button-mapping-form [targets]="state.availableButtonTargets()" />
          </mat-card-content>
        </mat-card>

        @if (state.buttonMappings().length > 0) {
          <mat-card class="list-card">
            <mat-card-header>
              <mat-card-title>Mapped Buttons</mat-card-title>
              <span class="flex-spacer"></span>
              <app-export-button exportType="inputs" />
            </mat-card-header>
            <mat-card-content>
              <app-button-mapping-list [mappings]="state.mappingsWithStatus()" />
            </mat-card-content>
          </mat-card>
        } @else {
          <app-empty-state
            icon="radio_button_checked"
            title="No buttons mapped"
            message="Add a mapping above to receive button events from Hue">
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
    .buttons-page {
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
export class ButtonsPageComponent implements OnInit, OnDestroy {
  readonly state = inject(ButtonsStateService);

  ngOnInit(): void {
    this.state.loadAll();
    this.state.startPolling();
  }

  ngOnDestroy(): void {
    this.state.stopPolling();
  }
}
