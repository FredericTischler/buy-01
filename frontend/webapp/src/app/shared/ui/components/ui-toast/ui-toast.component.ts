import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import type { ToastMessage } from '../../../../core/models/toast-message.model';

@Component({
  selector: 'ui-toast-container',
  templateUrl: './ui-toast.component.html',
  styleUrl: './ui-toast.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiToastComponent {
  @Input() toasts: ToastMessage[] = [];
  @Output() readonly dismissed = new EventEmitter<string>();
  @Output() readonly action = new EventEmitter<string>();

  protected onDismiss(id: string): void {
    this.dismissed.emit(id);
  }

  protected onAction(id: string): void {
    this.action.emit(id);
  }

  protected toastClasses(toast: ToastMessage): string {
    const base =
      'pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 shadow-lg transition-all';
    switch (toast.variant) {
      case 'success':
        return `${base} border-emerald-400/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100`;
      case 'destructive':
        return `${base} border-destructive/60 bg-destructive/10 text-destructive-foreground`;
      case 'warning':
        return `${base} border-amber-500/60 bg-amber-500/10 text-amber-900 dark:text-amber-100`;
      default:
        return `${base} border-border bg-card text-card-foreground`;
    }
  }
}
