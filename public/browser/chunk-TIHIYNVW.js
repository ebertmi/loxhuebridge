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
  ExportButtonComponent
} from "./chunk-STIUHK2R.js";
import {
  EmptyStateComponent
} from "./chunk-KKD2F7FI.js";
import {
  MatTooltip,
  MatTooltipModule
} from "./chunk-R2RN7UQH.js";
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
  MatCardContent,
  MatCardHeader,
  MatCardModule,
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
  ɵsetClassDebugInfo,
  ɵɵadvance,
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
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-U74TQY52.js";

// src/app/features/buttons/services/buttons-state.service.ts
var ButtonsStateService = class _ButtonsStateService {
  lightsState = inject(LightsStateService);
  loading = this.lightsState.loading;
  error = this.lightsState.error;
  targets = this.lightsState.targets;
  detected = this.lightsState.detected;
  status = this.lightsState.status;
  buttonMappings = computed(() => this.lightsState.mappings().filter((m) => m.hue_type === "button"));
  availableButtonTargets = computed(() => {
    const mappedIds = new Set(this.buttonMappings().map((m) => m.hue_id));
    return this.targets().filter((t) => t.type === "button" && !mappedIds.has(t.uuid));
  });
  mappingsWithStatus = computed(() => {
    const statusMap = this.status();
    return this.buttonMappings().map((m) => __spreadProps(__spreadValues({}, m), {
      currentStatus: statusMap[m.loxone_name]
    }));
  });
  loadAll() {
    this.lightsState.loadAll();
  }
  startPolling(intervalMs = 2e3) {
    this.lightsState.startPolling(intervalMs);
  }
  stopPolling() {
    this.lightsState.stopPolling();
  }
  addMapping = this.lightsState.addMapping.bind(this.lightsState);
  updateMapping = this.lightsState.updateMapping.bind(this.lightsState);
  deleteMapping = this.lightsState.deleteMapping.bind(this.lightsState);
  clearDetected = this.lightsState.clearDetected.bind(this.lightsState);
  static \u0275fac = function ButtonsStateService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ButtonsStateService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ButtonsStateService, factory: _ButtonsStateService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ButtonsStateService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/features/buttons/components/button-mapping-form/button-mapping-form.component.ts
var _forTrack0 = ($index, $item) => $item.uuid;
function ButtonMappingFormComponent_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-option", 3)(1, "span", 7)(2, "span", 8);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 9);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const target_r1 = ctx.$implicit;
    \u0275\u0275property("value", target_r1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(target_r1.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(target_r1.type);
  }
}
function ButtonMappingFormComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Name is required");
    \u0275\u0275elementEnd();
  }
}
function ButtonMappingFormComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Invalid characters in name");
    \u0275\u0275elementEnd();
  }
}
var ButtonMappingFormComponent = class _ButtonMappingFormComponent {
  fb = inject(FormBuilder);
  buttonsState = inject(ButtonsStateService);
  targets = input.required();
  form = this.fb.group({
    target: [null, Validators.required],
    loxoneName: ["", [Validators.required, loxoneNameValidator()]]
  });
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
      hue_type: "button",
      sync_mode: "http"
    };
    this.buttonsState.addMapping(mapping);
    this.form.reset();
  }
  static \u0275fac = function ButtonMappingFormComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ButtonMappingFormComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ButtonMappingFormComponent, selectors: [["app-button-mapping-form"]], inputs: { targets: [1, "targets"] }, decls: 17, vars: 4, consts: [[1, "mapping-form", 3, "ngSubmit", "formGroup"], [1, "target-field"], ["formControlName", "target", 3, "selectionChange"], [3, "value"], [1, "name-field"], ["matInput", "", "formControlName", "loxoneName", "placeholder", "e.g., Hue Switch Bedroom"], ["mat-flat-button", "", "color", "primary", "type", "submit", 3, "disabled"], [1, "target-option"], [1, "target-name"], [1, "target-type"]], template: function ButtonMappingFormComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "form", 0);
      \u0275\u0275listener("ngSubmit", function ButtonMappingFormComponent_Template_form_ngSubmit_0_listener() {
        return ctx.onSubmit();
      });
      \u0275\u0275elementStart(1, "mat-form-field", 1)(2, "mat-label");
      \u0275\u0275text(3, "Select Button");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "mat-select", 2);
      \u0275\u0275listener("selectionChange", function ButtonMappingFormComponent_Template_mat_select_selectionChange_4_listener() {
        return ctx.onTargetChange();
      });
      \u0275\u0275repeaterCreate(5, ButtonMappingFormComponent_For_6_Template, 6, 3, "mat-option", 3, _forTrack0);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "mat-form-field", 4)(8, "mat-label");
      \u0275\u0275text(9, "Loxone Virtual Input Name");
      \u0275\u0275elementEnd();
      \u0275\u0275element(10, "input", 5);
      \u0275\u0275template(11, ButtonMappingFormComponent_Conditional_11_Template, 2, 0, "mat-error")(12, ButtonMappingFormComponent_Conditional_12_Template, 2, 0, "mat-error");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(13, "button", 6)(14, "mat-icon");
      \u0275\u0275text(15, "add");
      \u0275\u0275elementEnd();
      \u0275\u0275text(16, " Add Mapping ");
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275property("formGroup", ctx.form);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.targets());
      \u0275\u0275advance(6);
      \u0275\u0275conditional(ctx.form.controls.loxoneName.hasError("required") ? 11 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.form.controls.loxoneName.hasError("invalidLoxoneName") ? 12 : -1);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", !ctx.form.valid);
    }
  }, dependencies: [ReactiveFormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, FormGroupDirective, FormControlName, MatFormFieldModule, MatFormField, MatLabel, MatError, MatInputModule, MatInput, MatSelectModule, MatSelect, MatOption, MatButtonModule, MatButton, MatIconModule, MatIcon], styles: ["\n\n.mapping-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n  align-items: flex-start;\n}\n.target-field[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 200px;\n}\n.name-field[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 200px;\n}\n.target-option[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  width: 100%;\n}\n.target-type[_ngcontent-%COMP%] {\n  opacity: 0.6;\n  font-size: 0.875em;\n}\nbutton[_ngcontent-%COMP%] {\n  height: 56px;\n}\n/*# sourceMappingURL=button-mapping-form.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ButtonMappingFormComponent, [{
    type: Component,
    args: [{ selector: "app-button-mapping-form", standalone: true, imports: [
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule
    ], template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mapping-form">
      <mat-form-field class="target-field">
        <mat-label>Select Button</mat-label>
        <mat-select formControlName="target" (selectionChange)="onTargetChange()">
          @for (target of targets(); track target.uuid) {
            <mat-option [value]="target">
              <span class="target-option">
                <span class="target-name">{{ target.name }}</span>
                <span class="target-type">{{ target.type }}</span>
              </span>
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field class="name-field">
        <mat-label>Loxone Virtual Input Name</mat-label>
        <input matInput formControlName="loxoneName" placeholder="e.g., Hue Switch Bedroom">
        @if (form.controls.loxoneName.hasError('required')) {
          <mat-error>Name is required</mat-error>
        }
        @if (form.controls.loxoneName.hasError('invalidLoxoneName')) {
          <mat-error>Invalid characters in name</mat-error>
        }
      </mat-form-field>

      <button mat-flat-button color="primary" type="submit" [disabled]="!form.valid">
        <mat-icon>add</mat-icon>
        Add Mapping
      </button>
    </form>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;059cb70d79ce9061fcabe9bacc6106025c8dc714a50a9689a2564dbb0a505050;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/buttons/components/button-mapping-form/button-mapping-form.component.ts */\n.mapping-form {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n  align-items: flex-start;\n}\n.target-field {\n  flex: 1;\n  min-width: 200px;\n}\n.name-field {\n  flex: 1;\n  min-width: 200px;\n}\n.target-option {\n  display: flex;\n  justify-content: space-between;\n  width: 100%;\n}\n.target-type {\n  opacity: 0.6;\n  font-size: 0.875em;\n}\nbutton {\n  height: 56px;\n}\n/*# sourceMappingURL=button-mapping-form.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ButtonMappingFormComponent, { className: "ButtonMappingFormComponent", filePath: "src/app/features/buttons/components/button-mapping-form/button-mapping-form.component.ts", lineNumber: 91 });
})();

// src/app/features/buttons/components/button-mapping-list/button-mapping-list.component.ts
var _forTrack02 = ($index, $item) => $item.loxone_name;
function ButtonMappingListComponent_For_2_Conditional_12_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-badge", 12);
  }
  if (rf & 2) {
    const status_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("text", "Event: " + status_r2.button_event);
  }
}
function ButtonMappingListComponent_For_2_Conditional_12_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-badge", 13);
  }
  if (rf & 2) {
    const status_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("text", status_r2.battery + "%")("lowBattery", status_r2.battery < 20);
  }
}
function ButtonMappingListComponent_For_2_Conditional_12_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 14);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const status_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(status_r2.last_updated);
  }
}
function ButtonMappingListComponent_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, ButtonMappingListComponent_For_2_Conditional_12_Conditional_0_Template, 1, 1, "app-badge", 12)(1, ButtonMappingListComponent_For_2_Conditional_12_Conditional_1_Template, 1, 2, "app-badge", 13)(2, ButtonMappingListComponent_For_2_Conditional_12_Conditional_2_Template, 2, 1, "span", 14);
  }
  if (rf & 2) {
    const status_r2 = ctx;
    \u0275\u0275conditional(status_r2.button_event !== void 0 ? 0 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(status_r2.battery !== void 0 ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(status_r2.last_updated ? 2 : -1);
  }
}
function ButtonMappingListComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "div", 3)(3, "mat-icon", 4);
    \u0275\u0275text(4, "radio_button_checked");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 5);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 6);
    \u0275\u0275text(8, "\u2192");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 7);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(11, "div", 8);
    \u0275\u0275template(12, ButtonMappingListComponent_For_2_Conditional_12_Template, 3, 3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "div", 9)(14, "span", 10);
    \u0275\u0275text(15, "HTTP");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "button", 11);
    \u0275\u0275listener("click", function ButtonMappingListComponent_For_2_Template_button_click_16_listener() {
      const mapping_r3 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.confirmDelete(mapping_r3.loxone_name));
    });
    \u0275\u0275elementStart(17, "mat-icon");
    \u0275\u0275text(18, "delete");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    let tmp_12_0;
    const mapping_r3 = ctx.$implicit;
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(mapping_r3.loxone_name);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(mapping_r3.hue_name);
    \u0275\u0275advance(2);
    \u0275\u0275conditional((tmp_12_0 = mapping_r3.currentStatus) ? 12 : -1, tmp_12_0);
  }
}
var ButtonMappingListComponent = class _ButtonMappingListComponent {
  dialog = inject(MatDialog);
  buttonsState = inject(ButtonsStateService);
  mappings = input.required();
  confirmDelete(loxoneName) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Delete Mapping",
        message: `Are you sure you want to delete the mapping "${loxoneName}"?`,
        confirmText: "Delete",
        confirmColor: "warn"
      }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.buttonsState.deleteMapping(loxoneName);
      }
    });
  }
  static \u0275fac = function ButtonMappingListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ButtonMappingListComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ButtonMappingListComponent, selectors: [["app-button-mapping-list"]], inputs: { mappings: [1, "mappings"] }, decls: 3, vars: 0, consts: [[1, "mapping-list"], [1, "mapping-item"], [1, "mapping-info"], [1, "mapping-header"], [1, "type-icon"], [1, "loxone-name"], [1, "arrow"], [1, "hue-name"], [1, "mapping-status"], [1, "mapping-actions"], [1, "sync-mode-chip"], ["mat-icon-button", "", "color", "warn", "matTooltip", "Delete mapping", 3, "click"], ["variant", "default", 3, "text"], ["variant", "battery", 3, "text", "lowBattery"], [1, "last-updated"]], template: function ButtonMappingListComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275repeaterCreate(1, ButtonMappingListComponent_For_2_Template, 19, 3, "div", 1, _forTrack02);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.mappings());
    }
  }, dependencies: [MatIconModule, MatIcon, MatButtonModule, MatIconButton, MatTooltipModule, MatTooltip, BadgeComponent], styles: ["\n\n.mapping-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.mapping-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  padding: 12px;\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n}\nhtml.dark[_nghost-%COMP%]   .mapping-item[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .mapping-item[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n}\n.mapping-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.mapping-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.type-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  opacity: 0.6;\n}\n.loxone-name[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n.arrow[_ngcontent-%COMP%] {\n  opacity: 0.4;\n}\n.hue-name[_ngcontent-%COMP%] {\n  opacity: 0.7;\n}\n.mapping-status[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.last-updated[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  opacity: 0.5;\n}\n.mapping-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.sync-mode-chip[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  padding: 4px 10px;\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.08);\n  letter-spacing: 0.5px;\n  cursor: default;\n}\nhtml.dark[_nghost-%COMP%]   .sync-mode-chip[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .sync-mode-chip[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.1);\n}\n/*# sourceMappingURL=button-mapping-list.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ButtonMappingListComponent, [{
    type: Component,
    args: [{ selector: "app-button-mapping-list", standalone: true, imports: [
      MatIconModule,
      MatButtonModule,
      MatTooltipModule,
      BadgeComponent
    ], template: `
    <div class="mapping-list">
      @for (mapping of mappings(); track mapping.loxone_name) {
        <div class="mapping-item">
          <div class="mapping-info">
            <div class="mapping-header">
              <mat-icon class="type-icon">radio_button_checked</mat-icon>
              <span class="loxone-name">{{ mapping.loxone_name }}</span>
              <span class="arrow">\u2192</span>
              <span class="hue-name">{{ mapping.hue_name }}</span>
            </div>
          </div>

          <div class="mapping-status">
            @if (mapping.currentStatus; as status) {
              @if (status.button_event !== undefined) {
                <app-badge
                  variant="default"
                  [text]="'Event: ' + status.button_event" />
              }
              @if (status.battery !== undefined) {
                <app-badge
                  variant="battery"
                  [text]="status.battery + '%'"
                  [lowBattery]="status.battery < 20" />
              }
              @if (status.last_updated) {
                <span class="last-updated">{{ status.last_updated }}</span>
              }
            }
          </div>

          <div class="mapping-actions">
            <span class="sync-mode-chip">HTTP</span>
            <button mat-icon-button color="warn" (click)="confirmDelete(mapping.loxone_name)" matTooltip="Delete mapping">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;6572ca24ccc06d43272b43e23df3f06e634b67a7b3c2e53f8cbe376dd7dccc92;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/buttons/components/button-mapping-list/button-mapping-list.component.ts */\n.mapping-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.mapping-item {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  padding: 12px;\n  border-radius: 8px;\n  background: rgba(0, 0, 0, 0.02);\n}\n:host-context(html.dark) .mapping-item {\n  background: rgba(255, 255, 255, 0.05);\n}\n.mapping-info {\n  flex: 1;\n  min-width: 0;\n}\n.mapping-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.type-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  opacity: 0.6;\n}\n.loxone-name {\n  font-weight: 500;\n}\n.arrow {\n  opacity: 0.4;\n}\n.hue-name {\n  opacity: 0.7;\n}\n.mapping-status {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.last-updated {\n  font-size: 0.75rem;\n  opacity: 0.5;\n}\n.mapping-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.sync-mode-chip {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  padding: 4px 10px;\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.08);\n  letter-spacing: 0.5px;\n  cursor: default;\n}\n:host-context(html.dark) .sync-mode-chip {\n  background: rgba(255, 255, 255, 0.1);\n}\n/*# sourceMappingURL=button-mapping-list.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ButtonMappingListComponent, { className: "ButtonMappingListComponent", filePath: "src/app/features/buttons/components/button-mapping-list/button-mapping-list.component.ts", lineNumber: 147 });
})();

// src/app/features/buttons/components/buttons-page/buttons-page.component.ts
function ButtonsPageComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275element(1, "mat-spinner", 3);
    \u0275\u0275elementEnd();
  }
}
function ButtonsPageComponent_Conditional_2_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 6)(1, "mat-card-header")(2, "mat-card-title");
    \u0275\u0275text(3, "Mapped Buttons");
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "span", 8)(5, "app-export-button", 9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "mat-card-content");
    \u0275\u0275element(7, "app-button-mapping-list", 10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(7);
    \u0275\u0275property("mappings", ctx_r0.state.mappingsWithStatus());
  }
}
function ButtonsPageComponent_Conditional_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "app-empty-state", 7);
  }
}
function ButtonsPageComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 4)(1, "mat-card-header")(2, "mat-card-title");
    \u0275\u0275text(3, "Add Button Mapping");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "mat-card-content");
    \u0275\u0275element(5, "app-button-mapping-form", 5);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(6, ButtonsPageComponent_Conditional_2_Conditional_6_Template, 8, 1, "mat-card", 6)(7, ButtonsPageComponent_Conditional_2_Conditional_7_Template, 1, 0, "app-empty-state", 7);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275property("targets", ctx_r0.state.availableButtonTargets());
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.state.buttonMappings().length > 0 ? 6 : 7);
  }
}
function ButtonsPageComponent_Conditional_3_Template(rf, ctx) {
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
var ButtonsPageComponent = class _ButtonsPageComponent {
  state = inject(ButtonsStateService);
  ngOnInit() {
    this.state.loadAll();
    this.state.startPolling();
  }
  ngOnDestroy() {
    this.state.stopPolling();
  }
  static \u0275fac = function ButtonsPageComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ButtonsPageComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ButtonsPageComponent, selectors: [["app-buttons-page"]], decls: 4, vars: 2, consts: [[1, "buttons-page"], [1, "loading-container"], [1, "error-banner"], ["diameter", "40"], [1, "form-card"], [3, "targets"], [1, "list-card"], ["icon", "radio_button_checked", "title", "No buttons mapped", "message", "Add a mapping above to receive button events from Hue"], [1, "flex-spacer"], ["exportType", "inputs"], [3, "mappings"]], template: function ButtonsPageComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275template(1, ButtonsPageComponent_Conditional_1_Template, 2, 0, "div", 1)(2, ButtonsPageComponent_Conditional_2_Template, 8, 2)(3, ButtonsPageComponent_Conditional_3_Template, 2, 1, "div", 2);
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
    ButtonMappingFormComponent,
    ButtonMappingListComponent,
    ExportButtonComponent,
    EmptyStateComponent
  ], styles: ["\n\n.buttons-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.form-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%], \n.list-card[_ngcontent-%COMP%]   mat-card-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.error-banner[_ngcontent-%COMP%] {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=buttons-page.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ButtonsPageComponent, [{
    type: Component,
    args: [{ selector: "app-buttons-page", standalone: true, imports: [
      MatCardModule,
      MatProgressSpinnerModule,
      ButtonMappingFormComponent,
      ButtonMappingListComponent,
      ExportButtonComponent,
      EmptyStateComponent
    ], template: `
    <div class="buttons-page">
      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Add Button Mapping</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-button-mapping-form [targets]="state.availableButtonTargets()" />
          </mat-card-content>
        </mat-card>

        @if (state.buttonMappings().length > 0) {
          <mat-card class="list-card">
            <mat-card-header>
              <mat-card-title>Mapped Buttons</mat-card-title>
              <span class="flex-spacer"></span>
              <app-export-button exportType="inputs" />
            </mat-card-header>
            <mat-card-content>
              <app-button-mapping-list [mappings]="state.mappingsWithStatus()" />
            </mat-card-content>
          </mat-card>
        } @else {
          <app-empty-state
            icon="radio_button_checked"
            title="No buttons mapped"
            message="Add a mapping above to receive button events from Hue">
          </app-empty-state>
        }
      }

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;807634126c6163f76d0d5f6d59abc6fbb552dc16e73c3f01f3e69101f01c976f;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/features/buttons/components/buttons-page/buttons-page.component.ts */\n.buttons-page {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.loading-container {\n  display: flex;\n  justify-content: center;\n  padding: 48px;\n}\n.form-card mat-card-header,\n.list-card mat-card-header {\n  display: flex;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.error-banner {\n  background-color: #f44336;\n  color: white;\n  padding: 12px 16px;\n  border-radius: 4px;\n}\n/*# sourceMappingURL=buttons-page.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ButtonsPageComponent, { className: "ButtonsPageComponent", filePath: "src/app/features/buttons/components/buttons-page/buttons-page.component.ts", lineNumber: 94 });
})();

// src/app/features/buttons/buttons.routes.ts
var BUTTONS_ROUTES = [
  { path: "", component: ButtonsPageComponent }
];
export {
  BUTTONS_ROUTES
};
//# sourceMappingURL=chunk-TIHIYNVW.js.map
