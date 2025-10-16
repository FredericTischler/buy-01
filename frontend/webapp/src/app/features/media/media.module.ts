import { NgModule } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { SharedModule } from '../../shared/shared.module';
import { MediaRoutingModule } from './media-routing.module';
import { MediaComponent } from './media.component';

@NgModule({
  declarations: [MediaComponent],
  imports: [SharedModule, MediaRoutingModule, ClipboardModule],
})
export class MediaModule {}
