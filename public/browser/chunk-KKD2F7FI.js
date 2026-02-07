import {
  MatIcon,
  MatIconModule
} from "./chunk-HOOTIT7M.js";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-U74TQY52.js";

// src/app/shared/components/empty-state/empty-state.component.ts
var _c0 = ["*"];
function EmptyStateComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-icon", 1);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.icon());
  }
}
function EmptyStateComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 3);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.message());
  }
}
var EmptyStateComponent = class _EmptyStateComponent {
  icon = input();
  title = input.required();
  message = input();
  static \u0275fac = function EmptyStateComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _EmptyStateComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _EmptyStateComponent, selectors: [["app-empty-state"]], inputs: { icon: [1, "icon"], title: [1, "title"], message: [1, "message"] }, ngContentSelectors: _c0, decls: 6, vars: 3, consts: [[1, "empty-state"], [1, "empty-icon"], [1, "empty-title"], [1, "empty-message"]], template: function EmptyStateComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275projectionDef();
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275template(1, EmptyStateComponent_Conditional_1_Template, 2, 1, "mat-icon", 1);
      \u0275\u0275elementStart(2, "h3", 2);
      \u0275\u0275text(3);
      \u0275\u0275elementEnd();
      \u0275\u0275template(4, EmptyStateComponent_Conditional_4_Template, 2, 1, "p", 3);
      \u0275\u0275projection(5);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.icon() ? 1 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.title());
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.message() ? 4 : -1);
    }
  }, dependencies: [MatIconModule, MatIcon], styles: ["\n\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 48px 24px;\n  text-align: center;\n}\n.empty-icon[_ngcontent-%COMP%] {\n  font-size: 64px;\n  width: 64px;\n  height: 64px;\n  opacity: 0.3;\n  margin-bottom: 16px;\n}\n.empty-title[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n  opacity: 0.7;\n}\n.empty-message[_ngcontent-%COMP%] {\n  margin: 0;\n  opacity: 0.5;\n  max-width: 300px;\n}\n/*# sourceMappingURL=empty-state.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(EmptyStateComponent, [{
    type: Component,
    args: [{ selector: "app-empty-state", standalone: true, imports: [MatIconModule], template: `
    <div class="empty-state">
      @if (icon()) {
        <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      }
      <h3 class="empty-title">{{ title() }}</h3>
      @if (message()) {
        <p class="empty-message">{{ message() }}</p>
      }
      <ng-content></ng-content>
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;f37ca2c2409323454f7c750b88405afebab6c931bb44d14989092581da06f507;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/shared/components/empty-state/empty-state.component.ts */\n.empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 48px 24px;\n  text-align: center;\n}\n.empty-icon {\n  font-size: 64px;\n  width: 64px;\n  height: 64px;\n  opacity: 0.3;\n  margin-bottom: 16px;\n}\n.empty-title {\n  margin: 0 0 8px 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n  opacity: 0.7;\n}\n.empty-message {\n  margin: 0;\n  opacity: 0.5;\n  max-width: 300px;\n}\n/*# sourceMappingURL=empty-state.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(EmptyStateComponent, { className: "EmptyStateComponent", filePath: "src/app/shared/components/empty-state/empty-state.component.ts", lineNumber: 53 });
})();

export {
  EmptyStateComponent
};
//# sourceMappingURL=chunk-KKD2F7FI.js.map
