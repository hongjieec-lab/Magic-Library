
export interface Resource {
  id: string;
  title: string;
  ageRange: string;
  whyItsGood: string;
  description?: string; 
  categories: string[]; 
  type: 'book' | 'game';
  image: string;
}

export interface Folder {
  id: string;
  name: string;
  itemIds: string[];
}

export interface User {
  email: string;
  password?: string; // In a real app, this would be handled by a backend
  favorites: string[];
  folders: Folder[];
}

export interface RecommendationResult {
  matches: string[]; 
  aiSummary: string; 
}

export enum FilterCategory {
  ALL = '全部',
  BOOK = '绘本',
  GAME = '桌游'
}
