import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

export interface DiscoveredBridge {
  ip: string;
  id: string;
}

export type SetupStep = 'discover' | 'register' | 'loxone' | 'complete';

@Injectable({ providedIn: 'root' })
export class SetupStateService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly currentStepSignal = signal<SetupStep>('discover');
  private readonly bridgesSignal = signal<DiscoveredBridge[]>([]);
  private readonly selectedBridgeSignal = signal<DiscoveredBridge | null>(null);
  private readonly apiKeySignal = signal<string | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly currentStep = this.currentStepSignal.asReadonly();
  readonly bridges = this.bridgesSignal.asReadonly();
  readonly selectedBridge = this.selectedBridgeSignal.asReadonly();
  readonly apiKey = this.apiKeySignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly stepIndex = computed(() => {
    const steps: SetupStep[] = ['discover', 'register', 'loxone', 'complete'];
    return steps.indexOf(this.currentStep());
  });

  discoverBridges(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.discoverBridges().subscribe({
      next: (bridges) => {
        this.bridgesSignal.set(bridges);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  selectBridge(bridge: DiscoveredBridge): void {
    this.selectedBridgeSignal.set(bridge);
    this.currentStepSignal.set('register');
  }

  selectBridgeManual(ip: string): void {
    this.selectedBridgeSignal.set({ ip, id: 'manual' });
    this.currentStepSignal.set('register');
  }

  registerBridge(): void {
    const bridge = this.selectedBridge();
    if (!bridge) return;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.registerBridge(bridge.ip).subscribe({
      next: (result) => {
        if (result.success && result.api_key) {
          this.apiKeySignal.set(result.api_key);
          this.currentStepSignal.set('loxone');
        } else {
          this.errorSignal.set(result.error || 'Registration failed. Press the link button on your bridge and try again.');
        }
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  saveLoxoneConfig(
    loxoneIp: string,
    loxonePort: number,
    loxoneUser?: string,
    loxonePassword?: string,
    loxoneHttpPort?: number
  ): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const config: Record<string, any> = { loxoneIp, loxonePort };
    if (loxoneUser && loxonePassword) {
      config.loxoneUser = loxoneUser;
      config.loxonePassword = loxonePassword;
      config.loxoneHttpPort = loxoneHttpPort || 80;
    }

    this.api.saveLoxoneConfig(config as any).subscribe({
      next: () => {
        this.currentStepSignal.set('complete');
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }

  goBack(): void {
    const step = this.currentStep();
    switch (step) {
      case 'register':
        this.currentStepSignal.set('discover');
        break;
      case 'loxone':
        this.currentStepSignal.set('register');
        break;
    }
  }

  finishSetup(): void {
    this.router.navigate(['/']);
  }

  reset(): void {
    this.currentStepSignal.set('discover');
    this.bridgesSignal.set([]);
    this.selectedBridgeSignal.set(null);
    this.apiKeySignal.set(null);
    this.errorSignal.set(null);
  }
}
