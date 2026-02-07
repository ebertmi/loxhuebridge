import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { SceneWithStatus } from '../../../../core/models';
import { SceneItemComponent } from '../scene-item/scene-item.component';

@Component({
  selector: 'app-scene-list',
  standalone: true,
  imports: [SceneItemComponent],
  template: `
    <div class="scene-list">
      @for (scene of scenes(); track scene.uuid) {
        <app-scene-item [scene]="scene" />
      }
    </div>
  `,
  styles: [`
    .scene-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SceneListComponent {
  readonly scenes = input.required<SceneWithStatus[]>();
}
