import {Routes} from '@angular/router';
import {authGuard} from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./presentations/views/home-page/home-page.component').then(m => m.HomePageComponent)
  },
  {
    path: 'employee/dashboard',
    loadComponent: () => import('./presentations/views/employee-dashboard/employee-dashboard.component')
      .then(m => m.EmployeeDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home',
  }
]
