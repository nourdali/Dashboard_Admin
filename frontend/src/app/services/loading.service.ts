import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({ isLoading: false });
  loading$: Observable<LoadingState> = this.loadingSubject.asObservable();

  show(message?: string): void {
    this.loadingSubject.next({ isLoading: true, message });
  }

  hide(): void {
    this.loadingSubject.next({ isLoading: false });
  }

  setMessage(message: string): void {
    const currentState = this.loadingSubject.value;
    if (currentState.isLoading) {
      this.loadingSubject.next({ ...currentState, message });
    }
  }
}