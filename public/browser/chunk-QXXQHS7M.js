import {
  MatTab,
  MatTabGroup,
  MatTabsModule
} from "./chunk-45SSR65Q.js";
import {
  SystemStateService
} from "./chunk-EGTMMTNG.js";
import {
  MatPseudoCheckbox,
  ipAddressValidator,
  portValidator
} from "./chunk-2JXLUE2R.js";
import {
  SelectionModel
} from "./chunk-XKOREQBY.js";
import {
  MatSlideToggle,
  MatSlideToggleModule
} from "./chunk-OY2S3K7Q.js";
import {
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatHint,
  MatInput,
  MatInputModule,
  MatLabel,
  MatSuffix,
  NG_VALUE_ACCESSOR,
  NgControlStatus,
  NgControlStatusGroup,
  NumberValueAccessor,
  ReactiveFormsModule,
  ɵNgNoValidate
} from "./chunk-D4AT3CLM.js";
import "./chunk-FL3KYB4C.js";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardTitle,
  MatProgressSpinner,
  MatProgressSpinnerModule
} from "./chunk-4WNYHGTU.js";
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
  ScrollingModule
} from "./chunk-U6PUA6ML.js";
import "./chunk-YRPT3MG6.js";
import {
  DOWN_ARROW,
  Directionality,
  ENTER,
  FocusMonitor,
  LEFT_ARROW,
  MatButton,
  MatButtonModule,
  MatCommonModule,
  MatIcon,
  MatIconButton,
  MatIconModule,
  MatRipple,
  MatRippleModule,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW,
  _CdkPrivateStyleLoader,
  _IdGenerator,
  _StructuralStylesLoader
} from "./chunk-HOOTIT7M.js";
import {
  ANIMATION_MODULE_TYPE,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostAttributeToken,
  InjectionToken,
  Input,
  NgModule,
  Output,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  forwardRef,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵviewQuery
} from "./chunk-U74TQY52.js";

