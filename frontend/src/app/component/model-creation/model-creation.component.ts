import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { Router } from '@angular/router';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-model-creation',
  templateUrl: './model-creation.component.html',
  styleUrls: ['./model-creation.component.scss']
})
export class ModelCreationComponent {
  model = {
    name: '',
    description: ''
  };
  selectedFiles: File[] = [];
  error: string | null = null;
  uploadProgress = 0;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {}

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

  async createModel(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.error = null;
    this.loadingService.show('Creating model...');

    try {
      // First create the model
      this.apiService.createModel(this.model.name, this.model.description)
        .pipe(
          switchMap(createdModel => {
            if (this.selectedFiles.length > 0) {
              // Upload the files
              this.loadingService.setMessage('Uploading files...');
              return this.apiService.uploadModelFiles(createdModel.id, this.selectedFiles)
                .pipe(
                  // switchMap(() => {
                  //   // Initialize vector store
                  //   this.loadingService.setMessage('Initializing vector store...');
                  //   return this.apiService.initVectorStore();
                  // }),
                  switchMap(() => {
                    // Start embedding process
                    this.loadingService.setMessage('Starting document embedding...');
                    return this.apiService.embedDocuments(createdModel.name);
                  }),
                  switchMap(() => of(createdModel))
                );
            }
            return of(createdModel);
          }),
          catchError(error => {
            console.error('Error details:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error creating model';
            this.error = errorMessage;
            this.toastService.error(errorMessage);
            throw error;
          }),
          finalize(() => {
            this.loadingService.hide();
          })
        )
        .subscribe({
          next: (createdModel) => {
            this.toastService.success('Model created successfully');
            // Navigate to model detail page
            this.router.navigate(['/models', createdModel.id]);
          }
        });
    } catch (error: any) {
      console.error('Error details:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error creating model';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
    }
  }

  private validateForm(): boolean {
    if (!this.model.name || !this.model.description) {
      const errorMessage = 'Please fill in all required fields';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
      return false;
    }

    if (this.selectedFiles.length === 0) {
      const errorMessage = 'Please select at least one PDF file';
      this.error = errorMessage;
      this.toastService.error(errorMessage);
      return false;
    }

    return true;
  }
}