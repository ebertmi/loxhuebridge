import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HueTarget, DeviceMapping, SyncMode } from '../../../../core/models';
import { LightsStateService } from '../../services/lights-state.service';
import { SystemStateService } from '../../../system/services/logs-state.service';
import { loxoneNameValidator } from '../../../../shared/utils/validators';

@Component({
  selector: 'app-mapping-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mapping-form">
      <mat-form-field class="target-field">
        <mat-label>Select {{ mappingType() === 'light' ? 'Light/Group' : mappingType() }}</mat-label>
        <mat-select formControlName="target" (selectionChange)="onTargetChange()">
          @for (target of targets(); track target.uuid) {
            <mat-option [value]="target">
              <span class="target-option">
                <span class="type-badge" [class]="target.type">
                  {{ target.type === 'light' ? '💡' : '🏠' }}
                </span>
                <span class="target-name">{{ target.name }}</span>
                <span class="type-label" [class]="target.type">{{ target.type }}</span>
              </span>
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="name-field">
        <mat-label>Loxone Name</mat-label>
        <input matInput formControlName="loxoneName" placeholder="e.g., Living Room Light">
        @if (form.controls.loxoneName.hasError('required')) {
          <mat-error>Name is required</mat-error>
        }
        @if (form.controls.loxoneName.hasError('invalidLoxoneName')) {
          <mat-error>Invalid characters in name</mat-error>
        }
      </mat-form-field>

      @if (mappingType() === 'light') {
        <mat-form-field class="format-field">
          <mat-label>Loxone Format</mat-label>
          <mat-select formControlName="loxoneFormat">
            <mat-option value="smart_actuator">Smart Actuator (Dimmer)</mat-option>
            <mat-option value="rgb">RGB Numeric</mat-option>
            <mat-option value="switch">Switch (On/Off)</mat-option>
          </mat-select>
        </mat-form-field>
      }

      @if (mappingType() === 'light' && canSelectBidirectional) {
        <mat-form-field class="mode-field">
          <mat-label>Sync Mode</mat-label>
          <mat-select formControlName="syncMode">
            <mat-option value="http">HTTP</mat-option>
            <mat-option value="bidirectional">Bidirectional</mat-option>
          </mat-select>
        </mat-form-field>
      }

      <button mat-flat-button color="primary" type="submit" [disabled]="!form.valid">
        <mat-icon>add</mat-icon>
        Add Mapping
      </button>
    </form>
  `,
  styles: [`
    .mapping-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
    }

    .target-field {
      flex: 1;
      min-width: 200px;
    }

    .name-field {
      flex: 1;
      min-width: 200px;
    }

    .format-field {
      min-width: 180px;
    }

    .target-option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }

    .type-badge {
      font-size: 1.1em;
      width: 24px;
      text-align: center;
    }

    .target-name {
      flex: 1;
    }

    .type-label {
      font-size: 0.7em;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .type-label.light {
      background: rgba(255, 193, 7, 0.2);
      color: #f9a825;
    }

    .type-label.group {
      background: rgba(33, 150, 243, 0.2);
      color: #1976d2;
    }

    .mode-field {
      min-width: 150px;
    }

    button {
      height: 56px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly lightsState = inject(LightsStateService);
  private readonly systemState = inject(SystemStateService);

  readonly targets = input.required<HueTarget[]>();
  readonly mappingType = input<'light' | 'sensor' | 'button'>('light');

  readonly form = this.fb.group({
    target: [null as HueTarget | null, Validators.required],
    loxoneName: ['', [Validators.required, loxoneNameValidator()]],
    loxoneFormat: ['smart_actuator'],
    syncMode: ['http' as SyncMode]
  });

  get canSelectBidirectional(): boolean {
    const settings = this.systemState.settings();
    return !!(settings?.loxone_connection_configured && settings?.bidirectional_sync);
  }

  onTargetChange(): void {
    const target = this.form.controls.target.value;
    if (target && !this.form.controls.loxoneName.value) {
      this.form.controls.loxoneName.setValue(target.name);
    }
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const target = this.form.controls.target.value!;
    const mapping: Partial<DeviceMapping> = {
      loxone_name: this.form.controls.loxoneName.value!,
      hue_id: target.uuid,
      hue_name: target.name,
      hue_type: target.type as 'light' | 'group' | 'sensor' | 'button',
      sync_mode: this.form.controls.syncMode.value as SyncMode
    };

    if (this.mappingType() === 'light') {
      mapping.loxone_format = this.form.controls.loxoneFormat.value as 'rgb' | 'smart_actuator' | 'switch';
    }

    this.lightsState.addMapping(mapping);
    this.form.reset({ loxoneFormat: 'smart_actuator', syncMode: 'http' });
  }
}
