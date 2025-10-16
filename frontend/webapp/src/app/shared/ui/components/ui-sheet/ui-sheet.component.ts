import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

type SheetSide = 'left' | 'right' | 'bottom';

@Component({
  selector: 'ui-sheet',
  templateUrl: './ui-sheet.component.html',
  styleUrl: './ui-sheet.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSheetComponent {
  @Input() side: SheetSide = 'right';

  private _open = false;

  @Input()
  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    this._open = value;
  }

  @Output() readonly openChange = new EventEmitter<boolean>();
  @Output() readonly closed = new EventEmitter<void>();

  protected onClose(): void {
    if (!this._open) {
      return;
    }

    this._open = false;
    this.openChange.emit(false);
    this.closed.emit();
  }

  protected get transitionClass(): string {
    switch (this.side) {
      case 'left':
        return this._open ? 'translate-x-0' : '-translate-x-full';
      case 'right':
        return this._open ? 'translate-x-0' : 'translate-x-full';
      default:
        return this._open ? 'translate-y-0' : 'translate-y-full';
    }
  }

  protected get positionClass(): string {
    switch (this.side) {
      case 'left':
        return 'left-0 top-0 h-full w-80 max-w-full';
      case 'right':
        return 'right-0 top-0 h-full w-80 max-w-full';
      default:
        return 'bottom-0 left-0 right-0 w-full max-h-[90vh]';
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.onClose();
  }
}