// src/app/features/system/components/settings-form/settings-form.component.ts
function SettingsFormComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Invalid IP address");
    \u0275\u0275elementEnd();
  }
}
function SettingsFormComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-icon", 24);
    \u0275\u0275text(1, "check_circle");
    \u0275\u0275elementEnd();
    \u0275\u0275text(2, " Configured ");
  }
}
function SettingsFormComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-icon", 25);
    \u0275\u0275text(1, "warning");
    \u0275\u0275elementEnd();
    \u0275\u0275text(2, " Not configured ");
  }
}
function SettingsFormComponent_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Invalid IP address");
    \u0275\u0275elementEnd();
  }
}
function SettingsFormComponent_Conditional_32_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Port must be between 1-65535");
    \u0275\u0275elementEnd();
  }
}
function SettingsFormComponent_Conditional_41_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 12)(1, "mat-form-field", 2)(2, "mat-label");
    \u0275\u0275text(3, "Loxone Username");
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "input", 26);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 4)(6, "span", 5);
    \u0275\u0275text(7, "Password:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 6)(9, "mat-icon", 24);
    \u0275\u0275text(10, "check_circle");
    \u0275\u0275elementEnd();
    \u0275\u0275text(11, " Configured ");
    \u0275\u0275elementStart(12, "button", 27);
    \u0275\u0275listener("click", function SettingsFormComponent_Conditional_41_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.editingPassword.set(true));
    });
    \u0275\u0275elementStart(13, "mat-icon");
    \u0275\u0275text(14, "edit");
    \u0275\u0275elementEnd();
    \u0275\u0275text(15, " Edit ");
    \u0275\u0275elementEnd()()()();
  }
}
function SettingsFormComponent_Conditional_42_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-form-field", 2)(1, "mat-label");
    \u0275\u0275text(2, "Loxone Username");
    \u0275\u0275elementEnd();
    \u0275\u0275element(3, "input", 26);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "mat-form-field", 2)(5, "mat-label");
    \u0275\u0275text(6, "Loxone Password");
    \u0275\u0275elementEnd();
    \u0275\u0275element(7, "input", 28);
    \u0275\u0275elementStart(8, "button", 29);
    \u0275\u0275listener("click", function SettingsFormComponent_Conditional_42_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.showPassword.set(!ctx_r1.showPassword()));
    });
    \u0275\u0275elementStart(9, "mat-icon");
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275property("type", ctx_r1.showPassword() ? "text" : "password");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.showPassword() ? "visibility_off" : "visibility");
  }
}
function SettingsFormComponent_Conditional_50_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 15)(1, "mat-icon");
    \u0275\u0275text(2, "remove_circle_outline");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3, " Disabled ");
    \u0275\u0275elementEnd();
  }
}
function SettingsFormComponent_Conditional_51_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 16)(1, "mat-icon");
    \u0275\u0275text(2, "info_outline");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3, " Not configured ");
    \u0275\u0275elementEnd();
  }
}
function SettingsFormComponent_Conditional_52_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 17)(1, "mat-icon");
    \u0275\u0275text(2, "check_circle_outline");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3, " Configured ");
    \u0275\u0275elementEnd();
  }
}
var SettingsFormComponent = class _SettingsFormComponent {
  fb = inject(FormBuilder);
  systemState = inject(SystemStateService);
  editingPassword = signal(false);
  showPassword = signal(false);
  form = this.fb.group({
    bridge_ip: ["", [ipAddressValidator()]],
    loxone_ip: ["", [ipAddressValidator()]],
    loxone_port: [7e3, [portValidator()]],
    http_port: [8555],
    debug: [false],
    key_configured: [false],
    transitionTime: [400],
    version: [""],
    bidirectional_sync: [false],
    loxone_user: [""],
    loxone_password: [""],
    loxone_http_port: [80]
  });
  loxoneConnectionConfigured() {
    const settings = this.systemState.settings();
    return settings?.loxone_connection_configured ?? false;
  }
  constructor() {
    effect(() => {
      const settings = this.systemState.settings();
      if (settings) {
        this.form.patchValue(settings, { emitEvent: false });
        this.form.markAsPristine();
        this.editingPassword.set(false);
      }
    });
  }
  saveSettings() {
    if (!this.form.valid)
      return;
    const formValue = this.form.value;
    const settings = {};
    if (formValue.loxone_ip)
      settings["loxone_ip"] = formValue.loxone_ip;
    if (formValue.loxone_port)
      settings["loxone_port"] = formValue.loxone_port;
    if (formValue.debug !== void 0)
      settings["debug"] = formValue.debug;
    if (formValue.transitionTime)
      settings["transitionTime"] = formValue.transitionTime;
    settings["bidirectional_sync"] = formValue.bidirectional_sync;
    if (formValue.loxone_user)
      settings["loxone_user"] = formValue.loxone_user;
    if (formValue.loxone_password)
      settings["loxone_password"] = formValue.loxone_password;
    if (formValue.loxone_http_port)
      settings["loxone_http_port"] = formValue.loxone_http_port;
    this.systemState.updateSettings(settings);
  }
  resetForm() {
    const settings = this.systemState.settings();
    if (settings) {
      this.form.patchValue(settings);
      this.form.markAsPristine();
      this.editingPassword.set(false);
    }
  }
  static \u0275fac = function SettingsFormComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SettingsFormComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SettingsFormComponent, selectors: [["app-settings-form"]], decls: 80, vars: 11, consts: [[1, "settings-form", 3, "formGroup"], [1, "form-section"], [1, "form-field-full-width"], ["matInput", "", "formControlName", "bridge_ip", "placeholder", "192.168.1.x"], [1, "info-row"], [1, "info-label"], [1, "info-value"], ["matInput", "", "formControlName", "loxone_ip", "placeholder", "192.168.1.x"], ["matInput", "", "formControlName", "loxone_port", "type", "number"], [1, "section-description"], ["formControlName", "bidirectional_sync"], [1, "bidirectional-fields"], [1, "credential-row"], ["matInput", "", "formControlName", "loxone_http_port", "type", "number"], [1, "sync-status"], [1, "status-indicator", "disabled"], [1, "status-indicator", "not-configured"], [1, "status-indicator", "enabled"], ["matInput", "", "formControlName", "transitionTime", "type", "number"], ["matInput", "", "formControlName", "http_port", "type", "number", "readonly", ""], ["formControlName", "debug"], ["align", "end"], ["mat-button", "", 3, "click"], ["mat-flat-button", "", "color", "primary", 3, "click", "disabled"], [1, "success-icon"], [1, "warning-icon"], ["matInput", "", "formControlName", "loxone_user"], ["mat-button", "", "type", "button", 3, "click"], ["matInput", "", "formControlName", "loxone_password", 3, "type"], ["mat-icon-button", "", "matSuffix", "", "type", "button", 3, "click"]], template: function SettingsFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "mat-card")(1, "mat-card-header")(2, "mat-card-title");
      \u0275\u0275text(3, "Bridge Configuration");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(4, "mat-card-content")(5, "form", 0)(6, "div", 1)(7, "h3");
      \u0275\u0275text(8, "Philips Hue Bridge");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "mat-form-field", 2)(10, "mat-label");
      \u0275\u0275text(11, "Bridge IP Address");
      \u0275\u0275elementEnd();
      \u0275\u0275element(12, "input", 3);
      \u0275\u0275template(13, SettingsFormComponent_Conditional_13_Template, 2, 0, "mat-error");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "div", 4)(15, "span", 5);
      \u0275\u0275text(16, "API Key:");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "span", 6);
      \u0275\u0275template(18, SettingsFormComponent_Conditional_18_Template, 3, 0)(19, SettingsFormComponent_Conditional_19_Template, 3, 0);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(20, "div", 1)(21, "h3");
      \u0275\u0275text(22, "Loxone Miniserver");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "mat-form-field", 2)(24, "mat-label");
      \u0275\u0275text(25, "Miniserver IP Address");
      \u0275\u0275elementEnd();
      \u0275\u0275element(26, "input", 7);
      \u0275\u0275template(27, SettingsFormComponent_Conditional_27_Template, 2, 0, "mat-error");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "mat-form-field", 2)(29, "mat-label");
      \u0275\u0275text(30, "UDP Port");
      \u0275\u0275elementEnd();
      \u0275\u0275element(31, "input", 8);
      \u0275\u0275template(32, SettingsFormComponent_Conditional_32_Template, 2, 0, "mat-error");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(33, "div", 1)(34, "h3");
      \u0275\u0275text(35, "Bidirectional Sync");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(36, "p", 9);
      \u0275\u0275text(37, " Enable two-way sync between Hue lights and Loxone via WebSocket. ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "mat-slide-toggle", 10);
      \u0275\u0275text(39, " Enable Bidirectional Sync ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "div", 11);
      \u0275\u0275template(41, SettingsFormComponent_Conditional_41_Template, 16, 0, "div", 12)(42, SettingsFormComponent_Conditional_42_Template, 11, 2);
      \u0275\u0275elementStart(43, "mat-form-field", 2)(44, "mat-label");
      \u0275\u0275text(45, "HTTP Port");
      \u0275\u0275elementEnd();
      \u0275\u0275element(46, "input", 13);
      \u0275\u0275elementStart(47, "mat-hint");
      \u0275\u0275text(48, "Miniserver web interface port (default: 80)");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(49, "div", 14);
      \u0275\u0275template(50, SettingsFormComponent_Conditional_50_Template, 4, 0, "span", 15)(51, SettingsFormComponent_Conditional_51_Template, 4, 0, "span", 16)(52, SettingsFormComponent_Conditional_52_Template, 4, 0, "span", 17);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(53, "div", 1)(54, "h3");
      \u0275\u0275text(55, "Advanced");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(56, "mat-form-field", 2)(57, "mat-label");
      \u0275\u0275text(58, "Transition Time (ms)");
      \u0275\u0275elementEnd();
      \u0275\u0275element(59, "input", 18);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(60, "mat-form-field", 2)(61, "mat-label");
      \u0275\u0275text(62, "HTTP Port");
      \u0275\u0275elementEnd();
      \u0275\u0275element(63, "input", 19);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(64, "mat-slide-toggle", 20);
      \u0275\u0275text(65, " Enable Debug Mode ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(66, "div", 4)(67, "span", 5);
      \u0275\u0275text(68, "Version:");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(69, "span", 6);
      \u0275\u0275text(70);
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(71, "mat-card-actions", 21)(72, "button", 22);
      \u0275\u0275listener("click", function SettingsFormComponent_Template_button_click_72_listener() {
        return ctx.resetForm();
      });
      \u0275\u0275elementStart(73, "mat-icon");
      \u0275\u0275text(74, "undo");
      \u0275\u0275elementEnd();
      \u0275\u0275text(75, " Reset ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(76, "button", 23);
      \u0275\u0275listener("click", function SettingsFormComponent_Template_button_click_76_listener() {
        return ctx.saveSettings();
      });
      \u0275\u0275elementStart(77, "mat-icon");
      \u0275\u0275text(78, "save");
      \u0275\u0275elementEnd();
      \u0275\u0275text(79, " Save Settings ");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275property("formGroup", ctx.form);
      \u0275\u0275advance(8);
      \u0275\u0275conditional(ctx.form.controls.bridge_ip.hasError("invalidIpAddress") ? 13 : -1);
      \u0275\u0275advance(5);
      \u0275\u0275conditional(ctx.form.controls.key_configured.value ? 18 : 19);
      \u0275\u0275advance(9);
      \u0275\u0275conditional(ctx.form.controls.loxone_ip.hasError("invalidIpAddress") ? 27 : -1);
      \u0275\u0275advance(5);
      \u0275\u0275conditional(ctx.form.controls.loxone_port.hasError("invalidPort") ? 32 : -1);
      \u0275\u0275advance(8);
      \u0275\u0275classProp("disabled", !ctx.form.controls.bidirectional_sync.value);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.editingPassword() && ctx.loxoneConnectionConfigured() ? 41 : 42);
      \u0275\u0275advance(9);
      \u0275\u0275conditional(!ctx.form.controls.bidirectional_sync.value ? 50 : !ctx.loxoneConnectionConfigured() && !ctx.form.dirty ? 51 : 52);
      \u0275\u0275advance(20);
      \u0275\u0275textInterpolate(ctx.form.controls.version.value || "unknown");
      \u0275\u0275advance(6);
      \u0275\u0275property("disabled", !ctx.form.valid || !ctx.form.dirty);
    }
  }, dependencies: [ReactiveFormsModule, \u0275NgNoValidate, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatCardModule, MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle, MatFormFieldModule, MatFormField, MatLabel, MatHint, MatError, MatSuffix, MatInputModule, MatInput, MatButtonModule, MatButton, MatIconButton, MatSlideToggleModule, MatSlideToggle, MatIconModule, MatIcon], styles: ["\n\n.settings-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n}\n.form-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.form-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1rem;\n  font-weight: 500;\n  opacity: 0.7;\n}\n.section-description[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.85rem;\n  opacity: 0.6;\n}\nmat-slide-toggle[_ngcontent-%COMP%] {\n  margin-top: 8px;\n}\n.bidirectional-fields[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding: 16px;\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n  transition: opacity 0.2s;\n}\nhtml.dark[_nghost-%COMP%]   .bidirectional-fields[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .bidirectional-fields[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n}\n.bidirectional-fields.disabled[_ngcontent-%COMP%] {\n  opacity: 0.5;\n  pointer-events: none;\n}\n.credential-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.sync-status[_ngcontent-%COMP%] {\n  margin-top: 8px;\n}\n.status-indicator[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 0.85rem;\n}\n.status-indicator.disabled[_ngcontent-%COMP%] {\n  opacity: 0.5;\n}\n.status-indicator.not-configured[_ngcontent-%COMP%] {\n  color: #ff9800;\n}\n.status-indicator.enabled[_ngcontent-%COMP%] {\n  color: #4caf50;\n}\n.info-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 0;\n}\n.info-label[_ngcontent-%COMP%] {\n  font-weight: 500;\n  opacity: 0.7;\n}\n.info-value[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.success-icon[_ngcontent-%COMP%] {\n  color: #4caf50;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n.warning-icon[_ngcontent-%COMP%] {\n  color: #ff9800;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n/*# sourceMappingURL=settings-form.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SettingsFormComponent, [{
    type: Component,
    args: [{ selector: "app-settings-form", standalone: true, imports: [
      ReactiveFormsModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatSlideToggleModule,
      MatIconModule
    ], template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Bridge Configuration</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" class="settings-form">
          <div class="form-section">
            <h3>Philips Hue Bridge</h3>
            <mat-form-field class="form-field-full-width">
              <mat-label>Bridge IP Address</mat-label>
              <input matInput formControlName="bridge_ip" placeholder="192.168.1.x">
              @if (form.controls.bridge_ip.hasError('invalidIpAddress')) {
                <mat-error>Invalid IP address</mat-error>
              }
            </mat-form-field>

            <div class="info-row">
              <span class="info-label">API Key:</span>
              <span class="info-value">
                @if (form.controls.key_configured.value) {
                  <mat-icon class="success-icon">check_circle</mat-icon> Configured
                } @else {
                  <mat-icon class="warning-icon">warning</mat-icon> Not configured
                }
              </span>
            </div>
          </div>

          <div class="form-section">
            <h3>Loxone Miniserver</h3>
            <mat-form-field class="form-field-full-width">
              <mat-label>Miniserver IP Address</mat-label>
              <input matInput formControlName="loxone_ip" placeholder="192.168.1.x">
              @if (form.controls.loxone_ip.hasError('invalidIpAddress')) {
                <mat-error>Invalid IP address</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="form-field-full-width">
              <mat-label>UDP Port</mat-label>
              <input matInput formControlName="loxone_port" type="number">
              @if (form.controls.loxone_port.hasError('invalidPort')) {
                <mat-error>Port must be between 1-65535</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-section">
            <h3>Bidirectional Sync</h3>
            <p class="section-description">
              Enable two-way sync between Hue lights and Loxone via WebSocket.
            </p>

            <mat-slide-toggle formControlName="bidirectional_sync">
              Enable Bidirectional Sync
            </mat-slide-toggle>

            <div class="bidirectional-fields" [class.disabled]="!form.controls.bidirectional_sync.value">
              @if (!editingPassword() && loxoneConnectionConfigured()) {
                <div class="credential-row">
                  <mat-form-field class="form-field-full-width">
                    <mat-label>Loxone Username</mat-label>
                    <input matInput formControlName="loxone_user">
                  </mat-form-field>
                  <div class="info-row">
                    <span class="info-label">Password:</span>
                    <span class="info-value">
                      <mat-icon class="success-icon">check_circle</mat-icon> Configured
                      <button mat-button type="button" (click)="editingPassword.set(true)">
                        <mat-icon>edit</mat-icon> Edit
                      </button>
                    </span>
                  </div>
                </div>
              } @else {
                <mat-form-field class="form-field-full-width">
                  <mat-label>Loxone Username</mat-label>
                  <input matInput formControlName="loxone_user">
                </mat-form-field>
                <mat-form-field class="form-field-full-width">
                  <mat-label>Loxone Password</mat-label>
                  <input matInput formControlName="loxone_password"
                         [type]="showPassword() ? 'text' : 'password'">
                  <button mat-icon-button matSuffix type="button"
                          (click)="showPassword.set(!showPassword())">
                    <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </mat-form-field>
              }
              <mat-form-field class="form-field-full-width">
                <mat-label>HTTP Port</mat-label>
                <input matInput formControlName="loxone_http_port" type="number">
                <mat-hint>Miniserver web interface port (default: 80)</mat-hint>
              </mat-form-field>
            </div>

            <div class="sync-status">
              @if (!form.controls.bidirectional_sync.value) {
                <span class="status-indicator disabled">
                  <mat-icon>remove_circle_outline</mat-icon> Disabled
                </span>
              } @else if (!loxoneConnectionConfigured() && !form.dirty) {
                <span class="status-indicator not-configured">
                  <mat-icon>info_outline</mat-icon> Not configured
                </span>
              } @else {
                <span class="status-indicator enabled">
                  <mat-icon>check_circle_outline</mat-icon> Configured
                </span>
              }
            </div>
          </div>

          <div class="form-section">
            <h3>Advanced</h3>
            <mat-form-field class="form-field-full-width">
              <mat-label>Transition Time (ms)</mat-label>
              <input matInput formControlName="transitionTime" type="number">
            </mat-form-field>

            <mat-form-field class="form-field-full-width">
              <mat-label>HTTP Port</mat-label>
              <input matInput formControlName="http_port" type="number" readonly>
            </mat-form-field>

            <mat-slide-toggle formControlName="debug">
              Enable Debug Mode
            </mat-slide-toggle>

            <div class="info-row">
              <span class="info-label">Version:</span>
              <span class="info-value">{{ form.controls.version.value || 'unknown' }}</span>
            </div>
          </div>
        </form>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="resetForm()">
          <mat-icon>undo</mat-icon>
          Reset
        </button>
        <button mat-flat-button color="primary" (click)="saveSettings()" [disabled]="!form.valid || !form.dirty">
          <mat-icon>save</mat-icon>
          Save Settings
        </button>
      </mat-card-actions>
    </mat-card>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;fb765ed22b1198efaa5d2097d995f5e38afd536681ac33b4d0db585a1bedc70e;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/system/components/settings-form/settings-form.component.ts */\n.settings-form {\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n}\n.form-section {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.form-section h3 {\n  margin: 0;\n  font-size: 1rem;\n  font-weight: 500;\n  opacity: 0.7;\n}\n.section-description {\n  margin: 0;\n  font-size: 0.85rem;\n  opacity: 0.6;\n}\nmat-slide-toggle {\n  margin-top: 8px;\n}\n.bidirectional-fields {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding: 16px;\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n  transition: opacity 0.2s;\n}\n:host-context(html.dark) .bidirectional-fields {\n  background: rgba(255, 255, 255, 0.05);\n}\n.bidirectional-fields.disabled {\n  opacity: 0.5;\n  pointer-events: none;\n}\n.credential-row {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.sync-status {\n  margin-top: 8px;\n}\n.status-indicator {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 0.85rem;\n}\n.status-indicator.disabled {\n  opacity: 0.5;\n}\n.status-indicator.not-configured {\n  color: #ff9800;\n}\n.status-indicator.enabled {\n  color: #4caf50;\n}\n.info-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 0;\n}\n.info-label {\n  font-weight: 500;\n  opacity: 0.7;\n}\n.info-value {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.success-icon {\n  color: #4caf50;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n.warning-icon {\n  color: #ff9800;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n/*# sourceMappingURL=settings-form.component.css.map */\n"] }]
  }], () => [], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SettingsFormComponent, { className: "SettingsFormComponent", filePath: "src/app/features/system/components/settings-form/settings-form.component.ts", lineNumber: 285 });
})();

// node_modules/@angular/material/fesm2022/button-toggle.mjs
var _c0 = ["button"];
var _c1 = ["*"];
function MatButtonToggle_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2);
    \u0275\u0275element(1, "mat-pseudo-checkbox", 6);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.disabled);
  }
}
var MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS = new InjectionToken("MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS", {
  providedIn: "root",
  factory: MAT_BUTTON_TOGGLE_GROUP_DEFAULT_OPTIONS_FACTORY
});
function MAT_BUTTON_TOGGLE_GROUP_DEFAULT_OPTIONS_FACTORY() {
  return {
    hideSingleSelectionIndicator: false,
    hideMultipleSelectionIndicator: false,
    disabledInteractive: false
  };
}
var MAT_BUTTON_TOGGLE_GROUP = new InjectionToken("MatButtonToggleGroup");
var MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatButtonToggleGroup),
  multi: true
};
var MatButtonToggleChange = class {
  source;
  value;
  constructor(source, value) {
    this.source = source;
    this.value = value;
  }
};
var MatButtonToggleGroup = class _MatButtonToggleGroup {
  _changeDetector = inject(ChangeDetectorRef);
  _dir = inject(Directionality, {
    optional: true
  });
  _multiple = false;
  _disabled = false;
  _disabledInteractive = false;
  _selectionModel;
  /**
   * Reference to the raw value that the consumer tried to assign. The real
   * value will exclude any values from this one that don't correspond to a
   * toggle. Useful for the cases where the value is assigned before the toggles
   * have been initialized or at the same that they're being swapped out.
   */
  _rawValue;
  /**
   * The method to be called in order to update ngModel.
   * Now `ngModel` binding is not supported in multiple selection mode.
   */
  _controlValueAccessorChangeFn = () => {
  };
  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  _onTouched = () => {
  };
  /** Child button toggle buttons. */
  _buttonToggles;
  /** The appearance for all the buttons in the group. */
  appearance;
  /** `name` attribute for the underlying `input` element. */
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
    this._markButtonsForCheck();
  }
  _name = inject(_IdGenerator).getId("mat-button-toggle-group-");
  /** Whether the toggle group is vertical. */
  vertical;
  /** Value of the toggle group. */
  get value() {
    const selected = this._selectionModel ? this._selectionModel.selected : [];
    if (this.multiple) {
      return selected.map((toggle) => toggle.value);
    }
    return selected[0] ? selected[0].value : void 0;
  }
  set value(newValue) {
    this._setSelectionByValue(newValue);
    this.valueChange.emit(this.value);
  }
  /**
   * Event that emits whenever the value of the group changes.
   * Used to facilitate two-way data binding.
   * @docs-private
   */
  valueChange = new EventEmitter();
  /** Selected button toggles in the group. */
  get selected() {
    const selected = this._selectionModel ? this._selectionModel.selected : [];
    return this.multiple ? selected : selected[0] || null;
  }
  /** Whether multiple button toggles can be selected. */
  get multiple() {
    return this._multiple;
  }
  set multiple(value) {
    this._multiple = value;
    this._markButtonsForCheck();
  }
  /** Whether multiple button toggle group is disabled. */
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = value;
    this._markButtonsForCheck();
  }
  /** Whether buttons in the group should be interactive while they're disabled. */
  get disabledInteractive() {
    return this._disabledInteractive;
  }
  set disabledInteractive(value) {
    this._disabledInteractive = value;
    this._markButtonsForCheck();
  }
  /** The layout direction of the toggle button group. */
  get dir() {
    return this._dir && this._dir.value === "rtl" ? "rtl" : "ltr";
  }
  /** Event emitted when the group's value changes. */
  change = new EventEmitter();
  /** Whether checkmark indicator for single-selection button toggle groups is hidden. */
  get hideSingleSelectionIndicator() {
    return this._hideSingleSelectionIndicator;
  }
  set hideSingleSelectionIndicator(value) {
    this._hideSingleSelectionIndicator = value;
    this._markButtonsForCheck();
  }
  _hideSingleSelectionIndicator;
  /** Whether checkmark indicator for multiple-selection button toggle groups is hidden. */
  get hideMultipleSelectionIndicator() {
    return this._hideMultipleSelectionIndicator;
  }
  set hideMultipleSelectionIndicator(value) {
    this._hideMultipleSelectionIndicator = value;
    this._markButtonsForCheck();
  }
  _hideMultipleSelectionIndicator;
  constructor() {
    const defaultOptions = inject(MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS, {
      optional: true
    });
    this.appearance = defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : "standard";
    this.hideSingleSelectionIndicator = defaultOptions?.hideSingleSelectionIndicator ?? false;
    this.hideMultipleSelectionIndicator = defaultOptions?.hideMultipleSelectionIndicator ?? false;
  }
  ngOnInit() {
    this._selectionModel = new SelectionModel(this.multiple, void 0, false);
  }
  ngAfterContentInit() {
    this._selectionModel.select(...this._buttonToggles.filter((toggle) => toggle.checked));
    if (!this.multiple) {
      this._initializeTabIndex();
    }
  }
  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value) {
    this.value = value;
    this._changeDetector.markForCheck();
  }
  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn) {
    this._controlValueAccessorChangeFn = fn;
  }
  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  /** Handle keydown event calling to single-select button toggle. */
  _keydown(event) {
    if (this.multiple || this.disabled) {
      return;
    }
    const target = event.target;
    const buttonId = target.id;
    const index = this._buttonToggles.toArray().findIndex((toggle) => {
      return toggle.buttonId === buttonId;
    });
    let nextButton = null;
    switch (event.keyCode) {
      case SPACE:
      case ENTER:
        nextButton = this._buttonToggles.get(index) || null;
        break;
      case UP_ARROW:
        nextButton = this._getNextButton(index, -1);
        break;
      case LEFT_ARROW:
        nextButton = this._getNextButton(index, this.dir === "ltr" ? -1 : 1);
        break;
      case DOWN_ARROW:
        nextButton = this._getNextButton(index, 1);
        break;
      case RIGHT_ARROW:
        nextButton = this._getNextButton(index, this.dir === "ltr" ? 1 : -1);
        break;
      default:
        return;
    }
    if (nextButton) {
      event.preventDefault();
      nextButton._onButtonClick();
      nextButton.focus();
    }
  }
  /** Dispatch change event with current selection and group value. */
  _emitChangeEvent(toggle) {
    const event = new MatButtonToggleChange(toggle, this.value);
    this._rawValue = event.value;
    this._controlValueAccessorChangeFn(event.value);
    this.change.emit(event);
  }
  /**
   * Syncs a button toggle's selected state with the model value.
   * @param toggle Toggle to be synced.
   * @param select Whether the toggle should be selected.
   * @param isUserInput Whether the change was a result of a user interaction.
   * @param deferEvents Whether to defer emitting the change events.
   */
  _syncButtonToggle(toggle, select, isUserInput = false, deferEvents = false) {
    if (!this.multiple && this.selected && !toggle.checked) {
      this.selected.checked = false;
    }
    if (this._selectionModel) {
      if (select) {
        this._selectionModel.select(toggle);
      } else {
        this._selectionModel.deselect(toggle);
      }
    } else {
      deferEvents = true;
    }
    if (deferEvents) {
      Promise.resolve().then(() => this._updateModelValue(toggle, isUserInput));
    } else {
      this._updateModelValue(toggle, isUserInput);
    }
  }
  /** Checks whether a button toggle is selected. */
  _isSelected(toggle) {
    return this._selectionModel && this._selectionModel.isSelected(toggle);
  }
  /** Determines whether a button toggle should be checked on init. */
  _isPrechecked(toggle) {
    if (typeof this._rawValue === "undefined") {
      return false;
    }
    if (this.multiple && Array.isArray(this._rawValue)) {
      return this._rawValue.some((value) => toggle.value != null && value === toggle.value);
    }
    return toggle.value === this._rawValue;
  }
  /** Initializes the tabindex attribute using the radio pattern. */
  _initializeTabIndex() {
    this._buttonToggles.forEach((toggle) => {
      toggle.tabIndex = -1;
    });
    if (this.selected) {
      this.selected.tabIndex = 0;
    } else {
      for (let i = 0; i < this._buttonToggles.length; i++) {
        const toggle = this._buttonToggles.get(i);
        if (!toggle.disabled) {
          toggle.tabIndex = 0;
          break;
        }
      }
    }
    this._markButtonsForCheck();
  }
  /** Obtain the subsequent toggle to which the focus shifts. */
  _getNextButton(startIndex, offset) {
    const items = this._buttonToggles;
    for (let i = 1; i <= items.length; i++) {
      const index = (startIndex + offset * i + items.length) % items.length;
      const item = items.get(index);
      if (item && !item.disabled) {
        return item;
      }
    }
    return null;
  }
  /** Updates the selection state of the toggles in the group based on a value. */
  _setSelectionByValue(value) {
    this._rawValue = value;
    if (!this._buttonToggles) {
      return;
    }
    const toggles = this._buttonToggles.toArray();
    if (this.multiple && value) {
      if (!Array.isArray(value) && (typeof ngDevMode === "undefined" || ngDevMode)) {
        throw Error("Value must be an array in multiple-selection mode.");
      }
      this._clearSelection();
      value.forEach((currentValue) => this._selectValue(currentValue, toggles));
    } else {
      this._clearSelection();
      this._selectValue(value, toggles);
    }
    if (!this.multiple && toggles.every((toggle) => toggle.tabIndex === -1)) {
      for (const toggle of toggles) {
        if (!toggle.disabled) {
          toggle.tabIndex = 0;
          break;
        }
      }
    }
  }
  /** Clears the selected toggles. */
  _clearSelection() {
    this._selectionModel.clear();
    this._buttonToggles.forEach((toggle) => {
      toggle.checked = false;
      if (!this.multiple) {
        toggle.tabIndex = -1;
      }
    });
  }
  /** Selects a value if there's a toggle that corresponds to it. */
  _selectValue(value, toggles) {
    for (const toggle of toggles) {
      if (toggle.value === value) {
        toggle.checked = true;
        this._selectionModel.select(toggle);
        if (!this.multiple) {
          toggle.tabIndex = 0;
        }
        break;
      }
    }
  }
  /** Syncs up the group's value with the model and emits the change event. */
  _updateModelValue(toggle, isUserInput) {
    if (isUserInput) {
      this._emitChangeEvent(toggle);
    }
    this.valueChange.emit(this.value);
  }
  /** Marks all of the child button toggles to be checked. */
  _markButtonsForCheck() {
    this._buttonToggles?.forEach((toggle) => toggle._markForCheck());
  }
  static \u0275fac = function MatButtonToggleGroup_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatButtonToggleGroup)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _MatButtonToggleGroup,
    selectors: [["mat-button-toggle-group"]],
    contentQueries: function MatButtonToggleGroup_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        \u0275\u0275contentQuery(dirIndex, MatButtonToggle, 5);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx._buttonToggles = _t);
      }
    },
    hostAttrs: [1, "mat-button-toggle-group"],
    hostVars: 6,
    hostBindings: function MatButtonToggleGroup_HostBindings(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275listener("keydown", function MatButtonToggleGroup_keydown_HostBindingHandler($event) {
          return ctx._keydown($event);
        });
      }
      if (rf & 2) {
        \u0275\u0275attribute("role", ctx.multiple ? "group" : "radiogroup")("aria-disabled", ctx.disabled);
        \u0275\u0275classProp("mat-button-toggle-vertical", ctx.vertical)("mat-button-toggle-group-appearance-standard", ctx.appearance === "standard");
      }
    },
    inputs: {
      appearance: "appearance",
      name: "name",
      vertical: [2, "vertical", "vertical", booleanAttribute],
      value: "value",
      multiple: [2, "multiple", "multiple", booleanAttribute],
      disabled: [2, "disabled", "disabled", booleanAttribute],
      disabledInteractive: [2, "disabledInteractive", "disabledInteractive", booleanAttribute],
      hideSingleSelectionIndicator: [2, "hideSingleSelectionIndicator", "hideSingleSelectionIndicator", booleanAttribute],
      hideMultipleSelectionIndicator: [2, "hideMultipleSelectionIndicator", "hideMultipleSelectionIndicator", booleanAttribute]
    },
    outputs: {
      valueChange: "valueChange",
      change: "change"
    },
    exportAs: ["matButtonToggleGroup"],
    features: [\u0275\u0275ProvidersFeature([MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR, {
      provide: MAT_BUTTON_TOGGLE_GROUP,
      useExisting: _MatButtonToggleGroup
    }])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatButtonToggleGroup, [{
    type: Directive,
    args: [{
      selector: "mat-button-toggle-group",
      providers: [MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR, {
        provide: MAT_BUTTON_TOGGLE_GROUP,
        useExisting: MatButtonToggleGroup
      }],
      host: {
        "class": "mat-button-toggle-group",
        "(keydown)": "_keydown($event)",
        "[attr.role]": "multiple ? 'group' : 'radiogroup'",
        "[attr.aria-disabled]": "disabled",
        "[class.mat-button-toggle-vertical]": "vertical",
        "[class.mat-button-toggle-group-appearance-standard]": 'appearance === "standard"'
      },
      exportAs: "matButtonToggleGroup"
    }]
  }], () => [], {
    _buttonToggles: [{
      type: ContentChildren,
      args: [forwardRef(() => MatButtonToggle), {
        // Note that this would technically pick up toggles
        // from nested groups, but that's not a case that we support.
        descendants: true
      }]
    }],
    appearance: [{
      type: Input
    }],
    name: [{
      type: Input
    }],
    vertical: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    value: [{
      type: Input
    }],
    valueChange: [{
      type: Output
    }],
    multiple: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    disabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    disabledInteractive: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    change: [{
      type: Output
    }],
    hideSingleSelectionIndicator: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    hideMultipleSelectionIndicator: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var MatButtonToggle = class _MatButtonToggle {
  _changeDetectorRef = inject(ChangeDetectorRef);
  _elementRef = inject(ElementRef);
  _focusMonitor = inject(FocusMonitor);
  _idGenerator = inject(_IdGenerator);
  _animationMode = inject(ANIMATION_MODULE_TYPE, {
    optional: true
  });
  _checked = false;
  /**
   * Attached to the aria-label attribute of the host element. In most cases, aria-labelledby will
   * take precedence so this may be omitted.
   */
  ariaLabel;
  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  ariaLabelledby = null;
  /** Underlying native `button` element. */
  _buttonElement;
  /** The parent button toggle group (exclusive selection). Optional. */
  buttonToggleGroup;
  /** Unique ID for the underlying `button` element. */
  get buttonId() {
    return `${this.id}-button`;
  }
  /** The unique ID for this button toggle. */
  id;
  /** HTML's 'name' attribute used to group radios for unique selection. */
  name;
  /** MatButtonToggleGroup reads this to assign its own value. */
  value;
  /** Tabindex of the toggle. */
  get tabIndex() {
    return this._tabIndex;
  }
  set tabIndex(value) {
    if (value !== this._tabIndex) {
      this._tabIndex = value;
      this._markForCheck();
    }
  }
  _tabIndex;
  /** Whether ripples are disabled on the button toggle. */
  disableRipple;
  /** The appearance style of the button. */
  get appearance() {
    return this.buttonToggleGroup ? this.buttonToggleGroup.appearance : this._appearance;
  }
  set appearance(value) {
    this._appearance = value;
  }
  _appearance;
  /** Whether the button is checked. */
  get checked() {
    return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
  }
  set checked(value) {
    if (value !== this._checked) {
      this._checked = value;
      if (this.buttonToggleGroup) {
        this.buttonToggleGroup._syncButtonToggle(this, this._checked);
      }
      this._changeDetectorRef.markForCheck();
    }
  }
  /** Whether the button is disabled. */
  get disabled() {
    return this._disabled || this.buttonToggleGroup && this.buttonToggleGroup.disabled;
  }
  set disabled(value) {
    this._disabled = value;
  }
  _disabled = false;
  /** Whether the button should remain interactive when it is disabled. */
  get disabledInteractive() {
    return this._disabledInteractive || this.buttonToggleGroup !== null && this.buttonToggleGroup.disabledInteractive;
  }
  set disabledInteractive(value) {
    this._disabledInteractive = value;
  }
  _disabledInteractive;
  /** Event emitted when the group value changes. */
  change = new EventEmitter();
  constructor() {
    inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
    const toggleGroup = inject(MAT_BUTTON_TOGGLE_GROUP, {
      optional: true
    });
    const defaultTabIndex = inject(new HostAttributeToken("tabindex"), {
      optional: true
    }) || "";
    const defaultOptions = inject(MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS, {
      optional: true
    });
    this._tabIndex = parseInt(defaultTabIndex) || 0;
    this.buttonToggleGroup = toggleGroup;
    this.appearance = defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : "standard";
    this.disabledInteractive = defaultOptions?.disabledInteractive ?? false;
  }
  ngOnInit() {
    const group = this.buttonToggleGroup;
    this.id = this.id || this._idGenerator.getId("mat-button-toggle-");
    if (group) {
      if (group._isPrechecked(this)) {
        this.checked = true;
      } else if (group._isSelected(this) !== this._checked) {
        group._syncButtonToggle(this, this._checked);
      }
    }
  }
  ngAfterViewInit() {
    if (this._animationMode !== "NoopAnimations") {
      this._elementRef.nativeElement.classList.add("mat-button-toggle-animations-enabled");
    }
    this._focusMonitor.monitor(this._elementRef, true);
  }
  ngOnDestroy() {
    const group = this.buttonToggleGroup;
    this._focusMonitor.stopMonitoring(this._elementRef);
    if (group && group._isSelected(this)) {
      group._syncButtonToggle(this, false, false, true);
    }
  }
  /** Focuses the button. */
  focus(options) {
    this._buttonElement.nativeElement.focus(options);
  }
  /** Checks the button toggle due to an interaction with the underlying native button. */
  _onButtonClick() {
    if (this.disabled) {
      return;
    }
    const newChecked = this.isSingleSelector() ? true : !this._checked;
    if (newChecked !== this._checked) {
      this._checked = newChecked;
      if (this.buttonToggleGroup) {
        this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
        this.buttonToggleGroup._onTouched();
      }
    }
    if (this.isSingleSelector()) {
      const focusable = this.buttonToggleGroup._buttonToggles.find((toggle) => {
        return toggle.tabIndex === 0;
      });
      if (focusable) {
        focusable.tabIndex = -1;
      }
      this.tabIndex = 0;
    }
    this.change.emit(new MatButtonToggleChange(this, this.value));
  }
  /**
   * Marks the button toggle as needing checking for change detection.
   * This method is exposed because the parent button toggle group will directly
   * update bound properties of the radio button.
   */
  _markForCheck() {
    this._changeDetectorRef.markForCheck();
  }
  /** Gets the name that should be assigned to the inner DOM node. */
  _getButtonName() {
    if (this.isSingleSelector()) {
      return this.buttonToggleGroup.name;
    }
    return this.name || null;
  }
  /** Whether the toggle is in single selection mode. */
  isSingleSelector() {
    return this.buttonToggleGroup && !this.buttonToggleGroup.multiple;
  }
  static \u0275fac = function MatButtonToggle_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatButtonToggle)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _MatButtonToggle,
    selectors: [["mat-button-toggle"]],
    viewQuery: function MatButtonToggle_Query(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275viewQuery(_c0, 5);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx._buttonElement = _t.first);
      }
    },
    hostAttrs: ["role", "presentation", 1, "mat-button-toggle"],
    hostVars: 14,
    hostBindings: function MatButtonToggle_HostBindings(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275listener("focus", function MatButtonToggle_focus_HostBindingHandler() {
          return ctx.focus();
        });
      }
      if (rf & 2) {
        \u0275\u0275attribute("aria-label", null)("aria-labelledby", null)("id", ctx.id)("name", null);
        \u0275\u0275classProp("mat-button-toggle-standalone", !ctx.buttonToggleGroup)("mat-button-toggle-checked", ctx.checked)("mat-button-toggle-disabled", ctx.disabled)("mat-button-toggle-disabled-interactive", ctx.disabledInteractive)("mat-button-toggle-appearance-standard", ctx.appearance === "standard");
      }
    },
    inputs: {
      ariaLabel: [0, "aria-label", "ariaLabel"],
      ariaLabelledby: [0, "aria-labelledby", "ariaLabelledby"],
      id: "id",
      name: "name",
      value: "value",
      tabIndex: "tabIndex",
      disableRipple: [2, "disableRipple", "disableRipple", booleanAttribute],
      appearance: "appearance",
      checked: [2, "checked", "checked", booleanAttribute],
      disabled: [2, "disabled", "disabled", booleanAttribute],
      disabledInteractive: [2, "disabledInteractive", "disabledInteractive", booleanAttribute]
    },
    outputs: {
      change: "change"
    },
    exportAs: ["matButtonToggle"],
    ngContentSelectors: _c1,
    decls: 7,
    vars: 13,
    consts: [["button", ""], ["type", "button", 1, "mat-button-toggle-button", "mat-focus-indicator", 3, "click", "id", "disabled"], [1, "mat-button-toggle-checkbox-wrapper"], [1, "mat-button-toggle-label-content"], [1, "mat-button-toggle-focus-overlay"], ["matRipple", "", 1, "mat-button-toggle-ripple", 3, "matRippleTrigger", "matRippleDisabled"], ["state", "checked", "aria-hidden", "true", "appearance", "minimal", 3, "disabled"]],
    template: function MatButtonToggle_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = \u0275\u0275getCurrentView();
        \u0275\u0275projectionDef();
        \u0275\u0275elementStart(0, "button", 1, 0);
        \u0275\u0275listener("click", function MatButtonToggle_Template_button_click_0_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx._onButtonClick());
        });
        \u0275\u0275template(2, MatButtonToggle_Conditional_2_Template, 2, 1, "div", 2);
        \u0275\u0275elementStart(3, "span", 3);
        \u0275\u0275projection(4);
        \u0275\u0275elementEnd()();
        \u0275\u0275element(5, "span", 4)(6, "span", 5);
      }
      if (rf & 2) {
        const button_r3 = \u0275\u0275reference(1);
        \u0275\u0275property("id", ctx.buttonId)("disabled", ctx.disabled && !ctx.disabledInteractive || null);
        \u0275\u0275attribute("role", ctx.isSingleSelector() ? "radio" : "button")("tabindex", ctx.disabled && !ctx.disabledInteractive ? -1 : ctx.tabIndex)("aria-pressed", !ctx.isSingleSelector() ? ctx.checked : null)("aria-checked", ctx.isSingleSelector() ? ctx.checked : null)("name", ctx._getButtonName())("aria-label", ctx.ariaLabel)("aria-labelledby", ctx.ariaLabelledby)("aria-disabled", ctx.disabled && ctx.disabledInteractive ? "true" : null);
        \u0275\u0275advance(2);
        \u0275\u0275conditional(ctx.buttonToggleGroup && (!ctx.buttonToggleGroup.multiple && !ctx.buttonToggleGroup.hideSingleSelectionIndicator || ctx.buttonToggleGroup.multiple && !ctx.buttonToggleGroup.hideMultipleSelectionIndicator) ? 2 : -1);
        \u0275\u0275advance(4);
        \u0275\u0275property("matRippleTrigger", button_r3)("matRippleDisabled", ctx.disableRipple || ctx.disabled);
      }
    },
    dependencies: [MatRipple, MatPseudoCheckbox],
    styles: [".mat-button-toggle-standalone,.mat-button-toggle-group{position:relative;display:inline-flex;flex-direction:row;white-space:nowrap;overflow:hidden;-webkit-tap-highlight-color:rgba(0,0,0,0);transform:translateZ(0);border-radius:var(--mat-legacy-button-toggle-shape)}.mat-button-toggle-standalone:not([class*=mat-elevation-z]),.mat-button-toggle-group:not([class*=mat-elevation-z]){box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)}@media(forced-colors: active){.mat-button-toggle-standalone,.mat-button-toggle-group{outline:solid 1px}}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{border-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard .mat-pseudo-checkbox,.mat-button-toggle-group-appearance-standard .mat-pseudo-checkbox{--mat-minimal-pseudo-checkbox-selected-checkmark-color: var(--mat-standard-button-toggle-selected-state-text-color, var(--mat-sys-on-secondary-container))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard:not([class*=mat-elevation-z]),.mat-button-toggle-group-appearance-standard:not([class*=mat-elevation-z]){box-shadow:none}@media(forced-colors: active){.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{outline:0}}.mat-button-toggle-vertical{flex-direction:column}.mat-button-toggle-vertical .mat-button-toggle-label-content{display:block}.mat-button-toggle{white-space:nowrap;position:relative;color:var(--mat-legacy-button-toggle-text-color);font-family:var(--mat-legacy-button-toggle-label-text-font);font-size:var(--mat-legacy-button-toggle-label-text-size);line-height:var(--mat-legacy-button-toggle-label-text-line-height);font-weight:var(--mat-legacy-button-toggle-label-text-weight);letter-spacing:var(--mat-legacy-button-toggle-label-text-tracking);--mat-minimal-pseudo-checkbox-selected-checkmark-color: var(--mat-legacy-button-toggle-selected-state-text-color)}.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-legacy-button-toggle-focus-state-layer-opacity)}.mat-button-toggle .mat-icon svg{vertical-align:top}.mat-button-toggle-checkbox-wrapper{display:inline-block;justify-content:flex-start;align-items:center;width:0;height:18px;line-height:18px;overflow:hidden;box-sizing:border-box;position:absolute;top:50%;left:16px;transform:translate3d(0, -50%, 0)}[dir=rtl] .mat-button-toggle-checkbox-wrapper{left:auto;right:16px}.mat-button-toggle-appearance-standard .mat-button-toggle-checkbox-wrapper{left:12px}[dir=rtl] .mat-button-toggle-appearance-standard .mat-button-toggle-checkbox-wrapper{left:auto;right:12px}.mat-button-toggle-checked .mat-button-toggle-checkbox-wrapper{width:18px}.mat-button-toggle-animations-enabled .mat-button-toggle-checkbox-wrapper{transition:width 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-button-toggle-vertical .mat-button-toggle-checkbox-wrapper{transition:none}.mat-button-toggle-checked{color:var(--mat-legacy-button-toggle-selected-state-text-color);background-color:var(--mat-legacy-button-toggle-selected-state-background-color)}.mat-button-toggle-disabled{pointer-events:none;color:var(--mat-legacy-button-toggle-disabled-state-text-color);background-color:var(--mat-legacy-button-toggle-disabled-state-background-color);--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color: var(--mat-legacy-button-toggle-disabled-state-text-color)}.mat-button-toggle-disabled.mat-button-toggle-checked{background-color:var(--mat-legacy-button-toggle-disabled-selected-state-background-color)}.mat-button-toggle-disabled-interactive{pointer-events:auto}.mat-button-toggle-appearance-standard{color:var(--mat-standard-button-toggle-text-color, var(--mat-sys-on-surface));background-color:var(--mat-standard-button-toggle-background-color, transparent);font-family:var(--mat-standard-button-toggle-label-text-font, var(--mat-sys-label-large-font));font-size:var(--mat-standard-button-toggle-label-text-size, var(--mat-sys-label-large-size));line-height:var(--mat-standard-button-toggle-label-text-line-height, var(--mat-sys-label-large-line-height));font-weight:var(--mat-standard-button-toggle-label-text-weight, var(--mat-sys-label-large-weight));letter-spacing:var(--mat-standard-button-toggle-label-text-tracking, var(--mat-sys-label-large-tracking))}.mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-sys-outline))}[dir=rtl] .mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:none;border-top:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-appearance-standard.mat-button-toggle-checked{color:var(--mat-standard-button-toggle-selected-state-text-color, var(--mat-sys-on-secondary-container));background-color:var(--mat-standard-button-toggle-selected-state-background-color, var(--mat-sys-secondary-container))}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled{color:var(--mat-standard-button-toggle-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));background-color:var(--mat-standard-button-toggle-disabled-state-background-color, transparent)}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled .mat-pseudo-checkbox{--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color: var(--mat-standard-button-toggle-disabled-selected-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent))}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled.mat-button-toggle-checked{color:var(--mat-standard-button-toggle-disabled-selected-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));background-color:var(--mat-standard-button-toggle-disabled-selected-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent))}.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{background-color:var(--mat-standard-button-toggle-state-layer-color, var(--mat-sys-on-surface))}.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{opacity:var(--mat-standard-button-toggle-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity))}.mat-button-toggle-appearance-standard.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-standard-button-toggle-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity))}@media(hover: none){.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{display:none}}.mat-button-toggle-label-content{-webkit-user-select:none;user-select:none;display:inline-block;padding:0 16px;line-height:var(--mat-legacy-button-toggle-height);position:relative}.mat-button-toggle-appearance-standard .mat-button-toggle-label-content{padding:0 12px;line-height:var(--mat-standard-button-toggle-height, 40px)}.mat-button-toggle-label-content>*{vertical-align:middle}.mat-button-toggle-focus-overlay{top:0;left:0;right:0;bottom:0;position:absolute;border-radius:inherit;pointer-events:none;opacity:0;background-color:var(--mat-legacy-button-toggle-state-layer-color)}@media(forced-colors: active){.mat-button-toggle-checked .mat-button-toggle-focus-overlay{border-bottom:solid 500px;opacity:.5;height:0}.mat-button-toggle-checked:hover .mat-button-toggle-focus-overlay{opacity:.6}.mat-button-toggle-checked.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{border-bottom:solid 500px}}.mat-button-toggle .mat-button-toggle-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-button-toggle-button{border:0;background:none;color:inherit;padding:0;margin:0;font:inherit;outline:none;width:100%;cursor:pointer}.mat-button-toggle-animations-enabled .mat-button-toggle-button{transition:padding 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-button-toggle-vertical .mat-button-toggle-button{transition:none}.mat-button-toggle-disabled .mat-button-toggle-button{cursor:default}.mat-button-toggle-button::-moz-focus-inner{border:0}.mat-button-toggle-checked .mat-button-toggle-button:has(.mat-button-toggle-checkbox-wrapper){padding-left:30px}[dir=rtl] .mat-button-toggle-checked .mat-button-toggle-button:has(.mat-button-toggle-checkbox-wrapper){padding-left:0;padding-right:30px}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard{--mat-focus-indicator-border-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard:not(.mat-button-toggle-vertical) .mat-button-toggle:last-of-type .mat-button-toggle-button::before{border-top-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard:not(.mat-button-toggle-vertical) .mat-button-toggle:first-of-type .mat-button-toggle-button::before{border-top-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle:last-of-type .mat-button-toggle-button::before{border-bottom-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle:first-of-type .mat-button-toggle-button::before{border-top-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border-top-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}\n"],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatButtonToggle, [{
    type: Component,
    args: [{
      selector: "mat-button-toggle",
      encapsulation: ViewEncapsulation.None,
      exportAs: "matButtonToggle",
      changeDetection: ChangeDetectionStrategy.OnPush,
      host: {
        "[class.mat-button-toggle-standalone]": "!buttonToggleGroup",
        "[class.mat-button-toggle-checked]": "checked",
        "[class.mat-button-toggle-disabled]": "disabled",
        "[class.mat-button-toggle-disabled-interactive]": "disabledInteractive",
        "[class.mat-button-toggle-appearance-standard]": 'appearance === "standard"',
        "class": "mat-button-toggle",
        "[attr.aria-label]": "null",
        "[attr.aria-labelledby]": "null",
        "[attr.id]": "id",
        "[attr.name]": "null",
        "(focus)": "focus()",
        "role": "presentation"
      },
      imports: [MatRipple, MatPseudoCheckbox],
      template: `<button #button class="mat-button-toggle-button mat-focus-indicator"
        type="button"
        [id]="buttonId"
        [attr.role]="isSingleSelector() ? 'radio' : 'button'"
        [attr.tabindex]="disabled && !disabledInteractive ? -1 : tabIndex"
        [attr.aria-pressed]="!isSingleSelector() ? checked : null"
        [attr.aria-checked]="isSingleSelector() ? checked : null"
        [disabled]="(disabled && !disabledInteractive) || null"
        [attr.name]="_getButtonName()"
        [attr.aria-label]="ariaLabel"
        [attr.aria-labelledby]="ariaLabelledby"
        [attr.aria-disabled]="disabled && disabledInteractive ? 'true' : null"
        (click)="_onButtonClick()">
  @if (buttonToggleGroup && (
    !buttonToggleGroup.multiple && !buttonToggleGroup.hideSingleSelectionIndicator ||
    buttonToggleGroup.multiple && !buttonToggleGroup.hideMultipleSelectionIndicator)
  ) {
    <div class="mat-button-toggle-checkbox-wrapper">
      <mat-pseudo-checkbox
        [disabled]="disabled"
        state="checked"
        aria-hidden="true"
        appearance="minimal"/>
    </div>
  }

  <span class="mat-button-toggle-label-content">
    <ng-content></ng-content>
  </span>
</button>

<span class="mat-button-toggle-focus-overlay"></span>
<span class="mat-button-toggle-ripple" matRipple
     [matRippleTrigger]="button"
     [matRippleDisabled]="this.disableRipple || this.disabled">
</span>
`,
      styles: [".mat-button-toggle-standalone,.mat-button-toggle-group{position:relative;display:inline-flex;flex-direction:row;white-space:nowrap;overflow:hidden;-webkit-tap-highlight-color:rgba(0,0,0,0);transform:translateZ(0);border-radius:var(--mat-legacy-button-toggle-shape)}.mat-button-toggle-standalone:not([class*=mat-elevation-z]),.mat-button-toggle-group:not([class*=mat-elevation-z]){box-shadow:0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)}@media(forced-colors: active){.mat-button-toggle-standalone,.mat-button-toggle-group{outline:solid 1px}}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{border-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard .mat-pseudo-checkbox,.mat-button-toggle-group-appearance-standard .mat-pseudo-checkbox{--mat-minimal-pseudo-checkbox-selected-checkmark-color: var(--mat-standard-button-toggle-selected-state-text-color, var(--mat-sys-on-secondary-container))}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard:not([class*=mat-elevation-z]),.mat-button-toggle-group-appearance-standard:not([class*=mat-elevation-z]){box-shadow:none}@media(forced-colors: active){.mat-button-toggle-standalone.mat-button-toggle-appearance-standard,.mat-button-toggle-group-appearance-standard{outline:0}}.mat-button-toggle-vertical{flex-direction:column}.mat-button-toggle-vertical .mat-button-toggle-label-content{display:block}.mat-button-toggle{white-space:nowrap;position:relative;color:var(--mat-legacy-button-toggle-text-color);font-family:var(--mat-legacy-button-toggle-label-text-font);font-size:var(--mat-legacy-button-toggle-label-text-size);line-height:var(--mat-legacy-button-toggle-label-text-line-height);font-weight:var(--mat-legacy-button-toggle-label-text-weight);letter-spacing:var(--mat-legacy-button-toggle-label-text-tracking);--mat-minimal-pseudo-checkbox-selected-checkmark-color: var(--mat-legacy-button-toggle-selected-state-text-color)}.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-legacy-button-toggle-focus-state-layer-opacity)}.mat-button-toggle .mat-icon svg{vertical-align:top}.mat-button-toggle-checkbox-wrapper{display:inline-block;justify-content:flex-start;align-items:center;width:0;height:18px;line-height:18px;overflow:hidden;box-sizing:border-box;position:absolute;top:50%;left:16px;transform:translate3d(0, -50%, 0)}[dir=rtl] .mat-button-toggle-checkbox-wrapper{left:auto;right:16px}.mat-button-toggle-appearance-standard .mat-button-toggle-checkbox-wrapper{left:12px}[dir=rtl] .mat-button-toggle-appearance-standard .mat-button-toggle-checkbox-wrapper{left:auto;right:12px}.mat-button-toggle-checked .mat-button-toggle-checkbox-wrapper{width:18px}.mat-button-toggle-animations-enabled .mat-button-toggle-checkbox-wrapper{transition:width 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-button-toggle-vertical .mat-button-toggle-checkbox-wrapper{transition:none}.mat-button-toggle-checked{color:var(--mat-legacy-button-toggle-selected-state-text-color);background-color:var(--mat-legacy-button-toggle-selected-state-background-color)}.mat-button-toggle-disabled{pointer-events:none;color:var(--mat-legacy-button-toggle-disabled-state-text-color);background-color:var(--mat-legacy-button-toggle-disabled-state-background-color);--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color: var(--mat-legacy-button-toggle-disabled-state-text-color)}.mat-button-toggle-disabled.mat-button-toggle-checked{background-color:var(--mat-legacy-button-toggle-disabled-selected-state-background-color)}.mat-button-toggle-disabled-interactive{pointer-events:auto}.mat-button-toggle-appearance-standard{color:var(--mat-standard-button-toggle-text-color, var(--mat-sys-on-surface));background-color:var(--mat-standard-button-toggle-background-color, transparent);font-family:var(--mat-standard-button-toggle-label-text-font, var(--mat-sys-label-large-font));font-size:var(--mat-standard-button-toggle-label-text-size, var(--mat-sys-label-large-size));line-height:var(--mat-standard-button-toggle-label-text-line-height, var(--mat-sys-label-large-line-height));font-weight:var(--mat-standard-button-toggle-label-text-weight, var(--mat-sys-label-large-weight));letter-spacing:var(--mat-standard-button-toggle-label-text-tracking, var(--mat-sys-label-large-tracking))}.mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-sys-outline))}[dir=rtl] .mat-button-toggle-group-appearance-standard .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle-appearance-standard+.mat-button-toggle-appearance-standard{border-left:none;border-right:none;border-top:solid 1px var(--mat-standard-button-toggle-divider-color, var(--mat-sys-outline))}.mat-button-toggle-appearance-standard.mat-button-toggle-checked{color:var(--mat-standard-button-toggle-selected-state-text-color, var(--mat-sys-on-secondary-container));background-color:var(--mat-standard-button-toggle-selected-state-background-color, var(--mat-sys-secondary-container))}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled{color:var(--mat-standard-button-toggle-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));background-color:var(--mat-standard-button-toggle-disabled-state-background-color, transparent)}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled .mat-pseudo-checkbox{--mat-minimal-pseudo-checkbox-disabled-selected-checkmark-color: var(--mat-standard-button-toggle-disabled-selected-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent))}.mat-button-toggle-appearance-standard.mat-button-toggle-disabled.mat-button-toggle-checked{color:var(--mat-standard-button-toggle-disabled-selected-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));background-color:var(--mat-standard-button-toggle-disabled-selected-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent))}.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{background-color:var(--mat-standard-button-toggle-state-layer-color, var(--mat-sys-on-surface))}.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{opacity:var(--mat-standard-button-toggle-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity))}.mat-button-toggle-appearance-standard.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:var(--mat-standard-button-toggle-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity))}@media(hover: none){.mat-button-toggle-appearance-standard:hover .mat-button-toggle-focus-overlay{display:none}}.mat-button-toggle-label-content{-webkit-user-select:none;user-select:none;display:inline-block;padding:0 16px;line-height:var(--mat-legacy-button-toggle-height);position:relative}.mat-button-toggle-appearance-standard .mat-button-toggle-label-content{padding:0 12px;line-height:var(--mat-standard-button-toggle-height, 40px)}.mat-button-toggle-label-content>*{vertical-align:middle}.mat-button-toggle-focus-overlay{top:0;left:0;right:0;bottom:0;position:absolute;border-radius:inherit;pointer-events:none;opacity:0;background-color:var(--mat-legacy-button-toggle-state-layer-color)}@media(forced-colors: active){.mat-button-toggle-checked .mat-button-toggle-focus-overlay{border-bottom:solid 500px;opacity:.5;height:0}.mat-button-toggle-checked:hover .mat-button-toggle-focus-overlay{opacity:.6}.mat-button-toggle-checked.mat-button-toggle-appearance-standard .mat-button-toggle-focus-overlay{border-bottom:solid 500px}}.mat-button-toggle .mat-button-toggle-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}.mat-button-toggle-button{border:0;background:none;color:inherit;padding:0;margin:0;font:inherit;outline:none;width:100%;cursor:pointer}.mat-button-toggle-animations-enabled .mat-button-toggle-button{transition:padding 150ms 45ms cubic-bezier(0.4, 0, 0.2, 1)}.mat-button-toggle-vertical .mat-button-toggle-button{transition:none}.mat-button-toggle-disabled .mat-button-toggle-button{cursor:default}.mat-button-toggle-button::-moz-focus-inner{border:0}.mat-button-toggle-checked .mat-button-toggle-button:has(.mat-button-toggle-checkbox-wrapper){padding-left:30px}[dir=rtl] .mat-button-toggle-checked .mat-button-toggle-button:has(.mat-button-toggle-checkbox-wrapper){padding-left:0;padding-right:30px}.mat-button-toggle-standalone.mat-button-toggle-appearance-standard{--mat-focus-indicator-border-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard:not(.mat-button-toggle-vertical) .mat-button-toggle:last-of-type .mat-button-toggle-button::before{border-top-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard:not(.mat-button-toggle-vertical) .mat-button-toggle:first-of-type .mat-button-toggle-button::before{border-top-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle:last-of-type .mat-button-toggle-button::before{border-bottom-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border-bottom-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}.mat-button-toggle-group-appearance-standard.mat-button-toggle-vertical .mat-button-toggle:first-of-type .mat-button-toggle-button::before{border-top-right-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large));border-top-left-radius:var(--mat-standard-button-toggle-shape, var(--mat-sys-corner-extra-large))}\n"]
    }]
  }], () => [], {
    ariaLabel: [{
      type: Input,
      args: ["aria-label"]
    }],
    ariaLabelledby: [{
      type: Input,
      args: ["aria-labelledby"]
    }],
    _buttonElement: [{
      type: ViewChild,
      args: ["button"]
    }],
    id: [{
      type: Input
    }],
    name: [{
      type: Input
    }],
    value: [{
      type: Input
    }],
    tabIndex: [{
      type: Input
    }],
    disableRipple: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    appearance: [{
      type: Input
    }],
    checked: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    disabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    disabledInteractive: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    change: [{
      type: Output
    }]
  });
})();
var MatButtonToggleModule = class _MatButtonToggleModule {
  static \u0275fac = function MatButtonToggleModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatButtonToggleModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _MatButtonToggleModule,
    imports: [MatCommonModule, MatRippleModule, MatButtonToggleGroup, MatButtonToggle],
    exports: [MatCommonModule, MatButtonToggleGroup, MatButtonToggle]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    imports: [MatCommonModule, MatRippleModule, MatButtonToggle, MatCommonModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatButtonToggleModule, [{
    type: NgModule,
    args: [{
      imports: [MatCommonModule, MatRippleModule, MatButtonToggleGroup, MatButtonToggle],
      exports: [MatCommonModule, MatButtonToggleGroup, MatButtonToggle]
    }]
  }], null, null);
})();

