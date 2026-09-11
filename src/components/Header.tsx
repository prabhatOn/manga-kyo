import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Volume2, VolumeX, Contrast, X, Languages } from 'lucide-react';
import { soundFx } from '../services/audioEngine';
import { getLibrary } from '../services/storage';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLanguage: 'all' | 'en' | 'hi';
  onLanguageChange: (lang: 'all' | 'en' | 'hi') => void;
  noirMode: boolean;
  onToggleNoir: () => void;
  onOpenLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedLanguage,
  onLanguageChange,
  noirMode,
  onToggleNoir,
  onOpenLibrary,
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const [libraryCount, setLibraryCount] = useState(0);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      setLibraryCount(getLibrary().length);
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 1500);
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#07060a]/95 backdrop-blur-2xl border-b border-white/[0.08] transition-colors duration-400 select-none">
      {/* Full-Width Modern Retro Manga Navbar */}
      <div className="w-full px-3 sm:px-6 lg:px-12 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 lg:gap-8">
        {/* LEFT: Distinctive Retro Manga Logo & Japanese Typography */}
        <div
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shrink-0"
          onClick={() => {
            soundFx.playDon();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {/* Authentic Japanese Hanko Chop Stamp */}
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-kanji font-black text-lg sm:text-xl rounded-xs transition-all duration-300 ${
              noirMode
                ? 'bg-white text-black shadow-sm'
                : 'bg-[var(--vermilion)] text-white shadow-[0_0_20px_rgba(230,0,18,0.4)] group-hover:brightness-110'
            }`}
          >
            狂
          </div>

          <div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-editorial text-xl sm:text-3xl font-black tracking-wider text-white group-hover:text-gray-200 transition-colors">
                MANGA<span className={noirMode ? 'text-gray-400' : 'text-[var(--vermilion)]'}>KYO</span>
              </span>
              <span className="font-kanji text-[10px] sm:text-xs text-gray-400 tracking-widest hidden sm:inline opacity-75">
                万華狂
              </span>
            </div>
            <p className="text-[9px] font-tech text-gray-400 tracking-widest uppercase hidden md:block">
              Retro Manga Archive // 集英社 • 白泉社
            </p>
          </div>
        </div>

        {/* CENTER: Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <div className="w-full relative flex items-center">
            <Search className="w-4 h-4 text-gray-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 10,000+ manga chapters (Berserk, One Piece, Hindi)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#121118]/80 hover:bg-[#16151f] text-white placeholder-gray-500 text-xs sm:text-sm pl-11 pr-10 py-2.5 rounded-full border border-white/10 focus:border-[var(--vermilion)] focus:outline-none transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 text-gray-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:block absolute right-4 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                /
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: Tools & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowMobileSearch(!showMobileSearch);
            }}
            className={`md:hidden p-2 rounded-full border transition-colors cursor-pointer ${
              showMobileSearch || searchQuery
                ? 'bg-white text-black border-white'
                : 'bg-[#14131c] text-gray-300 border-white/10'
            }`}
            title="Toggle Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Desktop Language Switcher Pills */}
          <div className="hidden lg:flex bg-[#121118] border border-white/10 rounded-full p-1 items-center text-xs font-tech font-bold">
            <button
              onClick={() => {
                soundFx.playClick();
                onLanguageChange('all');
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedLanguage === 'all'
                  ? noirMode
                    ? 'bg-white text-black'
                    : 'bg-[var(--vermilion)] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onLanguageChange('en');
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                selectedLanguage === 'en'
                  ? noirMode
                    ? 'bg-white text-black'
                    : 'bg-[var(--vermilion)] text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onLanguageChange('hi');
              }}
              className={`px-3 py-1 rounded-full font-hindi flex items-center gap-1 transition-all cursor-pointer ${
                selectedLanguage === 'hi'
                  ? 'bg-[var(--kin-gold)] text-black font-bold shadow-xs'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <Languages className="w-3 h-3" />
              <span>हिन्दी</span>
            </button>
          </div>

          {/* Master Theme Toggle (和 Japanese Color ⇄ 墨 Noir) */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleNoir();
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-tech font-bold tracking-wide transition-all border cursor-pointer ${
              noirMode
                ? 'bg-white text-black border-white shadow-sm hover:bg-gray-200'
                : 'bg-[#14131c] text-gray-300 hover:text-white border-white/10 hover:border-white/20'
            }`}
            title="Toggle between Japanese Color and Noir Monochrome"
          >
            <Contrast className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {noirMode ? '墨 NOIR' : '和 COLOR'}
            </span>
          </button>

          {/* Sound FX Toggle (Desktop) */}
          <button
            onClick={handleToggleMute}
            className={`hidden sm:flex p-2 rounded-full border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-[#121118] text-gray-500 border-white/5 hover:text-gray-300'
                : 'bg-[#181622] text-white border-white/15 hover:border-white/30'
            }`}
            title={isMuted ? 'Sound Muted' : 'Sound Active'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Vault Bookmarks Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenLibrary();
            }}
            className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-tech text-xs font-bold transition-all cursor-pointer shadow-md ${
              noirMode
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-[var(--vermilion)] text-white hover:brightness-110 shadow-[0_0_18px_rgba(230,0,18,0.3)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="tracking-wider">VAULT</span>
            {libraryCount > 0 && (
              <span className="bg-black text-white text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full border border-gray-700 font-bold">
                {libraryCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Expandable Search Bar & Language Strip */}
      {(showMobileSearch || searchQuery) && (
        <div className="md:hidden px-3 pb-3 pt-1 border-t border-white/5 bg-[#0b0a10] animate-in slide-in-from-top-2 duration-150 space-y-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search manga (Berserk, Hindi)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#161420] text-white placeholder-gray-500 text-xs pl-9 pr-9 py-2 rounded-full border border-white/10 focus:border-[var(--vermilion)] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-gray-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Language Switcher Strip */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center bg-[#13121b] border border-white/10 rounded-full p-0.5 text-[11px] font-tech font-bold">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onLanguageChange('all');
                }}
                className={`px-3 py-1 rounded-full ${
                  selectedLanguage === 'all'
                    ? noirMode
                      ? 'bg-white text-black'
                      : 'bg-[var(--vermilion)] text-white'
                    : 'text-gray-400'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onLanguageChange('en');
                }}
                className={`px-3 py-1 rounded-full ${
                  selectedLanguage === 'en'
                    ? noirMode
                      ? 'bg-white text-black'
                      : 'bg-[var(--vermilion)] text-white'
                    : 'text-gray-400'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onLanguageChange('hi');
                }}
                className={`px-3 py-1 rounded-full font-hindi flex items-center gap-1 ${
                  selectedLanguage === 'hi'
                    ? 'bg-[var(--kin-gold)] text-black font-bold'
                    : 'text-amber-400/80'
                }`}
              >
                <Languages className="w-2.5 h-2.5" />
                <span>हिन्दी</span>
              </button>
            </div>

            {/* Mobile Sound Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-full border text-xs flex items-center gap-1 px-2.5 font-tech ${
                isMuted ? 'bg-[#121118] text-gray-500 border-white/5' : 'bg-[#181622] text-white border-white/15'
              }`}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span className="text-[10px]">{isMuted ? 'MUTED' : 'AUDIO'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

