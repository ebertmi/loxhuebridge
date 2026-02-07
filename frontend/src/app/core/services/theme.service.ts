import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'loxhuebridge-theme';

  private readonly themeSignal = signal<Theme>('system');
  private readonly resolvedThemeSignal = signal<'light' | 'dark'>('light');

  readonly theme = this.themeSignal.asReadonly();
  readonly resolvedTheme = this.resolvedThemeSignal.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.storageKey) as Theme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        this.themeSignal.set(saved);
      }

      this.updateResolvedTheme();

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.updateResolvedTheme();
        }
      });

      effect(() => {
        const theme = this.theme();
        localStorage.setItem(this.storageKey, theme);
        this.updateResolvedTheme();
      });
    }
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  toggleTheme(): void {
    const current = this.resolvedTheme();
    this.themeSignal.set(current === 'light' ? 'dark' : 'light');
  }

  private updateResolvedTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const theme = this.theme();
    let resolved: 'light' | 'dark';

    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }

    this.resolvedThemeSignal.set(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }
}
