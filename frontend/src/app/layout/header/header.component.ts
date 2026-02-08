import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <mat-toolbar class="header">
      <div class="logo-container">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2385c440'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E"
             alt="Logo"
             class="logo" />
        <span class="title">Loxone-Hue-Bridge</span>
      </div>
      <span class="spacer"></span>
      <button mat-icon-button
              (click)="toggleTheme()"
              [matTooltip]="themeService.resolvedTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <mat-icon>{{ themeService.resolvedTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      background: var(--mat-toolbar-container-background-color);
      border-bottom: 1px solid var(--mat-divider-color);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      width: 32px;
      height: 32px;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 500;
      color: #85c440;
    }

    .spacer {
      flex: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
