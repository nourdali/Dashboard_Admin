import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { WebSocketService, ModelUpdate } from '../../services/websocket.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { AIModel, ModelStatus, EmbeddingStatus } from '../../models/ai-model.interface';
import { Subscription, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-model-list',
  templateUrl: './model-list.component.html',
  styleUrls: ['./model-list.component.scss']
})
export class ModelListComponent implements OnInit, OnDestroy {
  models: AIModel[] = [];
  filteredModels: AIModel[] = [];
  error: string | null = null;
  
  // Search and Filter
  searchTerm = '';
  statusFilter: ModelStatus | 'all' = 'all';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalModels = 0;
  Math = Math; // For using Math in template

  private wsSubscription: Subscription | null = null;

  constructor(
    private apiService: ApiService,
    private wsService: WebSocketService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadModels();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  private setupWebSocket(): void {
    this.wsSubscription = this.wsService.connect()
      .subscribe({
        next: (update: ModelUpdate) => {
          // Update model status in both models and filteredModels arrays
          const updateModel = (modelArray: AIModel[]) => {
            const index = modelArray.findIndex(m => m.id === update.modelId);
            if (index !== -1) {
              const previousStatus = modelArray[index].status;
              modelArray[index] = {
                ...modelArray[index],
                status: update.status,
                trainingLogs: update.trainingLogs || modelArray[index].trainingLogs
              };
              
              // Show notifications for significant status changes
              if (previousStatus !== update.status) {
                switch (update.status) {
                  case 'Ready':
                    this.toastService.success(`Model "${modelArray[index].name}" training completed`);
                    break;
                  case 'Error':
                    this.toastService.error(`Model "${modelArray[index].name}" training failed`);
                    break;
                }
              }
            }
          };

          updateModel(this.models);
          updateModel(this.filteredModels);
        },
        error: (error) => {
          console.error('WebSocket error:', error);
          this.toastService.error('Lost connection to server');
        }
      });
  }

  async loadModels(): Promise<void> {
    this.error = null;
    this.loadingService.show('Loading models...');

    try {
      const result = await this.apiService.getModels(this.currentPage, this.pageSize).toPromise();
      if (result?.models) {
        // Get embedding status and vector store info for each model
        const modelUpdates = result.models
          .filter(model => model.embeddingStatus !== 'Completed')
          .map(model => {
            return this.apiService.getModel(model.id)
          });

        forkJoin(modelUpdates).subscribe({
          next: (updatedModels) => {
            this.models = updatedModels;
            this.totalModels = result.total;
            this.applyFilters();
          },
          error: (error) => {
            console.error('Error loading model details:', error);
          }
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error loading models';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
    } finally {
      this.loadingService.hide();
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.models];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(term) ||
        model.description.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(model => 
        model.status === this.statusFilter
      );
    }

    this.filteredModels = filtered;
  }

  async onPageChange(page: number): Promise<void> {
    if (page < 1 || page > Math.ceil(this.totalModels / this.pageSize)) return;
    
    this.currentPage = page;
    await this.loadModels();
  }

  async deleteModel(modelId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this model?')) return;

    this.loadingService.show('Deleting model...');
    try {
      await this.apiService.deleteModel(modelId);
      this.toastService.success('Model deleted successfully');
      await this.loadModels();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error deleting model';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
    } finally {
      this.loadingService.hide();
    }
  }

  getStatusClass(status: ModelStatus): string {
    const classes = {
      'Pending': 'badge bg-secondary',
      'Training': 'badge bg-info',
      'Ready': 'badge bg-success',
      'Error': 'badge bg-danger'
    };
    return classes[status] || classes['Pending'];
  }

  getEmbeddingStatusClass(status: EmbeddingStatus): string {
    const classes = {
      'Pending': 'badge bg-secondary',
      'Processing': 'badge bg-info',
      'Completed': 'badge bg-success',
      'Error': 'badge bg-danger'
    };
    return classes[status] || classes['Pending'];
  }
}