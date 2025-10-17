import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { SellerRoutingModule } from './seller-routing.module';
import { SellerProductCreateComponent } from './seller-product-create.component';
import { SellerProductListComponent } from './seller-product-list.component';

@NgModule({
  declarations: [SellerProductListComponent, SellerProductCreateComponent],
  imports: [SharedModule, SellerRoutingModule],
})
export class SellerModule {}
