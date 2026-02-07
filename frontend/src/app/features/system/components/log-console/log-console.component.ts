import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SystemStateService } from '../../services/logs-state.service';
import { LogCategory } from '../../../../core/models';

@Component({
  selector: 'app-log-console',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    ScrollingModule
  ],
  template: `
    <mat-card class="log-card">
      <mat-card-header>
        <mat-card-title>Log Console</mat-card-title>
        <span class="flex-spacer"></span>
        <mat-button-toggle-group [value]="state.filter()" (change)="setFilter($event.value)">
          <mat-button-toggle value="ALL">All</mat-button-toggle>
          @for (cat of categories; track cat) {
            <mat-button-toggle [value]="cat">{{ cat }}</mat-button-toggle>
          }
        </mat-button-toggle-group>
        <button mat-icon-button (click)="clearLogs()" matTooltip="Clear logs">
          <mat-icon>delete_sweep</mat-icon>
        </button>
        <button mat-icon-button (click)="refreshLogs()" matTooltip="Refresh">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content>
        <cdk-virtual-scroll-viewport itemSize="28" class="log-viewport">
          <div *cdkVirtualFor="let log of state.filteredLogs()" class="log-entry" [class]="'log-' + log.level.toLowerCase()">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level" [class]="'level-' + log.level.toLowerCase()">{{ log.level }}</span>
            <span class="log-cat">[{{ log.cat }}]</span>
            <span class="log-message">{{ log.msg }}</span>
          </div>
        </cdk-virtual-scroll-viewport>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .log-card {
      height: 500px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    mat-card-content {
      padding: 0 16px 16px !important;
    }

    .log-viewport {
      height: 380px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 4px;
    }

    :host-context(html.dark) .log-viewport {
      background: rgba(0, 0, 0, 0.2);
    }

    .log-entry {
      display: flex;
      gap: 12px;
      padding: 4px 8px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    :host-context(html.dark) .log-entry {
      border-bottom-color: rgba(255, 255, 255, 0.05);
    }

    .log-time {
      color: #888;
      flex-shrink: 0;
      min-width: 85px;
    }

    .log-level {
      font-weight: 600;
      min-width: 60px;
      flex-shrink: 0;
      text-transform: uppercase;
      font-size: 11px;
    }

    .log-cat {
      color: #888;
      min-width: 70px;
      flex-shrink: 0;
    }

    .log-message {
      flex: 1;
      word-break: break-word;
    }

    /* Level colors */
    .level-success { color: #4caf50; }
    .level-info { color: #2196f3; }
    .level-debug { color: #9e9e9e; }
    .level-warn { color: #ff9800; }
    .level-error { color: #f44336; }

    /* Row background by level */
    .log-error {
      background: rgba(244, 67, 54, 0.1);
    }
    .log-warn {
      background: rgba(255, 152, 0, 0.1);
    }
    .log-success {
      background: rgba(76, 175, 80, 0.05);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogConsoleComponent {
  readonly state = inject(SystemStateService);

  readonly categories: LogCategory[] = ['HUE', 'LOXONE', 'SYSTEM', 'SYNC', 'LIGHT', 'UDP', 'ERROR', 'DEBUG'];

  setFilter(filter: LogCategory | 'ALL'): void {
    this.state.setFilter(filter);
  }

  clearLogs(): void {
    this.state.clearLogs();
  }

  refreshLogs(): void {
    this.state.loadLogs();
  }
}
