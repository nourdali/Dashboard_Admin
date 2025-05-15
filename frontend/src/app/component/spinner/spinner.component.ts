import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="spinner-overlay" *ngIf="show">
      <div class="spinner-wrapper">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div *ngIf="message" class="spinner-message mt-2">{{message}}</div>
      </div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .spinner-wrapper {
      text-align: center;
    }

    .spinner-message {
      color: var(--primary-color);
      font-size: 0.9rem;
    }
  `]
})
export class SpinnerComponent implements OnInit, OnDestroy {
  show = false;
  message?: string;
  private subscription?: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.subscription = this.loadingService.loading$.subscribe(state => {
      this.show = state.isLoading;
      this.message = state.message;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}