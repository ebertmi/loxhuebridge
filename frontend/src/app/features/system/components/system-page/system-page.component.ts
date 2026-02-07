import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SystemStateService } from '../../services/logs-state.service';
import { SettingsFormComponent } from '../settings-form/settings-form.component';
import { LogConsoleComponent } from '../log-console/log-console.component';

@Component({
  selector: 'app-system-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    SettingsFormComponent,
    LogConsoleComponent
  ],
  template: `
    <div class="system-page">
      <mat-tab-group>
        <mat-tab label="Settings">
          <div class="tab-content">
            @if (state.loading()) {
              <div class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
            } @else {
              <app-settings-form />
            }
          </div>
        </mat-tab>
        <mat-tab label="Logs">
          <div class="tab-content">
            <app-log-console />
          </div>
        </mat-tab>
      </mat-tab-group>

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .system-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tab-content {
      padding: 16px 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
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
export class SystemPageComponent implements OnInit, OnDestroy {
  readonly state = inject(SystemStateService);

  ngOnInit(): void {
    this.state.loadSettings();
    this.state.loadLogs();
    this.state.startPolling();
  }

  ngOnDestroy(): void {
    this.state.stopPolling();
  }
}
