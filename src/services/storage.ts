import { Manga, ReadingProgress, LibraryItem, ReaderSettings } from '../types/manga';

const STORAGE_KEYS = {
  HISTORY: 'mangakyo_reading_history',
  LIBRARY: 'mangakyo_library',
  SETTINGS: 'mangakyo_reader_settings',
  PROGRESS_PREFIX: 'mangakyo_progress_',
};

export const defaultSettings: ReaderSettings = {
  mode: 'rtl',
  theme: 'dark',
  fit: 'width',
  zoom: 1,
  doubleCoverOffset: true,
  soundEffects: true,
  screentoneOverlay: false,
  paperGrain: false,
};

// Reading Progress
export function saveReadingProgress(progress: ReadingProgress): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.PROGRESS_PREFIX}${progress.mangaId}`,
      JSON.stringify(progress)
    );
    updateHistory(progress);
  } catch (e) {
    console.error('Failed to save reading progress', e);
  }
}

export function getReadingProgress(mangaId: string): ReadingProgress | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.PROGRESS_PREFIX}${mangaId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// History
export function getHistory(): ReadingProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateHistory(progress: ReadingProgress): void {
  try {
    const history = getHistory().filter(h => h.mangaId !== progress.mangaId);
    history.unshift(progress);
    // Keep last 30
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.error('Failed to update history', e);
  }
}

// Library / Bookmarks
export function getLibrary(): LibraryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIBRARY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToLibrary(manga: Manga, category: LibraryItem['category']): void {
  try {
    const library = getLibrary().filter(item => item.manga.id !== manga.id);
    const progress = getReadingProgress(manga.id);
    const item: LibraryItem = {
      manga,
      category,
      lastReadChapterId: progress?.chapterId,
      lastReadChapterNum: progress?.chapterNumber,
      lastReadPage: progress?.currentPage,
      addedAt: Date.now(),
      updatedAt: Date.now(),
    };
    library.unshift(item);
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to save to library', e);
  }
}

export function removeFromLibrary(mangaId: string): void {
  try {
    const library = getLibrary().filter(item => item.manga.id !== mangaId);
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to remove from library', e);
  }
}

export function getLibraryItem(mangaId: string): LibraryItem | undefined {
  return getLibrary().find(item => item.manga.id === mangaId);
}

// Settings
export function getReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveReaderSettings(settings: Partial<ReaderSettings>): ReaderSettings {
  try {
    const current = getReaderSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch {
    return defaultSettings;
  }
}
