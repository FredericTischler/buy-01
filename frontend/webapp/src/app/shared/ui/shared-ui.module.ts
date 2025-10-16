import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmButtonModule } from '@spartan-ng/ui-button-helm';
import { UiCardComponent } from './components/ui-card/ui-card.component';
import { UiInputDirective } from './directives/ui-input.directive';
import { UiLabelDirective } from './directives/ui-label.directive';
import { UiBadgeComponent } from './components/ui-badge/ui-badge.component';
import { UiSkeletonComponent } from './components/ui-skeleton/ui-skeleton.component';
import { UiPaginationComponent } from './components/ui-pagination/ui-pagination.component';
import { UiTabsComponent } from './components/ui-tabs/ui-tabs.component';
import { UiDialogComponent } from './components/ui-dialog/ui-dialog.component';
import { UiDropdownComponent } from './components/ui-dropdown/ui-dropdown.component';
import { UiNavigationComponent } from './components/ui-navigation/ui-navigation.component';
import { UiSheetComponent } from './components/ui-sheet/ui-sheet.component';
import { UiToastComponent } from './components/ui-toast/ui-toast.component';
import { UiTabPanelDirective } from './directives/ui-tab-panel.directive';

@NgModule({
  imports: [CommonModule, A11yModule, HlmButtonModule, RouterModule],
  exports: [
    HlmButtonModule,
    RouterModule,
    UiCardComponent,
    UiInputDirective,
    UiLabelDirective,
    UiBadgeComponent,
    UiSkeletonComponent,
    UiPaginationComponent,
    UiTabsComponent,
    UiDialogComponent,
    UiDropdownComponent,
    UiNavigationComponent,
    UiSheetComponent,
    UiToastComponent,
    UiTabPanelDirective,
  ],
  declarations: [
    UiCardComponent,
    UiInputDirective,
    UiLabelDirective,
    UiBadgeComponent,
    UiSkeletonComponent,
    UiPaginationComponent,
    UiTabsComponent,
    UiDialogComponent,
    UiDropdownComponent,
    UiNavigationComponent,
    UiSheetComponent,
    UiToastComponent,
    UiTabPanelDirective,
  ],
})
export class SharedUiModule {}
