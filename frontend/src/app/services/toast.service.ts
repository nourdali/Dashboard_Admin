import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new Subject<Toast[]>();
  private toasts: Toast[] = [];
  private nextId = 1;

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  private show(options: ToastOptions): void {
    const toast: Toast = {
      ...options,
      id: this.nextId++,
      duration: options.duration || 3000 // Default duration
    };

    this.toasts.push(toast);
    this.toasts$.next([...this.toasts]);

    // Auto remove after the specified duration
    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toasts$.next([...this.toasts]);
  }

  clearAll(): void {
    this.toasts = [];
    this.toasts$.next([]);
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }
}