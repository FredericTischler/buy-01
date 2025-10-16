import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { CatalogRoutingModule } from './catalog-routing.module';
import { CatalogComponent } from './catalog.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

@NgModule({
  declarations: [CatalogComponent, ProductDetailComponent],
  imports: [SharedModule, CatalogRoutingModule],
})
export class CatalogModule {}
