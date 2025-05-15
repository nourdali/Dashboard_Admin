import { Component, OnDestroy } from '@angular/core';
import { LoadingService } from './services/loading.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'AI Model Admin';
  activeTab = 'upload';
  isSidebarCollapsed = false;

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  ngOnDestroy(): void {
    // Clean up any pending toast messages
    this.toastService.clearAll();
    
    // Ensure loading spinner is hidden
    this.loadingService.hide();
  }
}