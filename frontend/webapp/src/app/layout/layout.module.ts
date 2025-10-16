import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { AppShellComponent } from './components/app-shell/app-shell.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';

@NgModule({
  declarations: [AppShellComponent, AppHeaderComponent, SideNavComponent, AppFooterComponent],
  imports: [CommonModule, RouterModule, SharedModule],
  exports: [AppShellComponent, AppHeaderComponent, SideNavComponent, AppFooterComponent],
})
export class LayoutModule {}
