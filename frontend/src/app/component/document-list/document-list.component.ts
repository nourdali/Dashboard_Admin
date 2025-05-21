import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Document } from '../../models/document.model';
import { AIModel } from '../../models/ai-model.interface';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  isLoading = true;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  async ngOnInit(): Promise<void> {
    await this.loadDocuments();
  }

  async loadDocuments(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    
    try {
      // First get the model list to get access to all files
      const modelResponse = await this.apiService.getModels().toPromise();
      
      if (modelResponse) {
        // Flatten all files from all models into a document array
        this.documents = modelResponse.models.reduce((docs: Document[], model: AIModel) => {
          const modelDocs = model.files.map(file => ({
            id: model.id,
            category: file.path?.split('/')[0] || 'Other', // Use first part of path as category
            metadata: {
              filename: file.name,
              original_name: file.name,
              path: file.path || ''
            },
            text: ''  // This field might need to be populated differently
          }));
          return [...docs, ...modelDocs];
        }, []);

        // Update categories based on unique paths
        const uniqueCategories = new Set(this.documents.map(doc => doc.category));
        this.categories = ['All', ...Array.from(uniqueCategories)];
      } else {
        this.documents = [];
        this.categories = ['All'];
      }
      
      this.filterDocuments();
    } catch (error: any) {
      this.error = error.message || 'Erreur lors du chargement des documents';
    } finally {
      this.isLoading = false;
    }
  }

  filterDocuments(): void {
    if (this.selectedCategory === 'All') {
      this.filteredDocuments = [...this.documents];
    } else {
      this.filteredDocuments = this.documents.filter(
        doc => doc.category === this.selectedCategory
      );
    }
  }

  async onCategoryChange(): Promise<void> {
    this.filterDocuments();
  }

  async deleteDocument(doc: Document): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await this.apiService.deleteModelFile(doc.id, doc.metadata['filename']).toPromise();
        await this.loadDocuments();
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la suppression';
      }
    }
  }

  onUploadSuccess(): void {
    this.loadDocuments();
  }
}