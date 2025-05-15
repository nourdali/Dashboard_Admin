export interface Document {
    id: string;
    category: string;
    metadata: {
      filename: string;
      original_name?: string;
      [key: string]: any;
    };
    text: string;
  }
  
  export interface QueryResult extends Document {
    score: number;
  }