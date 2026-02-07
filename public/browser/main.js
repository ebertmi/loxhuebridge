import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  provideRouter,
  withHashLocation
} from "./chunk-PEW5UOLY.js";
import {
  MatTooltip,
  MatTooltipModule
} from "./chunk-R2RN7UQH.js";
import {
  MatTabLink,
  MatTabNav,
  MatTabNavPanel,
  MatTabsModule
} from "./chunk-45SSR65Q.js";
import "./chunk-FL3KYB4C.js";
import "./chunk-U6PUA6ML.js";
import "./chunk-YRPT3MG6.js";
import {
  DOCUMENT,
  DomRendererFactory2,
  MatButtonModule,
  MatCommonModule,
  MatIcon,
  MatIconButton,
  MatIconModule,
  Platform,
  bootstrapApplication,
  isPlatformBrowser,
  provideHttpClient,
  withInterceptors
} from "./chunk-HOOTIT7M.js";
import {
  ANIMATION_MODULE_TYPE,
  ChangeDetectionScheduler,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  NgModule,
  NgZone,
  PLATFORM_ID,
  RendererFactory2,
  RuntimeError,
  ViewEncapsulation,
  catchError,
  effect,
  inject,
  makeEnvironmentProviders,
  performanceMarkFeature,
  provideZoneChangeDetection,
  setClassMetadata,
  signal,
  throwError,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵinvalidFactory,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-U74TQY52.js";

// node_modules/@angular/platform-browser/fesm2022/animations/async.mjs
var ANIMATION_PREFIX = "@";
var AsyncAnimationRendererFactory = class _AsyncAnimationRendererFactory {
  doc;
  delegate;
  zone;
  animationType;
  moduleImpl;
  _rendererFactoryPromise = null;
  scheduler = null;
  injector = inject(Injector);
  loadingSchedulerFn = inject(\u0275ASYNC_ANIMATION_LOADING_SCHEDULER_FN, {
    optional: true
  });
  _engine;
  /**
   *
   * @param moduleImpl allows to provide a mock implmentation (or will load the animation module)
   */
  constructor(doc, delegate, zone, animationType, moduleImpl) {
    this.doc = doc;
    this.delegate = delegate;
    this.zone = zone;
    this.animationType = animationType;
    this.moduleImpl = moduleImpl;
  }
  /** @docs-private */
  ngOnDestroy() {
    this._engine?.flush();
  }
  /**
   * @internal
   */
  loadImpl() {
    const loadFn = () => this.moduleImpl ?? import("./chunk-TZQ5ZNNI.js").then((m) => m);
    let moduleImplPromise;
    if (this.loadingSchedulerFn) {
      moduleImplPromise = this.loadingSchedulerFn(loadFn);
    } else {
      moduleImplPromise = loadFn();
    }
    return moduleImplPromise.catch((e) => {
      throw new RuntimeError(5300, (typeof ngDevMode === "undefined" || ngDevMode) && "Async loading for animations package was enabled, but loading failed. Angular falls back to using regular rendering. No animations will be displayed and their styles won't be applied.");
    }).then(({
      \u0275createEngine,
      \u0275AnimationRendererFactory
    }) => {
      this._engine = \u0275createEngine(this.animationType, this.doc);
      const rendererFactory = new \u0275AnimationRendererFactory(this.delegate, this._engine, this.zone);
      this.delegate = rendererFactory;
      return rendererFactory;
    });
  }
  /**
   * This method is delegating the renderer creation to the factories.
   * It uses default factory while the animation factory isn't loaded
   * and will rely on the animation factory once it is loaded.
   *
   * Calling this method will trigger as side effect the loading of the animation module
   * if the renderered component uses animations.
   */
  createRenderer(hostElement, rendererType) {
    const renderer = this.delegate.createRenderer(hostElement, rendererType);
    if (renderer.\u0275type === 0) {
      return renderer;
    }
    if (typeof renderer.throwOnSyntheticProps === "boolean") {
      renderer.throwOnSyntheticProps = false;
    }
    const dynamicRenderer = new DynamicDelegationRenderer(renderer);
    if (rendererType?.data?.["animation"] && !this._rendererFactoryPromise) {
      this._rendererFactoryPromise = this.loadImpl();
    }
    this._rendererFactoryPromise?.then((animationRendererFactory) => {
      const animationRenderer = animationRendererFactory.createRenderer(hostElement, rendererType);
      dynamicRenderer.use(animationRenderer);
      this.scheduler ??= this.injector.get(ChangeDetectionScheduler, null, {
        optional: true
      });
      this.scheduler?.notify(
        10
        /* NotificationSource.AsyncAnimationsLoaded */
      );
    }).catch((e) => {
      dynamicRenderer.use(renderer);
    });
    return dynamicRenderer;
  }
  begin() {
    this.delegate.begin?.();
  }
  end() {
    this.delegate.end?.();
  }
  whenRenderingDone() {
    return this.delegate.whenRenderingDone?.() ?? Promise.resolve();
  }
  /**
   * Used during HMR to clear any cached data about a component.
   * @param componentId ID of the component that is being replaced.
   */
  componentReplaced(componentId) {
    this._engine?.flush();
    this.delegate.componentReplaced?.(componentId);
  }
  static \u0275fac = function AsyncAnimationRendererFactory_Factory(__ngFactoryType__) {
    \u0275\u0275invalidFactory();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _AsyncAnimationRendererFactory,
    factory: _AsyncAnimationRendererFactory.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AsyncAnimationRendererFactory, [{
    type: Injectable
  }], () => [{
    type: Document
  }, {
    type: RendererFactory2
  }, {
    type: NgZone
  }, {
    type: void 0
  }, {
    type: Promise
  }], null);
})();
var DynamicDelegationRenderer = class {
  delegate;
  // List of callbacks that need to be replayed on the animation renderer once its loaded
  replay = [];
  \u0275type = 1;
  constructor(delegate) {
    this.delegate = delegate;
  }
  use(impl) {
    this.delegate = impl;
    if (this.replay !== null) {
      for (const fn of this.replay) {
        fn(impl);
      }
      this.replay = null;
    }
  }
  get data() {
    return this.delegate.data;
  }
  destroy() {
    this.replay = null;
    this.delegate.destroy();
  }
  createElement(name, namespace) {
    return this.delegate.createElement(name, namespace);
  }
  createComment(value) {
    return this.delegate.createComment(value);
  }
  createText(value) {
    return this.delegate.createText(value);
  }
  get destroyNode() {
    return this.delegate.destroyNode;
  }
  appendChild(parent, newChild) {
    this.delegate.appendChild(parent, newChild);
  }
  insertBefore(parent, newChild, refChild, isMove) {
    this.delegate.insertBefore(parent, newChild, refChild, isMove);
  }
  removeChild(parent, oldChild, isHostElement) {
    this.delegate.removeChild(parent, oldChild, isHostElement);
  }
  selectRootElement(selectorOrNode, preserveContent) {
    return this.delegate.selectRootElement(selectorOrNode, preserveContent);
  }
  parentNode(node) {
    return this.delegate.parentNode(node);
  }
  nextSibling(node) {
    return this.delegate.nextSibling(node);
  }
  setAttribute(el, name, value, namespace) {
    this.delegate.setAttribute(el, name, value, namespace);
  }
  removeAttribute(el, name, namespace) {
    this.delegate.removeAttribute(el, name, namespace);
  }
  addClass(el, name) {
    this.delegate.addClass(el, name);
  }
  removeClass(el, name) {
    this.delegate.removeClass(el, name);
  }
  setStyle(el, style, value, flags) {
    this.delegate.setStyle(el, style, value, flags);
  }
  removeStyle(el, style, flags) {
    this.delegate.removeStyle(el, style, flags);
  }
  setProperty(el, name, value) {
    if (this.shouldReplay(name)) {
      this.replay.push((renderer) => renderer.setProperty(el, name, value));
    }
    this.delegate.setProperty(el, name, value);
  }
  setValue(node, value) {
    this.delegate.setValue(node, value);
  }
  listen(target, eventName, callback, options) {
    if (this.shouldReplay(eventName)) {
      this.replay.push((renderer) => renderer.listen(target, eventName, callback, options));
    }
    return this.delegate.listen(target, eventName, callback, options);
  }
  shouldReplay(propOrEventName) {
    return this.replay !== null && propOrEventName.startsWith(ANIMATION_PREFIX);
  }
};
var \u0275ASYNC_ANIMATION_LOADING_SCHEDULER_FN = new InjectionToken(ngDevMode ? "async_animation_loading_scheduler_fn" : "");
function provideAnimationsAsync(type = "animations") {
  performanceMarkFeature("NgAsyncAnimations");
  if (false) {
    type = "noop";
  }
  return makeEnvironmentProviders([{
    provide: RendererFactory2,
    useFactory: (doc, renderer, zone) => {
      return new AsyncAnimationRendererFactory(doc, renderer, zone, type);
    },
    deps: [DOCUMENT, DomRendererFactory2, NgZone]
  }, {
    provide: ANIMATION_MODULE_TYPE,
    useValue: type === "noop" ? "NoopAnimations" : "BrowserAnimations"
  }]);
}

