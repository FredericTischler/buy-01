import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[uiInput]',
})
export class UiInputDirective {
  @Input() invalid = false;
  @Input() dense = false;

  @HostBinding('class')
  protected get hostClasses(): string {
    return [
      'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.dense ? 'h-9 text-sm' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  @HostBinding('attr.aria-invalid')
  protected get ariaInvalid(): string {
    return this.invalid ? 'true' : 'false';
  }

  @HostBinding('class.border-destructive')
  protected get invalidBorder(): boolean {
    return this.invalid;
  }

  @HostBinding('class.focus-visible:ring-destructive/50')
  protected get invalidRing(): boolean {
    return this.invalid;
  }
}
