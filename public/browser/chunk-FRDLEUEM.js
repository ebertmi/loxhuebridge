import {
  ConfirmDialogComponent,
  LightsStateService,
  MatDialog,
  MatOption,
  MatSelect,
  MatSelectModule
} from "./chunk-F5OQNRVL.js";
import {
  BadgeComponent
} from "./chunk-JEBIZK53.js";
import "./chunk-UTCZUIUQ.js";
import {
  ColorDotComponent
} from "./chunk-P4PK2U4R.js";
import {
  ExportButtonComponent
} from "./chunk-STIUHK2R.js";
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
  SystemStateService
} from "./chunk-EGTMMTNG.js";
import {
  loxoneNameValidator
} from "./chunk-2JXLUE2R.js";
import "./chunk-XKOREQBY.js";
import {
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatInput,
  MatInputModule,
  MatLabel,
  NgControlStatus,
  NgControlStatusGroup,
  ReactiveFormsModule,
  Validators,
  ɵNgNoValidate
} from "./chunk-D4AT3CLM.js";
import "./chunk-FL3KYB4C.js";
import {
  MatCard,
  MatCardActions,
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
  computed,
  inject,
  input,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵconditional,
  ɵɵdefineComponent,
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
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-U74TQY52.js";

// src/app/features/lights/components/mapping-form/mapping-form.component.ts
var _forTrack0 = ($index, $item) => $item.uuid;
function MappingFormComponent_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-option", 3)(1, "span", 9)(2, "span", 10);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 11);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 12);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const target_r1 = ctx.$implicit;
    \u0275\u0275property("value", target_r1);
    \u0275\u0275advance(2);
    \u0275\u0275classMap(target_r1.type);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", target_r1.type === "light" ? "\u{1F4A1}" : "\u{1F3E0}", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(target_r1.name);
    \u0275\u0275advance();
    \u0275\u0275classMap(target_r1.type);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(target_r1.type);
  }
}
function MappingFormComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Name is required");
    \u0275\u0275elementEnd();
  }
}
function MappingFormComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Invalid characters in name");
    \u0275\u0275elementEnd();
  }
}
function MappingFormComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-form-field", 6)(1, "mat-label");
    \u0275\u0275text(2, "Loxone Format");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-select", 13)(4, "mat-option", 14);
    \u0275\u0275text(5, "Smart Actuator (Dimmer)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "mat-option", 15);
    \u0275\u0275text(7, "RGB Numeric");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "mat-option", 16);
    \u0275\u0275text(9, "Switch (On/Off)");
    \u0275\u0275elementEnd()()();
  }
}
function MappingFormComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-form-field", 7)(1, "mat-label");
    \u0275\u0275text(2, "Sync Mode");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-select", 17)(4, "mat-option", 18);
    \u0275\u0275text(5, "HTTP");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "mat-option", 19);
    \u0275\u0275text(7, "Bidirectional");
    \u0275\u0275elementEnd()()();
  }
}
var MappingFormComponent = class _MappingFormComponent {
  fb = inject(FormBuilder);
  lightsState = inject(LightsStateService);
  systemState = inject(SystemStateService);
  targets = input.required();
  mappingType = input("light");
  form = this.fb.group({
    target: [null, Validators.required],
    loxoneName: ["", [Validators.required, loxoneNameValidator()]],
    loxoneFormat: ["smart_actuator"],
    syncMode: ["http"]
  });
  get canSelectBidirectional() {
    const settings = this.systemState.settings();
    return !!(settings?.loxone_connection_configured && settings?.bidirectional_sync);
  }
  onTargetChange() {
    const target = this.form.controls.target.value;
    if (target && !this.form.controls.loxoneName.value) {
      this.form.controls.loxoneName.setValue(target.name);
    }
  }
  onSubmit() {
    if (!this.form.valid)
      return;
    const target = this.form.controls.target.value;
    const mapping = {
      loxone_name: this.form.controls.loxoneName.value,
      hue_id: target.uuid,
      hue_name: target.name,
      hue_type: target.type,
      sync_mode: this.form.controls.syncMode.value
    };
    if (this.mappingType() === "light") {
      mapping.loxone_format = this.form.controls.loxoneFormat.value;
    }
    this.lightsState.addMapping(mapping);
    this.form.reset({ loxoneFormat: "smart_actuator", syncMode: "http" });
  }
  static \u0275fac = function MappingFormComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MappingFormComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MappingFormComponent, selectors: [["app-mapping-form"]], inputs: { targets: [1, "targets"], mappingType: [1, "mappingType"] }, decls: 19, vars: 7, consts: [[1, "mapping-form", 3, "ngSubmit", "formGroup"], [1, "target-field"], ["formControlName", "target", 3, "selectionChange"], [3, "value"], [1, "name-field"], ["matInput", "", "formControlName", "loxoneName", "placeholder", "e.g., Living Room Light"], [1, "format-field"], [1, "mode-field"], ["mat-flat-button", "", "color", "primary", "type", "submit", 3, "disabled"], [1, "target-option"], [1, "type-badge"], [1, "target-name"], [1, "type-label"], ["formControlName", "loxoneFormat"], ["value", "smart_actuator"], ["value", "rgb"], ["value", "switch"], ["formControlName", "syncMode"], ["value", "http"], ["value", "bidirectional"]], template: function MappingFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "form", 0);
      \u0275\u0275listener("ngSubmit", function MappingFormComponent_Template_form_ngSubmit_0_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementStart(1, "mat-form-field", 1)(2, "mat-label");
      \u0275\u0275text(3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "mat-select", 2);
      \u0275\u0275listener("selectionChange", function MappingFormComponent_Template_mat_select_selectionChange_4_listener() {
        return ctx.onTargetChange();
      });
      \u0275\u0275repeaterCreate(5, MappingFormComponent_For_6_Template, 8, 8, "mat-option", 3, _forTrack0);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "mat-form-field", 4)(8, "mat-label");
      \u0275\u0275text(9, "Loxone Name");
      \u0275\u0275elementEnd();
      \u0275\u0275element(10, "input", 5);
      \u0275\u0275template(11, MappingFormComponent_Conditional_11_Template, 2, 0, "mat-error")(12, MappingFormComponent_Conditional_12_Template, 2, 0, "mat-error");
      \u0275\u0275elementEnd();
      \u0275\u0275template(13, MappingFormComponent_Conditional_13_Template, 10, 0, "mat-form-field", 6)(14, MappingFormComponent_Conditional_14_Template, 8, 0, "mat-form-field", 7);
      \u0275\u0275elementStart(15, "button", 8)(16, "mat-icon");
      \u0275\u0275text(17, "add");
      \u0275\u0275elementEnd();
      \u0275\u0275text(18, " Add Mapping ");
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275property("formGroup", ctx.form);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1("Select ", ctx.mappingType() === "light" ? "Light/Group" : ctx.mappingType(), "");
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.targets());
      \u0275\u0275advance(6);
      \u0275\u0275conditional(ctx.form.controls.loxoneName.hasError("required") ? 11 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.form.controls.loxoneName.hasError("invalidLoxoneName") ? 12 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.mappingType() === "light" ? 13 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.mappingType() === "light" && ctx.canSelectBidirectional ? 14 : -1);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", !ctx.form.valid);
    }
  }, dependencies: [ReactiveFormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatFormFieldModule, MatFormField, MatLabel, MatError, MatInputModule, MatInput, MatSelectModule, MatSelect, MatOption, MatButtonModule, MatButton, MatIconModule, MatIcon], styles: ["\n\n.mapping-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n  align-items: flex-start;\n}\n.target-field[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 200px;\n}\n.name-field[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 200px;\n}\n.format-field[_ngcontent-%COMP%] {\n  min-width: 180px;\n}\n.target-option[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n}\n.type-badge[_ngcontent-%COMP%] {\n  font-size: 1.1em;\n  width: 24px;\n  text-align: center;\n}\n.target-name[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.type-label[_ngcontent-%COMP%] {\n  font-size: 0.7em;\n  font-weight: 600;\n  text-transform: uppercase;\n  padding: 2px 8px;\n  border-radius: 4px;\n  letter-spacing: 0.5px;\n}\n.type-label.light[_ngcontent-%COMP%] {\n  background: rgba(255, 193, 7, 0.2);\n  color: #f9a825;\n}\n.type-label.group[_ngcontent-%COMP%] {\n  background: rgba(33, 150, 243, 0.2);\n  color: #1976d2;\n}\n.mode-field[_ngcontent-%COMP%] {\n  min-width: 150px;\n}\nbutton[_ngcontent-%COMP%] {\n  height: 56px;\n}\n/*# sourceMappingURL=mapping-form.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MappingFormComponent, [{
    type: Component,
    args: [{ selector: "app-mapping-form", standalone: true, imports: [
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule
    ], template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mapping-form">
      <mat-form-field class="target-field">
        <mat-label>Select {{ mappingType() === 'light' ? 'Light/Group' : mappingType() }}</mat-label>
        <mat-select formControlName="target" (selectionChange)="onTargetChange()">
          @for (target of targets(); track target.uuid) {
            <mat-option [value]="target">
              <span class="target-option">
                <span class="type-badge" [class]="target.type">
                  {{ target.type === 'light' ? '\u{1F4A1}' : '\u{1F3E0}' }}
                </span>
                <span class="target-name">{{ target.name }}</span>
                <span class="type-label" [class]="target.type">{{ target.type }}</span>
              </span>
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="name-field">
        <mat-label>Loxone Name</mat-label>
        <input matInput formControlName="loxoneName" placeholder="e.g., Living Room Light">
        @if (form.controls.loxoneName.hasError('required')) {
          <mat-error>Name is required</mat-error>
        }
        @if (form.controls.loxoneName.hasError('invalidLoxoneName')) {
          <mat-error>Invalid characters in name</mat-error>
        }
      </mat-form-field>

      @if (mappingType() === 'light') {
        <mat-form-field class="format-field">
          <mat-label>Loxone Format</mat-label>
          <mat-select formControlName="loxoneFormat">
            <mat-option value="smart_actuator">Smart Actuator (Dimmer)</mat-option>
            <mat-option value="rgb">RGB Numeric</mat-option>
            <mat-option value="switch">Switch (On/Off)</mat-option>
          </mat-select>
        </mat-form-field>
      }

      @if (mappingType() === 'light' && canSelectBidirectional) {
        <mat-form-field class="mode-field">
          <mat-label>Sync Mode</mat-label>
          <mat-select formControlName="syncMode">
            <mat-option value="http">HTTP</mat-option>
            <mat-option value="bidirectional">Bidirectional</mat-option>
          </mat-select>
        </mat-form-field>
      }

      <button mat-flat-button color="primary" type="submit" [disabled]="!form.valid">
        <mat-icon>add</mat-icon>
        Add Mapping
      </button>
    </form>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;7f8c7dc7e580e7ea70dbea23f4550a4fc0a307a66f86f4c5a39d4ff799cad560;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/lights/components/mapping-form/mapping-form.component.ts */\n.mapping-form {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n  align-items: flex-start;\n}\n.target-field {\n  flex: 1;\n  min-width: 200px;\n}\n.name-field {\n  flex: 1;\n  min-width: 200px;\n}\n.format-field {\n  min-width: 180px;\n}\n.target-option {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n}\n.type-badge {\n  font-size: 1.1em;\n  width: 24px;\n  text-align: center;\n}\n.target-name {\n  flex: 1;\n}\n.type-label {\n  font-size: 0.7em;\n  font-weight: 600;\n  text-transform: uppercase;\n  padding: 2px 8px;\n  border-radius: 4px;\n  letter-spacing: 0.5px;\n}\n.type-label.light {\n  background: rgba(255, 193, 7, 0.2);\n  color: #f9a825;\n}\n.type-label.group {\n  background: rgba(33, 150, 243, 0.2);\n  color: #1976d2;\n}\n.mode-field {\n  min-width: 150px;\n}\nbutton {\n  height: 56px;\n}\n/*# sourceMappingURL=mapping-form.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MappingFormComponent, { className: "MappingFormComponent", filePath: "src/app/features/lights/components/mapping-form/mapping-form.component.ts", lineNumber: 149 });
})();

// src/app/features/lights/components/mapping-item/mapping-item.component.ts
function MappingItemComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 9);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.formatLabel);
  }
}
function MappingItemComponent_Conditional_16_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-badge", 16);
  }
  if (rf & 2) {
    const status_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("variant", status_r2.on ? "on" : "off")("text", status_r2.on ? "On" : "Off");
  }
}
function MappingItemComponent_Conditional_16_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-badge", 17);
  }
  if (rf & 2) {
    const status_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("text", status_r2.brightness + "%");
  }
}
function MappingItemComponent_Conditional_16_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-color-dot", 18);
  }
  if (rf & 2) {
    \u0275\u0275property("xy", ctx)("size", 20);
  }
}
function MappingItemComponent_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, MappingItemComponent_Conditional_16_Conditional_0_Template, 1, 2, "app-badge", 16)(1, MappingItemComponent_Conditional_16_Conditional_1_Template, 1, 1, "app-badge", 17)(2, MappingItemComponent_Conditional_16_Conditional_2_Template, 1, 2, "app-color-dot", 18);
  }
  if (rf & 2) {
    let tmp_4_0;
    const status_r2 = ctx;
    \u0275\u0275conditional(status_r2.on !== void 0 ? 0 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(status_r2.brightness !== void 0 && status_r2.on ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_4_0 = status_r2.color == null ? null : status_r2.color.xy) ? 2 : -1, tmp_4_0);
  }
}
function MappingItemComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-select", 19);
    \u0275\u0275listener("selectionChange", function MappingItemComponent_Conditional_18_Template_mat_select_selectionChange_0_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onSyncModeChange($event.value));
    });
    \u0275\u0275elementStart(1, "mat-option", 20);
    \u0275\u0275text(2, "HTTP");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-option", 21);
    \u0275\u0275text(4, "Bidirectional");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("value", ctx_r0.mapping().sync_mode || "http");
  }
}
function MappingItemComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 13);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("matTooltip", "Bidirectional sync is globally disabled in settings");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", (ctx_r0.mapping().sync_mode || "http") === "bidirectional" ? "Bidirectional" : "HTTP", " ");
  }
}
function MappingItemComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 14);
    \u0275\u0275text(1, "HTTP");
    \u0275\u0275elementEnd();
  }
}
var MappingItemComponent = class _MappingItemComponent {
  dialog = inject(MatDialog);
  lightsState = inject(LightsStateService);
  systemState = inject(SystemStateService);
  mapping = input.required();
  get canSelectBidirectional() {
    const settings = this.systemState.settings();
    return !!(settings?.loxone_connection_configured && settings?.bidirectional_sync);
  }
  get isBidirectionalGloballyDisabled() {
    const settings = this.systemState.settings();
    return !!(settings?.loxone_connection_configured && !settings?.bidirectional_sync);
  }
  get formatLabel() {
    const format = this.mapping().loxone_format;
    switch (format) {
      case "smart_actuator":
        return "Dimmer";
      case "rgb":
        return "RGB";
      case "switch":
        return "Switch";
      default:
        return format || "";
    }
  }
  onSyncModeChange(mode) {
    this.lightsState.updateMapping(this.mapping().loxone_name, {
      sync_mode: mode
    });
  }
  confirmDelete() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Delete Mapping",
        message: `Are you sure you want to delete the mapping "${this.mapping().loxone_name}"?`,
        confirmText: "Delete",
        confirmColor: "warn"
      }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.lightsState.deleteMapping(this.mapping().loxone_name);
      }
    });
  }
  static \u0275fac = function MappingItemComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MappingItemComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MappingItemComponent, selectors: [["app-mapping-item"]], inputs: { mapping: [1, "mapping"] }, decls: 24, vars: 9, consts: [[1, "mapping-item"], [1, "mapping-info"], [1, "mapping-header"], [1, "type-emoji"], [1, "loxone-name"], [1, "arrow"], [1, "hue-name"], [1, "type-label"], [1, "mapping-meta"], [1, "format-badge"], [1, "mapping-status"], [1, "mapping-actions"], [1, "sync-mode-select", 3, "value"], [1, "sync-mode-chip", 3, "matTooltip"], [1, "sync-mode-chip"], ["mat-icon-button", "", "color", "warn", "matTooltip", "Delete mapping", 3, "click"], [3, "variant", "text"], ["variant", "brightness", 3, "text"], ["title", "Current color", 3, "xy", "size"], [1, "sync-mode-select", 3, "selectionChange", "value"], ["value", "http"], ["value", "bidirectional"]], template: function MappingItemComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "span", 3);
      \u0275\u0275text(4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "span", 4);
      \u0275\u0275text(6);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "span", 5);
      \u0275\u0275text(8, "\u2192");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "span", 6);
      \u0275\u0275text(10);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "span", 7);
      \u0275\u0275text(12);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(13, "div", 8);
      \u0275\u0275template(14, MappingItemComponent_Conditional_14_Template, 2, 1, "span", 9);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(15, "div", 10);
      \u0275\u0275template(16, MappingItemComponent_Conditional_16_Template, 3, 3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "div", 11);
      \u0275\u0275template(18, MappingItemComponent_Conditional_18_Template, 5, 1, "mat-select", 12)(19, MappingItemComponent_Conditional_19_Template, 2, 2, "span", 13)(20, MappingItemComponent_Conditional_20_Template, 2, 0, "span", 14);
      \u0275\u0275elementStart(21, "button", 15);
      \u0275\u0275listener("click", function MappingItemComponent_Template_button_click_21_listener() {
        return ctx.confirmDelete();
      });
      \u0275\u0275elementStart(22, "mat-icon");
      \u0275\u0275text(23, "delete");
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      let tmp_6_0;
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.mapping().hue_type === "light" ? "\u{1F4A1}" : "\u{1F3E0}");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.mapping().loxone_name);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.mapping().hue_name);
      \u0275\u0275advance();
      \u0275\u0275classMap(ctx.mapping().hue_type);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate(ctx.mapping().hue_type);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.mapping().loxone_format ? 14 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional((tmp_6_0 = ctx.mapping().currentStatus) ? 16 : -1, tmp_6_0);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.canSelectBidirectional ? 18 : ctx.isBidirectionalGloballyDisabled ? 19 : 20);
    }
  }, dependencies: [
    MatIconModule,
    MatIcon,
    MatButtonModule,
    MatIconButton,
    MatSelectModule,
    MatSelect,
    MatOption,
    MatTooltipModule,
    MatTooltip,
    BadgeComponent,
    ColorDotComponent
  ], styles: ["\n\n.mapping-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  padding: 12px;\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n}\nhtml.dark[_nghost-%COMP%]   .mapping-item[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .mapping-item[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n}\n.mapping-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.mapping-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 4px;\n}\n.type-emoji[_ngcontent-%COMP%] {\n  font-size: 1.1em;\n  width: 24px;\n  text-align: center;\n}\n.loxone-name[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n.arrow[_ngcontent-%COMP%] {\n  opacity: 0.4;\n}\n.hue-name[_ngcontent-%COMP%] {\n  opacity: 0.7;\n}\n.type-label[_ngcontent-%COMP%] {\n  font-size: 0.7em;\n  font-weight: 600;\n  text-transform: uppercase;\n  padding: 2px 8px;\n  border-radius: 4px;\n  letter-spacing: 0.5px;\n  margin-left: 4px;\n}\n.type-label.light[_ngcontent-%COMP%] {\n  background: rgba(255, 193, 7, 0.2);\n  color: #f9a825;\n}\n.type-label.group[_ngcontent-%COMP%] {\n  background: rgba(33, 150, 243, 0.2);\n  color: #1976d2;\n}\n.mapping-meta[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  padding-left: 32px;\n}\n.format-badge[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  padding: 2px 6px;\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.08);\n}\nhtml.dark[_nghost-%COMP%]   .format-badge[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .format-badge[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.1);\n}\n.mapping-status[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.mapping-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.sync-mode-select[_ngcontent-%COMP%] {\n  width: 130px;\n}\n.sync-mode-chip[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  padding: 4px 10px;\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.08);\n  letter-spacing: 0.5px;\n  cursor: default;\n}\nhtml.dark[_nghost-%COMP%]   .sync-mode-chip[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .sync-mode-chip[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.1);\n}\n/*# sourceMappingURL=mapping-item.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MappingItemComponent, [{
    type: Component,
    args: [{ selector: "app-mapping-item", standalone: true, imports: [
      MatIconModule,
      MatButtonModule,
      MatSelectModule,
      MatTooltipModule,
      BadgeComponent,
      ColorDotComponent
    ], template: `
    <div class="mapping-item">
      <div class="mapping-info">
        <div class="mapping-header">
          <span class="type-emoji">{{ mapping().hue_type === 'light' ? '\u{1F4A1}' : '\u{1F3E0}' }}</span>
          <span class="loxone-name">{{ mapping().loxone_name }}</span>
          <span class="arrow">\u2192</span>
          <span class="hue-name">{{ mapping().hue_name }}</span>
          <span class="type-label" [class]="mapping().hue_type">{{ mapping().hue_type }}</span>
        </div>
        <div class="mapping-meta">
          @if (mapping().loxone_format) {
            <span class="format-badge">{{ formatLabel }}</span>
          }
        </div>
      </div>

      <div class="mapping-status">
        @if (mapping().currentStatus; as status) {
          @if (status.on !== undefined) {
            <app-badge
              [variant]="status.on ? 'on' : 'off'"
              [text]="status.on ? 'On' : 'Off'" />
          }
          @if (status.brightness !== undefined && status.on) {
            <app-badge
              variant="brightness"
              [text]="status.brightness + '%'" />
          }
          @if (status.color?.xy; as xy) {
            <app-color-dot
              [xy]="xy"
              [size]="20"
              title="Current color" />
          }
        }
      </div>

      <div class="mapping-actions">
        @if (canSelectBidirectional) {
          <mat-select
            class="sync-mode-select"
            [value]="mapping().sync_mode || 'http'"
            (selectionChange)="onSyncModeChange($event.value)">
            <mat-option value="http">HTTP</mat-option>
            <mat-option value="bidirectional">Bidirectional</mat-option>
          </mat-select>
        } @else if (isBidirectionalGloballyDisabled) {
          <span class="sync-mode-chip" [matTooltip]="'Bidirectional sync is globally disabled in settings'">
            {{ (mapping().sync_mode || 'http') === 'bidirectional' ? 'Bidirectional' : 'HTTP' }}
          </span>
        } @else {
          <span class="sync-mode-chip">HTTP</span>
        }
        <button mat-icon-button color="warn" (click)="confirmDelete()" matTooltip="Delete mapping">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;8fea667856dedbf9b8c4b70728c31022bc34f2f51f4112d327b77772197fe18f;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/lights/components/mapping-item/mapping-item.component.ts */\n.mapping-item {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  padding: 12px;\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n}\n:host-context(html.dark) .mapping-item {\n  background: rgba(255, 255, 255, 0.05);\n}\n.mapping-info {\n  flex: 1;\n  min-width: 0;\n}\n.mapping-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 4px;\n}\n.type-emoji {\n  font-size: 1.1em;\n  width: 24px;\n  text-align: center;\n}\n.loxone-name {\n  font-weight: 500;\n}\n.arrow {\n  opacity: 0.4;\n}\n.hue-name {\n  opacity: 0.7;\n}\n.type-label {\n  font-size: 0.7em;\n  font-weight: 600;\n  text-transform: uppercase;\n  padding: 2px 8px;\n  border-radius: 4px;\n  letter-spacing: 0.5px;\n  margin-left: 4px;\n}\n.type-label.light {\n  background: rgba(255, 193, 7, 0.2);\n  color: #f9a825;\n}\n.type-label.group {\n  background: rgba(33, 150, 243, 0.2);\n  color: #1976d2;\n}\n.mapping-meta {\n  display: flex;\n  gap: 8px;\n  padding-left: 32px;\n}\n.format-badge {\n  font-size: 0.75rem;\n  padding: 2px 6px;\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.08);\n}\n:host-context(html.dark) .format-badge {\n  background: rgba(255, 255, 255, 0.1);\n}\n.mapping-status {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.mapping-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.sync-mode-select {\n  width: 130px;\n}\n.sync-mode-chip {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  padding: 4px 10px;\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.08);\n  letter-spacing: 0.5px;\n  cursor: default;\n}\n:host-context(html.dark) .sync-mode-chip {\n  background: rgba(255, 255, 255, 0.1);\n}\n/*# sourceMappingURL=mapping-item.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MappingItemComponent, { className: "MappingItemComponent", filePath: "src/app/features/lights/components/mapping-item/mapping-item.component.ts", lineNumber: 199 });
})();

// src/app/features/lights/components/mapping-list/mapping-list.component.ts
var _forTrack02 = ($index, $item) => $item.loxone_name;
function MappingListComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-mapping-item", 1);
  }
  if (rf & 2) {
    const mapping_r1 = ctx.$implicit;
    \u0275\u0275property("mapping", mapping_r1);
  }
}
var MappingListComponent = class _MappingListComponent {
  mappings = input.required();
  static \u0275fac = function MappingListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MappingListComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MappingListComponent, selectors: [["app-mapping-list"]], inputs: { mappings: [1, "mappings"] }, decls: 3, vars: 0, consts: [[1, "mapping-list"], [3, "mapping"]], template: function MappingListComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275repeaterCreate(1, MappingListComponent_For_2_Template, 1, 1, "app-mapping-item", 1, _forTrack02);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.mappings());
    }
  }, dependencies: [MappingItemComponent], styles: ["\n\n.mapping-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n/*# sourceMappingURL=mapping-list.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MappingListComponent, [{
    type: Component,
    args: [{ selector: "app-mapping-list", standalone: true, imports: [MappingItemComponent], template: `
    <div class="mapping-list">
      @for (mapping of mappings(); track mapping.loxone_name) {
        <app-mapping-item [mapping]="mapping" />
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;9824e21a8f9164b0429a997d6f5b3853e042c7131527cddb66b0bad9bc3fa7b8;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/lights/components/mapping-list/mapping-list.component.ts */\n.mapping-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n/*# sourceMappingURL=mapping-list.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MappingListComponent, { className: "MappingListComponent", filePath: "src/app/features/lights/components/mapping-list/mapping-list.component.ts", lineNumber: 25 });
})();

// src/app/features/lights/components/detected-commands/detected-commands.component.ts
var _forTrack03 = ($index, $item) => $item.name;
function DetectedCommandsComponent_Conditional_0_For_11_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 5);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r3 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("= ", item_r3.value, "");
  }
}
function DetectedCommandsComponent_Conditional_0_For_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-chip", 4);
    \u0275\u0275listener("click", function DetectedCommandsComponent_Conditional_0_For_11_Template_mat_chip_click_0_listener() {
      const item_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.useDetected(item_r3.name));
    });
    \u0275\u0275text(1);
    \u0275\u0275template(2, DetectedCommandsComponent_Conditional_0_For_11_Conditional_2_Template, 2, 1, "span", 5);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", item_r3.name, " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(item_r3.value ? 2 : -1);
  }
}
function DetectedCommandsComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "mat-card", 0)(1, "mat-card-header")(2, "mat-icon", 1);
    \u0275\u0275text(3, "notification_important");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "mat-card-title");
    \u0275\u0275text(5, "New Loxone Commands Detected");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "mat-card-subtitle");
    \u0275\u0275text(7, "Click a command to create a mapping");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "mat-card-content")(9, "mat-chip-set");
    \u0275\u0275repeaterCreate(10, DetectedCommandsComponent_Conditional_0_For_11_Template, 3, 2, "mat-chip", null, _forTrack03);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "mat-card-actions", 2)(13, "button", 3);
    \u0275\u0275listener("click", function DetectedCommandsComponent_Conditional_0_Template_button_click_13_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.clearAll());
    });
    \u0275\u0275elementStart(14, "mat-icon");
    \u0275\u0275text(15, "clear_all");
    \u0275\u0275elementEnd();
    \u0275\u0275text(16, " Clear All ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275repeater(ctx_r3.state.detected());
  }
}
var DetectedCommandsComponent = class _DetectedCommandsComponent {
  state = inject(LightsStateService);
  hasDetected = computed(() => this.state.detected().length > 0);
  useDetected(name) {
    console.log("Use detected command:", name);
  }
  clearAll() {
    this.state.clearDetected();
  }
  static \u0275fac = function DetectedCommandsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DetectedCommandsComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DetectedCommandsComponent, selectors: [["app-detected-commands"]], decls: 1, vars: 1, consts: [[1, "detected-card"], ["matCardAvatar", ""], ["align", "end"], ["mat-button", "", "color", "warn", 3, "click"], [3, "click"], [1, "value"]], template: function DetectedCommandsComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275template(0, DetectedCommandsComponent_Conditional_0_Template, 17, 0, "mat-card", 0);
    }
    if (rf & 2) {
      \u0275\u0275conditional(ctx.hasDetected() ? 0 : -1);
    }
  }, dependencies: [MatCardModule, MatCard, MatCardActions, MatCardAvatar, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatChipsModule, MatChip, MatChipSet, MatIconModule, MatIcon, MatButtonModule, MatButton], styles: ["\n\n.detected-card[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #fff3e0 0%,\n      #ffe0b2 100%);\n  margin-bottom: 16px;\n}\nhtml.dark[_nghost-%COMP%]   .detected-card[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .detected-card[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #3e2723 0%,\n      #4e342e 100%);\n}\nmat-card-header[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\nmat-chip[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.value[_ngcontent-%COMP%] {\n  opacity: 0.6;\n  margin-left: 4px;\n}\n/*# sourceMappingURL=detected-commands.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DetectedCommandsComponent, [{
    type: Component,
    args: [{ selector: "app-detected-commands", standalone: true, imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule], template: `
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
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;8dc4349153ab8dd5a88877e9eaaf8c50fba1bc1568f35793c906af0ff29f96b0;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/lights/components/detected-commands/detected-commands.component.ts */\n.detected-card {\n  background:\n    linear-gradient(\n      135deg,\n      #fff3e0 0%,\n      #ffe0b2 100%);\n  margin-bottom: 16px;\n}\n:host-context(html.dark) .detected-card {\n  background:\n    linear-gradient(\n      135deg,\n      #3e2723 0%,\n      #4e342e 100%);\n}\nmat-card-header {\n  margin-bottom: 8px;\n}\nmat-chip {\n  cursor: pointer;\n}\n.value {\n  opacity: 0.6;\n  margin-left: 4px;\n}\n/*# sourceMappingURL=detected-commands.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DetectedCommandsComponent, { className: "DetectedCommandsComponent", filePath: "src/app/features/lights/components/detected-commands/detected-commands.component.ts", lineNumber: 66 });
})();

// src/app/features/lights/components/lights-page/lights-page.component.ts
function LightsPageComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275element(1, "mat-spinner", 3);
    \u0275\u0275elementEnd();
  }
}
function LightsPageComponent_Conditional_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 6)(1, "mat-card-header")(2, "mat-card-title");
    \u0275\u0275text(3, "Mapped Lights");
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "span", 8)(5, "app-export-button", 9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "mat-card-content");
    \u0275\u0275element(7, "app-mapping-list", 10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(7);
    \u0275\u0275property("mappings", ctx_r0.state.mappingsWithStatus());
  }
}
function LightsPageComponent_Conditional_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-empty-state", 7);
  }
}
function LightsPageComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-detected-commands");
    \u0275\u0275elementStart(1, "mat-card", 4)(2, "mat-card-header")(3, "mat-card-title");
    \u0275\u0275text(4, "Add Light Mapping");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "mat-card-content");
    \u0275\u0275element(6, "app-mapping-form", 5);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(7, LightsPageComponent_Conditional_2_Conditional_7_Template, 8, 1, "mat-card", 6)(8, LightsPageComponent_Conditional_2_Conditional_8_Template, 1, 0, "app-empty-state", 7);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275property("targets", ctx_r0.state.availableLightTargets());
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.state.lightMappings().length > 0 ? 7 : 8);
  }
}
function LightsPageComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.state.error(), " ");
  }
}
var LightsPageComponent = class _LightsPageComponent {
  state = inject(LightsStateService);
  ngOnInit() {
    this.state.loadAll();
    this.state.startPolling();
  }
  ngOnDestroy() {
    this.state.stopPolling();
  }
  static \u0275fac = function LightsPageComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LightsPageComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LightsPageComponent, selectors: [["app-lights-page"]], decls: 4, vars: 2, consts: [[1, "lights-page"], [1, "loading-container"], [1, "error-banner"], ["diameter", "40"], [1, "form-card"], ["mappingType", "light", 3, "targets"], [1, "list-card"], ["icon", "lightbulb", "title", "No lights mapped", "message", "Add a mapping above to control Hue lights from Loxone"], [1, "flex-spacer"], ["exportType", "outputs"], [3, "mappings"]], template: function LightsPageComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275template(1, LightsPageComponent_Conditional_1_Template, 2, 0, "div", 1)(2, LightsPageComponent_Conditional_2_Template, 9, 2)(3, LightsPageComponent_Conditional_3_Template, 2, 1, "div", 2);
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
    MatCardTitle,
    MatProgressSpinnerModule,
    MatProgressSpinner,
    MappingFormComponent,
    MappingListComponent,
    DetectedCommandsComponent,
    ExportButtonComponent,
    EmptyStateComponent
  ], styles: ["\n\n.lights-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.form-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], \n.list-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.error-banner[_ngcontent-%COMP%] {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=lights-page.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LightsPageComponent, [{
    type: Component,
    args: [{ selector: "app-lights-page", standalone: true, imports: [
      MatCardModule,
      MatProgressSpinnerModule,
      MappingFormComponent,
      MappingListComponent,
      DetectedCommandsComponent,
      ExportButtonComponent,
      EmptyStateComponent
    ], template: `
    <div class="lights-page">
      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <app-detected-commands />

        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Add Light Mapping</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-mapping-form
              [targets]="state.availableLightTargets()"
              mappingType="light" />
          </mat-card-content>
        </mat-card>

        @if (state.lightMappings().length > 0) {
          <mat-card class="list-card">
            <mat-card-header>
              <mat-card-title>Mapped Lights</mat-card-title>
              <span class="flex-spacer"></span>
              <app-export-button exportType="outputs" />
            </mat-card-header>
            <mat-card-content>
              <app-mapping-list [mappings]="state.mappingsWithStatus()" />
            </mat-card-content>
          </mat-card>
        } @else {
          <app-empty-state
            icon="lightbulb"
            title="No lights mapped"
            message="Add a mapping above to control Hue lights from Loxone">
          </app-empty-state>
        }
      }

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;5d486c8c4ff994631abe46f71b377ba964a57073fa20458b99d6d5a449e166e9;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/lights/components/lights-page/lights-page.component.ts */\n.lights-page {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.loading-container {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.form-card mat-card-header,\n.list-card mat-card-header {\n  display: flex;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.error-banner {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=lights-page.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LightsPageComponent, { className: "LightsPageComponent", filePath: "src/app/features/lights/components/lights-page/lights-page.component.ts", lineNumber: 100 });
})();

// src/app/features/lights/lights.routes.ts
var LIGHTS_ROUTES = [
  { path: "", component: LightsPageComponent }
];
export {
  LIGHTS_ROUTES
};
//# sourceMappingURL=chunk-FRDLEUEM.js.map
