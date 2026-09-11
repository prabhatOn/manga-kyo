import React from 'react';
import { Star, Languages, Play } from 'lucide-react';
import { Manga } from '../types/manga';
import { soundFx } from '../services/audioEngine';

interface MangaCardProps {
  manga: Manga;
  onSelect: (manga: Manga) => void;
  onQuickRead: (manga: Manga) => void;
  noirMode?: boolean;
}

export const MangaCard: React.FC<MangaCardProps> = ({
  manga,
  onSelect,
  onQuickRead,
  noirMode = false,
}) => {
  return (
    <div className="group relative manga-card-frame rounded-xs overflow-hidden flex flex-col justify-between">
      {/* Cover Image Container */}
      <div
        className="relative aspect-[3/4.5] bg-[#000] overflow-hidden cursor-pointer"
        onClick={() => {
          soundFx.playClick();
          onSelect(manga);
        }}
      >
        <img
          src={manga.coverArtUrl}
          alt={manga.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            noirMode ? 'noir-cover-filter' : ''
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Screentone Texture Overlay */}
        <div className="absolute inset-0 bg-screentone-dots opacity-15 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {manga.hasHindi && (
            <span className="px-2 py-0.5 bg-[var(--kin-gold)] text-black font-hindi font-bold text-[10px] rounded-xs shadow-sm flex items-center gap-1">
              <Languages className="w-2.5 h-2.5" />
              हिन्दी
            </span>
          )}
          <span className="px-1.5 py-0.5 bg-black/85 text-white font-mono text-[10px] rounded-xs border border-white/15 backdrop-blur-xs flex items-center gap-1">
            <Star className="w-2.5 h-2.5 text-[var(--kin-gold)] fill-current" />
            {manga.rating ? manga.rating.toFixed(1) : '9.6'}
          </span>
        </div>

        {/* Chapter counter badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/85 text-gray-300 font-mono text-[10px] px-2 py-0.5 rounded-xs border border-white/10">
          CH. {manga.latestChapter || '01'}
        </div>

        {/* Hover Quick Read Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 pointer-events-none">
          <span className="px-3.5 py-2 bg-white text-black font-tech text-xs font-bold rounded-xs shadow-xl flex items-center gap-2">
            <Play className="w-3.5 h-3.5 fill-current" />
            READ CHAPTER 01
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          <h3
            onClick={() => {
              soundFx.playClick();
              onSelect(manga);
            }}
            className="font-editorial text-xs sm:text-sm font-bold text-white line-clamp-1 hover:text-[var(--vermilion)] cursor-pointer transition-colors"
            title={manga.title}
          >
            {manga.title}
          </h3>

          <p className="text-[10px] sm:text-[11px] text-gray-400 truncate mt-0.5 sm:mt-1 font-tech">
            {manga.author}
          </p>

          <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
            {manga.genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[8px] sm:text-[9px] font-tech text-gray-400 px-1.5 sm:px-2 py-0.5 bg-[#171520] border border-[#262334] rounded-xs"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundFx.playSlash();
            onQuickRead(manga);
          }}
          className={`w-full py-1.5 sm:py-2 text-[11px] sm:text-xs font-tech font-bold rounded-xs transition-colors flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            noirMode
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-[var(--vermilion)] text-white hover:brightness-110'
          }`}
        >
          <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
          <span>READ NOW</span>
        </button>
      </div>
    </div>
  );
};
