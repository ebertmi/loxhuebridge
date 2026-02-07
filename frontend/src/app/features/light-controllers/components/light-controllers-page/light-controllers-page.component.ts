import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LightControllersStateService } from '../../services/light-controllers-state.service';
import { ControllerListComponent } from '../controller-list/controller-list.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-light-controllers-page',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ControllerListComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="light-controllers-page">
      <div class="page-header">
        <h2>Loxone Light Controllers</h2>
        <span class="flex-spacer"></span>
        <mat-form-field class="search-field" subscriptSizing="dynamic">
          <mat-label>Search</mat-label>
          <input matInput
                 [ngModel]="state.searchTerm()"
                 (ngModelChange)="state.setSearchTerm($event)"
                 placeholder="Search by name, type, or room">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-icon-button (click)="refresh()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      @if (state.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (state.filteredControls().length > 0) {
        @for (entry of typeEntries; track entry[0]) {
          <mat-card class="type-card">
            <mat-card-header>
              <mat-icon matCardAvatar>{{ getTypeIcon(entry[0]) }}</mat-icon>
              <mat-card-title>{{ entry[0] }}</mat-card-title>
              <mat-card-subtitle>{{ entry[1].length }} controls</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-controller-list [controls]="entry[1]" />
            </mat-card-content>
          </mat-card>
        }
      } @else if (state.searchTerm()) {
        <app-empty-state
          icon="search_off"
          title="No results"
          message="No controls match your search">
        </app-empty-state>
      } @else {
        <app-empty-state
          icon="tune"
          title="No Loxone controls found"
          message="Ensure Loxone Miniserver is configured and running">
        </app-empty-state>
      }

      @if (state.error()) {
        <div class="error-banner">
          {{ state.error() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .light-controllers-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .page-header h2 {
      margin: 0;
    }

    .search-field {
      min-width: 250px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .type-card {
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
export class LightControllersPageComponent implements OnInit {
  readonly state = inject(LightControllersStateService);

  get typeEntries() {
    return Array.from(this.state.controlsByType().entries());
  }

  ngOnInit(): void {
    this.state.loadControls();
  }

  refresh(): void {
    this.state.loadControls();
  }

  getTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'switch': return 'toggle_on';
      case 'dimmer': return 'brightness_medium';
      case 'colorpicker': return 'palette';
      case 'colorpickerv2': return 'palette';
      case 'lightcontroller': return 'wb_incandescent';
      case 'lightcontrollerv2': return 'wb_incandescent';
      default: return 'device_unknown';
    }
  }
}
