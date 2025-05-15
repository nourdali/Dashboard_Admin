import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Observable, Subject, timer } from 'rxjs';
import { retryWhen, delay, tap } from 'rxjs/operators';
import { ModelStatus } from '../models/ai-model.interface';

export interface ModelUpdate {
  modelId: string;
  status: ModelStatus;
  trainingLogs?: string[];
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private reconnection$ = new Subject<void>();
  private wsUrl = environment.wsUrl || 'ws://localhost:5000/ws';

  public connect(): Observable<ModelUpdate> {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: this.wsUrl,
        openObserver: {
          next: () => {
            console.log('WebSocket connected');
          }
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket disconnected');
            this.reconnection$.next();
          }
        }
      });

      // Handle reconnection
      this.socket$.pipe(
        retryWhen(errors => 
          errors.pipe(
            tap(error => console.log('WebSocket error:', error)),
            delay(1000)
          )
        )
      );
    }

    return this.socket$.asObservable();
  }

  public sendMessage(message: any): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
    }
  }

  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }
}