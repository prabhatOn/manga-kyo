import React from 'react';
import { Languages, ArrowRight } from 'lucide-react';
import { Manga } from '../types/manga';
import { MangaCard } from './MangaCard';
import { soundFx } from '../services/audioEngine';

interface LanguageHubProps {
  hindiManga: Manga[];
  onSelectManga: (manga: Manga) => void;
  onQuickRead: (manga: Manga) => void;
  onViewAllHindi: () => void;
  noirMode: boolean;
}

export const LanguageHub: React.FC<LanguageHubProps> = ({
  hindiManga,
  onSelectManga,
  onQuickRead,
  onViewAllHindi,
  noirMode,
}) => {
  return (
    <section className="bg-[var(--ink-surface)] border-b border-[var(--ink-border)] py-16 px-6 sm:px-12 relative overflow-hidden transition-colors duration-400">
      {/* Subtle Screentone Pattern */}
      <div className="absolute inset-0 bg-screentone-dots opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[var(--ink-border)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--kin-gold)] animate-pulse" />
              <span className="font-tech text-xs uppercase tracking-widest text-gray-400 font-semibold">
                CURATED REGIONAL ARCHIVE • हिंदी अनुवाद
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              THE HINDI MANGA SANCTUARY <span className="font-hindi text-xl sm:text-2xl font-bold text-gray-400">| हिंदी मंगा संग्रह</span>
            </h2>
            <p className="font-hindi text-gray-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              MangaDex से सीधे आधिकारिक और उच्च गुणवत्ता वाले हिंदी अनुवादित मंगा अध्यायों का आनंद लें।
            </p>
          </div>

          <button
            onClick={() => {
              soundFx.playSlash();
              onViewAllHindi();
            }}
            className="flex items-center gap-2 px-5 py-3 bg-[#181622] hover:bg-[#221f2f] text-white border border-[#2e2a3c] font-tech text-xs font-bold rounded-xs transition-colors"
          >
            <span>VIEW ALL HINDI TITLES</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Hindi Manga Grid with Generous Gaps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
          {hindiManga.slice(0, 5).map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              onSelect={onSelectManga}
              onQuickRead={onQuickRead}
              noirMode={noirMode}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
