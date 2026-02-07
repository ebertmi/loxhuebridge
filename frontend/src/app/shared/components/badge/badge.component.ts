import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'on' | 'off' | 'brightness' | 'battery' | 'temperature' | 'motion' | 'unreachable' | 'default';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="badgeClasses()">
      @if (icon()) {
        <span class="badge-icon">{{ icon() }}</span>
      }
      <span class="badge-text">{{ text() }}</span>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .badge-icon {
      font-size: 0.875rem;
    }

    .badge-on {
      background-color: #4caf50;
      color: white;
    }

    .badge-off {
      background-color: #9e9e9e;
      color: white;
    }

    .badge-brightness {
      background-color: #ff9800;
      color: white;
    }

    .badge-battery {
      background-color: #2196f3;
      color: white;
    }

    .badge-battery.low {
      background-color: #f44336;
    }

    .badge-temperature {
      background-color: #9c27b0;
      color: white;
    }

    .badge-motion {
      background-color: #e91e63;
      color: white;
    }

    .badge-unreachable {
      background-color: #f44336;
      color: white;
    }

    .badge-default {
      background-color: rgba(0, 0, 0, 0.08);
      color: inherit;
    }

    :host-context(html.dark) .badge-default {
      background-color: rgba(255, 255, 255, 0.12);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly text = input.required<string>();
  readonly icon = input<string>();
  readonly lowBattery = input(false);

  readonly badgeClasses = computed(() => {
    const classes = ['badge', `badge-${this.variant()}`];
    if (this.variant() === 'battery' && this.lowBattery()) {
      classes.push('low');
    }
    return classes.join(' ');
  });
}
