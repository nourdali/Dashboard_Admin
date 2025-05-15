export interface ChatMessage {
  id: string;
  modelName: string;
  question: string;
  answer: string;
  timestamp: Date;
  sources?: {
    document: string;
    relevance: number;
  }[];
}

export interface ChatHistory {
  messages: ChatMessage[];
  totalMessages: number;
}