// src/app/features/system/components/log-console/log-console.component.ts
function LogConsoleComponent_For_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-button-toggle", 4);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cat_r1 = ctx.$implicit;
    \u0275\u0275property("value", cat_r1);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(cat_r1);
  }
}
function LogConsoleComponent_div_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 9)(1, "span", 10);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 11);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 12);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 13);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const log_r2 = ctx.$implicit;
    \u0275\u0275classMap("log-" + log_r2.level.toLowerCase());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(log_r2.time);
    \u0275\u0275advance();
    \u0275\u0275classMap("level-" + log_r2.level.toLowerCase());
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(log_r2.level);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("[", log_r2.cat, "]");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(log_r2.msg);
  }
}
var LogConsoleComponent = class _LogConsoleComponent {
  state = inject(SystemStateService);
  categories = ["HUE", "LOXONE", "SYSTEM", "SYNC", "LIGHT", "UDP", "ERROR", "DEBUG"];
  setFilter(filter) {
    this.state.setFilter(filter);
  }
  clearLogs() {
    this.state.clearLogs();
  }
  refreshLogs() {
    this.state.loadLogs();
  }
  static \u0275fac = function LogConsoleComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LogConsoleComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LogConsoleComponent, selectors: [["app-log-console"]], decls: 19, vars: 2, consts: [[1, "log-card"], [1, "flex-spacer"], [3, "change", "value"], ["value", "ALL"], [3, "value"], ["mat-icon-button", "", "matTooltip", "Clear logs", 3, "click"], ["mat-icon-button", "", "matTooltip", "Refresh", 3, "click"], ["itemSize", "28", 1, "log-viewport"], ["class", "log-entry", 3, "class", 4, "cdkVirtualFor", "cdkVirtualForOf"], [1, "log-entry"], [1, "log-time"], [1, "log-level"], [1, "log-cat"], [1, "log-message"]], template: function LogConsoleComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "mat-card", 0)(1, "mat-card-header")(2, "mat-card-title");
      \u0275\u0275text(3, "Log Console");
      \u0275\u0275elementEnd();
      \u0275\u0275element(4, "span", 1);
      \u0275\u0275elementStart(5, "mat-button-toggle-group", 2);
      \u0275\u0275listener("change", function LogConsoleComponent_Template_mat_button_toggle_group_change_5_listener($event) {
        return ctx.setFilter($event.value);
      });
      \u0275\u0275elementStart(6, "mat-button-toggle", 3);
      \u0275\u0275text(7, "All");
      \u0275\u0275elementEnd();
      \u0275\u0275repeaterCreate(8, LogConsoleComponent_For_9_Template, 2, 2, "mat-button-toggle", 4, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(10, "button", 5);
      \u0275\u0275listener("click", function LogConsoleComponent_Template_button_click_10_listener() {
        return ctx.clearLogs();
      });
      \u0275\u0275elementStart(11, "mat-icon");
      \u0275\u0275text(12, "delete_sweep");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(13, "button", 6);
      \u0275\u0275listener("click", function LogConsoleComponent_Template_button_click_13_listener() {
        return ctx.refreshLogs();
      });
      \u0275\u0275elementStart(14, "mat-icon");
      \u0275\u0275text(15, "refresh");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(16, "mat-card-content")(17, "cdk-virtual-scroll-viewport", 7);
      \u0275\u0275template(18, LogConsoleComponent_div_18_Template, 9, 8, "div", 8);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275property("value", ctx.state.filter());
      \u0275\u0275advance(3);
      \u0275\u0275repeater(ctx.categories);
      \u0275\u0275advance(10);
      \u0275\u0275property("cdkVirtualForOf", ctx.state.filteredLogs());
    }
  }, dependencies: [MatCardModule, MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatButtonModule, MatIconButton, MatButtonToggleModule, MatButtonToggleGroup, MatButtonToggle, MatIconModule, MatIcon, ScrollingModule, CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport], styles: ['\n\n[_nghost-%COMP%] {\n  display: block;\n}\n.log-card[_ngcontent-%COMP%] {\n  height: 500px;\n}\nmat-card-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\nmat-card-content[_ngcontent-%COMP%] {\n  padding: 0 16px 16px !important;\n}\n.log-viewport[_ngcontent-%COMP%] {\n  height: 380px;\n  font-family:\n    "Monaco",\n    "Consolas",\n    monospace;\n  font-size: 12px;\n  background: rgba(0, 0, 0, 0.03);\n  border-radius: 4px;\n}\nhtml.dark[_nghost-%COMP%]   .log-viewport[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .log-viewport[_ngcontent-%COMP%] {\n  background: rgba(0, 0, 0, 0.2);\n}\n.log-entry[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  padding: 4px 8px;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.05);\n}\nhtml.dark[_nghost-%COMP%]   .log-entry[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .log-entry[_ngcontent-%COMP%] {\n  border-bottom-color: rgba(255, 255, 255, 0.05);\n}\n.log-time[_ngcontent-%COMP%] {\n  color: #888;\n  flex-shrink: 0;\n  min-width: 85px;\n}\n.log-level[_ngcontent-%COMP%] {\n  font-weight: 600;\n  min-width: 60px;\n  flex-shrink: 0;\n  text-transform: uppercase;\n  font-size: 11px;\n}\n.log-cat[_ngcontent-%COMP%] {\n  color: #888;\n  min-width: 70px;\n  flex-shrink: 0;\n}\n.log-message[_ngcontent-%COMP%] {\n  flex: 1;\n  word-break: break-word;\n}\n.level-success[_ngcontent-%COMP%] {\n  color: #4caf50;\n}\n.level-info[_ngcontent-%COMP%] {\n  color: #2196f3;\n}\n.level-debug[_ngcontent-%COMP%] {\n  color: #9e9e9e;\n}\n.level-warn[_ngcontent-%COMP%] {\n  color: #ff9800;\n}\n.level-error[_ngcontent-%COMP%] {\n  color: #f44336;\n}\n.log-error[_ngcontent-%COMP%] {\n  background: rgba(244, 67, 54, 0.1);\n}\n.log-warn[_ngcontent-%COMP%] {\n  background: rgba(255, 152, 0, 0.1);\n}\n.log-success[_ngcontent-%COMP%] {\n  background: rgba(76, 175, 80, 0.05);\n}\n/*# sourceMappingURL=log-console.component.css.map */'], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LogConsoleComponent, [{
    type: Component,
    args: [{ selector: "app-log-console", standalone: true, imports: [
      MatCardModule,
      MatButtonModule,
      MatButtonToggleModule,
      MatIconModule,
      ScrollingModule
    ], template: `
    <mat-card class="log-card">
      <mat-card-header>
        <mat-card-title>Log Console</mat-card-title>
        <span class="flex-spacer"></span>
        <mat-button-toggle-group [value]="state.filter()" (change)="setFilter($event.value)">
          <mat-button-toggle value="ALL">All</mat-button-toggle>
          @for (cat of categories; track cat) {
            <mat-button-toggle [value]="cat">{{ cat }}</mat-button-toggle>
          }
        </mat-button-toggle-group>
        <button mat-icon-button (click)="clearLogs()" matTooltip="Clear logs">
          <mat-icon>delete_sweep</mat-icon>
        </button>
        <button mat-icon-button (click)="refreshLogs()" matTooltip="Refresh">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content>
        <cdk-virtual-scroll-viewport itemSize="28" class="log-viewport">
          <div *cdkVirtualFor="let log of state.filteredLogs()" class="log-entry" [class]="'log-' + log.level.toLowerCase()">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level" [class]="'level-' + log.level.toLowerCase()">{{ log.level }}</span>
            <span class="log-cat">[{{ log.cat }}]</span>
            <span class="log-message">{{ log.msg }}</span>
          </div>
        </cdk-virtual-scroll-viewport>
      </mat-card-content>
    </mat-card>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ['/* angular:styles/component:scss;ad011179bb6fae5c8e4f652ff6eb82faa2957097fc4c7c6d764b77762a63fe09;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/system/components/log-console/log-console.component.ts */\n:host {\n  display: block;\n}\n.log-card {\n  height: 500px;\n}\nmat-card-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\nmat-card-content {\n  padding: 0 16px 16px !important;\n}\n.log-viewport {\n  height: 380px;\n  font-family:\n    "Monaco",\n    "Consolas",\n    monospace;\n  font-size: 12px;\n  background: rgba(0, 0, 0, 0.03);\n  border-radius: 4px;\n}\n:host-context(html.dark) .log-viewport {\n  background: rgba(0, 0, 0, 0.2);\n}\n.log-entry {\n  display: flex;\n  gap: 12px;\n  padding: 4px 8px;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.05);\n}\n:host-context(html.dark) .log-entry {\n  border-bottom-color: rgba(255, 255, 255, 0.05);\n}\n.log-time {\n  color: #888;\n  flex-shrink: 0;\n  min-width: 85px;\n}\n.log-level {\n  font-weight: 600;\n  min-width: 60px;\n  flex-shrink: 0;\n  text-transform: uppercase;\n  font-size: 11px;\n}\n.log-cat {\n  color: #888;\n  min-width: 70px;\n  flex-shrink: 0;\n}\n.log-message {\n  flex: 1;\n  word-break: break-word;\n}\n.level-success {\n  color: #4caf50;\n}\n.level-info {\n  color: #2196f3;\n}\n.level-debug {\n  color: #9e9e9e;\n}\n.level-warn {\n  color: #ff9800;\n}\n.level-error {\n  color: #f44336;\n}\n.log-error {\n  background: rgba(244, 67, 54, 0.1);\n}\n.log-warn {\n  background: rgba(255, 152, 0, 0.1);\n}\n.log-success {\n  background: rgba(76, 175, 80, 0.05);\n}\n/*# sourceMappingURL=log-console.component.css.map */\n'] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LogConsoleComponent, { className: "LogConsoleComponent", filePath: "src/app/features/system/components/log-console/log-console.component.ts", lineNumber: 138 });
})();

// src/app/features/system/components/system-page/system-page.component.ts
function SystemPageComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 3);
    \u0275\u0275element(1, "mat-spinner", 6);
    \u0275\u0275elementEnd();
  }
}
function SystemPageComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-settings-form");
  }
}
function SystemPageComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.state.error(), " ");
  }
}
var SystemPageComponent = class _SystemPageComponent {
  state = inject(SystemStateService);
  ngOnInit() {
    this.state.loadSettings();
    this.state.loadLogs();
    this.state.startPolling();
  }
  ngOnDestroy() {
    this.state.stopPolling();
  }
  static \u0275fac = function SystemPageComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SystemPageComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SystemPageComponent, selectors: [["app-system-page"]], decls: 10, vars: 2, consts: [[1, "system-page"], ["label", "Settings"], [1, "tab-content"], [1, "loading-container"], ["label", "Logs"], [1, "error-banner"], ["diameter", "40"]], template: function SystemPageComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "mat-tab-group")(2, "mat-tab", 1)(3, "div", 2);
      \u0275\u0275template(4, SystemPageComponent_Conditional_4_Template, 2, 0, "div", 3)(5, SystemPageComponent_Conditional_5_Template, 1, 0, "app-settings-form");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "mat-tab", 4)(7, "div", 2);
      \u0275\u0275element(8, "app-log-console");
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(9, SystemPageComponent_Conditional_9_Template, 2, 1, "div", 5);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.state.loading() ? 4 : 5);
      \u0275\u0275advance(5);
      \u0275\u0275conditional(ctx.state.error() ? 9 : -1);
    }
  }, dependencies: [
    MatCardModule,
    MatTabsModule,
    MatTab,
    MatTabGroup,
    MatProgressSpinnerModule,
    MatProgressSpinner,
    SettingsFormComponent,
    LogConsoleComponent
  ], styles: ["\n\n.system-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.tab-content[_ngcontent-%COMP%] {\n  padding: 16px 0;\n}\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.error-banner[_ngcontent-%COMP%] {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=system-page.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SystemPageComponent, [{
    type: Component,
    args: [{ selector: "app-system-page", standalone: true, imports: [
      MatCardModule,
      MatTabsModule,
      MatProgressSpinnerModule,
      SettingsFormComponent,
      LogConsoleComponent
    ], template: `
    <div class="system-page">
      <mat-tab-group>
        <mat-tab label="Settings">
          <div class="tab-content">
            @if (state.loading()) {
              <div class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
            } @else {
              <app-settings-form />
            }
          </div>
        </mat-tab>
        <mat-tab label="Logs">
          <div class="tab-content">
            <app-log-console />
          </div>
        </mat-tab>
      </mat-tab-group>

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;c8d2cb2180b552b1ccaf1dd07971371a4f965a92db046d62779e019a92ff9b94;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/system/components/system-page/system-page.component.ts */\n.system-page {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.tab-content {\n  padding: 16px 0;\n}\n.loading-container {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.error-banner {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=system-page.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SystemPageComponent, { className: "SystemPageComponent", filePath: "src/app/features/system/components/system-page/system-page.component.ts", lineNumber: 73 });
})();

// src/app/features/system/system.routes.ts
var SYSTEM_ROUTES = [
  { path: "", component: SystemPageComponent }
];
export {
  SYSTEM_ROUTES
};
//# sourceMappingURL=chunk-QXXQHS7M.js.map
