import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Settings,
  List,
  Contrast,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Manga, Chapter, ChapterPages, ReadingMode, ReaderTheme, ReaderFit, ReaderSettings } from '../../types/manga';
import { getChapterPages, getMangaChapters } from '../../services/mangadex';
import { soundFx } from '../../services/audioEngine';
import {
  saveReadingProgress,
  getReadingProgress,
  getReaderSettings,
  saveReaderSettings,
} from '../../services/storage';

interface MangaReaderProps {
  manga: Manga;
  currentChapter: Chapter;
  onClose: () => void;
  onChapterChange: (chapter: Chapter) => void;
  noirModeDefault?: boolean;
}

export const MangaReader: React.FC<MangaReaderProps> = ({
  manga,
  currentChapter,
  onClose,
  onChapterChange,
  noirModeDefault = false,
}) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readerNoir, setReaderNoir] = useState(noirModeDefault);
  const [settings, setSettings] = useState<ReaderSettings>(getReaderSettings());
  const [chapterCompleted, setChapterCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const webtoonRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Chapter Pages
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setChapterCompleted(false);

    getChapterPages(currentChapter.id)
      .then((data: ChapterPages) => {
        if (!isMounted) return;
        const pageUrls = data.fallbackUrls || [];
        setPages(pageUrls);
        setTotalPages(pageUrls.length > 0 ? pageUrls.length : 1);

        // Resume saved progress
        const saved = getReadingProgress(manga.id);
        if (saved && saved.chapterId === currentChapter.id && saved.currentPage <= pageUrls.length) {
          setCurrentPage(saved.currentPage);
        } else {
          setCurrentPage(1);
        }
      })
      .catch((err) => {
        console.error('Failed to load chapter pages:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Load chapters for drawer
    getMangaChapters(manga.id, 'all').then((chList) => {
      if (isMounted) setAllChapters(chList);
    });

    return () => {
      isMounted = false;
    };
  }, [currentChapter.id, manga.id]);

  // Preload next images in background
  useEffect(() => {
    if (pages.length > 0) {
      const nextIdxs = [currentPage, currentPage + 1, currentPage + 2];
      nextIdxs.forEach((idx) => {
        if (idx < pages.length) {
          const img = new Image();
          img.src = pages[idx];
        }
      });
    }
  }, [currentPage, pages]);

  // Save progress
  useEffect(() => {
    if (pages.length > 0 && currentPage > 0) {
      saveReadingProgress({
        mangaId: manga.id,
        chapterId: currentChapter.id,
        chapterNumber: currentChapter.chapter,
        currentPage,
        totalPages: pages.length,
        updatedAt: Date.now(),
        completed: chapterCompleted,
      });
    }
  }, [currentPage, pages.length, manga.id, currentChapter, chapterCompleted]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (!showSettings && !showChapterList) {
        setShowControls(false);
      }
    }, 4000);
  }, [showSettings, showChapterList]);

  // Page Turn Actions
  const handleNextPage = useCallback(() => {
    if (settings.mode === 'double') {
      const step = (currentPage === 1 && settings.doubleCoverOffset) ? 1 : 2;
      if (currentPage + step <= totalPages) {
        soundFx.playPageFlip();
        setCurrentPage((prev) => prev + step);
      } else if (!chapterCompleted) {
        triggerChapterCompletion();
      }
    } else {
      if (currentPage < totalPages) {
        soundFx.playPageFlip();
        setCurrentPage((prev) => prev + 1);
      } else if (!chapterCompleted) {
        triggerChapterCompletion();
      }
    }
  }, [currentPage, totalPages, settings.mode, settings.doubleCoverOffset, chapterCompleted]);

  const handlePrevPage = useCallback(() => {
    if (settings.mode === 'double') {
      const step = (currentPage === 2 && settings.doubleCoverOffset) ? 1 : 2;
      if (currentPage - step >= 1) {
        soundFx.playPageFlip();
        setCurrentPage((prev) => Math.max(1, prev - step));
      }
    } else {
      if (currentPage > 1) {
        soundFx.playPageFlip();
        setCurrentPage((prev) => prev - 1);
      }
    }
  }, [currentPage, settings.mode, settings.doubleCoverOffset]);

  const triggerChapterCompletion = () => {
    setChapterCompleted(true);
    soundFx.playChime();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#ff1e27', '#000000'],
      });
    } catch {
      // Optional confetti
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (showChapterList) setShowChapterList(false);
        else onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (settings.mode === 'rtl') handlePrevPage();
        else handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (settings.mode === 'rtl') handleNextPage();
        else handlePrevPage();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage, settings.mode, showSettings, showChapterList, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentChapterIdx = allChapters.findIndex((c) => c.id === currentChapter.id);
  const nextChapter = currentChapterIdx > 0 ? allChapters[currentChapterIdx - 1] : null;
  const prevChapter = currentChapterIdx < allChapters.length - 1 ? allChapters[currentChapterIdx + 1] : null;

  const handleUpdateSettings = (newSettings: Partial<ReaderSettings>) => {
    const updated = saveReaderSettings(newSettings);
    setSettings(updated);
  };

  const themeClasses = {
    dark: 'bg-[#050406] text-white',
    paper: 'bg-screentone-paper text-black',
    sepia: 'bg-[#f3edd9] text-black',
    white: 'bg-white text-black',
  }[settings.theme];

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      className={`fixed inset-0 z-50 overflow-hidden flex flex-col select-none transition-colors duration-200 reader-canvas ${themeClasses}`}
    >
      {/* Top Floating Bar */}
      <div
        className={`absolute top-0 inset-x-0 z-40 bg-[#09080c]/95 backdrop-blur-md border-b border-[#22202c] text-white transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Back & Manga Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundFx.playClick(); onClose(); }}
              className="p-1.5 bg-[#171520] text-gray-300 hover:text-white border border-[#2e2b3c] rounded-xs"
              title="Close Reader (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-editorial text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-sm">
                {manga.title}
              </h2>
              <div className="text-[11px] font-tech text-gray-400 flex items-center gap-2">
                <span>Ch. {currentChapter.chapter}</span>
                {currentChapter.title && (
                  <span className="text-gray-500 truncate max-w-xs hidden sm:inline">
                    - {currentChapter.title}
                  </span>
                )}
                <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-xs ${
                  currentChapter.language === 'hi' ? 'bg-[#ffc700] text-black font-hindi' : 'bg-[#181622] text-gray-300 border border-[#333]'
                }`}>
                  {currentChapter.language === 'hi' ? 'हिन्दी' : 'EN'}
                </span>
              </div>
            </div>
          </div>

          {/* Center Mode Controls */}
          <div className="hidden md:flex items-center bg-[#131219] border border-[#262434] rounded-xs p-0.5 text-xs font-tech font-semibold">
            <button
              onClick={() => handleUpdateSettings({ mode: 'vertical' })}
              className={`px-3 py-1 rounded-xs transition-all ${
                settings.mode === 'vertical' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              WEBTOON
            </button>
            <button
              onClick={() => handleUpdateSettings({ mode: 'rtl' })}
              className={`px-3 py-1 rounded-xs transition-all ${
                settings.mode === 'rtl' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
              title="Traditional Right-to-Left Japanese Manga"
            >
              RTL (MANGA)
            </button>
            <button
              onClick={() => handleUpdateSettings({ mode: 'ltr' })}
              className={`px-3 py-1 rounded-xs transition-all ${
                settings.mode === 'ltr' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              LTR
            </button>
            <button
              onClick={() => handleUpdateSettings({ mode: 'double' })}
              className={`px-3 py-1 rounded-xs transition-all ${
                settings.mode === 'double' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              SPREAD
            </button>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-2">
            {/* Noir Filter Toggle inside Reader */}
            <button
              onClick={() => {
                soundFx.playClick();
                setReaderNoir(!readerNoir);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-tech font-bold rounded-xs border transition-all ${
                readerNoir
                  ? 'bg-white text-black border-white'
                  : 'bg-[#171520] text-gray-300 border-[#2e2b3c] hover:text-white'
              }`}
              title="Toggle Noir B&W Ink Filter"
            >
              <Contrast className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{readerNoir ? 'NOIR: ON' : 'NOIR INK'}</span>
            </button>

            {/* Chapters Drawer */}
            <button
              onClick={() => {
                soundFx.playClick();
                setShowChapterList(!showChapterList);
                setShowSettings(false);
              }}
              className={`p-2 border rounded-xs transition-colors ${
                showChapterList
                  ? 'bg-white text-black border-white'
                  : 'bg-[#171520] text-gray-300 border-[#2e2b3c] hover:text-white'
              }`}
              title="Chapter Drawer"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                soundFx.playClick();
                setShowSettings(!showSettings);
                setShowChapterList(false);
              }}
              className={`p-2 border rounded-xs transition-colors ${
                showSettings
                  ? 'bg-white text-black border-white'
                  : 'bg-[#171520] text-gray-300 border-[#2e2b3c] hover:text-white'
              }`}
              title="Reader Customizer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-[#171520] text-gray-300 hover:text-white border border-[#2e2b3c] rounded-xs"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute top-14 right-4 z-50 w-72 bg-[#100f17] border border-[#2c293c] shadow-2xl rounded-xs p-4 text-white space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#242232] pb-2">
            <span className="font-editorial text-sm font-bold text-white">READER CUSTOMIZATION</span>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Reading Direction */}
          <div className="space-y-1">
            <label className="text-[10px] font-tech text-gray-400 uppercase tracking-wider block">
              Reading Flow:
            </label>
            <div className="grid grid-cols-2 gap-1 text-xs font-tech font-semibold">
              {(['vertical', 'rtl', 'ltr', 'double'] as ReadingMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleUpdateSettings({ mode: m })}
                  className={`py-1.5 px-2 border rounded-xs uppercase ${
                    settings.mode === m
                      ? 'bg-white text-black border-white'
                      : 'bg-[#161420] text-gray-400 border-[#252232]'
                  }`}
                >
                  {m === 'vertical' ? 'Webtoon' : m === 'rtl' ? 'Manga (RTL)' : m === 'ltr' ? 'LTR Comic' : '2-Page Spread'}
                </button>
              ))}
            </div>
          </div>

          {/* Background Theme */}
          <div className="space-y-1">
            <label className="text-[10px] font-tech text-gray-400 uppercase tracking-wider block">
              Paper Theme:
            </label>
            <div className="grid grid-cols-2 gap-1 text-xs font-tech font-semibold">
              {[
                { id: 'dark', label: 'Noir Ink', color: 'bg-black text-white' },
                { id: 'paper', label: 'Tankōbon Paper', color: 'bg-[#ede5d8] text-black' },
                { id: 'sepia', label: 'Warm Sepia', color: 'bg-[#f3edd9] text-black' },
                { id: 'white', label: 'Pure White', color: 'bg-white text-black' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => handleUpdateSettings({ theme: th.id as ReaderTheme })}
                  className={`py-1.5 px-2 border rounded-xs ${th.color} ${
                    settings.theme === th.id ? 'ring-2 ring-[#ff1e27] border-transparent' : 'border-[#333]'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Fit */}
          <div className="space-y-1">
            <label className="text-[10px] font-tech text-gray-400 uppercase tracking-wider block">
              Fit Mode:
            </label>
            <div className="grid grid-cols-3 gap-1 text-xs font-tech font-semibold">
              {(['width', 'height', 'original'] as ReaderFit[]).map((f) => (
                <button
                  key={f}
                  onClick={() => handleUpdateSettings({ fit: f })}
                  className={`py-1 px-1 border rounded-xs uppercase ${
                    settings.fit === f
                      ? 'bg-white text-black border-white'
                      : 'bg-[#161420] text-gray-400 border-[#252232]'
                  }`}
                >
                  {f === 'width' ? 'Width' : f === 'height' ? 'Height' : 'Original'}
                </button>
              ))}
            </div>
          </div>

          {/* Screentone Dot Overlay */}
          <div className="pt-2 border-t border-[#242232] flex items-center justify-between text-xs font-tech">
            <span className="text-gray-300">Screentone Dot Matrix:</span>
            <button
              onClick={() => handleUpdateSettings({ screentoneOverlay: !settings.screentoneOverlay })}
              className={`px-2 py-0.5 rounded-xs border text-[10px] font-bold ${
                settings.screentoneOverlay
                  ? 'bg-white text-black border-white'
                  : 'bg-[#161420] text-gray-400 border-[#252232]'
              }`}
            >
              {settings.screentoneOverlay ? 'ENABLED' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* Chapters Drawer */}
      {showChapterList && (
        <div className="absolute top-14 right-4 z-50 w-80 max-h-96 overflow-y-auto bg-[#100f17] border border-[#2c293c] shadow-2xl rounded-xs p-4 text-white space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#242232] pb-2">
            <span className="font-editorial text-sm font-bold text-white">CHAPTER ARCHIVE</span>
            <button onClick={() => setShowChapterList(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {allChapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  soundFx.playSlash();
                  onChapterChange(ch);
                  setShowChapterList(false);
                }}
                className={`w-full text-left p-2 border rounded-xs text-xs font-tech flex items-center justify-between transition-all ${
                  ch.id === currentChapter.id
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-[#161420] text-gray-300 border-[#23202e] hover:bg-[#1f1c2b]'
                }`}
              >
                <span>Ch. {ch.chapter} {ch.title ? `- ${ch.title}` : ''}</span>
                <span className={`px-1.5 text-[9px] rounded-xs ${ch.language === 'hi' ? 'bg-[#ffc700] text-black font-hindi font-bold' : 'bg-black text-gray-400'}`}>
                  {ch.language === 'hi' ? 'हिन्दी' : 'EN'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reader Display Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center relative p-2 sm:p-4">
        {loading ? (
          <div className="text-center space-y-3">
            <div className="font-editorial text-xl text-white font-bold tracking-wider">
              LOADING MANGA PAGES...
            </div>
            <div className="w-40 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-white animate-pulse" />
            </div>
            <p className="text-[11px] font-tech text-gray-500">MangaDex distributed network delivery</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="bg-[#121118] border border-[#2a2738] rounded-xs p-8 text-center max-w-md">
            <div className="font-editorial text-lg text-white font-bold mb-2">CHAPTER EMPTY</div>
            <p className="text-xs text-gray-400">
              The requested chapter feed has no available scanlation pages. Please try another chapter.
            </p>
          </div>
        ) : settings.mode === 'vertical' ? (
          /* Webtoon Vertical Infinite Scroll */
          <div ref={webtoonRef} className="w-full max-w-3xl mx-auto space-y-2 py-16">
            {pages.map((url, idx) => (
              <div key={idx} className="relative">
                <img
                  src={url}
                  alt={`Page ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className={`w-full object-contain mx-auto shadow-md ${
                    readerNoir ? 'reader-noir-filter' : ''
                  } ${settings.screentoneOverlay ? 'reader-screentone' : ''}`}
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded-xs">
                  {idx + 1} / {totalPages}
                </div>
              </div>
            ))}

            {/* Chapter Complete End Card */}
            <div className="bg-[#100f17] border border-[#242232] rounded-xs p-8 text-center my-10 space-y-3">
              <div className="font-editorial text-2xl font-bold text-white">
                CHAPTER COMPLETE
              </div>
              <p className="text-xs text-gray-400 font-tech">
                Finished reading Chapter {currentChapter.chapter} of {manga.title}
              </p>
              {nextChapter ? (
                <button
                  onClick={() => { soundFx.playDon(); onChapterChange(nextChapter); }}
                  className="px-6 py-2.5 bg-white text-black font-tech text-xs font-bold rounded-xs hover:bg-gray-200 transition-colors"
                >
                  NEXT CHAPTER ({nextChapter.chapter}) →
                </button>
              ) : (
                <span className="text-xs font-tech text-gray-500">You are on the latest available chapter.</span>
              )}
            </div>
          </div>
        ) : settings.mode === 'double' ? (
          /* Dual Page Spread Mode */
          <div className="h-full w-full flex items-center justify-center gap-2 py-14">
            <div className="max-h-[84vh] max-w-[48vw] flex items-center justify-end relative">
              <img
                src={pages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                referrerPolicy="no-referrer"
                className={`max-h-[84vh] object-contain shadow-2xl border border-black/30 ${
                  readerNoir ? 'reader-noir-filter' : ''
                } ${settings.screentoneOverlay ? 'reader-screentone' : ''}`}
              />
              <span className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-xs">
                {currentPage}
              </span>
            </div>

            {currentPage < totalPages && (
              <div className="max-h-[84vh] max-w-[48vw] flex items-center justify-start relative">
                <img
                  src={pages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  referrerPolicy="no-referrer"
                  className={`max-h-[84vh] object-contain shadow-2xl border border-black/30 ${
                    readerNoir ? 'reader-noir-filter' : ''
                  } ${settings.screentoneOverlay ? 'reader-screentone' : ''}`}
                />
                <span className="absolute bottom-2 left-2 bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-xs">
                  {currentPage + 1}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Single Page (RTL / LTR) */
          <div className="h-full w-full flex items-center justify-center py-14 relative">
            <div className="max-h-[86vh] max-w-full relative flex items-center justify-center">
              <img
                src={pages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                referrerPolicy="no-referrer"
                className={`max-h-[86vh] object-contain shadow-2xl ${
                  settings.fit === 'width' ? 'w-full' : ''
                } ${readerNoir ? 'reader-noir-filter' : ''} ${
                  settings.screentoneOverlay ? 'reader-screentone' : ''
                }`}
              />
              <div className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-xs px-2 py-0.5 rounded-xs border border-white/10">
                {currentPage} / {totalPages}
              </div>
            </div>

            {/* Click zones */}
            <div
              onClick={settings.mode === 'rtl' ? handleNextPage : handlePrevPage}
              className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize z-20"
              title={settings.mode === 'rtl' ? 'Next Page' : 'Previous Page'}
            />
            <div
              onClick={settings.mode === 'rtl' ? handlePrevPage : handleNextPage}
              className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize z-20"
              title={settings.mode === 'rtl' ? 'Previous Page' : 'Next Page'}
            />
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {chapterCompleted && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121118] border border-[#2b273b] shadow-2xl rounded-xs p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="font-editorial text-2xl font-bold text-white">CHAPTER FINISHED</h3>
            <p className="text-gray-300 text-xs font-tech">
              You completed Chapter {currentChapter.chapter} of {manga.title}.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              {nextChapter ? (
                <button
                  onClick={() => { soundFx.playDon(); onChapterChange(nextChapter); }}
                  className="w-full py-2.5 bg-white text-black font-tech text-xs font-bold rounded-xs hover:bg-gray-200 transition-colors"
                >
                  NEXT CHAPTER ({nextChapter.chapter}) →
                </button>
              ) : (
                <div className="bg-[#181622] border border-[#292638] p-2 text-xs font-tech text-gray-400 rounded-xs">
                  Caught up with the latest chapter.
                </div>
              )}

              <button
                onClick={() => setChapterCompleted(false)}
                className="w-full py-2 bg-[#1b1926] text-gray-300 hover:text-white font-tech text-xs rounded-xs"
              >
                Re-read Chapter
              </button>

              <button
                onClick={onClose}
                className="w-full py-1.5 text-gray-500 hover:text-gray-400 font-tech text-xs"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-40 bg-[#09080c]/95 backdrop-blur-md border-t border-[#22202c] text-white transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <button
            onClick={settings.mode === 'rtl' ? handleNextPage : handlePrevPage}
            disabled={currentPage === 1 && !prevChapter}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#171520] text-gray-300 hover:text-white border border-[#2b273b] rounded-xs text-xs font-tech disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">PREV</span>
          </button>

          <div className="flex-1 flex items-center gap-3 max-w-md">
            <span className="font-mono text-xs font-bold text-gray-300">
              {currentPage}
            </span>
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                soundFx.playClick();
                setCurrentPage(parseInt(e.target.value, 10));
              }}
              className="flex-1 accent-white cursor-pointer h-1.5 bg-gray-700 rounded-full"
            />
            <span className="font-mono text-xs text-gray-500">
              {totalPages}
            </span>
          </div>

          <button
            onClick={settings.mode === 'rtl' ? handlePrevPage : handleNextPage}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-black hover:bg-gray-200 rounded-xs text-xs font-tech font-bold"
          >
            <span className="hidden sm:inline">NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
