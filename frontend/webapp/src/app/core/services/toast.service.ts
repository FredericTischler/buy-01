import { Injectable, signal } from '@angular/core';

import { ToastMessage } from '../models/toast-message.model';

const DEFAULT_AUTO_CLOSE = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  private readonly timers = new Map<string, number>();

  readonly toasts = this._toasts.asReadonly();

  show(partial: Omit<ToastMessage, 'id'> & { id?: string }): string {
    const id = partial.id ?? this.createToastId();
    const toast: ToastMessage = {
      id,
      variant: 'default',
      autoClose: DEFAULT_AUTO_CLOSE,
      ...partial,
    };

    this._toasts.update(current => [toast, ...current.filter(item => item.id !== id)]);
    this.scheduleAutoClose(toast);
    return id;
  }

  success(title: string, description?: string): string {
    return this.show({ title, description, variant: 'success' });
  }

  warning(title: string, description?: string): string {
    return this.show({ title, description, variant: 'warning' });
  }

  error(title: string, description?: string): string {
    return this.show({
      title,
      description,
      variant: 'destructive',
      autoClose: DEFAULT_AUTO_CLOSE * 1.5,
    });
  }

  dismiss(id: string): void {
    this.clearTimer(id);
    this._toasts.update(current => current.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.timers.forEach(timerId => this.safeClearTimeout(timerId));
    this.timers.clear();
    this._toasts.set([]);
  }

  private scheduleAutoClose(toast: ToastMessage): void {
    if (!toast.autoClose || toast.autoClose <= 0) {
      return;
    }

    this.clearTimer(toast.id);

    const timerId = this.safeSetTimeout(() => {
      this.dismiss(toast.id);
    }, toast.autoClose);

    if (timerId !== undefined) {
      this.timers.set(toast.id, timerId);
    }
  }

  private createToastId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `toast-${Date.now()}-${Math.round(Math.random() * 10_000)}`;
  }

  private clearTimer(id: string): void {
    const timerId = this.timers.get(id);
    if (timerId !== undefined) {
      this.safeClearTimeout(timerId);
      this.timers.delete(id);
    }
  }

  private safeSetTimeout(callback: () => void, delay: number): number | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    return window.setTimeout(callback, delay);
  }

  private safeClearTimeout(timerId: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.clearTimeout(timerId);
  }
}
