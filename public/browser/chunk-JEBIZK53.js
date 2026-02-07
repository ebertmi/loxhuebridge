import {
  CommonModule
} from "./chunk-HOOTIT7M.js";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnextContext,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-U74TQY52.js";

// src/app/shared/components/badge/badge.component.ts
function BadgeComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 1);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.icon());
  }
}
var BadgeComponent = class _BadgeComponent {
  variant = input("default");
  text = input.required();
  icon = input();
  lowBattery = input(false);
  badgeClasses = computed(() => {
    const classes = ["badge", `badge-${this.variant()}`];
    if (this.variant() === "battery" && this.lowBattery()) {
      classes.push("low");
    }
    return classes.join(" ");
  });
  static \u0275fac = function BadgeComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BadgeComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BadgeComponent, selectors: [["app-badge"]], inputs: { variant: [1, "variant"], text: [1, "text"], icon: [1, "icon"], lowBattery: [1, "lowBattery"] }, decls: 4, vars: 4, consts: [[1, "badge"], [1, "badge-icon"], [1, "badge-text"]], template: function BadgeComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "span", 0);
      \u0275\u0275template(1, BadgeComponent_Conditional_1_Template, 2, 1, "span", 1);
      \u0275\u0275elementStart(2, "span", 2);
      \u0275\u0275text(3);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275classMap(ctx.badgeClasses());
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.icon() ? 1 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.text());
    }
  }, dependencies: [CommonModule], styles: ["\n\n.badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 8px;\n  border-radius: 12px;\n  font-size: 0.75rem;\n  font-weight: 500;\n  white-space: nowrap;\n}\n.badge-icon[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n}\n.badge-on[_ngcontent-%COMP%] {\n  background-color: #4caf50;\n  color: white;\n}\n.badge-off[_ngcontent-%COMP%] {\n  background-color: #9e9e9e;\n  color: white;\n}\n.badge-brightness[_ngcontent-%COMP%] {\n  background-color: #ff9800;\n  color: white;\n}\n.badge-battery[_ngcontent-%COMP%] {\n  background-color: #2196f3;\n  color: white;\n}\n.badge-battery.low[_ngcontent-%COMP%] {\n  background-color: #f44336;\n}\n.badge-temperature[_ngcontent-%COMP%] {\n  background-color: #9c27b0;\n  color: white;\n}\n.badge-motion[_ngcontent-%COMP%] {\n  background-color: #e91e63;\n  color: white;\n}\n.badge-unreachable[_ngcontent-%COMP%] {\n  background-color: #f44336;\n  color: white;\n}\n.badge-default[_ngcontent-%COMP%] {\n  background-color: rgba(0, 0, 0, 0.08);\n  color: inherit;\n}\nhtml.dark[_nghost-%COMP%]   .badge-default[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .badge-default[_ngcontent-%COMP%] {\n  background-color: rgba(255, 255, 255, 0.12);\n}\n/*# sourceMappingURL=badge.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BadgeComponent, [{
    type: Component,
    args: [{ selector: "app-badge", standalone: true, imports: [CommonModule], template: `
    <span class="badge" [class]="badgeClasses()">
      @if (icon()) {
        <span class="badge-icon">{{ icon() }}</span>
      }
      <span class="badge-text">{{ text() }}</span>
    </span>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;27790250cecfc58d5f96ae5c159ab3b198dd7595afa67caf05e1d4be86df8ced;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/shared/components/badge/badge.component.ts */\n.badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 8px;\n  border-radius: 12px;\n  font-size: 0.75rem;\n  font-weight: 500;\n  white-space: nowrap;\n}\n.badge-icon {\n  font-size: 0.875rem;\n}\n.badge-on {\n  background-color: #4caf50;\n  color: white;\n}\n.badge-off {\n  background-color: #9e9e9e;\n  color: white;\n}\n.badge-brightness {\n  background-color: #ff9800;\n  color: white;\n}\n.badge-battery {\n  background-color: #2196f3;\n  color: white;\n}\n.badge-battery.low {\n  background-color: #f44336;\n}\n.badge-temperature {\n  background-color: #9c27b0;\n  color: white;\n}\n.badge-motion {\n  background-color: #e91e63;\n  color: white;\n}\n.badge-unreachable {\n  background-color: #f44336;\n  color: white;\n}\n.badge-default {\n  background-color: rgba(0, 0, 0, 0.08);\n  color: inherit;\n}\n:host-context(html.dark) .badge-default {\n  background-color: rgba(255, 255, 255, 0.12);\n}\n/*# sourceMappingURL=badge.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BadgeComponent, { className: "BadgeComponent", filePath: "src/app/shared/components/badge/badge.component.ts", lineNumber: 84 });
})();

export {
  BadgeComponent
};
//# sourceMappingURL=chunk-JEBIZK53.js.map
