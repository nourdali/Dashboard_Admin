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
          console.log('Selected files:', files.map(f => ({ name: f.name, type: f.type })));
          this.selectedFiles = files.filter(file => file.type === 'application/pdf');
          console.log('Filtered PDF files:', this.selectedFiles.map(f => f.name));
          
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
        this.apiService.createModel(this.model.name, this.model.description)
            .pipe(
                switchMap(createdModel => {
                    if (this.selectedFiles.length > 0) {
                        this.loadingService.setMessage('Uploading files...');
                        return this.apiService.uploadModelFiles(this.model.name, this.selectedFiles)
                           
                    }
                    return of(createdModel);
                }),
                catchError(error => {
                    console.error('Error details:', error);
                    const errorMessage = error.error?.error || error.message || 'Error creating model';
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
                    this.router.navigate(['/models', createdModel.id]);
                }
            });
    } catch (error: any) {
        console.error('Error details:', error);
        const errorMessage = error.error?.error || error.message || 'Error creating model';
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