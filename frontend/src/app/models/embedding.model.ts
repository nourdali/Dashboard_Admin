export interface EmbeddingStatus {
  modelId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
  startTime?: Date;
  completionTime?: Date;
}

export interface VectorStoreInfo {
  modelId: string;
  documentCount: number;
  lastUpdated: Date;
  status: 'active' | 'inactive';
}
