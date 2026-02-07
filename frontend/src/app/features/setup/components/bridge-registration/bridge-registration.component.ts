import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SetupStateService } from '../../services/setup-state.service';

@Component({
  selector: 'app-bridge-registration',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="registration-step">
      <div class="bridge-info">
        <mat-icon class="bridge-icon">router</mat-icon>
        <div class="bridge-details">
          <span class="label">Bridge IP</span>
          <span class="value">{{ state.selectedBridge()?.ip }}</span>
        </div>
      </div>

      <div class="instructions">
        <p><strong>Step 1:</strong> Press the large round link button on top of your Hue Bridge</p>
        <p><strong>Step 2:</strong> Click the "Register" button below within 30 seconds</p>
      </div>

      <div class="button-image">
        <mat-icon>touch_app</mat-icon>
        <span>Press the bridge button</span>
      </div>

      @if (state.error()) {
        <div class="error-message">
          {{ state.error() }}
        </div>
      }

      <div class="actions">
        <button mat-stroked-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
        <button mat-flat-button color="primary" (click)="register()" [disabled]="state.loading()">
          @if (state.loading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>link</mat-icon>
            Register
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .registration-step {
      padding: 16px 0;
    }

    .bridge-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 8px;
      margin-bottom: 24px;
    }

    :host-context(html.dark) .bridge-info {
      background: rgba(255, 255, 255, 0.05);
    }

    .bridge-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.6;
    }

    .bridge-details {
      display: flex;
      flex-direction: column;
    }

    .label {
      font-size: 0.75rem;
      opacity: 0.6;
      text-transform: uppercase;
    }

    .value {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .instructions {
      margin-bottom: 24px;
    }

    .instructions p {
      margin: 8px 0;
    }

    .button-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border-radius: 8px;
      margin-bottom: 24px;
    }

    :host-context(html.dark) .button-image {
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
    }

    .button-image mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
    }

    .error-message {
      margin-bottom: 16px;
      padding: 12px;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 4px;
      color: #f44336;
    }

    .actions {
      display: flex;
      gap: 16px;
    }

    .actions button mat-spinner {
      margin-right: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BridgeRegistrationComponent {
  readonly state = inject(SetupStateService);

  register(): void {
    this.state.registerBridge();
  }

  goBack(): void {
    this.state.goBack();
  }
}
