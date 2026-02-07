import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SetupStateService } from '../../services/setup-state.service';
import { BridgeDiscoveryComponent } from '../bridge-discovery/bridge-discovery.component';
import { BridgeRegistrationComponent } from '../bridge-registration/bridge-registration.component';
import { LoxoneConfigComponent } from '../loxone-config/loxone-config.component';
import { SetupCompleteComponent } from '../setup-complete/setup-complete.component';

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [
    MatCardModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    BridgeDiscoveryComponent,
    BridgeRegistrationComponent,
    LoxoneConfigComponent,
    SetupCompleteComponent
  ],
  template: `
    <div class="setup-container">
      <mat-card class="setup-card">
        <mat-card-header>
          <mat-card-title>
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2385c440'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E"
                 alt="Logo"
                 class="logo" />
            loxHueBridge Setup
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-stepper [selectedIndex]="state.stepIndex()" orientation="vertical">
            <mat-step label="Discover Bridge" [completed]="state.stepIndex() > 0">
              <app-bridge-discovery />
            </mat-step>
            <mat-step label="Register" [completed]="state.stepIndex() > 1">
              <app-bridge-registration />
            </mat-step>
            <mat-step label="Loxone Config" [completed]="state.stepIndex() > 2">
              <app-loxone-config />
            </mat-step>
            <mat-step label="Complete">
              <app-setup-complete />
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .setup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
    }

    .setup-card {
      max-width: 600px;
      width: 100%;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
    }

    .logo {
      width: 40px;
      height: 40px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupWizardComponent implements OnInit {
  readonly state = inject(SetupStateService);

  ngOnInit(): void {
    this.state.reset();
  }
}
