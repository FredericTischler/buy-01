import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { SellerRoutingModule } from './seller-routing.module';
import { SellerComponent } from './seller.component';

@NgModule({
  declarations: [SellerComponent],
  imports: [SharedModule, SellerRoutingModule],
})
export class SellerModule {}
