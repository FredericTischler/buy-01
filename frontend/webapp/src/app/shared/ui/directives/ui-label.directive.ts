import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[uiLabel]',
})
export class UiLabelDirective {
  @HostBinding('class')
  protected hostClass =
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
}
