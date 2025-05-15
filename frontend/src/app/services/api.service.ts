import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AIModel } from '../models/ai-model.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }

  // Document Upload
  uploadFile(file: File, category: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return this.http.post(`${this.apiUrl}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Get Documents
  getDocuments(category?: string): Observable<any> {
    const url = category ? `${this.apiUrl}/documents?category=${category}` : `${this.apiUrl}/documents`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  // Delete Document
  deleteDocument(docId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents/${docId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Query Documents
  queryDocuments(query: string, category?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/query`, { query, category }).pipe(
      catchError(this.handleError)
    );
  }

  // Vector Store Operations
  initVectorStore(): Observable<any> {
    return this.http.post(`${this.apiUrl}/init-vector-store`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getVectorStore(modelId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-vector-store/${modelId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Embedding Operations
  embedDocuments(modelName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/models/${modelName}/embed`, {}).pipe(
      catchError(this.handleError)
    );
  }

  reembedModel(modelId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/models/${modelId}/reembed`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getEmbeddingStatus(modelId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/models/${modelId}/embedding-status`).pipe(
      catchError(this.handleError)
    );
  }

  // Model Management
  getModels(page: number = 1, limit: number = 10): Observable<{models: AIModel[], total: number}> {
    return this.http.get<{models: AIModel[], total: number}>(`${this.apiUrl}/models`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getModel(modelId: string): Observable<AIModel> {
    return this.http.get<AIModel>(`${this.apiUrl}/models/${modelId}`).pipe(
      catchError(this.handleError)
    );
  }

  createModel(name: string, description: string): Observable<AIModel> {
    return this.http.post<AIModel>(`${this.apiUrl}/models`, { name, description }).pipe(
      catchError(this.handleError)
    );
  }

  deleteModel(modelId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/models/${modelId}`).pipe(
      catchError(this.handleError)
    );
  }

  uploadModelFiles(modelId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('model_name', modelId);
    
    files.forEach(file => {
      formData.append('files[]', file);
    });
    return this.http.post(`${this.apiUrl}/models/${modelId}/files`, formData).pipe(
      catchError(this.handleError)
    );
  }

  updateModelFiles(modelId: string, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('model_id', modelId);
    files.forEach(file => {
      formData.append('files[]', file);
    });
    return this.http.post(`${this.apiUrl}/update-model`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteModelFile(modelId: string, filename: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/models/${modelId}/files/${filename}`).pipe(
      catchError(this.handleError)
    );
  }

  getModelFile(modelId: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/models/${modelId}/files/${filename}`, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  trainModel(modelId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/models/${modelId}/train`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Chat Operations
  askQuestion(modelName: string, question: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ask`, { model_name: modelName, question }).pipe(
      catchError(this.handleError)
    );
  }

  getChatHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`).pipe(
      catchError(this.handleError)
    );
  }
}