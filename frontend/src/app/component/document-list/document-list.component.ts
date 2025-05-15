import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  categories = ['Tous', 'SALLE DE BAINS', 'REVETEMENT', 'MENUISERIE EXTERIEURE'];
  selectedCategory = 'Tous';
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
      this.documents = await this.apiService.getDocuments().toPromise();
      this.filterDocuments();
    } catch (error: any) {
      this.error = error.message || 'Erreur lors du chargement des documents';
    } finally {
      this.isLoading = false;
    }
  }

  filterDocuments(): void {
    if (this.selectedCategory === 'Tous') {
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

  async deleteDocument(docId: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        const success = await this.apiService.deleteDocument(docId);
        if (success) {
          await this.loadDocuments();
        }
      } catch (error: any) {
        this.error = error.message || 'Erreur lors de la suppression';
      }
    }
  }

  onUploadSuccess(): void {
    this.loadDocuments();
  }
}