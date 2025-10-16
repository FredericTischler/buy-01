import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  templateUrl: './ui-badge.component.html',
  styleUrl: './ui-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBadgeComponent {
  @Input() variant: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' = 'default';

  @HostBinding('class')
  protected get hostClass(): string {
    const base =
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';
    const variants: Record<typeof this.variant, string> = {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      outline: 'border-border text-foreground',
      success: 'border-transparent bg-emerald-500/90 text-white',
      destructive: 'border-transparent bg-destructive text-destructive-foreground',
    };

    return `${base} ${variants[this.variant] ?? variants.default}`;
  }
}
