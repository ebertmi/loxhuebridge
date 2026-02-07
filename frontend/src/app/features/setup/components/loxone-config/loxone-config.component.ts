import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SetupStateService } from '../../services/setup-state.service';
import { ipAddressValidator, portValidator } from '../../../../shared/utils/validators';

@Component({
  selector: 'app-loxone-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="loxone-step">
      <p class="description">
        Configure your Loxone Miniserver connection. The bridge will send UDP commands to this address.
      </p>

      <form [formGroup]="form" class="loxone-form">
        <mat-form-field class="form-field-full-width">
          <mat-label>Miniserver IP Address</mat-label>
          <input matInput formControlName="loxoneIp" placeholder="192.168.1.x">
          @if (form.controls.loxoneIp.hasError('required')) {
            <mat-error>IP address is required</mat-error>
          }
          @if (form.controls.loxoneIp.hasError('invalidIpAddress')) {
            <mat-error>Invalid IP address format</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="form-field-full-width">
          <mat-label>UDP Port</mat-label>
          <input matInput formControlName="loxonePort" type="number">
          @if (form.controls.loxonePort.hasError('required')) {
            <mat-error>Port is required</mat-error>
          }
          @if (form.controls.loxonePort.hasError('invalidPort')) {
            <mat-error>Port must be between 1-65535</mat-error>
          }
          <mat-hint>Default: 7000</mat-hint>
        </mat-form-field>

        <div class="bidirectional-section">
          <mat-slide-toggle [checked]="showBidirectional()" (change)="showBidirectional.set($event.checked)">
            Enable Bidirectional Sync (Optional)
          </mat-slide-toggle>
          <p class="section-hint">
            Enable two-way sync between Hue lights and Loxone. Requires Miniserver credentials.
          </p>

          @if (showBidirectional()) {
            <div class="bidirectional-fields">
              <mat-form-field class="form-field-full-width">
                <mat-label>Loxone Username</mat-label>
                <input matInput formControlName="loxoneUser">
              </mat-form-field>

              <mat-form-field class="form-field-full-width">
                <mat-label>Loxone Password</mat-label>
                <input matInput formControlName="loxonePassword"
                       [type]="showPassword() ? 'text' : 'password'">
                <button mat-icon-button matSuffix type="button"
                        (click)="showPassword.set(!showPassword())">
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <mat-form-field class="form-field-full-width">
                <mat-label>HTTP Port</mat-label>
                <input matInput formControlName="loxoneHttpPort" type="number">
                <mat-hint>Miniserver web interface port (default: 80)</mat-hint>
              </mat-form-field>
            </div>
          }
        </div>
      </form>

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
        <button mat-flat-button color="primary" (click)="save()" [disabled]="!isFormValid() || state.loading()">
          @if (state.loading()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>check</mat-icon>
            Save Configuration
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .loxone-step {
      padding: 16px 0;
    }

    .description {
      margin-bottom: 24px;
      opacity: 0.7;
    }

    .loxone-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .bidirectional-section {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-hint {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.6;
    }

    .bidirectional-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.02);
    }

    :host-context(html.dark) .bidirectional-fields {
      background: rgba(255, 255, 255, 0.05);
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
export class LoxoneConfigComponent {
  private readonly fb = inject(FormBuilder);
  readonly state = inject(SetupStateService);
  readonly showBidirectional = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    loxoneIp: ['', [Validators.required, ipAddressValidator()]],
    loxonePort: [7000, [Validators.required, portValidator()]],
    loxoneUser: [''],
    loxonePassword: [''],
    loxoneHttpPort: [80]
  });

  isFormValid(): boolean {
    if (!this.form.controls.loxoneIp.valid || !this.form.controls.loxonePort.valid) {
      return false;
    }
    if (this.showBidirectional()) {
      return !!(this.form.controls.loxoneUser.value && this.form.controls.loxonePassword.value);
    }
    return true;
  }

  save(): void {
    if (!this.isFormValid()) return;

    if (this.showBidirectional()) {
      this.state.saveLoxoneConfig(
        this.form.controls.loxoneIp.value!,
        this.form.controls.loxonePort.value!,
        this.form.controls.loxoneUser.value!,
        this.form.controls.loxonePassword.value!,
        this.form.controls.loxoneHttpPort.value!
      );
    } else {
      this.state.saveLoxoneConfig(
        this.form.controls.loxoneIp.value!,
        this.form.controls.loxonePort.value!
      );
    }
  }

  goBack(): void {
    this.state.goBack();
  }
}
