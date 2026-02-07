import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LightsStateService } from '../../services/lights-state.service';

@Component({
  selector: 'app-detected-commands',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  template: `
    @if (hasDetected()) {
      <mat-card class="detected-card">
        <mat-card-header>
          <mat-icon matCardAvatar>notification_important</mat-icon>
          <mat-card-title>New Loxone Commands Detected</mat-card-title>
          <mat-card-subtitle>Click a command to create a mapping</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-chip-set>
            @for (item of state.detected(); track item.name) {
              <mat-chip (click)="useDetected(item.name)">
                {{ item.name }}
                @if (item.value) {
                  <span class="value">= {{ item.value }}</span>
                }
              </mat-chip>
            }
          </mat-chip-set>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-button color="warn" (click)="clearAll()">
            <mat-icon>clear_all</mat-icon>
            Clear All
          </button>
        </mat-card-actions>
      </mat-card>
    }
  `,
  styles: [`
    .detected-card {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
      margin-bottom: 16px;
    }

    :host-context(html.dark) .detected-card {
      background: linear-gradient(135deg, #3e2723 0%, #4e342e 100%);
    }

    mat-card-header {
      margin-bottom: 8px;
    }

    mat-chip {
      cursor: pointer;
    }

    .value {
      opacity: 0.6;
      margin-left: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetectedCommandsComponent {
  readonly state = inject(LightsStateService);

  readonly hasDetected = computed(() => this.state.detected().length > 0);

  useDetected(name: string): void {
    // This would typically open the form with the name pre-filled
    // For now, we'll just log it
    console.log('Use detected command:', name);
  }

  clearAll(): void {
    this.state.clearDetected();
  }
}
