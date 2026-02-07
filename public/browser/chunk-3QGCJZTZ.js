import {
  ColorDotComponent
} from "./chunk-P4PK2U4R.js";
import {
  ExportButtonComponent
} from "./chunk-STIUHK2R.js";
import {
  EmptyStateComponent
} from "./chunk-KKD2F7FI.js";
import "./chunk-R2RN7UQH.js";
import {
  ApiService,
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardSubtitle,
  MatCardTitle,
  MatProgressSpinner,
  MatProgressSpinnerModule
} from "./chunk-4WNYHGTU.js";
import "./chunk-U6PUA6ML.js";
import "./chunk-YRPT3MG6.js";
import {
  MatButton,
  MatButtonModule,
  MatIcon,
  MatIconButton,
  MatIconModule
} from "./chunk-HOOTIT7M.js";
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  __spreadProps,
  __spreadValues,
  computed,
  inject,
  input,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-U74TQY52.js";

// src/app/features/scenes/services/scenes-state.service.ts
var ScenesStateService = class _ScenesStateService {
  api = inject(ApiService);
  scenesSignal = signal([]);
  activeScenesSignal = signal(/* @__PURE__ */ new Set());
  loadingSignal = signal(false);
  errorSignal = signal(null);
  activatingSignal = signal(/* @__PURE__ */ new Set());
  scenes = this.scenesSignal.asReadonly();
  activeScenes = this.activeScenesSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  activating = this.activatingSignal.asReadonly();
  scenesWithStatus = computed(() => {
    const active = this.activeScenes();
    return this.scenes().map((scene) => __spreadProps(__spreadValues({}, scene), {
      isActive: active.has(scene.uuid)
    }));
  });
  scenesByGroup = computed(() => {
    const groups = /* @__PURE__ */ new Map();
    this.scenesWithStatus().forEach((scene) => {
      const groupName = scene.group_name || "Other";
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName).push(scene);
    });
    return groups;
  });
  loadScenes() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.getScenes().subscribe({
      next: (scenes) => {
        this.scenesSignal.set(scenes);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }
  activateScene(uuid) {
    this.activatingSignal.update((set) => /* @__PURE__ */ new Set([...set, uuid]));
    this.api.activateScene(uuid).subscribe({
      next: () => {
        this.activeScenesSignal.update((set) => /* @__PURE__ */ new Set([...set, uuid]));
        this.activatingSignal.update((set) => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.activatingSignal.update((set) => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      }
    });
  }
  deactivateScene(uuid) {
    this.activatingSignal.update((set) => /* @__PURE__ */ new Set([...set, uuid]));
    this.api.deactivateScene(uuid).subscribe({
      next: () => {
        this.activeScenesSignal.update((set) => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
        this.activatingSignal.update((set) => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.activatingSignal.update((set) => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      }
    });
  }
  toggleScene(uuid) {
    if (this.activeScenes().has(uuid)) {
      this.deactivateScene(uuid);
    } else {
      this.activateScene(uuid);
    }
  }
  static \u0275fac = function ScenesStateService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ScenesStateService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ScenesStateService, factory: _ScenesStateService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScenesStateService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/features/scenes/components/scene-item/scene-item.component.ts
function SceneItemComponent_Conditional_4_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-color-dot", 7);
  }
  if (rf & 2) {
    const color_r1 = ctx.$implicit;
    \u0275\u0275property("xy", color_r1)("size", 12);
  }
}
function SceneItemComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 3);
    \u0275\u0275repeaterCreate(1, SceneItemComponent_Conditional_4_For_2_Template, 1, 2, "app-color-dot", 7, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.paletteColors());
  }
}
function SceneItemComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 5);
  }
}
function SceneItemComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 8);
    \u0275\u0275listener("click", function SceneItemComponent_Conditional_7_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggle());
    });
    \u0275\u0275elementStart(1, "mat-icon");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("color", ctx_r1.scene().isActive ? "warn" : "primary");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.scene().isActive ? "stop" : "play_arrow");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.scene().isActive ? "Deactivate" : "Activate", " ");
  }
}
var SceneItemComponent = class _SceneItemComponent {
  scenesState = inject(ScenesStateService);
  scene = input.required();
  paletteColors = computed(() => {
    const palette = this.scene().palette;
    if (!palette?.color)
      return [];
    return palette.color.slice(0, 5).map((c) => c.color.xy);
  });
  isActivating = computed(() => this.scenesState.activating().has(this.scene().uuid));
  toggle() {
    this.scenesState.toggleScene(this.scene().uuid);
  }
  static \u0275fac = function SceneItemComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SceneItemComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SceneItemComponent, selectors: [["app-scene-item"]], inputs: { scene: [1, "scene"] }, decls: 8, vars: 5, consts: [[1, "scene-item"], [1, "scene-info"], [1, "scene-name"], [1, "scene-palette"], [1, "scene-actions"], ["diameter", "24"], ["mat-stroked-button", "", 3, "color"], [3, "xy", "size"], ["mat-stroked-button", "", 3, "click", "color"]], template: function SceneItemComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2);
      \u0275\u0275text(3);
      \u0275\u0275elementEnd();
      \u0275\u0275template(4, SceneItemComponent_Conditional_4_Template, 3, 0, "div", 3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "div", 4);
      \u0275\u0275template(6, SceneItemComponent_Conditional_6_Template, 1, 0, "mat-spinner", 5)(7, SceneItemComponent_Conditional_7_Template, 4, 3, "button", 6);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275classProp("active", ctx.scene().isActive);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.scene().name);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.paletteColors().length > 0 ? 4 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.isActivating() ? 6 : 7);
    }
  }, dependencies: [MatButtonModule, MatButton, MatIconModule, MatIcon, MatProgressSpinnerModule, MatProgressSpinner, ColorDotComponent], styles: ["\n\n.scene-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n  transition: background-color 0.2s;\n}\nhtml.dark[_nghost-%COMP%]   .scene-item[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .scene-item[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n}\n.scene-item.active[_ngcontent-%COMP%] {\n  background: rgba(133, 196, 64, 0.1);\n  border: 1px solid rgba(133, 196, 64, 0.3);\n}\n.scene-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.scene-name[_ngcontent-%COMP%] {\n  font-weight: 500;\n  margin-bottom: 4px;\n}\n.scene-palette[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n}\n.scene-actions[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  margin-left: 16px;\n}\n/*# sourceMappingURL=scene-item.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SceneItemComponent, [{
    type: Component,
    args: [{ selector: "app-scene-item", standalone: true, imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, ColorDotComponent], template: `
    <div class="scene-item" [class.active]="scene().isActive">
      <div class="scene-info">
        <div class="scene-name">{{ scene().name }}</div>
        @if (paletteColors().length > 0) {
          <div class="scene-palette">
            @for (color of paletteColors(); track $index) {
              <app-color-dot [xy]="color" [size]="12" />
            }
          </div>
        }
      </div>
      <div class="scene-actions">
        @if (isActivating()) {
          <mat-spinner diameter="24"></mat-spinner>
        } @else {
          <button mat-stroked-button
                  [color]="scene().isActive ? 'warn' : 'primary'"
                  (click)="toggle()">
            <mat-icon>{{ scene().isActive ? 'stop' : 'play_arrow' }}</mat-icon>
            {{ scene().isActive ? 'Deactivate' : 'Activate' }}
          </button>
        }
      </div>
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;2b27c1271d5504644ae2bdbbd262d3e25a684fa747de09e95685f10b1f770819;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/scenes/components/scene-item/scene-item.component.ts */\n.scene-item {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n  transition: background-color 0.2s;\n}\n:host-context(html.dark) .scene-item {\n  background: rgba(255, 255, 255, 0.05);\n}\n.scene-item.active {\n  background: rgba(133, 196, 64, 0.1);\n  border: 1px solid rgba(133, 196, 64, 0.3);\n}\n.scene-info {\n  flex: 1;\n  min-width: 0;\n}\n.scene-name {\n  font-weight: 500;\n  margin-bottom: 4px;\n}\n.scene-palette {\n  display: flex;\n  gap: 4px;\n}\n.scene-actions {\n  flex-shrink: 0;\n  margin-left: 16px;\n}\n/*# sourceMappingURL=scene-item.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SceneItemComponent, { className: "SceneItemComponent", filePath: "src/app/features/scenes/components/scene-item/scene-item.component.ts", lineNumber: 81 });
})();

// src/app/features/scenes/components/scene-list/scene-list.component.ts
var _forTrack0 = ($index, $item) => $item.uuid;
function SceneListComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-scene-item", 1);
  }
  if (rf & 2) {
    const scene_r1 = ctx.$implicit;
    \u0275\u0275property("scene", scene_r1);
  }
}
var SceneListComponent = class _SceneListComponent {
  scenes = input.required();
  static \u0275fac = function SceneListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SceneListComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SceneListComponent, selectors: [["app-scene-list"]], inputs: { scenes: [1, "scenes"] }, decls: 3, vars: 0, consts: [[1, "scene-list"], [3, "scene"]], template: function SceneListComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275repeaterCreate(1, SceneListComponent_For_2_Template, 1, 1, "app-scene-item", 1, _forTrack0);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.scenes());
    }
  }, dependencies: [SceneItemComponent], styles: ["\n\n.scene-list[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 12px;\n}\n/*# sourceMappingURL=scene-list.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SceneListComponent, [{
    type: Component,
    args: [{ selector: "app-scene-list", standalone: true, imports: [SceneItemComponent], template: `
    <div class="scene-list">
      @for (scene of scenes(); track scene.uuid) {
        <app-scene-item [scene]="scene" />
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;48094e6ef2fea123e1c7e79f1341059debda867d7d2f2269f7a8f6f136e39105;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/scenes/components/scene-list/scene-list.component.ts */\n.scene-list {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 12px;\n}\n/*# sourceMappingURL=scene-list.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SceneListComponent, { className: "SceneListComponent", filePath: "src/app/features/scenes/components/scene-list/scene-list.component.ts", lineNumber: 25 });
})();

// src/app/features/scenes/components/scenes-page/scenes-page.component.ts
var _forTrack02 = ($index, $item) => $item[0];
function ScenesPageComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275element(1, "mat-spinner", 3);
    \u0275\u0275elementEnd();
  }
}
function ScenesPageComponent_Conditional_2_Conditional_8_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 9)(1, "mat-card-header")(2, "mat-card-title");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "mat-card-subtitle");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "mat-card-content");
    \u0275\u0275element(7, "app-scene-list", 10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const entry_r3 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(entry_r3[0]);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", entry_r3[1].length, " scenes");
    \u0275\u0275advance(2);
    \u0275\u0275property("scenes", entry_r3[1]);
  }
}
function ScenesPageComponent_Conditional_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, ScenesPageComponent_Conditional_2_Conditional_8_For_1_Template, 8, 3, "mat-card", 9, _forTrack02);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r1.groupEntries);
  }
}
function ScenesPageComponent_Conditional_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-empty-state", 8);
  }
}
function ScenesPageComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 4)(1, "h2");
    \u0275\u0275text(2, "Hue Scenes");
    \u0275\u0275elementEnd();
    \u0275\u0275element(3, "span", 5)(4, "app-export-button", 6);
    \u0275\u0275elementStart(5, "button", 7);
    \u0275\u0275listener("click", function ScenesPageComponent_Conditional_2_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.refresh());
    });
    \u0275\u0275elementStart(6, "mat-icon");
    \u0275\u0275text(7, "refresh");
    \u0275\u0275elementEnd()()();
    \u0275\u0275template(8, ScenesPageComponent_Conditional_2_Conditional_8_Template, 2, 0)(9, ScenesPageComponent_Conditional_2_Conditional_9_Template, 1, 0, "app-empty-state", 8);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(8);
    \u0275\u0275conditional(ctx_r1.state.scenes().length > 0 ? 8 : 9);
  }
}
function ScenesPageComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.state.error(), " ");
  }
}
var ScenesPageComponent = class _ScenesPageComponent {
  state = inject(ScenesStateService);
  get groupEntries() {
    return Array.from(this.state.scenesByGroup().entries());
  }
  ngOnInit() {
    this.state.loadScenes();
  }
  refresh() {
    this.state.loadScenes();
  }
  static \u0275fac = function ScenesPageComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ScenesPageComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ScenesPageComponent, selectors: [["app-scenes-page"]], decls: 4, vars: 2, consts: [[1, "scenes-page"], [1, "loading-container"], [1, "error-banner"], ["diameter", "40"], [1, "page-header"], [1, "flex-spacer"], ["exportType", "scenes"], ["mat-icon-button", "", 3, "click"], ["icon", "palette", "title", "No scenes found", "message", "Create scenes in the Philips Hue app first"], [1, "group-card"], [3, "scenes"]], template: function ScenesPageComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275template(1, ScenesPageComponent_Conditional_1_Template, 2, 0, "div", 1)(2, ScenesPageComponent_Conditional_2_Template, 10, 1)(3, ScenesPageComponent_Conditional_3_Template, 2, 1, "div", 2);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.state.loading() ? 1 : 2);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.state.error() ? 3 : -1);
    }
  }, dependencies: [
    MatCardModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatProgressSpinnerModule,
    MatProgressSpinner,
    MatButtonModule,
    MatIconButton,
    MatIconModule,
    MatIcon,
    SceneListComponent,
    ExportButtonComponent,
    EmptyStateComponent
  ], styles: ["\n\n.scenes-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n.page-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n}\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.group-card[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.error-banner[_ngcontent-%COMP%] {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=scenes-page.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScenesPageComponent, [{
    type: Component,
    args: [{ selector: "app-scenes-page", standalone: true, imports: [
      MatCardModule,
      MatProgressSpinnerModule,
      MatButtonModule,
      MatIconModule,
      SceneListComponent,
      ExportButtonComponent,
      EmptyStateComponent
    ], template: `
    <div class="scenes-page">
      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="page-header">
          <h2>Hue Scenes</h2>
          <span class="flex-spacer"></span>
          <app-export-button exportType="scenes" />
          <button mat-icon-button (click)="refresh()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        @if (state.scenes().length > 0) {
          @for (entry of groupEntries; track entry[0]) {
            <mat-card class="group-card">
              <mat-card-header>
                <mat-card-title>{{ entry[0] }}</mat-card-title>
                <mat-card-subtitle>{{ entry[1].length }} scenes</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <app-scene-list [scenes]="entry[1]" />
              </mat-card-content>
            </mat-card>
          }
        } @else {
          <app-empty-state
            icon="palette"
            title="No scenes found"
            message="Create scenes in the Philips Hue app first">
          </app-empty-state>
        }
      }

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;588c21bc1e8f2911419af42c2cdede918cc58864cddd2a681beb120d4a00363c;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/scenes/components/scenes-page/scenes-page.component.ts */\n.scenes-page {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.page-header {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n.page-header h2 {\n  margin: 0;\n}\n.loading-container {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.group-card {\n  margin-bottom: 16px;\n}\n.error-banner {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=scenes-page.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ScenesPageComponent, { className: "ScenesPageComponent", filePath: "src/app/features/scenes/components/scenes-page/scenes-page.component.ts", lineNumber: 103 });
})();

// src/app/features/scenes/scenes.routes.ts
var SCENES_ROUTES = [
  { path: "", component: ScenesPageComponent }
];
export {
  SCENES_ROUTES
};
//# sourceMappingURL=chunk-3QGCJZTZ.js.map