// node_modules/@angular/material/fesm2022/toolbar.mjs
var _c0 = ["*", [["mat-toolbar-row"]]];
var _c1 = ["*", "mat-toolbar-row"];
var MatToolbarRow = class _MatToolbarRow {
  static \u0275fac = function MatToolbarRow_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatToolbarRow)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _MatToolbarRow,
    selectors: [["mat-toolbar-row"]],
    hostAttrs: [1, "mat-toolbar-row"],
    exportAs: ["matToolbarRow"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatToolbarRow, [{
    type: Directive,
    args: [{
      selector: "mat-toolbar-row",
      exportAs: "matToolbarRow",
      host: {
        "class": "mat-toolbar-row"
      }
    }]
  }], null, null);
})();
var MatToolbar = class _MatToolbar {
  _elementRef = inject(ElementRef);
  _platform = inject(Platform);
  _document = inject(DOCUMENT);
  // TODO: should be typed as `ThemePalette` but internal apps pass in arbitrary strings.
  /**
   * Theme color of the toolbar. This API is supported in M2 themes only, it has
   * no effect in M3 themes. For color customization in M3, see https://material.angular.dev/components/toolbar/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.dev/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  color;
  /** Reference to all toolbar row elements that have been projected. */
  _toolbarRows;
  constructor() {
  }
  ngAfterViewInit() {
    if (this._platform.isBrowser) {
      this._checkToolbarMixedModes();
      this._toolbarRows.changes.subscribe(() => this._checkToolbarMixedModes());
    }
  }
  /**
   * Throws an exception when developers are attempting to combine the different toolbar row modes.
   */
  _checkToolbarMixedModes() {
    if (this._toolbarRows.length && (typeof ngDevMode === "undefined" || ngDevMode)) {
      const isCombinedUsage = Array.from(this._elementRef.nativeElement.childNodes).filter((node) => !(node.classList && node.classList.contains("mat-toolbar-row"))).filter((node) => node.nodeType !== (this._document ? this._document.COMMENT_NODE : 8)).some((node) => !!(node.textContent && node.textContent.trim()));
      if (isCombinedUsage) {
        throwToolbarMixedModesError();
      }
    }
  }
  static \u0275fac = function MatToolbar_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatToolbar)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _MatToolbar,
    selectors: [["mat-toolbar"]],
    contentQueries: function MatToolbar_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        \u0275\u0275contentQuery(dirIndex, MatToolbarRow, 5);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx._toolbarRows = _t);
      }
    },
    hostAttrs: [1, "mat-toolbar"],
    hostVars: 6,
    hostBindings: function MatToolbar_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275classMap(ctx.color ? "mat-" + ctx.color : "");
        \u0275\u0275classProp("mat-toolbar-multiple-rows", ctx._toolbarRows.length > 0)("mat-toolbar-single-row", ctx._toolbarRows.length === 0);
      }
    },
    inputs: {
      color: "color"
    },
    exportAs: ["matToolbar"],
    ngContentSelectors: _c1,
    decls: 2,
    vars: 0,
    template: function MatToolbar_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275projectionDef(_c0);
        \u0275\u0275projection(0);
        \u0275\u0275projection(1, 1);
      }
    },
    styles: [".mat-toolbar{background:var(--mat-toolbar-container-background-color, var(--mat-sys-surface));color:var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface))}.mat-toolbar,.mat-toolbar h1,.mat-toolbar h2,.mat-toolbar h3,.mat-toolbar h4,.mat-toolbar h5,.mat-toolbar h6{font-family:var(--mat-toolbar-title-text-font, var(--mat-sys-title-large-font));font-size:var(--mat-toolbar-title-text-size, var(--mat-sys-title-large-size));line-height:var(--mat-toolbar-title-text-line-height, var(--mat-sys-title-large-line-height));font-weight:var(--mat-toolbar-title-text-weight, var(--mat-sys-title-large-weight));letter-spacing:var(--mat-toolbar-title-text-tracking, var(--mat-sys-title-large-tracking));margin:0}@media(forced-colors: active){.mat-toolbar{outline:solid 1px}}.mat-toolbar .mat-form-field-underline,.mat-toolbar .mat-form-field-ripple,.mat-toolbar .mat-focused .mat-form-field-ripple{background-color:currentColor}.mat-toolbar .mat-form-field-label,.mat-toolbar .mat-focused .mat-form-field-label,.mat-toolbar .mat-select-value,.mat-toolbar .mat-select-arrow,.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow{color:inherit}.mat-toolbar .mat-input-element{caret-color:currentColor}.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed{--mdc-text-button-label-text-color:var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));--mdc-outlined-button-label-text-color:var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface))}.mat-toolbar-row,.mat-toolbar-single-row{display:flex;box-sizing:border-box;padding:0 16px;width:100%;flex-direction:row;align-items:center;white-space:nowrap;height:var(--mat-toolbar-standard-height, 64px)}@media(max-width: 599px){.mat-toolbar-row,.mat-toolbar-single-row{height:var(--mat-toolbar-mobile-height, 56px)}}.mat-toolbar-multiple-rows{display:flex;box-sizing:border-box;flex-direction:column;width:100%;min-height:var(--mat-toolbar-standard-height, 64px)}@media(max-width: 599px){.mat-toolbar-multiple-rows{min-height:var(--mat-toolbar-mobile-height, 56px)}}\n"],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatToolbar, [{
    type: Component,
    args: [{
      selector: "mat-toolbar",
      exportAs: "matToolbar",
      host: {
        "class": "mat-toolbar",
        "[class]": 'color ? "mat-" + color : ""',
        "[class.mat-toolbar-multiple-rows]": "_toolbarRows.length > 0",
        "[class.mat-toolbar-single-row]": "_toolbarRows.length === 0"
      },
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      template: '<ng-content></ng-content>\n<ng-content select="mat-toolbar-row"></ng-content>\n',
      styles: [".mat-toolbar{background:var(--mat-toolbar-container-background-color, var(--mat-sys-surface));color:var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface))}.mat-toolbar,.mat-toolbar h1,.mat-toolbar h2,.mat-toolbar h3,.mat-toolbar h4,.mat-toolbar h5,.mat-toolbar h6{font-family:var(--mat-toolbar-title-text-font, var(--mat-sys-title-large-font));font-size:var(--mat-toolbar-title-text-size, var(--mat-sys-title-large-size));line-height:var(--mat-toolbar-title-text-line-height, var(--mat-sys-title-large-line-height));font-weight:var(--mat-toolbar-title-text-weight, var(--mat-sys-title-large-weight));letter-spacing:var(--mat-toolbar-title-text-tracking, var(--mat-sys-title-large-tracking));margin:0}@media(forced-colors: active){.mat-toolbar{outline:solid 1px}}.mat-toolbar .mat-form-field-underline,.mat-toolbar .mat-form-field-ripple,.mat-toolbar .mat-focused .mat-form-field-ripple{background-color:currentColor}.mat-toolbar .mat-form-field-label,.mat-toolbar .mat-focused .mat-form-field-label,.mat-toolbar .mat-select-value,.mat-toolbar .mat-select-arrow,.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow{color:inherit}.mat-toolbar .mat-input-element{caret-color:currentColor}.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed{--mdc-text-button-label-text-color:var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));--mdc-outlined-button-label-text-color:var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface))}.mat-toolbar-row,.mat-toolbar-single-row{display:flex;box-sizing:border-box;padding:0 16px;width:100%;flex-direction:row;align-items:center;white-space:nowrap;height:var(--mat-toolbar-standard-height, 64px)}@media(max-width: 599px){.mat-toolbar-row,.mat-toolbar-single-row{height:var(--mat-toolbar-mobile-height, 56px)}}.mat-toolbar-multiple-rows{display:flex;box-sizing:border-box;flex-direction:column;width:100%;min-height:var(--mat-toolbar-standard-height, 64px)}@media(max-width: 599px){.mat-toolbar-multiple-rows{min-height:var(--mat-toolbar-mobile-height, 56px)}}\n"]
    }]
  }], () => [], {
    color: [{
      type: Input
    }],
    _toolbarRows: [{
      type: ContentChildren,
      args: [MatToolbarRow, {
        descendants: true
      }]
    }]
  });
})();
function throwToolbarMixedModesError() {
  throw Error("MatToolbar: Attempting to combine different toolbar modes. Either specify multiple `<mat-toolbar-row>` elements explicitly or just place content inside of a `<mat-toolbar>` for a single row.");
}
var MatToolbarModule = class _MatToolbarModule {
  static \u0275fac = function MatToolbarModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MatToolbarModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _MatToolbarModule,
    imports: [MatCommonModule, MatToolbar, MatToolbarRow],
    exports: [MatToolbar, MatToolbarRow, MatCommonModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    imports: [MatCommonModule, MatCommonModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MatToolbarModule, [{
    type: NgModule,
    args: [{
      imports: [MatCommonModule, MatToolbar, MatToolbarRow],
      exports: [MatToolbar, MatToolbarRow, MatCommonModule]
    }]
  }], null, null);
})();

