import React, { useState, useEffect } from 'react';
import { X, Trash2, Play, BookOpen } from 'lucide-react';
import { LibraryItem, Manga } from '../types/manga';
import { getLibrary, removeFromLibrary, getReadingProgress } from '../services/storage';
import { soundFx } from '../services/audioEngine';

interface LibraryModalProps {
  onClose: () => void;
  onSelectManga: (manga: Manga) => void;
  onQuickResume: (manga: Manga, chapterId?: string) => void;
  noirMode?: boolean;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  onClose,
  onSelectManga,
  onQuickResume,
  noirMode = false,
}) => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [category, setCategory] = useState<'all' | 'reading' | 'favorite' | 'plan_to_read' | 'completed'>('all');

  const refreshItems = () => {
    setItems(getLibrary());
  };

  useEffect(() => {
    refreshItems();
  }, []);

  const handleRemove = (mangaId: string) => {
    soundFx.playClick();
    removeFromLibrary(mangaId);
    refreshItems();
  };

  const filtered = category === 'all' ? items : items.filter((i) => i.category === category);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0e0d14] border border-[#2b2838] shadow-2xl rounded-sm overflow-hidden my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#14121c] border-b border-[#242230] p-3 px-4 sm:px-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-base sm:text-lg font-bold">
              MY MANGA VAULT (個人書庫)
            </span>
            <span className="bg-[#1f1c2b] text-gray-300 px-2 py-0.5 font-mono text-xs rounded-xs">
              {items.length} SAVED
            </span>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1 text-gray-400 hover:text-white rounded-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="bg-[#121118] border-b border-[#23202e] p-2 px-3 sm:px-4 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'all', label: 'All Saved' },
            { id: 'reading', label: 'Reading' },
            { id: 'favorite', label: 'Favorites' },
            { id: 'plan_to_read', label: 'Plan to Read' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => { soundFx.playClick(); setCategory(tab.id as any); }}
              className={`px-3 py-1 text-xs font-tech font-semibold whitespace-nowrap rounded-xs border transition-all ${
                category === tab.id
                  ? 'bg-white text-black border-white'
                  : 'bg-[#171520] text-gray-400 border-[#2b273b] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-[#121118] border border-[#23202e] rounded-xs p-10 text-center my-6">
              <div className="font-editorial text-xl text-gray-300 font-bold mb-2">Vault is Empty</div>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4 font-tech">
                Save your favorite titles while exploring to track reading progress and resume instantly.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white text-black font-tech text-xs font-bold rounded-xs hover:bg-gray-200 transition-colors"
              >
                EXPLORE ARCHIVE
              </button>
            </div>
          ) : (
            filtered.map((item) => {
              const progress = getReadingProgress(item.manga.id);

              return (
                <div
                  key={item.manga.id}
                  className="bg-[#131219] border border-[#23202e] hover:border-gray-500 rounded-xs p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group transition-colors"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => { soundFx.playClick(); onSelectManga(item.manga); onClose(); }}
                  >
                    <div className="w-12 h-16 bg-black border border-[#2d2b3b] overflow-hidden shrink-0 rounded-xs">
                      <img
                        src={item.manga.coverArtUrl}
                        alt={item.manga.title}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${noirMode ? 'noir-cover-filter' : ''}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-editorial text-sm font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-1">
                        {item.manga.title}
                      </h4>
                      <p className="text-xs font-tech text-gray-400">By {item.manga.author}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.2 bg-black text-gray-300 text-[10px] font-mono rounded-xs border border-white/10 uppercase">
                          {item.category.replace('_', ' ')}
                        </span>
                        {item.manga.hasHindi && (
                          <span className="px-1.5 py-0.2 bg-[#ffc700] text-black font-hindi text-[10px] font-bold rounded-xs">
                            हिन्दी
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                    {progress ? (
                      <button
                        onClick={() => {
                          soundFx.playDon();
                          onQuickResume(item.manga, progress.chapterId);
                          onClose();
                        }}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-white text-black font-tech text-xs font-bold rounded-xs hover:bg-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>RESUME CH. {progress.chapterNumber} (P. {progress.currentPage})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          soundFx.playDon();
                          onQuickResume(item.manga);
                          onClose();
                        }}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-white text-black font-tech text-xs font-bold rounded-xs hover:bg-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>READ CH. 01</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleRemove(item.manga.id)}
                      className="p-1.5 bg-[#1a1824] text-gray-400 hover:text-red-400 rounded-xs transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
