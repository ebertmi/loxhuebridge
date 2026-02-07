import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MappingWithStatus } from '../../../../core/models';
import { MappingItemComponent } from '../mapping-item/mapping-item.component';

@Component({
  selector: 'app-mapping-list',
  standalone: true,
  imports: [MappingItemComponent],
  template: `
    <div class="mapping-list">
      @for (mapping of mappings(); track mapping.loxone_name) {
        <app-mapping-item [mapping]="mapping" />
      }
    </div>
  `,
  styles: [`
    .mapping-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingListComponent {
  readonly mappings = input.required<MappingWithStatus[]>();
}
