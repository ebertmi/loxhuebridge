import {
  MatChip,
  MatChipSet,
  MatChipsModule
} from "./chunk-2OODSGSP.js";
import {
  EmptyStateComponent
} from "./chunk-KKD2F7FI.js";
import {
  MatTooltip,
  MatTooltipModule
} from "./chunk-R2RN7UQH.js";
import {
  MatSlideToggleModule
} from "./chunk-OY2S3K7Q.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MatFormField,
  MatFormFieldModule,
  MatInput,
  MatInputModule,
  MatLabel,
  MatSuffix,
  NgControlStatus,
  NgModel
} from "./chunk-D4AT3CLM.js";
import "./chunk-FL3KYB4C.js";
import {
  ApiService,
  MatCard,
  MatCardAvatar,
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
  ɵɵclassMap,
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
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-U74TQY52.js";

// src/app/features/light-controllers/services/light-controllers-state.service.ts
var LightControllersStateService = class _LightControllersStateService {
  api = inject(ApiService);
  controlsSignal = signal([]);
  searchTermSignal = signal("");
  loadingSignal = signal(false);
  errorSignal = signal(null);
  sendingCommandSignal = signal(/* @__PURE__ */ new Set());
  controls = this.controlsSignal.asReadonly();
  searchTerm = this.searchTermSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  sendingCommand = this.sendingCommandSignal.asReadonly();
  filteredControls = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const controls = this.controls();
    if (!term)
      return controls;
    return controls.filter((c) => c.name.toLowerCase().includes(term) || c.type.toLowerCase().includes(term) || c.room?.toLowerCase().includes(term));
  });
  controlsByType = computed(() => {
    const types = /* @__PURE__ */ new Map();
    this.filteredControls().forEach((control) => {
      const type = control.type;
      if (!types.has(type)) {
        types.set(type, []);
      }
      types.get(type).push(control);
    });
    return types;
  });
  availableTypes = computed(() => {
    const types = /* @__PURE__ */ new Set();
    this.controls().forEach((c) => types.add(c.type));
    return Array.from(types).sort();
  });
  loadControls() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.getLoxoneControls().subscribe({
      next: (controls) => {
        this.controlsSignal.set(controls);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
      }
    });
  }
  setSearchTerm(term) {
    this.searchTermSignal.set(term);
  }
  sendCommand(uuid, command) {
    this.sendingCommandSignal.update((set) => /* @__PURE__ */ new Set([...set, uuid]));
    this.api.sendLoxoneCommand(uuid, command).subscribe({
      next: () => {
        this.sendingCommandSignal.update((set) => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.sendingCommandSignal.update((set) => {
          const newSet = new Set(set);
          newSet.delete(uuid);
          return newSet;
        });
      }
    });
  }
  static \u0275fac = function LightControllersStateService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LightControllersStateService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _LightControllersStateService, factory: _LightControllersStateService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LightControllersStateService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/features/light-controllers/components/controller-item/controller-item.component.ts
var _forTrack0 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.uuid;
function ControllerItemComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 4);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.control().room);
  }
}
function ControllerItemComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 7);
  }
}
function ControllerItemComponent_Conditional_10_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-chip", 10);
    \u0275\u0275listener("click", function ControllerItemComponent_Conditional_10_For_2_Template_mat_chip_click_0_listener() {
      const mood_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.selectMood(mood_r3.id));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mood_r3 = ctx.$implicit;
    \u0275\u0275property("highlighted", mood_r3.isActive);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", mood_r3.name, " ");
  }
}
function ControllerItemComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-chip-set");
    \u0275\u0275repeaterCreate(1, ControllerItemComponent_Conditional_10_For_2_Template, 2, 2, "mat-chip", 9, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r0.moods());
  }
}
function ControllerItemComponent_Conditional_11_For_2_Case_14_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-icon");
    \u0275\u0275text(1, "lightbulb");
    \u0275\u0275elementEnd();
    \u0275\u0275text(2, " AN ");
  }
}
function ControllerItemComponent_Conditional_11_For_2_Case_14_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-icon");
    \u0275\u0275text(1, "lightbulb_outline");
    \u0275\u0275elementEnd();
    \u0275\u0275text(2, " AUS ");
  }
}
function ControllerItemComponent_Conditional_11_For_2_Case_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 22);
    \u0275\u0275listener("click", function ControllerItemComponent_Conditional_11_For_2_Case_14_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r6);
      const sub_r5 = \u0275\u0275nextContext().$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.sendSubCommand(sub_r5.uuid, ctx_r0.getSubControlActive(sub_r5) ? "Off" : "On"));
    });
    \u0275\u0275template(1, ControllerItemComponent_Conditional_11_For_2_Case_14_Conditional_1_Template, 3, 0)(2, ControllerItemComponent_Conditional_11_For_2_Case_14_Conditional_2_Template, 3, 0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sub_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275classMap(ctx_r0.getSubControlActive(sub_r5) ? "status-btn active" : "status-btn");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.getSubControlActive(sub_r5) ? 1 : 2);
  }
}
function ControllerItemComponent_Conditional_11_For_2_Case_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 20)(1, "span", 23);
    \u0275\u0275text(2, "Helligkeit");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 24);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const sub_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("", ctx_r0.getSubControlPosition(sub_r5), "%");
  }
}
function ControllerItemComponent_Conditional_11_For_2_Case_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275element(1, "div", 25);
    \u0275\u0275elementStart(2, "span", 26);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const sub_r5 = \u0275\u0275nextContext().$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", ctx_r0.getColorPreview(sub_r5));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.getSubControlColor(sub_r5));
  }
}
function ControllerItemComponent_Conditional_11_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 11)(1, "div", 12)(2, "div", 13)(3, "span", 14);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 15);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 16)(8, "code");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 17);
    \u0275\u0275listener("click", function ControllerItemComponent_Conditional_11_For_2_Template_button_click_10_listener() {
      const sub_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.copyUuid(sub_r5.uuid));
    });
    \u0275\u0275elementStart(11, "mat-icon");
    \u0275\u0275text(12, "content_copy");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(13, "div", 18);
    \u0275\u0275template(14, ControllerItemComponent_Conditional_11_For_2_Case_14_Template, 3, 3, "button", 19)(15, ControllerItemComponent_Conditional_11_For_2_Case_15_Template, 5, 1, "div", 20)(16, ControllerItemComponent_Conditional_11_For_2_Case_16_Template, 4, 3, "div", 21);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_14_0;
    const sub_r5 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(sub_r5.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.getSubControlTypeDisplay(sub_r5));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(sub_r5.uuid);
    \u0275\u0275advance(5);
    \u0275\u0275conditional((tmp_14_0 = sub_r5.type) === "Switch" ? 14 : tmp_14_0 === "Dimmer" ? 15 : tmp_14_0 === "ColorPickerV2" ? 16 : -1);
  }
}
function ControllerItemComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275repeaterCreate(1, ControllerItemComponent_Conditional_11_For_2_Template, 17, 4, "div", 11, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r0.control().subControls);
  }
}
var ControllerItemComponent = class _ControllerItemComponent {
  state = inject(LightControllersStateService);
  control = input.required();
  isSending = computed(() => this.state.sendingCommand().has(this.control().uuid));
  isOn = computed(() => {
    const stateValues = this.control().stateValues;
    if (!stateValues)
      return false;
    const active = stateValues["active"];
    const value = stateValues["value"];
    const position = stateValues["position"];
    return active === 1 || typeof value === "number" && value > 0 || typeof position === "number" && position > 0;
  });
  moods = computed(() => {
    const moodInfo = this.control().moodInfo;
    if (!moodInfo?.moodList)
      return [];
    const activeIds = new Set(moodInfo.activeMoodIds || []);
    return moodInfo.moodList.map((mood) => __spreadProps(__spreadValues({}, mood), {
      isActive: activeIds.has(mood.id)
    }));
  });
  sendCommand(command) {
    this.state.sendCommand(this.control().uuid, command);
  }
  sendSubCommand(uuid, command) {
    this.state.sendCommand(uuid, command);
  }
  toggleSwitch() {
    this.sendCommand(this.isOn() ? "Off" : "On");
  }
  selectMood(moodId) {
    this.sendCommand(`changeTo/${moodId}`);
  }
  copyUuid(uuid) {
    navigator.clipboard.writeText(uuid);
  }
  getSubControlTypeDisplay(sub) {
    if (sub.type === "ColorPickerV2" && sub.details?.["pickerType"]) {
      return `${sub.type} (${sub.details["pickerType"]})`;
    }
    return sub.type;
  }
  getSubControlActive(sub) {
    return sub.stateValues?.["active"] === 1;
  }
  getSubControlPosition(sub) {
    const position = sub.stateValues?.["position"];
    return typeof position === "number" ? Math.round(position) : 0;
  }
  getSubControlColor(sub) {
    const color = sub.stateValues?.["color"];
    return typeof color === "string" ? color : "";
  }
  getColorPreview(sub) {
    const colorValue = this.getSubControlColor(sub);
    if (!colorValue)
      return "transparent";
    if (colorValue.startsWith("hsv(")) {
      const match = colorValue.match(/hsv\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const [, h, s, v] = match.map(Number);
        return this.hsvToRgb(h, s, v);
      }
    } else if (colorValue.startsWith("temp(")) {
      const match = colorValue.match(/temp\((\d+),(\d+)\)/);
      if (match) {
        const [, brightness, kelvin] = match.map(Number);
        return this.kelvinToRgb(kelvin, brightness);
      }
    }
    return "transparent";
  }
  hsvToRgb(h, s, v) {
    s = s / 100;
    v = v / 100;
    const c = v * s;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`;
  }
  kelvinToRgb(kelvin, brightness) {
    const temp = kelvin / 100;
    let r, g, b;
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
  static \u0275fac = function ControllerItemComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ControllerItemComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ControllerItemComponent, selectors: [["app-controller-item"]], inputs: { control: [1, "control"] }, decls: 12, vars: 5, consts: [[1, "controller-card"], [1, "controller-header"], [1, "controller-info"], [1, "controller-name"], [1, "controller-room"], [1, "controller-type"], [1, "controller-controls"], ["diameter", "24"], [1, "subcontrols"], [3, "highlighted"], [3, "click", "highlighted"], [1, "subcontrol-item"], [1, "subcontrol-info"], [1, "subcontrol-header"], [1, "subcontrol-name"], [1, "subcontrol-type"], [1, "subcontrol-uuid"], ["mat-icon-button", "", "matTooltip", "UUID kopieren", 1, "copy-btn", 3, "click"], [1, "subcontrol-controls"], ["mat-flat-button", "", 3, "class"], [1, "dimmer-display"], [1, "color-display"], ["mat-flat-button", "", 3, "click"], [1, "dimmer-label"], [1, "dimmer-value"], [1, "color-preview"], [1, "color-value"]], template: function ControllerItemComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "span", 3);
      \u0275\u0275text(4);
      \u0275\u0275elementEnd();
      \u0275\u0275template(5, ControllerItemComponent_Conditional_5_Template, 2, 1, "span", 4);
      \u0275\u0275elementStart(6, "span", 5);
      \u0275\u0275text(7);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(8, "div", 6);
      \u0275\u0275template(9, ControllerItemComponent_Conditional_9_Template, 1, 0, "mat-spinner", 7)(10, ControllerItemComponent_Conditional_10_Template, 3, 0, "mat-chip-set");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(11, ControllerItemComponent_Conditional_11_Template, 3, 0, "div", 8);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.control().name);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.control().room ? 5 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.control().type);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.isSending() ? 9 : ctx.control().type === "LightControllerV2" && ctx.moods().length > 0 ? 10 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.control().subControls && ctx.control().subControls.length > 0 ? 11 : -1);
    }
  }, dependencies: [
    MatButtonModule,
    MatButton,
    MatIconButton,
    MatIconModule,
    MatIcon,
    MatSlideToggleModule,
    MatChipsModule,
    MatChip,
    MatChipSet,
    MatProgressSpinnerModule,
    MatProgressSpinner,
    MatTooltipModule,
    MatTooltip
  ], styles: ["\n\n.controller-card[_ngcontent-%COMP%] {\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n  overflow: hidden;\n}\nhtml.dark[_nghost-%COMP%]   .controller-card[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .controller-card[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n}\n.controller-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.controller-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.controller-name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 1.1em;\n}\n.controller-room[_ngcontent-%COMP%] {\n  font-size: 0.875em;\n  opacity: 0.6;\n}\n.controller-type[_ngcontent-%COMP%] {\n  font-size: 0.75em;\n  padding: 2px 8px;\n  border-radius: 4px;\n  background: rgba(133, 196, 64, 0.2);\n  color: #85c440;\n}\n.controller-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\nmat-chip-set[_ngcontent-%COMP%] {\n  max-width: 400px;\n}\nmat-chip[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.subcontrols[_ngcontent-%COMP%] {\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n  padding: 12px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\nhtml.dark[_nghost-%COMP%]   .subcontrols[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .subcontrols[_ngcontent-%COMP%] {\n  border-top-color: rgba(255, 255, 255, 0.1);\n}\n.subcontrol-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px;\n  background: rgba(0, 0, 0, 0.03);\n  border-radius: 6px;\n  gap: 16px;\n}\nhtml.dark[_nghost-%COMP%]   .subcontrol-item[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .subcontrol-item[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.03);\n}\n.subcontrol-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.subcontrol-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 4px;\n}\n.subcontrol-name[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n.subcontrol-type[_ngcontent-%COMP%] {\n  font-size: 0.75em;\n  opacity: 0.6;\n}\n.subcontrol-uuid[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.subcontrol-uuid[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] {\n  font-size: 0.7em;\n  opacity: 0.5;\n  font-family: monospace;\n}\n.copy-btn[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  line-height: 24px;\n}\n.copy-btn[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n}\n.subcontrol-controls[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n}\n.status-btn[_ngcontent-%COMP%] {\n  min-width: 100px;\n}\n.status-btn.active[_ngcontent-%COMP%] {\n  background: #85c440;\n  color: white;\n}\n.dimmer-display[_ngcontent-%COMP%], \n.color-display[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.dimmer-label[_ngcontent-%COMP%], \n.color-value[_ngcontent-%COMP%] {\n  font-size: 0.75em;\n  opacity: 0.6;\n  display: block;\n}\n.dimmer-value[_ngcontent-%COMP%] {\n  font-size: 1.1em;\n  font-weight: 600;\n  color: #85c440;\n}\n.color-preview[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  border: 2px solid rgba(0, 0, 0, 0.1);\n  display: inline-block;\n  vertical-align: middle;\n  margin-right: 8px;\n}\nhtml.dark[_nghost-%COMP%]   .color-preview[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .color-preview[_ngcontent-%COMP%] {\n  border-color: rgba(255, 255, 255, 0.2);\n}\n/*# sourceMappingURL=controller-item.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ControllerItemComponent, [{
    type: Component,
    args: [{ selector: "app-controller-item", standalone: true, imports: [
      MatButtonModule,
      MatIconModule,
      MatSlideToggleModule,
      MatChipsModule,
      MatProgressSpinnerModule,
      MatTooltipModule
    ], template: `
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
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;e80734da0c972107aee92603a06baf369867cac899fd1e4fe14ae70cff4fd01f;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/light-controllers/components/controller-item/controller-item.component.ts */\n.controller-card {\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n  overflow: hidden;\n}\n:host-context(html.dark) .controller-card {\n  background: rgba(255, 255, 255, 0.05);\n}\n.controller-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.controller-info {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.controller-name {\n  font-weight: 600;\n  font-size: 1.1em;\n}\n.controller-room {\n  font-size: 0.875em;\n  opacity: 0.6;\n}\n.controller-type {\n  font-size: 0.75em;\n  padding: 2px 8px;\n  border-radius: 4px;\n  background: rgba(133, 196, 64, 0.2);\n  color: #85c440;\n}\n.controller-controls {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\nmat-chip-set {\n  max-width: 400px;\n}\nmat-chip {\n  cursor: pointer;\n}\n.subcontrols {\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n  padding: 12px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n:host-context(html.dark) .subcontrols {\n  border-top-color: rgba(255, 255, 255, 0.1);\n}\n.subcontrol-item {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px;\n  background: rgba(0, 0, 0, 0.03);\n  border-radius: 6px;\n  gap: 16px;\n}\n:host-context(html.dark) .subcontrol-item {\n  background: rgba(255, 255, 255, 0.03);\n}\n.subcontrol-info {\n  flex: 1;\n  min-width: 0;\n}\n.subcontrol-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 4px;\n}\n.subcontrol-name {\n  font-weight: 500;\n}\n.subcontrol-type {\n  font-size: 0.75em;\n  opacity: 0.6;\n}\n.subcontrol-uuid {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.subcontrol-uuid code {\n  font-size: 0.7em;\n  opacity: 0.5;\n  font-family: monospace;\n}\n.copy-btn {\n  width: 24px;\n  height: 24px;\n  line-height: 24px;\n}\n.copy-btn mat-icon {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n}\n.subcontrol-controls {\n  flex-shrink: 0;\n}\n.status-btn {\n  min-width: 100px;\n}\n.status-btn.active {\n  background: #85c440;\n  color: white;\n}\n.dimmer-display,\n.color-display {\n  text-align: right;\n}\n.dimmer-label,\n.color-value {\n  font-size: 0.75em;\n  opacity: 0.6;\n  display: block;\n}\n.dimmer-value {\n  font-size: 1.1em;\n  font-weight: 600;\n  color: #85c440;\n}\n.color-preview {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  border: 2px solid rgba(0, 0, 0, 0.1);\n  display: inline-block;\n  vertical-align: middle;\n  margin-right: 8px;\n}\n:host-context(html.dark) .color-preview {\n  border-color: rgba(255, 255, 255, 0.2);\n}\n/*# sourceMappingURL=controller-item.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ControllerItemComponent, { className: "ControllerItemComponent", filePath: "src/app/features/light-controllers/components/controller-item/controller-item.component.ts", lineNumber: 276 });
})();

// src/app/features/light-controllers/components/controller-list/controller-list.component.ts
var _forTrack02 = ($index, $item) => $item.uuid;
function ControllerListComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-controller-item", 1);
  }
  if (rf & 2) {
    const control_r1 = ctx.$implicit;
    \u0275\u0275property("control", control_r1);
  }
}
var ControllerListComponent = class _ControllerListComponent {
  controls = input.required();
  static \u0275fac = function ControllerListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ControllerListComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ControllerListComponent, selectors: [["app-controller-list"]], inputs: { controls: [1, "controls"] }, decls: 3, vars: 0, consts: [[1, "controller-list"], [3, "control"]], template: function ControllerListComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275repeaterCreate(1, ControllerListComponent_For_2_Template, 1, 1, "app-controller-item", 1, _forTrack02);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.controls());
    }
  }, dependencies: [ControllerItemComponent], styles: ["\n\n.controller-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n/*# sourceMappingURL=controller-list.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ControllerListComponent, [{
    type: Component,
    args: [{ selector: "app-controller-list", standalone: true, imports: [ControllerItemComponent], template: `
    <div class="controller-list">
      @for (control of controls(); track control.uuid) {
        <app-controller-item [control]="control" />
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;04a54636249afab05c60f8b70fed9002c3e6868f8922767ef57b2201085af0bc;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/light-controllers/components/controller-list/controller-list.component.ts */\n.controller-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n/*# sourceMappingURL=controller-list.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ControllerListComponent, { className: "ControllerListComponent", filePath: "src/app/features/light-controllers/components/controller-list/controller-list.component.ts", lineNumber: 25 });
})();

// src/app/features/light-controllers/components/light-controllers-page/light-controllers-page.component.ts
var _forTrack03 = ($index, $item) => $item[0];
function LightControllersPageComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275element(1, "mat-spinner", 11);
    \u0275\u0275elementEnd();
  }
}
function LightControllersPageComponent_Conditional_15_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 12)(1, "mat-card-header")(2, "mat-icon", 13);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "mat-card-title");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "mat-card-subtitle");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "mat-card-content");
    \u0275\u0275element(9, "app-controller-list", 14);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const entry_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.getTypeIcon(entry_r1[0]));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r1[0]);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", entry_r1[1].length, " controls");
    \u0275\u0275advance(2);
    \u0275\u0275property("controls", entry_r1[1]);
  }
}
function LightControllersPageComponent_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LightControllersPageComponent_Conditional_15_For_1_Template, 10, 4, "mat-card", 12, _forTrack03);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r1.typeEntries);
  }
}
function LightControllersPageComponent_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-empty-state", 8);
  }
}
function LightControllersPageComponent_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-empty-state", 9);
  }
}
function LightControllersPageComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 10);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.state.error(), " ");
  }
}
var LightControllersPageComponent = class _LightControllersPageComponent {
  state = inject(LightControllersStateService);
  get typeEntries() {
    return Array.from(this.state.controlsByType().entries());
  }
  ngOnInit() {
    this.state.loadControls();
  }
  refresh() {
    this.state.loadControls();
  }
  getTypeIcon(type) {
    switch (type.toLowerCase()) {
      case "switch":
        return "toggle_on";
      case "dimmer":
        return "brightness_medium";
      case "colorpicker":
        return "palette";
      case "colorpickerv2":
        return "palette";
      case "lightcontroller":
        return "wb_incandescent";
      case "lightcontrollerv2":
        return "wb_incandescent";
      default:
        return "device_unknown";
    }
  }
  static \u0275fac = function LightControllersPageComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LightControllersPageComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LightControllersPageComponent, selectors: [["app-light-controllers-page"]], decls: 19, vars: 3, consts: [[1, "light-controllers-page"], [1, "page-header"], [1, "flex-spacer"], ["subscriptSizing", "dynamic", 1, "search-field"], ["matInput", "", "placeholder", "Search by name, type, or room", 3, "ngModelChange", "ngModel"], ["matSuffix", ""], ["mat-icon-button", "", 3, "click"], [1, "loading-container"], ["icon", "search_off", "title", "No results", "message", "No controls match your search"], ["icon", "tune", "title", "No Loxone controls found", "message", "Ensure Loxone Miniserver is configured and running"], [1, "error-banner"], ["diameter", "40"], [1, "type-card"], ["matCardAvatar", ""], [3, "controls"]], template: function LightControllersPageComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "h2");
      \u0275\u0275text(3, "Loxone Light Controllers");
      \u0275\u0275elementEnd();
      \u0275\u0275element(4, "span", 2);
      \u0275\u0275elementStart(5, "mat-form-field", 3)(6, "mat-label");
      \u0275\u0275text(7, "Search");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "input", 4);
      \u0275\u0275listener("ngModelChange", function LightControllersPageComponent_Template_input_ngModelChange_8_listener($event) {
        return ctx.state.setSearchTerm($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "mat-icon", 5);
      \u0275\u0275text(10, "search");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "button", 6);
      \u0275\u0275listener("click", function LightControllersPageComponent_Template_button_click_11_listener() {
        return ctx.refresh();
      });
      \u0275\u0275elementStart(12, "mat-icon");
      \u0275\u0275text(13, "refresh");
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(14, LightControllersPageComponent_Conditional_14_Template, 2, 0, "div", 7)(15, LightControllersPageComponent_Conditional_15_Template, 2, 0)(16, LightControllersPageComponent_Conditional_16_Template, 1, 0, "app-empty-state", 8)(17, LightControllersPageComponent_Conditional_17_Template, 1, 0, "app-empty-state", 9)(18, LightControllersPageComponent_Conditional_18_Template, 2, 1, "div", 10);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(8);
      \u0275\u0275property("ngModel", ctx.state.searchTerm());
      \u0275\u0275advance(6);
      \u0275\u0275conditional(ctx.state.loading() ? 14 : ctx.state.filteredControls().length > 0 ? 15 : ctx.state.searchTerm() ? 16 : 17);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.state.error() ? 18 : -1);
    }
  }, dependencies: [
    FormsModule,
    DefaultValueAccessor,
    NgControlStatus,
    NgModel,
    MatCardModule,
    MatCard,
    MatCardAvatar,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatFormFieldModule,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInputModule,
    MatInput,
    MatIconModule,
    MatIcon,
    MatButtonModule,
    MatIconButton,
    MatProgressSpinnerModule,
    MatProgressSpinner,
    ControllerListComponent,
    EmptyStateComponent
  ], styles: ["\n\n.light-controllers-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.page-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.page-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n}\n.search-field[_ngcontent-%COMP%] {\n  min-width: 250px;\n}\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.type-card[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.error-banner[_ngcontent-%COMP%] {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=light-controllers-page.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LightControllersPageComponent, [{
    type: Component,
    args: [{ selector: "app-light-controllers-page", standalone: true, imports: [
      FormsModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      MatProgressSpinnerModule,
      ControllerListComponent,
      EmptyStateComponent
    ], template: `
    <div class="light-controllers-page">
      <div class="page-header">
        <h2>Loxone Light Controllers</h2>
        <span class="flex-spacer"></span>
        <mat-form-field class="search-field" subscriptSizing="dynamic">
          <mat-label>Search</mat-label>
          <input matInput
                 [ngModel]="state.searchTerm()"
                 (ngModelChange)="state.setSearchTerm($event)"
                 placeholder="Search by name, type, or room">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-icon-button (click)="refresh()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (state.filteredControls().length > 0) {
        @for (entry of typeEntries; track entry[0]) {
          <mat-card class="type-card">
            <mat-card-header>
              <mat-icon matCardAvatar>{{ getTypeIcon(entry[0]) }}</mat-icon>
              <mat-card-title>{{ entry[0] }}</mat-card-title>
              <mat-card-subtitle>{{ entry[1].length }} controls</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-controller-list [controls]="entry[1]" />
            </mat-card-content>
          </mat-card>
        }
      } @else if (state.searchTerm()) {
        <app-empty-state
          icon="search_off"
          title="No results"
          message="No controls match your search">
        </app-empty-state>
      } @else {
        <app-empty-state
          icon="tune"
          title="No Loxone controls found"
          message="Ensure Loxone Miniserver is configured and running">
        </app-empty-state>
      }

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;fb6e2a651b8ea6b3d90175ea76d30b859fc5bf65116f0702c3ec53a570c134f4;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/light-controllers/components/light-controllers-page/light-controllers-page.component.ts */\n.light-controllers-page {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.page-header {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.page-header h2 {\n  margin: 0;\n}\n.search-field {\n  min-width: 250px;\n}\n.loading-container {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.type-card {\n  margin-bottom: 16px;\n}\n.error-banner {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=light-controllers-page.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LightControllersPageComponent, { className: "LightControllersPageComponent", filePath: "src/app/features/light-controllers/components/light-controllers-page/light-controllers-page.component.ts", lineNumber: 124 });
})();

// src/app/features/light-controllers/light-controllers.routes.ts
var LIGHT_CONTROLLERS_ROUTES = [
  { path: "", component: LightControllersPageComponent }
];
export {
  LIGHT_CONTROLLERS_ROUTES
};
//# sourceMappingURL=chunk-AORQROKF.js.map
