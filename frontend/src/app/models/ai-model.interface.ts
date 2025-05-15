export type ModelStatus = 'Pending' | 'Training' | 'Ready' | 'Error';
export type EmbeddingStatus = 'Pending' | 'Processing' | 'Completed' | 'Error';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  status: ModelStatus;
  dateCreated: Date;
  files: {
    id: string;
    name: string;
    path: string;
  }[];
  trainingLogs?: string[];
  embeddingStatus?: EmbeddingStatus;
  embeddingProgress?: number;
  vectorStore?: {
    documentCount: number;
    lastUpdated: Date;
    status: 'active' | 'inactive';
  };
}