import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ScenesStateService } from '../../services/scenes-state.service';
import { SceneListComponent } from '../scene-list/scene-list.component';
import { ExportButtonComponent } from '../../../lights/components/export-button/export-button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-scenes-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    SceneListComponent,
    ExportButtonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="scenes-page">
      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="page-header">
          <h2>Hue Scenes</h2>
          <span class="flex-spacer"></span>
          <app-export-button exportType="scenes" />
          <button mat-icon-button (click)="refresh()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        @if (state.scenes().length > 0) {
          @for (entry of groupEntries; track entry[0]) {
            <mat-card class="group-card">
              <mat-card-header>
                <mat-card-title>{{ entry[0] }}</mat-card-title>
                <mat-card-subtitle>{{ entry[1].length }} scenes</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <app-scene-list [scenes]="entry[1]" />
              </mat-card-content>
            </mat-card>
          }
        } @else {
          <app-empty-state
            icon="palette"
            title="No scenes found"
            message="Create scenes in the Philips Hue app first">
          </app-empty-state>
        }
      }

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .scenes-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-header h2 {
      margin: 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .group-card {
      margin-bottom: 16px;
    }

    .error-banner {
      background-color: #f44336;
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScenesPageComponent implements OnInit {
  readonly state = inject(ScenesStateService);

  get groupEntries() {
    return Array.from(this.state.scenesByGroup().entries());
  }

  ngOnInit(): void {
    this.state.loadScenes();
  }

  refresh(): void {
    this.state.loadScenes();
  }
}
