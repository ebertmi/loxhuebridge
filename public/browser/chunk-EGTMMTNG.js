import {
  ApiService
} from "./chunk-4WNYHGTU.js";
import {
  Injectable,
  computed,
  inject,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-U74TQY52.js";

// src/app/features/system/services/logs-state.service.ts
var SystemStateService = class _SystemStateService {
  api = inject(ApiService);
  logsSignal = signal([]);
  settingsSignal = signal(null);
  filterSignal = signal("ALL");
  loadingSignal = signal(false);
  errorSignal = signal(null);
  logs = this.logsSignal.asReadonly();
  settings = this.settingsSignal.asReadonly();
  filter = this.filterSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  filteredLogs = computed(() => {
    const filter = this.filter();
    const logs = this.logs();
    if (filter === "ALL")
      return logs;
    return logs.filter((log) => log.cat === filter);
  });
  logCategories = computed(() => {
    const categories = /* @__PURE__ */ new Set();
    this.logs().forEach((log) => categories.add(log.cat));
    return Array.from(categories).sort();
  });
  pollingInterval = null;
  loadSettings() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.getSettings().subscribe({
      next: (settings) => {
        this.settingsSignal.set(settings);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }
  updateSettings(settings) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.updateSettings(settings).subscribe({
      next: (updated) => {
        this.settingsSignal.set(updated);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }
  loadLogs() {
    this.api.getLogs().subscribe({
      next: (logs) => {
        this.logsSignal.set(logs);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
      }
    });
  }
  clearLogs() {
    this.api.clearLogs().subscribe({
      next: () => {
        this.logsSignal.set([]);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
      }
    });
  }
  setFilter(filter) {
    this.filterSignal.set(filter);
  }
  startPolling(intervalMs = 2e3) {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      this.loadLogs();
    }, intervalMs);
  }
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  static \u0275fac = function SystemStateService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SystemStateService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SystemStateService, factory: _SystemStateService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SystemStateService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  SystemStateService
};
//# sourceMappingURL=chunk-EGTMMTNG.js.map