// src/app/core/services/theme.service.ts
var ThemeService = class _ThemeService {
  platformId = inject(PLATFORM_ID);
  storageKey = "loxhuebridge-theme";
  themeSignal = signal("system");
  resolvedThemeSignal = signal("light");
  theme = this.themeSignal.asReadonly();
  resolvedTheme = this.resolvedThemeSignal.asReadonly();
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && ["light", "dark", "system"].includes(saved)) {
        this.themeSignal.set(saved);
      }
      this.updateResolvedTheme();
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (this.theme() === "system") {
          this.updateResolvedTheme();
        }
      });
      effect(() => {
        const theme = this.theme();
        localStorage.setItem(this.storageKey, theme);
        this.updateResolvedTheme();
      });
    }
  }
  setTheme(theme) {
    this.themeSignal.set(theme);
  }
  toggleTheme() {
    const current = this.resolvedTheme();
    this.themeSignal.set(current === "light" ? "dark" : "light");
  }
  updateResolvedTheme() {
    if (!isPlatformBrowser(this.platformId))
      return;
    const theme = this.theme();
    let resolved;
    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      resolved = theme;
    }
    this.resolvedThemeSignal.set(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }
  static \u0275fac = function ThemeService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ThemeService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ThemeService, factory: _ThemeService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ThemeService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [], null);
})();

