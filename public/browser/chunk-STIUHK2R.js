import {
  MatTooltip,
  MatTooltipModule
} from "./chunk-R2RN7UQH.js";
import {
  ApiService
} from "./chunk-4WNYHGTU.js";
import {
  MatButton,
  MatButtonModule,
  MatIcon,
  MatIconModule
} from "./chunk-HOOTIT7M.js";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵtext
} from "./chunk-U74TQY52.js";

// src/app/features/lights/components/export-button/export-button.component.ts
var ExportButtonComponent = class _ExportButtonComponent {
  api = inject(ApiService);
  exportType = input.required();
  download() {
    this.api.downloadExport(this.exportType()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${this.exportType()}.xml`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error("Export failed:", err);
      }
    });
  }
  static \u0275fac = function ExportButtonComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ExportButtonComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ExportButtonComponent, selectors: [["app-export-button"]], inputs: { exportType: [1, "exportType"] }, decls: 4, vars: 0, consts: [["mat-stroked-button", "", "matTooltip", "Download XML for Loxone Config", 3, "click"]], template: function ExportButtonComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "button", 0);
      \u0275\u0275listener("click", function ExportButtonComponent_Template_button_click_0_listener() {
        return ctx.download();
      });
      \u0275\u0275elementStart(1, "mat-icon");
      \u0275\u0275text(2, "download");
      \u0275\u0275elementEnd();
      \u0275\u0275text(3, " Export XML ");
      \u0275\u0275elementEnd();
    }
  }, dependencies: [MatButtonModule, MatButton, MatIconModule, MatIcon, MatTooltipModule, MatTooltip], encapsulation: 2, changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ExportButtonComponent, [{
    type: Component,
    args: [{ selector: "app-export-button", standalone: true, imports: [MatButtonModule, MatIconModule, MatTooltipModule], template: `
    <button mat-stroked-button (click)="download()" matTooltip="Download XML for Loxone Config">
      <mat-icon>download</mat-icon>
      Export XML
    </button>
  `, changeDetection: ChangeDetectionStrategy.OnPush }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ExportButtonComponent, { className: "ExportButtonComponent", filePath: "src/app/features/lights/components/export-button/export-button.component.ts", lineNumber: 20 });
})();

export {
  ExportButtonComponent
};
//# sourceMappingURL=chunk-STIUHK2R.js.map
