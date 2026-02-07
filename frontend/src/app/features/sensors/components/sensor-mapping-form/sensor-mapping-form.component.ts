import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HueTarget, DeviceMapping } from '../../../../core/models';
import { SensorsStateService } from '../../services/sensors-state.service';
import { loxoneNameValidator } from '../../../../shared/utils/validators';

@Component({
  selector: 'app-sensor-mapping-form',
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
        <mat-label>Select Sensor</mat-label>
        <mat-select formControlName="target" (selectionChange)="onTargetChange()">
          @for (target of targets(); track target.uuid) {
            <mat-option [value]="target">
              <span class="target-option">
                <span class="target-name">{{ target.name }}</span>
                <span class="target-type">{{ target.type }}</span>
              </span>
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="name-field">
        <mat-label>Loxone Virtual Input Name</mat-label>
        <input matInput formControlName="loxoneName" placeholder="e.g., Motion Sensor Living Room">
        @if (form.controls.loxoneName.hasError('required')) {
          <mat-error>Name is required</mat-error>
        }
        @if (form.controls.loxoneName.hasError('invalidLoxoneName')) {
          <mat-error>Invalid characters in name</mat-error>
        }
      </mat-form-field>

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

    .target-option {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .target-type {
      opacity: 0.6;
      font-size: 0.875em;
    }

    button {
      height: 56px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SensorMappingFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly sensorsState = inject(SensorsStateService);

  readonly targets = input.required<HueTarget[]>();

  readonly form = this.fb.group({
    target: [null as HueTarget | null, Validators.required],
    loxoneName: ['', [Validators.required, loxoneNameValidator()]]
  });

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
      hue_type: 'sensor',
      sync_mode: 'http' as const
    };

    this.sensorsState.addMapping(mapping);
    this.form.reset();
  }
}
