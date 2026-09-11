import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { JapaneseMarquee } from './components/JapaneseMarquee';
import { LanguageHub } from './components/LanguageHub';
import { MangaGrid } from './components/MangaGrid';
import { MangaDetailModal } from './components/MangaDetailModal';
import { MangaReader } from './components/Reader/MangaReader';
import { LibraryModal } from './components/LibraryModal';
import { LatestUpdatesSection } from './components/LatestUpdatesSection';
import { Manga, Chapter, LatestChapterUpdate } from './types/manga';
import {
  getTopManga,
  getHindiManga,
  searchManga,
  getMangaChapters,
  getLatestChapterFeed,
  getAdultManga,
  CURATED_MANGA_VAULT,
} from './services/mangadex';
import { soundFx } from './services/audioEngine';

export function App() {
  const [mangaList, setMangaList] = useState<Manga[]>(CURATED_MANGA_VAULT);
  const [hindiManga, setHindiManga] = useState<Manga[]>(CURATED_MANGA_VAULT.filter((m) => m.hasHindi));
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'hi'>('all');

  // Default to Japanese Color Mode (false = Japanese Vermilion & Gold, true = Noir B&W)
  const [noirMode, setNoirMode] = useState<boolean>(false);

  // 18+ Adult & Hentai Content Mode (Persisted to localStorage)
  const [showAdult, setShowAdult] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mangakyo_show_adult') === 'true';
    } catch {
      return false;
    }
  });

  // MangaDex Live Latest Updates Feed
  const [latestUpdates, setLatestUpdates] = useState<LatestChapterUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  // Modals & Reader
  const [detailManga, setDetailManga] = useState<Manga | null>(null);
  const [readingSession, setReadingSession] = useState<{
    manga: Manga;
    chapter: Chapter;
  } | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Sync Noir Mode with DOM
  useEffect(() => {
    if (noirMode) {
      document.body.classList.add('noir-mode');
    } else {
      document.body.classList.remove('noir-mode');
    }
  }, [noirMode]);

  const handleToggleNoir = () => {
    soundFx.playClick();
    setNoirMode((prev) => !prev);
  };

  const handleToggleAdult = () => {
    soundFx.playClick();
    setShowAdult((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mangakyo_show_adult', String(next));
      } catch {}
      return next;
    });
  };

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getTopManga('all', 24),
      getHindiManga(12),
      getLatestChapterFeed(16),
    ])
      .then(([top, hindi, updates]) => {
        if (!isMounted) return;
        if (top && top.length > 0) setMangaList(top);
        if (hindi && hindi.length > 0) setHindiManga(hindi);
        if (updates && updates.length > 0) setLatestUpdates(updates);
      })
      .catch((err) => {
        console.warn('Initial fetch fallback initialized:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          setLoadingUpdates(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // When 18+ adult mode is turned on, fetch top adult & hentai titles from MangaDex
  useEffect(() => {
    if (showAdult) {
      getAdultManga(24)
        .then((adultList) => {
          if (adultList && adultList.length > 0) {
            setMangaList((prev) => {
              const merged = [...prev];
              adultList.forEach((item) => {
                if (!merged.some((m) => m.id === item.id)) {
                  merged.push(item);
                }
              });
              return merged;
            });
          }
        })
        .catch((err) => console.warn('Failed to fetch adult titles:', err));
    }
  }, [showAdult]);

  // Search & Language Filter Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      searchManga(searchQuery, selectedLanguage)
        .then((res) => {
          setMangaList(res);
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedLanguage]);

  // Quick Start Reading Handler (Instant Real Manga Pages)
  const handleQuickRead = useCallback(async (manga: Manga, specificChapterId?: string) => {
    soundFx.playDon();
    setLoading(true);
    try {
      const chapters = await getMangaChapters(manga.id, manga.hasHindi ? 'hi' : 'en');
      let targetChapter: Chapter | undefined;

      if (specificChapterId) {
        targetChapter = chapters.find((c) => c.id === specificChapterId);
      }
      if (!targetChapter && chapters.length > 0) {
        // Find Chapter 1 or earliest verified chapter
        const ch1 = chapters.find(c => c.chapter === '1' || c.chapter === '0.01' || c.chapter === '0');
        if (ch1) {
          targetChapter = ch1;
        } else {
          const sortedAsc = [...chapters].sort(
            (a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0)
          );
          targetChapter = sortedAsc[0];
        }
      }

      if (targetChapter) {
        setReadingSession({ manga, chapter: targetChapter });
      }
    } catch (e) {
      console.error('Quick read failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={`min-h-screen bg-[var(--ink-bg)] text-[var(--washi-white)] flex flex-col transition-colors duration-400 ${
      noirMode ? 'noir-mode' : ''
    }`}>
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        noirMode={noirMode}
        onToggleNoir={handleToggleNoir}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        showAdult={showAdult}
        onToggleAdult={handleToggleAdult}
      />

      {/* Hero Banner (Shown when not searching) */}
      {!searchQuery && (
        <HeroBanner
          featuredManga={mangaList.slice(0, 6)}
          onSelectManga={(m) => setDetailManga(m)}
          onReadChapter={(m) => handleQuickRead(m)}
          onNavigateHindi={() => {
            setSelectedLanguage('hi');
            window.scrollTo({ top: 480, behavior: 'smooth' });
          }}
          noirMode={noirMode}
          onToggleNoir={handleToggleNoir}
        />
      )}

      {/* GSAP Japanese Marquee Ticker */}
      <JapaneseMarquee noirMode={noirMode} />

      {/* Live MangaDex Two-Column Latest Chapter Updates Feed */}
      {!searchQuery && (
        <LatestUpdatesSection
          updates={latestUpdates}
          loading={loadingUpdates}
          onReadChapter={(manga, chapter) => {
            soundFx.playDon();
            setReadingSession({ manga, chapter });
          }}
          onSelectManga={(manga) => {
            soundFx.playClick();
            setDetailManga(manga);
          }}
          noirMode={noirMode}
          showAdult={showAdult}
        />
      )}

      {/* Dedicated Hindi Manga Hub (Shown when language is 'all' or 'hi') */}
      {!searchQuery && selectedLanguage !== 'en' && (
        <LanguageHub
          hindiManga={hindiManga}
          onSelectManga={(m) => setDetailManga(m)}
          onQuickRead={(m) => handleQuickRead(m)}
          onViewAllHindi={() => setSelectedLanguage('hi')}
          noirMode={noirMode}
        />
      )}

      {/* Main Manga Archive Grid */}
      <main className="flex-1">
        <MangaGrid
          mangaList={mangaList}
          loading={loading}
          selectedLanguage={selectedLanguage}
          onSelectManga={(m) => setDetailManga(m)}
          onQuickRead={(m) => handleQuickRead(m)}
          noirMode={noirMode}
          showAdult={showAdult}
        />
      </main>

      {/* Refined Japanese Editorial Footer */}
      <footer className="bg-[#050407] border-t border-[var(--ink-border)] py-10 sm:py-16 px-4 sm:px-8 lg:px-12 relative overflow-hidden transition-colors duration-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-kanji font-bold text-lg sm:text-xl border transition-all ${
              noirMode ? 'bg-white text-black border-white' : 'bg-[var(--vermilion)] text-white border-[var(--vermilion)]'
            }`}>
              狂
            </div>
            <div>
              <div className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-white">
                MANGA<span className={noirMode ? 'text-gray-400' : 'text-[var(--vermilion)]'}>KYO</span> (万華狂)
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 font-tech uppercase tracking-widest mt-0.5">
                The Japanese Editorial Manga Sanctuary
              </p>
            </div>
          </div>

          <div className="font-tech text-xs text-gray-500 space-y-1 text-left md:text-right">
            <p>
              Direct Distributed Scans Powered by{' '}
              <a
                href="https://mangadex.org"
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 underline hover:text-white"
              >
                MangaDex v5 API
              </a>
            </p>
            <p className="font-hindi text-gray-400 text-xs">
              हिंदी और अंग्रेजी दोनों भाषाओं में सर्वश्रेष्ठ मंगा अनुभव
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 sm:mt-10 pt-4 sm:pt-5 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-gray-600 gap-2 text-center sm:text-left">
          <span>JAPANESE COLOR & NOIR PRINT EDITIONS • VERIFIED HIGH-RES PAGES</span>
          <span>© MANGA-KYO EDITORIAL ENGINE</span>
        </div>
      </footer>

      {/* Manga Detail Modal */}
      {detailManga && (
        <MangaDetailModal
          manga={detailManga}
          onClose={() => setDetailManga(null)}
          onOpenReader={(manga, chapter) => {
            setDetailManga(null);
            setReadingSession({ manga, chapter });
          }}
          noirMode={noirMode}
        />
      )}

      {/* Advanced God-Tier Reader */}
      {readingSession && (
        <MangaReader
          manga={readingSession.manga}
          currentChapter={readingSession.chapter}
          onClose={() => setReadingSession(null)}
          onChapterChange={(chapter) => {
            setReadingSession({ manga: readingSession.manga, chapter });
          }}
          noirModeDefault={noirMode}
        />
      )}

      {/* My Vault (Library) Modal */}
      {isLibraryOpen && (
        <LibraryModal
          onClose={() => setIsLibraryOpen(false)}
          onSelectManga={(m) => setDetailManga(m)}
          onQuickResume={(m, chapterId) => handleQuickRead(m, chapterId)}
          noirMode={noirMode}
        />
      )}
    </div>
  );
}

export default App;