// src/app/layout/header/header.component.ts
var HeaderComponent = class _HeaderComponent {
  themeService = inject(ThemeService);
  toggleTheme() {
    this.themeService.toggleTheme();
  }
  static \u0275fac = function HeaderComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _HeaderComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _HeaderComponent, selectors: [["app-header"]], decls: 9, vars: 2, consts: [[1, "header"], [1, "logo-container"], ["src", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2385c440'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E", "alt", "Logo", 1, "logo"], [1, "title"], [1, "spacer"], ["mat-icon-button", "", 3, "click", "matTooltip"]], template: function HeaderComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "mat-toolbar", 0)(1, "div", 1);
      \u0275\u0275element(2, "img", 2);
      \u0275\u0275elementStart(3, "span", 3);
      \u0275\u0275text(4, "loxHueBridge");
      \u0275\u0275elementEnd()();
      \u0275\u0275element(5, "span", 4);
      \u0275\u0275elementStart(6, "button", 5);
      \u0275\u0275listener("click", function HeaderComponent_Template_button_click_6_listener() {
        return ctx.toggleTheme();
      });
      \u0275\u0275elementStart(7, "mat-icon");
      \u0275\u0275text(8);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(6);
      \u0275\u0275property("matTooltip", ctx.themeService.resolvedTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.themeService.resolvedTheme() === "dark" ? "light_mode" : "dark_mode");
    }
  }, dependencies: [MatToolbarModule, MatToolbar, MatIconModule, MatIcon, MatButtonModule, MatIconButton, MatTooltipModule, MatTooltip], styles: ["\n\n.header[_ngcontent-%COMP%] {\n  background: var(--mat-toolbar-container-background-color);\n  border-bottom: 1px solid var(--mat-divider-color);\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n}\n.logo-container[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.logo[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n}\n.title[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  font-weight: 500;\n  color: #85c440;\n}\n.spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n/*# sourceMappingURL=header.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HeaderComponent, [{
    type: Component,
    args: [{ selector: "app-header", standalone: true, imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatTooltipModule], template: `
    <mat-toolbar class="header">
      <div class="logo-container">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2385c440'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E"
             alt="Logo"
             class="logo" />
        <span class="title">loxHueBridge</span>
      </div>
      <span class="spacer"></span>
      <button mat-icon-button
              (click)="toggleTheme()"
              [matTooltip]="themeService.resolvedTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <mat-icon>{{ themeService.resolvedTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>
    </mat-toolbar>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;14606bed58690256fdbdc1f69ea90efa212b5c20435716630fab6b0ea4e2e66a;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/layout/header/header.component.ts */\n.header {\n  background: var(--mat-toolbar-container-background-color);\n  border-bottom: 1px solid var(--mat-divider-color);\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n}\n.logo-container {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.logo {\n  width: 32px;\n  height: 32px;\n}\n.title {\n  font-size: 1.25rem;\n  font-weight: 500;\n  color: #85c440;\n}\n.spacer {\n  flex: 1;\n}\n/*# sourceMappingURL=header.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(HeaderComponent, { className: "HeaderComponent", filePath: "src/app/layout/header/header.component.ts", lineNumber: 60 });
})();

// src/app/layout/tab-navigation/tab-navigation.component.ts
var _forTrack0 = ($index, $item) => $item.path;
function TabNavigationComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "a", 3, 1)(2, "mat-icon", 4);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 5);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const tab_r1 = ctx.$implicit;
    const rla_r2 = \u0275\u0275reference(1);
    \u0275\u0275property("routerLink", tab_r1.path)("active", rla_r2.isActive);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(tab_r1.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(tab_r1.label);
  }
}
var TabNavigationComponent = class _TabNavigationComponent {
  tabs = [
    { path: "/lights", label: "Lights", icon: "lightbulb" },
    { path: "/sensors", label: "Sensors", icon: "sensors" },
    { path: "/buttons", label: "Buttons", icon: "radio_button_checked" },
    { path: "/scenes", label: "Scenes", icon: "palette" },
    { path: "/light-controllers", label: "Light Controllers", icon: "tune" },
    { path: "/system", label: "System", icon: "settings" },
    { path: "/diagnostics", label: "Diagnostics", icon: "monitor_heart" }
  ];
  static \u0275fac = function TabNavigationComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TabNavigationComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _TabNavigationComponent, selectors: [["app-tab-navigation"]], decls: 5, vars: 1, consts: [["tabPanel", ""], ["rla", "routerLinkActive"], ["mat-tab-nav-bar", "", 1, "tab-nav", 3, "tabPanel"], ["mat-tab-link", "", "routerLinkActive", "", 3, "routerLink", "active"], [1, "tab-icon"], [1, "tab-label"]], template: function TabNavigationComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "nav", 2);
      \u0275\u0275repeaterCreate(1, TabNavigationComponent_For_2_Template, 6, 4, "a", 3, _forTrack0);
      \u0275\u0275elementEnd();
      \u0275\u0275element(3, "mat-tab-nav-panel", null, 0);
    }
    if (rf & 2) {
      const tabPanel_r3 = \u0275\u0275reference(4);
      \u0275\u0275property("tabPanel", tabPanel_r3);
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.tabs);
    }
  }, dependencies: [RouterLink, RouterLinkActive, MatTabsModule, MatTabNav, MatTabNavPanel, MatTabLink, MatIconModule, MatIcon], styles: ["\n\n.tab-nav[_ngcontent-%COMP%] {\n  background: var(--mat-tab-header-background-color);\n  border-bottom: 1px solid var(--mat-divider-color);\n}\n.tab-icon[_ngcontent-%COMP%] {\n  margin-right: 8px;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n.tab-label[_ngcontent-%COMP%] {\n  white-space: nowrap;\n}\n@media (max-width: 900px) {\n  .tab-label[_ngcontent-%COMP%] {\n    display: none;\n  }\n  .tab-icon[_ngcontent-%COMP%] {\n    margin-right: 0;\n  }\n}\n/*# sourceMappingURL=tab-navigation.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TabNavigationComponent, [{
    type: Component,
    args: [{ selector: "app-tab-navigation", standalone: true, imports: [RouterLink, RouterLinkActive, MatTabsModule, MatIconModule], template: `
    <nav mat-tab-nav-bar [tabPanel]="tabPanel" class="tab-nav">
      @for (tab of tabs; track tab.path) {
        <a mat-tab-link
           [routerLink]="tab.path"
           routerLinkActive
           #rla="routerLinkActive"
           [active]="rla.isActive">
          <mat-icon class="tab-icon">{{ tab.icon }}</mat-icon>
          <span class="tab-label">{{ tab.label }}</span>
        </a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;608df0a618fccb2959f2b6025037541db5ab79bdaee843415c12d98f555abc45;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/layout/tab-navigation/tab-navigation.component.ts */\n.tab-nav {\n  background: var(--mat-tab-header-background-color);\n  border-bottom: 1px solid var(--mat-divider-color);\n}\n.tab-icon {\n  margin-right: 8px;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n.tab-label {\n  white-space: nowrap;\n}\n@media (max-width: 900px) {\n  .tab-label {\n    display: none;\n  }\n  .tab-icon {\n    margin-right: 0;\n  }\n}\n/*# sourceMappingURL=tab-navigation.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(TabNavigationComponent, { className: "TabNavigationComponent", filePath: "src/app/layout/tab-navigation/tab-navigation.component.ts", lineNumber: 60 });
})();

// src/app/layout/shell/shell.component.ts
var ShellComponent = class _ShellComponent {
  static \u0275fac = function ShellComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ShellComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ShellComponent, selectors: [["app-shell"]], decls: 5, vars: 0, consts: [[1, "app-shell"], [1, "main-content"]], template: function ShellComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275element(1, "app-header")(2, "app-tab-navigation");
      \u0275\u0275elementStart(3, "main", 1);
      \u0275\u0275element(4, "router-outlet");
      \u0275\u0275elementEnd()();
    }
  }, dependencies: [RouterOutlet, HeaderComponent, TabNavigationComponent], styles: ["\n\n.app-shell[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n  background: var(--mat-app-background-color);\n}\n.main-content[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 16px;\n  max-width: 1400px;\n  width: 100%;\n  margin: 0 auto;\n  box-sizing: border-box;\n}\n@media (max-width: 768px) {\n  .main-content[_ngcontent-%COMP%] {\n    padding: 12px;\n  }\n}\n/*# sourceMappingURL=shell.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ShellComponent, [{
    type: Component,
    args: [{ selector: "app-shell", standalone: true, imports: [RouterOutlet, HeaderComponent, TabNavigationComponent], template: `
    <div class="app-shell">
      <app-header />
      <app-tab-navigation />
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:scss;dfe34fdf02f70ebfa118b009fadb5f666a3749afcdf987cbd62db7350d7cdbae;/Users/michaelebert/Projects/loxhuebridge/frontend/src/app/layout/shell/shell.component.ts */\n.app-shell {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n  background: var(--mat-app-background-color);\n}\n.main-content {\n  flex: 1;\n  padding: 16px;\n  max-width: 1400px;\n  width: 100%;\n  margin: 0 auto;\n  box-sizing: border-box;\n}\n@media (max-width: 768px) {\n  .main-content {\n    padding: 12px;\n  }\n}\n/*# sourceMappingURL=shell.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ShellComponent, { className: "ShellComponent", filePath: "src/app/layout/shell/shell.component.ts", lineNumber: 44 });
})();

// src/app/app.routes.ts
var routes = [
  {
    path: "",
    component: ShellComponent,
    children: [
      {
        path: "",
        redirectTo: "lights",
        pathMatch: "full"
      },
      {
        path: "lights",
        loadChildren: () => import("./chunk-FRDLEUEM.js").then((m) => m.LIGHTS_ROUTES)
      },
      {
        path: "sensors",
        loadChildren: () => import("./chunk-2Y4IPDD4.js").then((m) => m.SENSORS_ROUTES)
      },
      {
        path: "buttons",
        loadChildren: () => import("./chunk-TIHIYNVW.js").then((m) => m.BUTTONS_ROUTES)
      },
      {
        path: "scenes",
        loadChildren: () => import("./chunk-3QGCJZTZ.js").then((m) => m.SCENES_ROUTES)
      },
      {
        path: "light-controllers",
        loadChildren: () => import("./chunk-AORQROKF.js").then((m) => m.LIGHT_CONTROLLERS_ROUTES)
      },
      {
        path: "system",
        loadChildren: () => import("./chunk-QXXQHS7M.js").then((m) => m.SYSTEM_ROUTES)
      },
      {
        path: "diagnostics",
        loadChildren: () => import("./chunk-KYNJCTIU.js").then((m) => m.DIAGNOSTICS_ROUTES)
      }
    ]
  },
  {
    path: "setup",
    loadChildren: () => import("./chunk-MMDYEK7T.js").then((m) => m.SETUP_ROUTES)
  },
  {
    path: "**",
    redirectTo: "lights"
  }
];

// src/app/core/interceptors/error.interceptor.ts
var errorInterceptor = (req, next) => {
  return next(req).pipe(catchError((error) => {
    let errorMessage = "An error occurred";
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = "Unable to connect to server";
          break;
        case 401:
          errorMessage = "Unauthorized - Please check your credentials";
          break;
        case 403:
          errorMessage = "Forbidden - Access denied";
          break;
        case 404:
          errorMessage = "Resource not found";
          break;
        case 500:
          errorMessage = "Internal server error";
          break;
        default:
          errorMessage = error.error?.message || error.message || `Error ${error.status}`;
      }
    }
    console.error("HTTP Error:", errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }));
};

// src/app/app.config.ts
var appConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAnimationsAsync()
  ]
};

// src/app/app.component.ts
var AppComponent = class _AppComponent {
  themeService = inject(ThemeService);
  ngOnInit() {
    this.themeService.resolvedTheme();
  }
  static \u0275fac = function AppComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AppComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppComponent, selectors: [["app-root"]], decls: 1, vars: 0, template: function AppComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "router-outlet");
    }
  }, dependencies: [RouterOutlet], encapsulation: 2, changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppComponent, [{
    type: Component,
    args: [{ selector: "app-root", standalone: true, imports: [RouterOutlet], template: `<router-outlet />`, changeDetection: ChangeDetectionStrategy.OnPush }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppComponent, { className: "AppComponent", filePath: "src/app/app.component.ts", lineNumber: 13 });
})();

// src/main.ts
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
/*! Bundled license information:

@angular/platform-browser/fesm2022/animations/async.mjs:
  (**
   * @license Angular v19.2.18
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
*/
//# sourceMappingURL=main.js.map
