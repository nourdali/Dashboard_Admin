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
  
  getModelFile(modelId: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/models/${modelId}/files/${filename}`, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }
  // Embedding Operations


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
      console.log('Sending payload:', { name, description });
      return this.http.post<AIModel>(`${this.apiUrl}/models`, { name, description }).pipe(
          catchError(this.handleError)
      );
  }

  deleteModel(modelId: string): Observable<void> {
      const url = `${this.apiUrl}/models/${modelId}`;
      console.log('DELETE Model URL:', url); // Debug log
      return this.http.delete<{ message: string, model_id: string }>(url).pipe(
        map(response => {
          console.log('DELETE Model Response:', response); // Debug log
          if (response.message === 'Model deleted successfully') {
            return; // Return void for successful deletion
          }
          throw new Error(response.message || 'Unexpected response');
        }),
        catchError(this.handleError)
      );
  }

  uploadModelFiles(modelName: string, files: File[]): Observable<any> {
      const formData = new FormData();
      formData.append('model_name', modelName); // Utiliser modelName
      files.forEach(file => {
          console.log('Adding file to FormData:', file.name);
          formData.append('files[]', file);
      });
      return this.http.post(`${this.apiUrl}/models/upload-model`, formData).pipe(
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
      // Encode filename to handle special characters
      const encodedFilename = encodeURIComponent(filename);
      return this.http.delete<{ message: string, model_id: string, filename: string }>(
        `${this.apiUrl}/models/${modelId}/files/${encodedFilename}`
      ).pipe(
        map(response => {
          if (response.message === 'File deleted successfully') {
            return; // Return void for successful deletion
          }
          throw new Error(response.message || 'Unexpected response');
        }),
        catchError(this.handleError)
      );
    }



  embedDocuments(model_name: string): Observable<any> {
      console.log('Embedding documents for model:', model_name);
      return this.http.post(`${this.apiUrl}/models/${model_name}/embed`, {}).pipe(
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