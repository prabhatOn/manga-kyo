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
];

export const MangaGrid: React.FC<MangaGridProps> = ({
  mangaList,
  loading,
  selectedLanguage,
  onSelectManga,
  onQuickRead,
  noirMode,
}) => {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'latest'>('popular');

  const filteredManga = useMemo(() => {
    let list = [...mangaList];

    if (selectedGenre !== 'All') {
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
  }, [mangaList, selectedGenre, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[var(--ink-border)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--vermilion)]" />
            <span className="font-tech text-xs uppercase tracking-widest text-gray-400 font-semibold">
              {selectedLanguage === 'hi' ? 'HINDI ARCHIVE' : 'COMPLETE SERIALIZATION CATALOGUE'}
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {selectedLanguage === 'hi' ? 'हिंदी मंगा संग्रह' : 'ALL SERIALIZED WORKS'}
          </h2>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <span className="text-xs font-tech text-gray-500 font-semibold uppercase tracking-wider">
            ORDER BY:
          </span>
          <select
            value={sortBy}
            onChange={(e) => {
              soundFx.playClick();
              setSortBy(e.target.value as 'popular' | 'rating' | 'latest');
            }}
            className="bg-[#121118] text-white text-xs font-tech font-medium px-3.5 py-2 border border-[#2b273b] rounded-xs focus:outline-none focus:border-[var(--vermilion)] transition-colors"
          >
            <option value="popular">Most Followed</option>
            <option value="rating">Highest Rated</option>
            <option value="latest">Latest Chapters</option>
          </select>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-thin">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => {
              soundFx.playClick();
              setSelectedGenre(genre);
            }}
            className={`px-4 py-1.5 text-xs font-tech font-semibold whitespace-nowrap rounded-xs border transition-all ${
              selectedGenre === genre
                ? noirMode
                  ? 'bg-white text-black border-white'
                  : 'bg-[var(--vermilion)] text-white border-[var(--vermilion)]'
                : 'bg-[#121118] text-gray-400 border-[#242131] hover:text-white hover:border-gray-500'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#121118] border border-[#242131] rounded-xs p-3.5 space-y-3 animate-pulse"
            >
              <div className="aspect-[3/4.5] bg-[#1a1824] rounded-xs" />
              <div className="h-4 bg-[#1a1824] w-3/4 rounded-xs" />
              <div className="h-3 bg-[#1a1824] w-1/2 rounded-xs" />
            </div>
          ))}
        </div>
      ) : filteredManga.length === 0 ? (
        <div className="bg-[#121118] border border-[#262334] rounded-xs p-16 text-center my-8">
          <div className="font-editorial text-2xl font-bold text-gray-300 mb-2">No Titles Found</div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
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
