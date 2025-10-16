export type ToastVariant = 'default' | 'success' | 'destructive' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  actionLabel?: string;
  autoClose?: number;
}
