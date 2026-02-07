import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SetupStateService } from '../../services/setup-state.service';

@Component({
  selector: 'app-setup-complete',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="complete-step">
      <div class="success-icon">
        <mat-icon>check_circle</mat-icon>
      </div>
      <h2>Setup Complete!</h2>
      <p>
        Your loxHueBridge is now configured and ready to use.
        You can start mapping your Hue devices to Loxone.
      </p>
      <button mat-flat-button color="primary" (click)="finish()">
        <mat-icon>dashboard</mat-icon>
        Go to Dashboard
      </button>
    </div>
  `,
  styles: [`
    .complete-step {
      padding: 32px 16px;
      text-align: center;
    }

    .success-icon mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #4caf50;
    }

    h2 {
      margin: 16px 0 8px 0;
    }

    p {
      margin: 0 0 24px 0;
      opacity: 0.7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupCompleteComponent {
  private readonly state = inject(SetupStateService);

  finish(): void {
    this.state.finishSetup();
  }
}
