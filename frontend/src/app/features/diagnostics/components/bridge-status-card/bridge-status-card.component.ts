import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BridgeStatus } from '../../../../core/models';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-bridge-status-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, BadgeComponent],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-icon matCardAvatar>router</mat-icon>
        <mat-card-title>Hue Bridge</mat-card-title>
        <mat-card-subtitle>{{ bridge().ip }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="bridge-info">
          <div class="info-item">
            <span class="label">Status</span>
            <app-badge
              [variant]="bridge().connected ? 'on' : 'unreachable'"
              [text]="bridge().connected ? 'Connected' : 'Disconnected'" />
          </div>
          @if (bridge().api_version) {
            <div class="info-item">
              <span class="label">API Version</span>
              <span class="value">{{ bridge().api_version }}</span>
            </div>
          }
          @if (bridge().software_version) {
            <div class="info-item">
              <span class="label">Software Version</span>
              <span class="value">{{ bridge().software_version }}</span>
            </div>
          }
          @if (bridge().zigbee_channel) {
            <div class="info-item">
              <span class="label">Zigbee Channel</span>
              <span class="value">{{ bridge().zigbee_channel }}</span>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .bridge-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 0.75rem;
      opacity: 0.6;
      text-transform: uppercase;
    }

    .value {
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BridgeStatusCardComponent {
  readonly bridge = input.required<BridgeStatus>();
}
