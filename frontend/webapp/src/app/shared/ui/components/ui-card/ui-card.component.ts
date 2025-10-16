import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-card',
  templateUrl: './ui-card.component.html',
  styleUrl: './ui-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent {
  @Input() interactive = false;
  @HostBinding('class')
  protected hostClass =
    'block overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm';
}
