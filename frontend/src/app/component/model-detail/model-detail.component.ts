import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { AIModel, ModelStatus, EmbeddingStatus } from '../../models/ai-model.interface';
import { Subscription, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-model-detail',
  templateUrl: './model-detail.component.html',
  styleUrls: ['./model-detail.component.scss']
})
export class ModelDetailComponent implements OnInit, OnDestroy {
  model: AIModel | null = null;
  error: string | null = null;
  selectedFiles: File[] = [];
  uploadProgress = 0;
  private wsSubscription: Subscription | null = null;
  private embeddingStatusSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const modelId = this.route.snapshot.paramMap.get('id');
    if (modelId) {
      this.loadModel(modelId);
      this.startEmbeddingStatusPolling(modelId);
    } else {
      const errorMessage = 'Model ID not found';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.embeddingStatusSubscription) {
      this.embeddingStatusSubscription.unsubscribe();
    }
  }

  private startEmbeddingStatusPolling(modelId: string): void {
    // Poll embedding status every 5 seconds if model is in Processing state
    this.embeddingStatusSubscription = interval(5000).subscribe(() => {
      if (this.model?.embeddingStatus === 'Processing') {
        this.apiService.getEmbeddingStatus(modelId).subscribe({
          next: (status) => {
            if (this.model) {
              this.model.embeddingStatus = status.status;
              this.model.embeddingProgress = status.progress;
              
              if (status.status === 'Completed') {
                this.toastService.success('Document embedding completed');
                this.embeddingStatusSubscription?.unsubscribe();
                // this.loadVectorStoreInfo(modelId);
              } else if (status.status === 'Error') {
                this.toastService.error('Document embedding failed: ' + status.error);
                this.embeddingStatusSubscription?.unsubscribe();
              }
            }
          },
          error: (error) => {
            console.error('Error fetching embedding status:', error);
          }
        });
      }
    });
  }

  // private loadVectorStoreInfo(modelId: string): void {
  //   this.apiService.getVectorStore(modelId).subscribe({
  //     next: (vectorStore) => {
  //       if (this.model) {
  //         this.model.vectorStore = vectorStore;
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error loading vector store info:', error);
  //     }
  //   });
  // }

  async loadModel(modelId: string): Promise<void> {
    this.error = null;
    this.loadingService.show('Loading model details...');

    try {
      const response = await this.apiService.getModel(modelId).toPromise();
      
      if (!response) {
        throw new Error('No data received from API');
      }

      // Map the response to our AIModel interface
      this.model = {
        id: response.id,
        name: response.name,
        description: response.description,
        status: response.status || 'Pending',
        dateCreated: new Date(response.dateCreated),
        files: response.files || [],
        trainingLogs: response.trainingLogs || [],
        embeddingStatus: response.embeddingStatus,
        embeddingProgress: response.embeddingProgress,
        vectorStore: response.vectorStore
      };

      // Load vector store info if not included in model response
      // if (!response.vectorStore) {
      //   this.loadVectorStoreInfo(modelId);
      // }
      
    } catch (error: any) {
      console.error('Load Model Error:', error);
      const errorMessage = error.error?.message || error.message || 'Error loading model';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
      
      // Redirect to models list if model not found
      if (error.status === 404) {
        this.router.navigate(['/models']);
      }
    } finally {
      this.loadingService.hide();
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedFiles = files.filter(file => file.type === 'application/pdf');
      
      const invalidCount = files.length - this.selectedFiles.length;
      if (invalidCount > 0) {
        this.toastService.warning(`${invalidCount} file(s) were skipped because they are not PDFs`);
      }
    }
  }

  async uploadFiles(): Promise<void> {
    if (!this.model || this.selectedFiles.length === 0) return;
  
    this.error = null;
    this.loadingService.show('Uploading files...');

    try {
      await this.apiService.uploadModelFiles(this.model.id, this.selectedFiles).toPromise();
      
      // Start embedding process for new files
      this.loadingService.setMessage('Starting document embedding...');
      await this.apiService.reembedModel(this.model.id).toPromise();
      
      this.toastService.success('Files uploaded successfully. Document embedding started.');
      this.loadModel(this.model.id); // Reload model to get updated file list
      this.selectedFiles = [];
      
    } catch (error: any) {
      console.error('Upload Error:', error);
      const errorMessage = error.error?.message || error.message || 'Error uploading files';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
    } finally {
      this.loadingService.hide();
    }
  }

  async triggerTraining(): Promise<void> {
    if (!this.model) return;
  
    this.error = null;
    this.loadingService.show('Initiating model training...');
  
    try {
      const response = await this.apiService.trainModel(this.model.id).toPromise();
  
      if (response) {
        // Update model status and logs
        this.model.status = 'Training';
        this.model.trainingLogs = [
          ...(this.model.trainingLogs || []),
          `Training started at ${new Date().toLocaleString()}`
        ];
      
        this.toastService.success('Training initiated successfully');
      }
    } catch (error: any) {
      console.error('Training error:', error);
      
      const errorMessage = error.error?.message || 'Error initiating training';
      this.error = errorMessage;
      this.model.status = 'Error';
      this.model.trainingLogs = [
        ...(this.model.trainingLogs || []),
        `Training failed at ${new Date().toLocaleString()}`,
        `Error: ${errorMessage}`
      ];
  
      this.toastService.error(errorMessage);
    } finally {
      this.loadingService.hide();
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.model) return;

    if (confirm('Are you sure you want to delete this file?')) {
      this.loadingService.show('Deleting file...');
      try {
        await this.apiService.deleteModelFile(this.model.id, fileId);
        await this.loadModel(this.model.id);
        this.toastService.success('File deleted successfully');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Error deleting file';
        this.error = errorMessage;
        this.toastService.error(errorMessage);
      } finally {
        this.loadingService.hide();
      }
    }
  }

  async reembedModel(): Promise<void> {
    if (!this.model) return;

    this.loadingService.show('Starting re-embedding process...');
    try {
      await this.apiService.reembedModel(this.model.id).toPromise();
      this.toastService.success('Re-embedding process started');
      this.loadModel(this.model.id);
    } catch (error: any) {
      console.error('Re-embedding Error:', error);
      const errorMessage = error.error?.message || error.message || 'Error starting re-embedding process';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
    } finally {
      this.loadingService.hide();
    }
  }

  getStatusClass(status: ModelStatus): string {
    switch (status) {
      case 'Ready':
        return 'badge bg-success';
      case 'Training':
        return 'badge bg-warning';
      case 'Error':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
}