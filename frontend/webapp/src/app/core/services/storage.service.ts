import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage: Storage | null = this.resolveStorage();

  getItem<T>(key: string): T | null {
    if (!this.storage) {
      return null;
    }

    try {
      const raw = this.storage.getItem(key);
      if (!raw) {
        return null;
      }

      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch {
      // noop
    }
  }

  removeItem(key: string): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.removeItem(key);
    } catch {
      // noop
    }
  }

  private resolveStorage(): Storage | null {
    if (typeof window === 'undefined' || !('localStorage' in window)) {
      return null;
    }

    return window.localStorage;
  }
}
