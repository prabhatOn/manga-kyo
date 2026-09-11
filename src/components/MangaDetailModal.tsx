import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Play,
  Languages,
  ArrowUpDown,
  BookOpen,
  Search,
  Check,
} from 'lucide-react';
import { Manga, Chapter, LibraryItem } from '../types/manga';
import { getMangaChapters } from '../services/mangadex';
import { soundFx } from '../services/audioEngine';
import {
  saveToLibrary,
  getLibraryItem,
  removeFromLibrary,
  getReadingProgress,
} from '../services/storage';

interface MangaDetailModalProps {
  manga: Manga | null;
  onClose: () => void;
  onOpenReader: (manga: Manga, chapter: Chapter) => void;
  noirMode?: boolean;
}

export const MangaDetailModal: React.FC<MangaDetailModalProps> = ({
  manga,
  onClose,
  onOpenReader,
  noirMode = false,
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chapterLang, setChapterLang] = useState<'all' | 'en' | 'hi'>('all');
  const [chapterSearch, setChapterSearch] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [libraryCategory, setLibraryCategory] = useState<LibraryItem['category'] | null>(null);

  useEffect(() => {
    if (!manga) return;

    const item = getLibraryItem(manga.id);
    setLibraryCategory(item ? item.category : null);

    setLoadingChapters(true);
    getMangaChapters(manga.id, 'all')
      .then((data) => {
        setChapters(data);
      })
      .catch((err) => {
        console.error('Failed to load chapters:', err);
      })
      .finally(() => {
        setLoadingChapters(false);
      });
  }, [manga]);

  if (!manga) return null;

  const readingProgress = getReadingProgress(manga.id);

  // Parse title into main English name and secondary subtitle
  const titleMatch = manga.title.match(/^(.+?)(?:\s*\((.+?)\))?$/);
  const mainTitle = titleMatch ? titleMatch[1].trim() : manga.title;
  const secondaryTitle = titleMatch && titleMatch[2] ? titleMatch[2].trim() : '';

  const filteredChapters = chapters
    .filter((c) => {
      if (chapterLang === 'hi' && c.language !== 'hi') return false;
      if (chapterLang === 'en' && c.language !== 'en') return false;
      if (chapterSearch.trim()) {
        const query = chapterSearch.toLowerCase();
        return (
          c.chapter.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const numA = parseFloat(a.chapter) || 0;
      const numB = parseFloat(b.chapter) || 0;
      return sortDesc ? numB - numA : numA - numB;
    });

  const handleLibraryToggle = (cat: LibraryItem['category']) => {
    soundFx.playClick();
    if (libraryCategory === cat) {
      removeFromLibrary(manga.id);
      setLibraryCategory(null);
    } else {
      saveToLibrary(manga, cat);
      setLibraryCategory(cat);
    }
  };

  const handleStartReading = () => {
    if (filteredChapters.length === 0) return;
    soundFx.playDon();
    if (readingProgress) {
      const lastChapter = chapters.find((c) => c.id === readingProgress.chapterId);
      if (lastChapter) {
        onOpenReader(manga, lastChapter);
        return;
      }
    }
    const sortedAsc = [...filteredChapters].sort(
      (a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0)
    );
    onOpenReader(manga, sortedAsc[0]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0d0c13]/95 border border-white/10 shadow-2xl rounded-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Top Minimal Bar */}
        <div className="py-3 px-6 border-b border-white/5 flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-2 text-xs font-tech tracking-wider uppercase">
            <span className="text-[var(--vermilion)] font-bold">ARCHIVE</span>
            <span className="text-gray-700">/</span>
            <span>SERIALIZATION NO. {manga.id.slice(0, 6)}</span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8 scrollbar-thin">
          {/* Top Section: Artwork + Editorial Information */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Cover Artwork */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative w-full max-w-[210px] aspect-[3/4.5] bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={manga.coverArtUrl}
                  alt={manga.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover ${noirMode ? 'noir-cover-filter' : ''}`}
                  onError={(e) => {
                    // Guaranteed fallback if anything goes wrong
                    (e.target as HTMLImageElement).src = 'https://cdn.myanimelist.net/images/manga/1/157897.jpg';
                  }}
                />
                {manga.hasHindi && (
                  <div className="absolute top-2.5 right-2.5 bg-[var(--kin-gold)] text-black font-hindi font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                    हिन्दी अनुवाद
                  </div>
                )}
              </div>

              {/* Minimal Vault Save Pills */}
              <div className="w-full max-w-[210px] mt-4 space-y-2">
                <span className="text-[10px] font-tech text-gray-500 uppercase tracking-wider block text-center">
                  Save to Vault
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {[
                    { id: 'reading', label: 'Reading' },
                    { id: 'favorite', label: '★ Favorite' },
                    { id: 'plan_to_read', label: 'Plan to Read' },
                    { id: 'completed', label: 'Finished' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => handleLibraryToggle(tab.id as any)}
                      className={`text-[10px] font-tech font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        libraryCategory === tab.id
                          ? 'bg-white text-black border-white shadow-sm'
                          : 'bg-white/5 text-gray-400 border-white/5 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Manga Information */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  {mainTitle}
                </h2>
                {secondaryTitle && (
                  <p className="font-hindi text-sm text-[var(--kin-gold)] mt-1 font-medium">
                    {secondaryTitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs font-tech text-gray-400 mt-2">
                  <div className="flex items-center gap-1 text-[var(--kin-gold)]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-white">{manga.rating?.toFixed(1) || '9.8'}</span>
                    <span className="text-gray-500">/ 10</span>
                  </div>
                  <span className="text-gray-700">•</span>
                  <span>Illustrated by <strong className="text-white">{manga.author}</strong></span>
                  <span className="text-gray-700">•</span>
                  <span>Year {manga.year}</span>
                  <span className="text-gray-700">•</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[10px] uppercase font-bold border border-white/10">
                    {manga.status}
                  </span>
                </div>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-1.5">
                {manga.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 bg-white/5 text-gray-300 text-xs font-tech rounded-full border border-white/5"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal pt-1">
                {manga.description}
              </p>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartReading}
                  className={`w-full sm:w-auto px-8 py-3 rounded-full font-tech font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
                    noirMode
                      ? 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                      : 'bg-[var(--vermilion)] text-white hover:brightness-110 shadow-[var(--vermilion)]/25'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {readingProgress
                      ? `RESUME CH. ${readingProgress.chapterNumber} (PAGE ${readingProgress.currentPage})`
                      : 'START READING CHAPTER 01'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Chapters Archive Section */}
          <div className="border-t border-white/10 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--vermilion)]" />
                <h3 className="font-editorial text-lg font-bold text-white tracking-tight">
                  CHAPTER LIST ({filteredChapters.length})
                </h3>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-xs font-tech">
                  <button
                    onClick={() => { soundFx.playClick(); setChapterLang('all'); }}
                    className={`px-3 py-1 rounded-full transition-all ${chapterLang === 'all' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { soundFx.playClick(); setChapterLang('en'); }}
                    className={`px-3 py-1 rounded-full transition-all ${chapterLang === 'en' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => { soundFx.playClick(); setChapterLang('hi'); }}
                    className={`px-3 py-1 font-hindi rounded-full flex items-center gap-1 transition-all ${
                      chapterLang === 'hi' ? 'bg-[var(--kin-gold)] text-black font-bold' : 'text-yellow-400/80 hover:text-yellow-300'
                    }`}
                  >
                    <Languages className="w-3 h-3" />
                    हिन्दी
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search chapter..."
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    className="bg-white/5 text-white text-xs px-3 py-1.5 rounded-full border border-white/10 focus:outline-none focus:border-[var(--vermilion)] w-32 sm:w-40 font-tech"
                  />
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSortDesc(!sortDesc);
                  }}
                  className="p-1.5 px-3 bg-white/5 text-gray-300 hover:text-white border border-white/10 rounded-full flex items-center gap-1 text-xs font-tech"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>{sortDesc ? 'DESC' : 'ASC'}</span>
                </button>
              </div>
            </div>

            {/* Clean Chapters List */}
            {loadingChapters ? (
              <div className="py-8 text-center text-gray-500 font-tech text-xs animate-pulse">
                Loading verified chapters...
              </div>
            ) : filteredChapters.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs font-tech">
                No chapters found for this selection.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {filteredChapters.map((chapter) => {
                  const isCurrent = readingProgress?.chapterId === chapter.id;

                  return (
                    <div
                      key={chapter.id}
                      onClick={() => {
                        soundFx.playSlash();
                        onOpenReader(manga, chapter);
                      }}
                      className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[var(--vermilion)]/10 border-[var(--vermilion)]/50'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            chapter.language === 'hi'
                              ? 'bg-[var(--kin-gold)] text-black font-hindi'
                              : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {chapter.language === 'hi' ? 'हिन्दी' : 'EN'}
                        </span>
                        <div>
                          <div className="font-tech text-xs sm:text-sm font-semibold text-white group-hover:text-gray-200 transition-colors">
                            Chapter {chapter.chapter} {chapter.title && <span className="text-gray-400 font-normal">- {chapter.title}</span>}
                          </div>
                          <div className="text-[10px] font-tech text-gray-500 mt-0.5">
                            {chapter.scanlationGroup} {chapter.pagesCount && `• ${chapter.pagesCount} Pages`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <span className="text-[10px] font-tech font-bold text-[var(--vermilion)] bg-[var(--vermilion)]/10 px-2 py-0.5 rounded-full border border-[var(--vermilion)]/30">
                            CURRENT
                          </span>
                        )}
                        <span className="text-xs font-tech font-semibold text-gray-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          <span>Read</span>
                          <Play className="w-3 h-3 fill-current" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
