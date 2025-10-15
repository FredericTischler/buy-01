import { Routes } from '@angular/router';
import { authGuard, sellerGuard } from './core/guards/auth.guard';
import { ProductListComponent } from './products/product-list.component';
import { SignInComponent } from './auth/sign-in.component';
import { SignUpComponent } from './auth/sign-up.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MediaManagerComponent } from './media/media-manager.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  { path: 'products', component: ProductListComponent },
  { path: 'auth/sign-in', component: SignInComponent },
  { path: 'auth/sign-up', component: SignUpComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, sellerGuard]
  },
  {
    path: 'media',
    component: MediaManagerComponent,
    canActivate: [authGuard, sellerGuard]
  },
  { path: '**', redirectTo: 'products' }
];
