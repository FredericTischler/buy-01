import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog.module').then(m => m.CatalogModule),
  },
  {
    path: 'seller',
    canMatch: [AuthGuard, RoleGuard],
    data: {
      roles: ['SELLER'],
    },
    loadChildren: () => import('./features/seller/seller.module').then(m => m.SellerModule),
  },
  {
    path: 'media',
    canMatch: [AuthGuard, RoleGuard],
    data: {
      roles: ['SELLER'],
    },
    loadChildren: () => import('./features/media/media.module').then(m => m.MediaModule),
  },
  {
    path: 'profile',
    canMatch: [AuthGuard],
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
  },
  {
    path: '**',
    redirectTo: 'catalog',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'always' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
