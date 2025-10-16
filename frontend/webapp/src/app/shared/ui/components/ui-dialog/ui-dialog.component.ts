import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

type DialogSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-dialog',
  templateUrl: './ui-dialog.component.html',
  styleUrl: './ui-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiDialogComponent {
  @Input() title?: string;
  @Input() size: DialogSize = 'md';

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

  protected get dialogWidthClass(): string {
    switch (this.size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-3xl';
      default:
        return 'max-w-xl';
    }
  }

  protected onClose(): void {
    if (!this._open) {
      return;
    }

    this._open = false;
    this.openChange.emit(false);
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.onClose();
  }
}
