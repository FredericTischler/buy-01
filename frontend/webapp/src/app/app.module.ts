import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from './layout/layout.module';
import { API_BASE_URL, MAX_IMAGE_UPLOAD_MB } from './core/tokens/api.tokens';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    LayoutModule,
  ],
  providers: [
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    { provide: MAX_IMAGE_UPLOAD_MB, useValue: environment.maxImageMb },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
