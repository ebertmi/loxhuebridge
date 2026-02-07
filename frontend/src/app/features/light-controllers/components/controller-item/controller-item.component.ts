import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoxoneControl, LoxoneSubControl } from '../../../../core/models';
import { LightControllersStateService } from '../../services/light-controllers-state.service';

@Component({
  selector: 'app-controller-item',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="controller-card">
      <div class="controller-header">
        <div class="controller-info">
          <span class="controller-name">{{ control().name }}</span>
          @if (control().room) {
            <span class="controller-room">{{ control().room }}</span>
          }
          <span class="controller-type">{{ control().type }}</span>
        </div>

        <div class="controller-controls">
          @if (isSending()) {
            <mat-spinner diameter="24"></mat-spinner>
          } @else if (control().type === 'LightControllerV2' && moods().length > 0) {
            <mat-chip-set>
              @for (mood of moods(); track mood.id) {
                <mat-chip
                  [highlighted]="mood.isActive"
                  (click)="selectMood(mood.id)">
                  {{ mood.name }}
                </mat-chip>
              }
            </mat-chip-set>
          }
        </div>
      </div>

      @if (control().subControls && control().subControls!.length > 0) {
        <div class="subcontrols">
          @for (sub of control().subControls; track sub.uuid) {
            <div class="subcontrol-item">
              <div class="subcontrol-info">
                <div class="subcontrol-header">
                  <span class="subcontrol-name">{{ sub.name }}</span>
                  <span class="subcontrol-type">{{ getSubControlTypeDisplay(sub) }}</span>
                </div>
                <div class="subcontrol-uuid">
                  <code>{{ sub.uuid }}</code>
                  <button mat-icon-button (click)="copyUuid(sub.uuid)" matTooltip="UUID kopieren" class="copy-btn">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
              </div>

              <div class="subcontrol-controls">
                @switch (sub.type) {
                  @case ('Switch') {
                    <button
                      [class]="getSubControlActive(sub) ? 'status-btn active' : 'status-btn'"
                      mat-flat-button
                      (click)="sendSubCommand(sub.uuid, getSubControlActive(sub) ? 'Off' : 'On')">
                      @if (getSubControlActive(sub)) {
                        <mat-icon>lightbulb</mat-icon> AN
                      } @else {
                        <mat-icon>lightbulb_outline</mat-icon> AUS
                      }
                    </button>
                  }
                  @case ('Dimmer') {
                    <div class="dimmer-display">
                      <span class="dimmer-label">Helligkeit</span>
                      <span class="dimmer-value">{{ getSubControlPosition(sub) }}%</span>
                    </div>
                  }
                  @case ('ColorPickerV2') {
                    <div class="color-display">
                      <div class="color-preview" [style.background]="getColorPreview(sub)"></div>
                      <span class="color-value">{{ getSubControlColor(sub) }}</span>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .controller-card {
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.02);
      overflow: hidden;
    }

    :host-context(html.dark) .controller-card {
      background: rgba(255, 255, 255, 0.05);
    }

    .controller-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .controller-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .controller-name {
      font-weight: 600;
      font-size: 1.1em;
    }

    .controller-room {
      font-size: 0.875em;
      opacity: 0.6;
    }

    .controller-type {
      font-size: 0.75em;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(133, 196, 64, 0.2);
      color: #85c440;
    }

    .controller-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-chip-set {
      max-width: 400px;
    }

    mat-chip {
      cursor: pointer;
    }

    .subcontrols {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    :host-context(html.dark) .subcontrols {
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    .subcontrol-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 6px;
      gap: 16px;
    }

    :host-context(html.dark) .subcontrol-item {
      background: rgba(255, 255, 255, 0.03);
    }

    .subcontrol-info {
      flex: 1;
      min-width: 0;
    }

    .subcontrol-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .subcontrol-name {
      font-weight: 500;
    }

    .subcontrol-type {
      font-size: 0.75em;
      opacity: 0.6;
    }

    .subcontrol-uuid {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .subcontrol-uuid code {
      font-size: 0.7em;
      opacity: 0.5;
      font-family: monospace;
    }

    .copy-btn {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .copy-btn mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .subcontrol-controls {
      flex-shrink: 0;
    }

    .status-btn {
      min-width: 100px;
    }

    .status-btn.active {
      background: #85c440;
      color: white;
    }

    .dimmer-display, .color-display {
      text-align: right;
    }

    .dimmer-label, .color-value {
      font-size: 0.75em;
      opacity: 0.6;
      display: block;
    }

    .dimmer-value {
      font-size: 1.1em;
      font-weight: 600;
      color: #85c440;
    }

    .color-preview {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(0, 0, 0, 0.1);
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }

    :host-context(html.dark) .color-preview {
      border-color: rgba(255, 255, 255, 0.2);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControllerItemComponent {
  private readonly state = inject(LightControllersStateService);

  readonly control = input.required<LoxoneControl>();

  readonly isSending = computed(() =>
    this.state.sendingCommand().has(this.control().uuid)
  );

  readonly isOn = computed(() => {
    const stateValues = this.control().stateValues;
    if (!stateValues) return false;
    const active = stateValues['active'];
    const value = stateValues['value'];
    const position = stateValues['position'];
    return active === 1 || (typeof value === 'number' && value > 0) || (typeof position === 'number' && position > 0);
  });

  readonly moods = computed(() => {
    const moodInfo = this.control().moodInfo;
    if (!moodInfo?.moodList) return [];
    const activeIds = new Set(moodInfo.activeMoodIds || []);
    return moodInfo.moodList.map(mood => ({
      ...mood,
      isActive: activeIds.has(mood.id)
    }));
  });

  sendCommand(command: string): void {
    this.state.sendCommand(this.control().uuid, command);
  }

  sendSubCommand(uuid: string, command: string): void {
    this.state.sendCommand(uuid, command);
  }

  toggleSwitch(): void {
    this.sendCommand(this.isOn() ? 'Off' : 'On');
  }

  selectMood(moodId: number): void {
    this.sendCommand(`changeTo/${moodId}`);
  }

  copyUuid(uuid: string): void {
    navigator.clipboard.writeText(uuid);
  }

  getSubControlTypeDisplay(sub: LoxoneSubControl): string {
    if (sub.type === 'ColorPickerV2' && sub.details?.['pickerType']) {
      return `${sub.type} (${sub.details['pickerType']})`;
    }
    return sub.type;
  }

  getSubControlActive(sub: LoxoneSubControl): boolean {
    return sub.stateValues?.['active'] === 1;
  }

  getSubControlPosition(sub: LoxoneSubControl): number {
    const position = sub.stateValues?.['position'];
    return typeof position === 'number' ? Math.round(position) : 0;
  }

  getSubControlColor(sub: LoxoneSubControl): string {
    const color = sub.stateValues?.['color'];
    return typeof color === 'string' ? color : '';
  }

  getColorPreview(sub: LoxoneSubControl): string {
    const colorValue = this.getSubControlColor(sub);
    if (!colorValue) return 'transparent';

    // Parse Loxone color formats
    if (colorValue.startsWith('hsv(')) {
      const match = colorValue.match(/hsv\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const [, h, s, v] = match.map(Number);
        return this.hsvToRgb(h, s, v);
      }
    } else if (colorValue.startsWith('temp(')) {
      const match = colorValue.match(/temp\((\d+),(\d+)\)/);
      if (match) {
        const [, brightness, kelvin] = match.map(Number);
        return this.kelvinToRgb(kelvin, brightness);
      }
    }
    return 'transparent';
  }

  private hsvToRgb(h: number, s: number, v: number): string {
    s = s / 100;
    v = v / 100;
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;

    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;
  }

  private kelvinToRgb(kelvin: number, brightness: number): string {
    const temp = kelvin / 100;
    let r: number, g: number, b: number;

    if (temp <= 66) {
      r = 255;
      g = Math.min(255, Math.max(0, 99.4708025861 * Math.log(temp) - 161.1195681661));
    } else {
      r = Math.min(255, Math.max(0, 329.698727446 * Math.pow(temp - 60, -0.1332047592)));
      g = Math.min(255, Math.max(0, 288.1221695283 * Math.pow(temp - 60, -0.0755148492)));
    }

    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = Math.min(255, Math.max(0, 138.5177312231 * Math.log(temp - 10) - 305.0447927307));
    }

    const factor = brightness / 100;
    return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
  }
}
