import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  templateUrl: './ui-skeleton.component.html',
  styleUrl: './ui-skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSkeletonComponent {
  @Input() width: string | number = '100%';
  @Input() height: string | number = '1rem';
  @Input() radius = 'var(--radius)';

  @HostBinding('style.width')
  protected get hostWidth(): string {
    return typeof this.width === 'number' ? `${this.width}px` : this.width;
  }

  @HostBinding('style.height')
  protected get hostHeight(): string {
    return typeof this.height === 'number' ? `${this.height}px` : this.height;
  }

  @HostBinding('style.borderRadius')
  protected get hostRadius(): string {
    return this.radius;
  }
}
