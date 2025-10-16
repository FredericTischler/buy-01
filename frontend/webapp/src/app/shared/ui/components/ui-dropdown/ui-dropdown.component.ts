import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';

type DropdownAlignment = 'start' | 'end';

@Component({
  selector: 'ui-dropdown',
  templateUrl: './ui-dropdown.component.html',
  styleUrl: './ui-dropdown.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDropdownComponent {
  @Input() alignment: DropdownAlignment = 'end';

  protected open = false;
  @ViewChild('trigger', { static: true })
  protected trigger?: ElementRef<HTMLElement>;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  toggle(event?: Event): void {
    event?.stopPropagation();
    this.open = !this.open;
  }

  close(): void {
    this.open = false;
  }

  protected get menuAlignmentClass(): string {
    return this.alignment === 'start' ? 'left-0' : 'right-0';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as Node | null;
    if (!this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('click', ['$event'])
  protected onHostClick(event: Event): void {
    if (!this.open) {
      return;
    }

    const target = event.target as Node | null;
    if (target && this.trigger?.nativeElement.contains(target)) {
      return;
    }

    this.close();
  }
}
