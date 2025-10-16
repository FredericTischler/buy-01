import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[uiTabPanel]',
})
export class UiTabPanelDirective {
  @Input('uiTabPanel') name!: string;

  constructor(public readonly template: TemplateRef<unknown>) {}
}
