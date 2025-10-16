import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedUiModule } from './ui/shared-ui.module';

const ANGULAR_MODULES = [CommonModule, FormsModule, ReactiveFormsModule, RouterModule];

@NgModule({
  imports: [CommonModule, SharedUiModule],
  exports: [...ANGULAR_MODULES, SharedUiModule],
})
export class SharedModule {}
