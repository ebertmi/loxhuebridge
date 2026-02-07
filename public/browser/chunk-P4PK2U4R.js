import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵproperty,
  ɵɵstyleProp
} from "./chunk-U74TQY52.js";

// src/app/shared/components/color-dot/color-dot.component.ts
var ColorDotComponent = class _ColorDotComponent {
  color = input();
  xy = input();
  kelvin = input();
  size = input(16);
  title = input("");
  backgroundColor = computed(() => {
    if (this.color()) {
      return this.color();
    }
    if (this.xy()) {
      const { x, y } = this.xy();
      return this.xyToRgb(x, y);
    }
    if (this.kelvin()) {
      return this.kelvinToRgb(this.kelvin());
    }
    return "#808080";
  });
  xyToRgb(x, y) {
    const z = 1 - x - y;
    const Y = 1;
    const X = Y / y * x;
    const Z = Y / y * z;
    let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    let b = X * 0.051713 - Y * 0.121364 + Z * 1.01153;
    r = r > 31308e-7 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 31308e-7 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 31308e-7 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
    return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
  }
  kelvinToRgb(kelvin) {
    const temp = kelvin / 100;
    let r, g, b;
    if (temp <= 66) {
      r = 255;
      g = temp;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
      if (temp <= 19) {
        b = 0;
      } else {
        b = temp - 10;
        b = 138.5177312231 * Math.log(b) - 305.0447927307;
      }
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
      b = 255;
    }
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
  }
  static \u0275fac = function ColorDotComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ColorDotComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ColorDotComponent, selectors: [["app-color-dot"]], inputs: { color: [1, "color"], xy: [1, "xy"], kelvin: [1, "kelvin"], size: [1, "size"], title: [1, "title"] }, decls: 1, vars: 7, consts: [[1, "color-dot", 3, "title"]], template: function ColorDotComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "span", 0);
    }
    if (rf & 2) {
      \u0275\u0275styleProp("background-color", ctx.backgroundColor())("width", ctx.size(), "px")("height", ctx.size(), "px");
      \u0275\u0275property("title", ctx.title());
    }
  }, styles: ["\n\n.color-dot[_ngcontent-%COMP%] {\n  display: inline-block;\n  border-radius: 50%;\n  border: 1px solid rgba(0, 0, 0, 0.12);\n}\nhtml.dark[_nghost-%COMP%]   .color-dot[_ngcontent-%COMP%], html.dark   [_nghost-%COMP%]   .color-dot[_ngcontent-%COMP%] {\n  border-color: rgba(255, 255, 255, 0.12);\n}\n/*# sourceMappingURL=color-dot.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ColorDotComponent, [{
    type: Component,
    args: [{ selector: "app-color-dot", standalone: true, template: `
    <span
      class="color-dot"
      [style.background-color]="backgroundColor()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [title]="title()">
    </span>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;eaf11daa6b608d2105ef3945690283fc18b640af772a4caaa219d78fa151f457;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/shared/components/color-dot/color-dot.component.ts */\n.color-dot {\n  display: inline-block;\n  border-radius: 50%;\n  border: 1px solid rgba(0, 0, 0, 0.12);\n}\n:host-context(html.dark) .color-dot {\n  border-color: rgba(255, 255, 255, 0.12);\n}\n/*# sourceMappingURL=color-dot.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ColorDotComponent, { className: "ColorDotComponent", filePath: "src/app/shared/components/color-dot/color-dot.component.ts", lineNumber: 28 });
})();

export {
  ColorDotComponent
};
//# sourceMappingURL=chunk-P4PK2U4R.js.map
