import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleGuard } from '../../core/guards/role.guard';
import { SellerProductCreateComponent } from './seller-product-create.component';
import { SellerProductListComponent } from './seller-product-list.component';

const routes: Routes = [
  {
    path: '',
    canMatch: [RoleGuard],
    data: { roles: ['SELLER'] },
    component: SellerProductListComponent,
  },
  {
    path: 'products/new',
    canMatch: [RoleGuard],
    data: { roles: ['SELLER'] },
    component: SellerProductCreateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellerRoutingModule {}
