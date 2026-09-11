import React, { useState, useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { Manga } from '../types/manga';
import { soundFx } from '../services/audioEngine';

interface HeroBannerProps {
  featuredManga: Manga[];
  onSelectManga: (manga: Manga) => void;
  onReadChapter: (manga: Manga) => void;
  onNavigateHindi: () => void;
  noirMode: boolean;
  onToggleNoir: () => void;
}

const KANJI_MAP: Record<string, { kanji: string; logline: string; watermark: string }> = {
  'Berserk (ベルセルク)': {
    kanji: 'ベルセルク',
    logline: 'A solitary branded warrior struggles against demonic apostles and the cruel wheels of destiny.',
    watermark: '狂戦士',
  },
  'Chainsaw Man (チェンソーマン)': {
    kanji: 'チェンソーマン',
    logline: 'A debt-ridden devil hunter merges with his chainsaw dog to carve through the bloody underworld.',
    watermark: '悪魔',
  },
  'Death Note (デスノート)': {
    kanji: 'デスノート',
    logline: 'A brilliant prodigy discovers a lethal shinigami notebook, sparking an intellectual duel against a master detective.',
    watermark: '死神',
  },
  'One Punch-Man (वन पंच मैन)': {
    kanji: 'ワンパンマン',
    logline: 'An ordinary hero who trained until his hair fell out can obliterate any foe with a single overwhelming strike.',
    watermark: '最強',
  },
  'Solo Leveling (나 혼자만 レベルアップ)': {
    kanji: '俺だけレベルアップな件',
    logline: 'The world’s weakest hunter awakens from a horrific dungeon as the sole player of an ominous leveling system.',
    watermark: '影の君主',
  },
  'Tokyo Ghoul (東京喰種)': {
    kanji: '東京喰種',
    logline: 'A gentle college student in Tokyo is thrust into the nocturnal war between humanity and flesh-eating ghouls.',
    watermark: '喰種',
  },
  'One Piece (वन पीस)': {
    kanji: 'ワンピース',
    logline: 'A spirited pirate sets sail with his loyal crew to discover the legendary treasure and claim the throne.',
    watermark: '海賊王',
  },
};

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredManga,
  onSelectManga,
  onReadChapter,
  noirMode,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  const current = featuredManga[activeIndex] || featuredManga[0];

  // GSAP Smooth Transition
  useEffect(() => {
    if (!textRef.current || !coverRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current?.children || [],
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.5,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(
        coverRef.current,
        { opacity: 0, scale: 0.96, y: 12 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeIndex]);

  if (!featuredManga || featuredManga.length === 0) return null;

  // Title parsing
  const titleMatch = current.title.match(/^(.+?)(?:\s*\((.+?)\))?$/);
  const mainTitle = titleMatch ? titleMatch[1].trim() : current.title;
  const itemMeta = KANJI_MAP[current.title] || {
    kanji: titleMatch && titleMatch[2] ? titleMatch[2].trim() : '漫画',
    logline: current.description.slice(0, 130) + '...',
    watermark: '傑作',
  };

  const handlePrev = () => {
    soundFx.playClick();
    setActiveIndex((prev) => (prev === 0 ? featuredManga.length - 1 : prev - 1));
  };

  const handleNext = () => {
    soundFx.playClick();
    setActiveIndex((prev) => (prev === featuredManga.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[560px] lg:h-[calc(100vh-68px)] lg:min-h-[640px] lg:max-h-[960px] flex items-center overflow-hidden border-b border-[var(--ink-border)] select-none transition-colors duration-500 py-8 sm:py-12 lg:py-0"
    >
      {/* 1. DYNAMIC FULL-SCREEN BACKGROUND MATCHING ACTIVE MANGA (BALANCED VISIBILITY) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          key={current.id}
          src={current.coverArtUrl}
          alt={current.title}
          className={`w-full h-full object-cover object-center sm:object-[center_25%] transition-all duration-700 transform scale-105 blur-[1.5px] sm:blur-[1px] ${
            noirMode
              ? 'filter grayscale contrast-130 brightness-55 opacity-55'
              : 'opacity-55 filter contrast-110 brightness-75'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://cdn.myanimelist.net/images/manga/1/157897.jpg';
          }}
        />

        {/* 2. BALANCED DIRECTIONAL VIGNETTES */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            noirMode
              ? 'bg-gradient-to-r from-black/90 via-black/55 to-black/35'
              : 'bg-gradient-to-r from-black/85 via-black/50 to-black/30'
          }`}
        />

        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            noirMode
              ? 'bg-gradient-to-t from-[#040405] via-transparent to-[#040405]/60'
              : 'bg-gradient-to-t from-[#07060a] via-transparent to-[#07060a]/50'
          }`}
        />

        {/* Radial backing behind text block */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-black/60 rounded-full blur-[130px] pointer-events-none" />

        {/* Screentone Halftone Dots for Authentic Manga Print Feel */}
        <div className="absolute inset-0 bg-screentone-dots opacity-10 pointer-events-none" />

        {/* Giant Japanese Kanji Watermark (Subtle & Atmospheric) */}
        <div className="absolute right-2 sm:right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden opacity-[0.04] text-white">
          <span className="watermark-manga-text text-[100px] sm:text-[200px] lg:text-[340px] font-black uppercase">
            {itemMeta.watermark}
          </span>
        </div>
      </div>

      {/* 3. CLEAN, UNCLUTTERED HERO CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full py-4 sm:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* LEFT: Minimal Editorial Typography */}
          <div ref={textRef} className="lg:col-span-7 flex flex-col justify-center space-y-3.5 sm:space-y-5 text-center lg:text-left items-center lg:items-start">
            {/* Minimal Index Eyebrow */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-xs font-tech tracking-widest uppercase text-gray-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  noirMode ? 'bg-white' : 'bg-[var(--vermilion)]'
                }`}
              />
              <span className="font-bold text-white tracking-wider">
                0{activeIndex + 1} / 0{featuredManga.length}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-gray-300 font-semibold">{current.author}</span>
              {current.hasHindi && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-[var(--kin-gold)] font-hindi font-bold">
                    हिन्दी अनुवाद
                  </span>
                </>
              )}
            </div>

            {/* Imposing Title Block */}
            <div>
              <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-wider uppercase leading-[0.92] drop-shadow-lg text-balance">
                {mainTitle.replace('-', ' ')}
              </h1>
              <p className="font-manga-bold text-lg sm:text-xl md:text-2xl text-[var(--vermilion)] tracking-widest mt-1.5 sm:mt-2 opacity-95">
                {itemMeta.kanji}
              </p>
            </div>

            {/* 1-Line Clean Poetic Logline */}
            <p className="text-xs sm:text-sm md:text-base text-gray-300/90 font-normal leading-relaxed max-w-lg">
              {itemMeta.logline}
            </p>

            {/* Minimal Specs */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs font-tech text-gray-400 pt-0.5 sm:pt-1">
              <span className="text-[var(--kin-gold)] font-bold">
                ★ {current.rating?.toFixed(1) || '9.9'}
              </span>
              <span className="text-white/20">•</span>
              <span className="uppercase text-gray-300">CH. 01 READY</span>
              <span className="text-white/20">•</span>
              <span className="uppercase text-gray-400">{current.status}</span>
            </div>

            {/* Single Powerful CTA + Minimal Switcher */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 pt-2 sm:pt-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  soundFx.playDon();
                  onReadChapter(current);
                }}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-tech font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer shadow-xl ${
                  noirMode
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-[var(--vermilion)] text-white hover:brightness-110 shadow-[0_0_24px_rgba(230,0,18,0.4)]'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>START READING CH. 01</span>
              </button>

              {/* Minimalist Slide Controls */}
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-full border border-white/10">
                <button
                  onClick={handlePrev}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Previous Manga"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-tech text-white/70 px-1 font-bold">
                  0{activeIndex + 1}
                </span>
                <button
                  onClick={handleNext}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Next Manga"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Standalone Physical Tankōbon Volume */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              ref={coverRef}
              onClick={() => {
                soundFx.playSlash();
                onSelectManga(current);
              }}
              className="relative group cursor-pointer"
            >
              {/* Subtle ambient glow backlight */}
              {!noirMode && (
                <div className="absolute -inset-3 bg-[var(--vermilion)]/20 rounded-2xl blur-3xl group-hover:bg-[var(--vermilion)]/30 transition-all duration-500" />
              )}

              {/* 3D Physical Tankōbon Volume */}
              <div className="relative w-48 sm:w-60 md:w-64 lg:w-72 aspect-[1/1.48] bg-[#0c0b11] rounded-sm overflow-hidden border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.9)] group-hover:border-white/40 group-hover:-translate-y-2 transition-all duration-500">
                {/* Book Spine Highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 via-white/15 to-transparent z-20 pointer-events-none" />

                {/* Top Corner Badge */}
                <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-20">
                  <span
                    className={`px-2 py-0.5 text-[8px] sm:text-[9px] font-tech font-bold uppercase tracking-widest shadow-md rounded-xs ${
                      noirMode ? 'bg-white text-black' : 'bg-[var(--vermilion)] text-white'
                    }`}
                  >
                    {current.hasHindi ? 'हिन्दी + EN' : 'VOL. 01'}
                  </span>
                </div>

                <img
                  src={current.coverArtUrl}
                  alt={current.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ${
                    noirMode ? 'noir-cover-filter' : ''
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://cdn.myanimelist.net/images/manga/1/157897.jpg';
                  }}
                />

                {/* Minimalist Bottom Foil Strip */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3.5 flex items-center justify-between z-20">
                  <span className="font-tech text-[10px] uppercase tracking-widest text-gray-300 font-bold">
                    OFFICIAL EDITION
                  </span>
                  <span className="text-[10px] font-tech text-white bg-white/15 px-2 py-0.5 rounded-xs backdrop-blur-xs font-semibold">
                    INSPECT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



