import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { LoxoneControl } from '../../../../core/models';
import { ControllerItemComponent } from '../controller-item/controller-item.component';

@Component({
  selector: 'app-controller-list',
  standalone: true,
  imports: [ControllerItemComponent],
  template: `
    <div class="controller-list">
      @for (control of controls(); track control.uuid) {
        <app-controller-item [control]="control" />
      }
    </div>
  `,
  styles: [`
    .controller-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControllerListComponent {
  readonly controls = input.required<LoxoneControl[]>();
}
