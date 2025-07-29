// src/types.ts

export interface Book {
  id: string;
  title: string;
  author: string[];
  isbn?: string;
  publishYear?: number;
  subjects?: string[];
  coverUrl?: string;
  downloadUrl?: string;
  source: 'openlibrary' | 'archive' | 'ai-recommendation';
  isAIRecommendation?: boolean;
}

export interface SearchResult {
  books: Book[];
  totalResults: number;
  query: string;
  enhancedQuery?: string;
  searchTerms?: string[];
  aiRecommendationsCount?: number;
}

export interface AIRecommendation {
  enhancedQuery: string;
  recommendations: string[];
  searchTerms: string[];
}