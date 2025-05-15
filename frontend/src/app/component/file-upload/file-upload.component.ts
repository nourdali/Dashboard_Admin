import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() uploadSuccess = new EventEmitter<any>();
  selectedFile: File | null = null;
  selectedCategory: string = 'SALLE DE BAINS';
  categories = ['SALLE DE BAINS', 'REVETEMENT', 'MENUISERIE EXTERIEURE'];
  isLoading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      this.error = 'Veuillez sélectionner un fichier';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.apiService.uploadFile(this.selectedFile, this.selectedCategory);
      this.uploadSuccess.emit(result);
      this.selectedFile = null;
    } catch (error: any) {
      this.error = error.response?.data?.error || 'Erreur lors du téléversement';
    } finally {
      this.isLoading = false;
    }
  }
}