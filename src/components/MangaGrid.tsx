import React, { useState, useMemo } from 'react';
import { Manga } from '../types/manga';
import { MangaCard } from './MangaCard';
import { soundFx } from '../services/audioEngine';

interface MangaGridProps {
  mangaList: Manga[];
  loading: boolean;
  selectedLanguage: 'all' | 'en' | 'hi';
  onSelectManga: (manga: Manga) => void;
  onQuickRead: (manga: Manga) => void;
  noirMode: boolean;
  showAdult?: boolean;
}

const GENRES = [
  'All',
  'Seinen',
  'Shonen',
  'Dark Fantasy',
  'Psychological',
  'Action',
  'Horror',
  'Mystery',
  'Comedy',
  'Romance',
  '🔞 18+ Adult',
  'Hentai (R18)',
  'Ecchi / Erotica',
];

export const MangaGrid: React.FC<MangaGridProps> = ({
  mangaList,
  loading,
  selectedLanguage,
  onSelectManga,
  onQuickRead,
  noirMode,
  showAdult = false,
}) => {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'latest'>('popular');

  const filteredManga = useMemo(() => {
    let list = [...mangaList];

    // Hide 18+ adult manga if showAdult is false AND user hasn't explicitly selected an adult genre
    const isAdultGenreSelected =
      selectedGenre === '🔞 18+ Adult' ||
      selectedGenre === 'Hentai (R18)' ||
      selectedGenre === 'Ecchi / Erotica';

    if (!showAdult && !isAdultGenreSelected) {
      list = list.filter(
        (m) => !m.isAdult && m.contentRating !== 'pornographic' && m.contentRating !== 'erotica'
      );
    }

    if (selectedGenre === '🔞 18+ Adult') {
      list = mangaList.filter(
        (m) =>
          m.isAdult ||
          m.contentRating === 'pornographic' ||
          m.contentRating === 'erotica' ||
          m.genres.some((g) => {
            const low = g.toLowerCase();
            return low.includes('adult') || low.includes('hentai') || low.includes('erotica');
          })
      );
    } else if (selectedGenre === 'Hentai (R18)') {
      list = mangaList.filter(
        (m) =>
          m.contentRating === 'pornographic' ||
          m.genres.some((g) => g.toLowerCase().includes('hentai'))
      );
    } else if (selectedGenre === 'Ecchi / Erotica') {
      list = mangaList.filter(
        (m) =>
          m.contentRating === 'erotica' ||
          m.contentRating === 'suggestive' ||
          m.genres.some((g) => {
            const low = g.toLowerCase();
            return low.includes('ecchi') || low.includes('erotica');
          })
      );
    } else if (selectedGenre !== 'All') {
      list = list.filter((m) =>
        m.genres.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()))
      );
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'latest') {
      list.sort((a, b) => parseFloat(b.latestChapter || '0') - parseFloat(a.latestChapter || '0'));
    } else {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return list;
  }, [mangaList, selectedGenre, sortBy, showAdult]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-[var(--ink-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--vermilion)]" />
            <span className="font-tech text-xs uppercase tracking-widest text-gray-400 font-semibold">
              {selectedLanguage === 'hi' ? 'HINDI ARCHIVE' : 'COMPLETE SERIALIZATION CATALOGUE'}
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {selectedLanguage === 'hi' ? 'हिंदी मंगा संग्रह' : 'ALL SERIALIZED WORKS'}
          </h2>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto">
          <span className="text-xs font-tech text-gray-500 font-semibold uppercase tracking-wider">
            ORDER BY:
          </span>
          <select
            value={sortBy}
            onChange={(e) => {
              soundFx.playClick();
              setSortBy(e.target.value as 'popular' | 'rating' | 'latest');
            }}
            className="bg-[#121118] text-white text-xs font-tech font-medium px-3 sm:px-3.5 py-1.5 sm:py-2 border border-[#2b273b] rounded-xs focus:outline-none focus:border-[var(--vermilion)] transition-colors"
          >
            <option value="popular">Most Followed</option>
            <option value="rating">Highest Rated</option>
            <option value="latest">Latest Chapters</option>
          </select>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none">
        {GENRES.map((genre) => {
          const isAdultPill = genre.includes('18+') || genre.includes('Hentai') || genre.includes('Ecchi');
          const isSelected = selectedGenre === genre;

          let pillClass = '';
          if (isSelected) {
            if (isAdultPill) {
              pillClass = 'bg-[#e50914] text-white border-[#e50914] shadow-md shadow-red-950/40';
            } else {
              pillClass = noirMode
                ? 'bg-white text-black border-white'
                : 'bg-[var(--vermilion)] text-white border-[var(--vermilion)]';
            }
          } else {
            if (isAdultPill) {
              pillClass = 'bg-[#200e12] text-red-400 border-red-900/50 hover:bg-red-950/60 hover:border-red-600 hover:text-red-200';
            } else {
              pillClass = 'bg-[#121118] text-gray-400 border-[#242131] hover:text-white hover:border-gray-500';
            }
          }

          return (
            <button
              key={genre}
              onClick={() => {
                soundFx.playClick();
                setSelectedGenre(genre);
              }}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-tech font-semibold whitespace-nowrap rounded-xs border transition-all ${pillClass}`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#121118] border border-[#242131] rounded-xs p-3 space-y-3 animate-pulse"
            >
              <div className="aspect-[3/4.5] bg-[#1a1824] rounded-xs" />
              <div className="h-4 bg-[#1a1824] w-3/4 rounded-xs" />
              <div className="h-3 bg-[#1a1824] w-1/2 rounded-xs" />
            </div>
          ))}
        </div>
      ) : filteredManga.length === 0 ? (
        <div className="bg-[#121118] border border-[#262334] rounded-xs p-10 sm:p-16 text-center my-8">
          <div className="font-editorial text-xl sm:text-2xl font-bold text-gray-300 mb-2">No Titles Found</div>
          <p className="text-gray-400 text-xs max-w-md mx-auto font-tech">
            No works match your current filter parameters. Try clearing your search query or selecting a different genre.
          </p>
          <button
            onClick={() => setSelectedGenre('All')}
            className="mt-6 px-5 py-2.5 bg-white text-black font-tech text-xs font-bold rounded-xs hover:bg-gray-200 transition-colors"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
          {filteredManga.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              onSelect={onSelectManga}
              onQuickRead={onQuickRead}
              noirMode={noirMode}
            />
          ))}
        </div>
      )}
    </section>
  );
};
