import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { setupGuard } from './core/guards/setup.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    canActivate: [setupGuard],
    children: [
      {
        path: '',
        redirectTo: 'lights',
        pathMatch: 'full'
      },
      {
        path: 'lights',
        loadChildren: () => import('./features/lights/lights.routes').then(m => m.LIGHTS_ROUTES)
      },
      {
        path: 'sensors',
        loadChildren: () => import('./features/sensors/sensors.routes').then(m => m.SENSORS_ROUTES)
      },
      {
        path: 'buttons',
        loadChildren: () => import('./features/buttons/buttons.routes').then(m => m.BUTTONS_ROUTES)
      },
      {
        path: 'scenes',
        loadChildren: () => import('./features/scenes/scenes.routes').then(m => m.SCENES_ROUTES)
      },
      {
        path: 'light-controllers',
        loadChildren: () => import('./features/light-controllers/light-controllers.routes').then(m => m.LIGHT_CONTROLLERS_ROUTES)
      },
      {
        path: 'system',
        loadChildren: () => import('./features/system/system.routes').then(m => m.SYSTEM_ROUTES)
      },
      {
        path: 'diagnostics',
        loadChildren: () => import('./features/diagnostics/diagnostics.routes').then(m => m.DIAGNOSTICS_ROUTES)
      }
    ]
  },
  {
    path: 'setup',
    loadChildren: () => import('./features/setup/setup.routes').then(m => m.SETUP_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'lights'
  }
];
