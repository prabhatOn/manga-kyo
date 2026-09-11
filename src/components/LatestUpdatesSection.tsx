import React from 'react';
import { MessageSquare, Users, Sparkles } from 'lucide-react';
import { LatestChapterUpdate, Manga, Chapter } from '../types/manga';
import { soundFx } from '../services/audioEngine';

interface LatestUpdatesSectionProps {
  updates: LatestChapterUpdate[];
  loading: boolean;
  onReadChapter: (manga: Manga, chapter: Chapter) => void;
  onSelectManga: (manga: Manga) => void;
  noirMode: boolean;
  showAdult: boolean;
}

function getLanguageFlag(lang: string): string {
  switch (lang) {
    case 'en': return '🇬🇧';
    case 'hi': return '🇮🇳';
    case 'ja': return '🇯🇵';
    case 'fr': return '🇫🇷';
    case 'it': return '🇮🇹';
    case 'es':
    case 'es-la': return '🇪🇸';
    case 'pt':
    case 'pt-br': return '🇧🇷';
    case 'vi': return '🇻🇳';
    case 'id': return '🇮🇩';
    case 'ko': return '🇰🇷';
    case 'de': return '🇩🇪';
    case 'ru': return '🇷🇺';
    case 'zh':
    case 'zh-hk': return '🇨🇳';
    case 'tr': return '🇹🇷';
    default: return '🌐';
  }
}

function formatTimeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } catch {
    return 'Recently';
  }
}

export const LatestUpdatesSection: React.FC<LatestUpdatesSectionProps> = ({
  updates,
  loading,
  onReadChapter,
  onSelectManga,
  noirMode,
  showAdult,
}) => {
  const displayUpdates = showAdult
    ? updates
    : updates.filter((u) => !u.isAdult);

  if (!loading && displayUpdates.length === 0) return null;

  const handleCardClick = (item: LatestChapterUpdate) => {
    soundFx.playDon();
    const mockManga: Manga = {
      id: item.mangaId,
      title: item.mangaTitle,
      description: 'Serialized manga release from the live MangaDex network.',
      coverArtUrl: item.coverArtUrl || '/Standard-list-img-4.jpg',
      status: 'ongoing',
      author: item.scanlationGroup,
      genres: item.isAdult ? ['18+ Adult', 'Erotica', 'Seinen'] : ['Shonen', 'Seinen'],
      availableLanguages: [item.language],
      hasHindi: item.language === 'hi',
      contentRating: item.contentRating,
      isAdult: item.isAdult,
    };

    const targetChapter: Chapter = {
      id: item.id,
      mangaId: item.mangaId,
      chapter: item.chapter,
      volume: item.volume,
      title: item.title || `Chapter ${item.chapter}`,
      language: item.language,
      pagesCount: 24,
      publishAt: item.publishAt,
      scanlationGroup: item.scanlationGroup,
    };

    onReadChapter(mockManga, targetChapter);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--vermilion)] animate-pulse" />
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <span>LATEST SERIALIZED UPDATES</span>
            <span className="text-xs font-kanji text-gray-500 font-normal hidden sm:inline">
              最新チャプター更新
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-tech text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-[var(--kin-gold)]" />
          <span className="hidden sm:inline">LIVE FEED</span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-gray-300">
            {displayUpdates.length} RELEASES
          </span>
        </div>
      </div>

      {/* Two-Column MangaDex-Style Update Feed (Responsive) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#111018] border border-white/5 rounded-md p-3 flex gap-3 animate-pulse"
            >
              <div className="w-12 sm:w-14 h-16 sm:h-20 bg-[#1c1a26] rounded-xs shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-[#1c1a26] w-3/4 rounded-xs" />
                <div className="h-3 bg-[#1c1a26] w-1/2 rounded-xs" />
                <div className="h-2.5 bg-[#1c1a26] w-1/3 rounded-xs" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
          {displayUpdates.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className={`group bg-[#111018]/80 hover:bg-[#181622] border border-white/[0.07] hover:border-[var(--vermilion)]/60 rounded-md p-2.5 sm:p-3 flex gap-3 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg select-none ${
                noirMode ? 'noir-mode' : ''
              }`}
            >
              {/* Manga Cover Thumbnail */}
              <div className="relative w-12 sm:w-14 h-16 sm:h-20 rounded-xs overflow-hidden bg-black border border-white/10 shrink-0 shadow-md">
                <img
                  src={item.coverArtUrl || '/Standard-list-img-4.jpg'}
                  alt={item.mangaTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/Standard-list-img-4.jpg';
                  }}
                />
                {item.isAdult && (
                  <span className="absolute bottom-0 inset-x-0 bg-red-700/90 text-[8px] font-tech font-black text-center text-white uppercase py-0.2">
                    18+
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  {/* Manga Title */}
                  <div className="flex items-center justify-between gap-1.5">
                    <h3
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playClick();
                        onSelectManga({
                          id: item.mangaId,
                          title: item.mangaTitle,
                          description: 'Serialized manga work from MangaDex network.',
                          coverArtUrl: item.coverArtUrl || '/Standard-list-img-4.jpg',
                          status: 'ongoing',
                          author: item.scanlationGroup,
                          genres: item.isAdult ? ['18+ Adult', 'Erotica'] : ['Manga'],
                          availableLanguages: [item.language],
                          contentRating: item.contentRating,
                          isAdult: item.isAdult,
                        });
                      }}
                      className="font-editorial text-xs sm:text-sm font-bold text-white group-hover:text-[var(--vermilion)] truncate transition-colors cursor-pointer"
                      title={item.mangaTitle}
                    >
                      {item.mangaTitle}
                    </h3>

                    {item.isAdult && (
                      <span className="px-1.5 py-0.2 rounded-xs bg-red-950/80 text-red-400 border border-red-700/40 text-[9px] font-tech font-black shrink-0">
                        {item.contentRating === 'pornographic' ? '🔞 HENTAI' : '🔞 18+'}
                      </span>
                    )}
                  </div>

                  {/* Chapter Details Line with Flag & Comments */}
                  <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-sm" title={`Language: ${item.language}`}>
                        {getLanguageFlag(item.language)}
                      </span>
                      <span className="font-tech font-semibold text-gray-200 truncate">
                        {item.volume ? `Vol. ${item.volume} ` : ''}Ch. {item.chapter}
                        {item.title ? ` - ${item.title}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 shrink-0 pl-2">
                      <MessageSquare className="w-3 h-3" />
                      <span>{Math.abs(item.id.charCodeAt(0) % 5)}</span>
                    </div>
                  </div>
                </div>

                {/* Scanlation Group & Relative Time */}
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-tech text-gray-500 pt-1 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1 truncate text-gray-400">
                    <Users className="w-2.5 h-2.5 shrink-0 text-gray-500" />
                    <span className="truncate">{item.scanlationGroup}</span>
                  </div>
                  <span className="shrink-0 text-gray-500 pl-2">
                    {formatTimeAgo(item.publishAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
