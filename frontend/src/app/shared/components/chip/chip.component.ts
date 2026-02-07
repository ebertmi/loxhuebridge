import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  template: `
    <mat-chip-option
      [selected]="selected()"
      [disabled]="disabled()"
      (click)="handleClick()">
      @if (icon()) {
        <mat-icon matChipAvatar>{{ icon() }}</mat-icon>
      }
      {{ label() }}
    </mat-chip-option>
  `,
  styles: [`
    mat-chip-option {
      cursor: pointer;
    }

    mat-chip-option[disabled] {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipComponent {
  readonly label = input.required<string>();
  readonly icon = input<string>();
  readonly selected = input(false);
  readonly disabled = input(false);

  readonly clicked = output<void>();

  handleClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
