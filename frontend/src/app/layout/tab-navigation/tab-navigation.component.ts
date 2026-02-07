import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

interface TabItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatTabsModule, MatIconModule],
  template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel" class="tab-nav">
      @for (tab of tabs; track tab.path) {
        <a mat-tab-link
           [routerLink]="tab.path"
           routerLinkActive
           #rla="routerLinkActive"
           [active]="rla.isActive">
          <mat-icon class="tab-icon">{{ tab.icon }}</mat-icon>
          <span class="tab-label">{{ tab.label }}</span>
        </a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>
  `,
  styles: [`
    .tab-nav {
      background: var(--mat-tab-header-background-color);
      border-bottom: 1px solid var(--mat-divider-color);
    }

    .tab-icon {
      margin-right: 8px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .tab-label {
      white-space: nowrap;
    }

    @media (max-width: 900px) {
      .tab-label {
        display: none;
      }

      .tab-icon {
        margin-right: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabNavigationComponent {
  readonly tabs: TabItem[] = [
    { path: '/lights', label: 'Lights', icon: 'lightbulb' },
    { path: '/sensors', label: 'Sensors', icon: 'sensors' },
    { path: '/buttons', label: 'Buttons', icon: 'radio_button_checked' },
    { path: '/scenes', label: 'Scenes', icon: 'palette' },
    { path: '/light-controllers', label: 'Light Controllers', icon: 'tune' },
    { path: '/system', label: 'System', icon: 'settings' },
    { path: '/diagnostics', label: 'Diagnostics', icon: 'monitor_heart' }
  ];
}
