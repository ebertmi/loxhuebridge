import { Component, ChangeDetectionStrategy, inject, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { SystemStateService } from '../../services/logs-state.service';
import { ipAddressValidator, portValidator } from '../../../../shared/utils/validators';

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Bridge Configuration</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" class="settings-form">
          <div class="form-section">
            <h3>Philips Hue Bridge</h3>
            <mat-form-field class="form-field-full-width">
              <mat-label>Bridge IP Address</mat-label>
              <input matInput formControlName="bridge_ip" placeholder="192.168.1.x">
              @if (form.controls.bridge_ip.hasError('invalidIpAddress')) {
                <mat-error>Invalid IP address</mat-error>
              }
            </mat-form-field>

            <div class="info-row">
              <span class="info-label">API Key:</span>
              <span class="info-value">
                @if (form.controls.key_configured.value) {
                  <mat-icon class="success-icon">check_circle</mat-icon> Configured
                } @else {
                  <mat-icon class="warning-icon">warning</mat-icon> Not configured
                }
              </span>
            </div>
          </div>

          <div class="form-section">
            <h3>Loxone Miniserver</h3>
            <mat-form-field class="form-field-full-width">
              <mat-label>Miniserver IP Address</mat-label>
              <input matInput formControlName="loxone_ip" placeholder="192.168.1.x">
              @if (form.controls.loxone_ip.hasError('invalidIpAddress')) {
                <mat-error>Invalid IP address</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="form-field-full-width">
              <mat-label>UDP Port</mat-label>
              <input matInput formControlName="loxone_port" type="number">
              @if (form.controls.loxone_port.hasError('invalidPort')) {
                <mat-error>Port must be between 1-65535</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-section">
            <h3>Bidirectional Sync</h3>
            <p class="section-description">
              Enable two-way sync between Hue lights and Loxone via WebSocket.
            </p>

            <mat-slide-toggle formControlName="bidirectional_sync">
              Enable Bidirectional Sync
            </mat-slide-toggle>

            <div class="bidirectional-fields" [class.disabled]="!form.controls.bidirectional_sync.value">
              @if (!editingPassword() && loxoneConnectionConfigured()) {
                <div class="credential-row">
                  <mat-form-field class="form-field-full-width">
                    <mat-label>Loxone Username</mat-label>
                    <input matInput formControlName="loxone_user">
                  </mat-form-field>
                  <div class="info-row">
                    <span class="info-label">Password:</span>
                    <span class="info-value">
                      <mat-icon class="success-icon">check_circle</mat-icon> Configured
                      <button mat-button type="button" (click)="editingPassword.set(true)">
                        <mat-icon>edit</mat-icon> Edit
                      </button>
                    </span>
                  </div>
                </div>
              } @else {
                <mat-form-field class="form-field-full-width">
                  <mat-label>Loxone Username</mat-label>
                  <input matInput formControlName="loxone_user">
                </mat-form-field>
                <mat-form-field class="form-field-full-width">
                  <mat-label>Loxone Password</mat-label>
                  <input matInput formControlName="loxone_password"
                         [type]="showPassword() ? 'text' : 'password'">
                  <button mat-icon-button matSuffix type="button"
                          (click)="showPassword.set(!showPassword())">
                    <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>
              }
              <mat-form-field class="form-field-full-width">
                <mat-label>HTTP Port</mat-label>
                <input matInput formControlName="loxone_http_port" type="number">
                <mat-hint>Miniserver web interface port (default: 80)</mat-hint>
              </mat-form-field>
            </div>

            <div class="sync-status">
              @if (!form.controls.bidirectional_sync.value) {
                <span class="status-indicator disabled">
                  <mat-icon>remove_circle_outline</mat-icon> Disabled
                </span>
              } @else if (!loxoneConnectionConfigured() && !form.dirty) {
                <span class="status-indicator not-configured">
                  <mat-icon>info_outline</mat-icon> Not configured
                </span>
              } @else {
                <span class="status-indicator enabled">
                  <mat-icon>check_circle_outline</mat-icon> Configured
                </span>
              }
            </div>
          </div>

          <div class="form-section">
            <h3>Advanced</h3>
            <mat-form-field class="form-field-full-width">
              <mat-label>Transition Time (ms)</mat-label>
              <input matInput formControlName="transitionTime" type="number">
            </mat-form-field>

            <mat-form-field class="form-field-full-width">
              <mat-label>HTTP Port</mat-label>
              <input matInput formControlName="http_port" type="number" readonly>
            </mat-form-field>

            <mat-slide-toggle formControlName="debug">
              Enable Debug Mode
            </mat-slide-toggle>

            <div class="info-row">
              <span class="info-label">Version:</span>
              <span class="info-value">{{ form.controls.version.value || 'unknown' }}</span>
            </div>
          </div>
        </form>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="resetForm()">
          <mat-icon>undo</mat-icon>
          Reset
        </button>
        <button mat-flat-button color="primary" (click)="saveSettings()" [disabled]="!form.valid || !form.dirty">
          <mat-icon>save</mat-icon>
          Save Settings
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-section h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      opacity: 0.7;
    }

    .section-description {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.6;
    }

    mat-slide-toggle {
      margin-top: 8px;
    }

    .bidirectional-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.02);
      transition: opacity 0.2s;
    }

    :host-context(html.dark) .bidirectional-fields {
      background: rgba(255, 255, 255, 0.05);
    }

    .bidirectional-fields.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .credential-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sync-status {
      margin-top: 8px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
    }

    .status-indicator.disabled {
      opacity: 0.5;
    }

    .status-indicator.not-configured {
      color: #ff9800;
    }

    .status-indicator.enabled {
      color: #4caf50;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 0;
    }

    .info-label {
      font-weight: 500;
      opacity: 0.7;
    }

    .info-value {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .success-icon {
      color: #4caf50;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly systemState = inject(SystemStateService);

  readonly editingPassword = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    bridge_ip: ['', [ipAddressValidator()]],
    loxone_ip: ['', [ipAddressValidator()]],
    loxone_port: [7000, [portValidator()]],
    http_port: [8555],
    debug: [false],
    key_configured: [false],
    transitionTime: [400],
    version: [''],
    bidirectional_sync: [false],
    loxone_user: [''],
    loxone_password: [''],
    loxone_http_port: [80],
  });

  loxoneConnectionConfigured(): boolean {
    const settings = this.systemState.settings();
    return settings?.loxone_connection_configured ?? false;
  }

  constructor() {
    effect(() => {
      const settings = this.systemState.settings();
      if (settings) {
        // Patch all fields except password (never returned by API)
        this.form.patchValue(settings, { emitEvent: false });
        this.form.markAsPristine();
        this.editingPassword.set(false);
      }
    });
  }

  saveSettings(): void {
    if (!this.form.valid) return;

    const formValue = this.form.value;
    const settings: Record<string, unknown> = {};

    // Only send changed/relevant fields
    if (formValue.loxone_ip) settings.loxone_ip = formValue.loxone_ip;
    if (formValue.loxone_port) settings.loxone_port = formValue.loxone_port;
    if (formValue.debug !== undefined) settings.debug = formValue.debug;
    if (formValue.transitionTime) settings.transitionTime = formValue.transitionTime;
    settings.bidirectional_sync = formValue.bidirectional_sync;
    if (formValue.loxone_user) settings.loxone_user = formValue.loxone_user;
    if (formValue.loxone_password) settings.loxone_password = formValue.loxone_password;
    if (formValue.loxone_http_port) settings.loxone_http_port = formValue.loxone_http_port;

    this.systemState.updateSettings(settings);
  }

  resetForm(): void {
    const settings = this.systemState.settings();
    if (settings) {
      this.form.patchValue(settings);
      this.form.markAsPristine();
      this.editingPassword.set(false);
    }
  }
}
