import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-color-dot',
  standalone: true,
  template: `
    <span
      class="color-dot"
      [style.background-color]="backgroundColor()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [title]="title()">
    </span>
  `,
  styles: [`
    .color-dot {
      display: inline-block;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }

    :host-context(html.dark) .color-dot {
      border-color: rgba(255, 255, 255, 0.12);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorDotComponent {
  readonly color = input<string>();
  readonly xy = input<{ x: number; y: number }>();
  readonly kelvin = input<number>();
  readonly size = input(16);
  readonly title = input('');

  readonly backgroundColor = computed(() => {
    if (this.color()) {
      return this.color();
    }

    if (this.xy()) {
      const { x, y } = this.xy()!;
      return this.xyToRgb(x, y);
    }

    if (this.kelvin()) {
      return this.kelvinToRgb(this.kelvin()!);
    }

    return '#808080';
  });

  private xyToRgb(x: number, y: number): string {
    // Convert CIE 1931 xy to RGB
    const z = 1.0 - x - y;
    const Y = 1.0;
    const X = (Y / y) * x;
    const Z = (Y / y) * z;

    let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    let b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

    // Apply gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055 : 12.92 * b;

    // Clamp and convert to 0-255
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255)));

    return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
  }

  private kelvinToRgb(kelvin: number): string {
    // Convert color temperature to RGB
    const temp = kelvin / 100;
    let r: number, g: number, b: number;

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

    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
  }
}
