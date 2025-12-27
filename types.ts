
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  isFavorite: boolean;
  type: 'generation' | 'edit';
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface AppState {
  images: GeneratedImage[];
  isGenerating: boolean;
  theme: Theme;
  error: string | null;
}
