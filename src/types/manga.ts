export type ReadingMode = 'rtl' | 'ltr' | 'vertical' | 'double';
export type ReaderTheme = 'paper' | 'dark' | 'sepia' | 'white';
export type ReaderFit = 'width' | 'height' | 'contain' | 'original';

export interface Manga {
  id: string;
  title: string;
  altTitles?: { [key: string]: string }[];
  description: string;
  coverArtUrl: string;
  bannerUrl?: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  year?: number;
  author: string;
  artist?: string;
  genres: string[];
  rating?: number;
  views?: number;
  availableLanguages: string[]; // e.g. ['en', 'hi']
  totalChapters?: number;
  latestChapter?: string;
  hasHindi?: boolean;
}

export interface Chapter {
  id: string;
  mangaId: string;
  chapter: string; // e.g. "1", "1024.5"
  volume?: string;
  title: string;
  language: string; // 'en' or 'hi' or other
  pagesCount: number;
  publishAt?: string;
  scanlationGroup?: string;
}

export interface ChapterPages {
  chapterId: string;
  baseUrl: string;
  hash: string;
  pages: string[]; // filenames
  fallbackUrls?: string[]; // direct absolute image URLs
}

export interface ReadingProgress {
  mangaId: string;
  chapterId: string;
  chapterNumber: string;
  currentPage: number;
  totalPages: number;
  updatedAt: number;
  completed?: boolean;
}

export interface LibraryItem {
  manga: Manga;
  category: 'reading' | 'completed' | 'plan_to_read' | 'favorite';
  lastReadChapterId?: string;
  lastReadChapterNum?: string;
  lastReadPage?: number;
  addedAt: number;
  updatedAt: number;
}

export interface ReaderSettings {
  mode: ReadingMode;
  theme: ReaderTheme;
  fit: ReaderFit;
  zoom: number; // 0.8 to 2.0
  doubleCoverOffset: boolean;
  soundEffects: boolean;
  screentoneOverlay: boolean;
  paperGrain: boolean;
}
