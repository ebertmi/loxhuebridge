import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SetupStateService, DiscoveredBridge } from '../../services/setup-state.service';

@Component({
  selector: 'app-bridge-discovery',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="discovery-step">
      <p class="description">
        Searching for Philips Hue bridges on your network...
      </p>

      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Searching...</span>
        </div>
      } @else if (state.bridges().length > 0) {
        <mat-selection-list [multiple]="false">
          @for (bridge of state.bridges(); track bridge.id) {
            <mat-list-option (click)="selectBridge(bridge)">
              <mat-icon matListItemIcon>router</mat-icon>
              <span matListItemTitle>{{ bridge.ip }}</span>
              <span matListItemLine>ID: {{ bridge.id }}</span>
            </mat-list-option>
          }
        </mat-selection-list>
      } @else {
        <p class="no-bridges">No bridges found automatically.</p>
      }

      <div class="manual-entry">
        <h4>Or enter IP manually:</h4>
        <mat-form-field class="ip-field">
          <mat-label>Bridge IP Address</mat-label>
          <input matInput [(ngModel)]="manualIp" placeholder="192.168.1.x">
        </mat-form-field>
        <button mat-flat-button color="primary" [disabled]="!manualIp" (click)="selectManual()">
          <mat-icon>arrow_forward</mat-icon>
          Continue
        </button>
      </div>

      @if (state.error()) {
        <div class="error-message">
          {{ state.error() }}
        </div>
      }

      <div class="actions">
        <button mat-stroked-button (click)="discover()">
          <mat-icon>refresh</mat-icon>
          Search Again
        </button>
      </div>
    </div>
  `,
  styles: [`
    .discovery-step {
      padding: 16px 0;
    }

    .description {
      margin-bottom: 16px;
      opacity: 0.7;
    }

    .loading-container {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      justify-content: center;
    }

    .no-bridges {
      text-align: center;
      padding: 24px;
      opacity: 0.6;
    }

    .manual-entry {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    :host-context(html.dark) .manual-entry {
      border-top-color: rgba(255, 255, 255, 0.12);
    }

    .manual-entry h4 {
      margin: 0 0 16px 0;
      opacity: 0.7;
    }

    .ip-field {
      margin-right: 16px;
    }

    .error-message {
      margin-top: 16px;
      padding: 12px;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 4px;
      color: #f44336;
    }

    .actions {
      margin-top: 24px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BridgeDiscoveryComponent implements OnInit {
  readonly state = inject(SetupStateService);
  manualIp = '';

  ngOnInit(): void {
    this.discover();
  }

  discover(): void {
    this.state.discoverBridges();
  }

  selectBridge(bridge: DiscoveredBridge): void {
    this.state.selectBridge(bridge);
  }

  selectManual(): void {
    if (this.manualIp) {
      this.state.selectBridgeManual(this.manualIp);
    }
  }
}
