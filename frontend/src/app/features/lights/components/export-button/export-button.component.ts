import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button mat-stroked-button (click)="download()" matTooltip="Download XML for Loxone Config">
      <mat-icon>download</mat-icon>
      Export XML
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportButtonComponent {
  private readonly api = inject(ApiService);

  readonly exportType = input.required<'outputs' | 'inputs' | 'scenes'>();

  download(): void {
    this.api.downloadExport(this.exportType()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.exportType()}.xml`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Export failed:', err);
      }
    });
  }
}
