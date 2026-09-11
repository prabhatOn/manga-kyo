import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface JapaneseMarqueeProps {
  noirMode: boolean;
}

export const JapaneseMarquee: React.FC<JapaneseMarqueeProps> = ({ noirMode }) => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        xPercent: -50,
        repeat: -1,
        duration: 35,
        ease: 'none',
      });
    });

    return () => ctx.revert();
  }, []);

  const items = [
    '週刊少年ジャンプ',
    'WEEKLY SHONEN JUMP',
    'ヤングジャンプ',
    'SEINEN MASTERWORKS',
    '不滅の物語',
    'HINDI TRANSLATED ARCHIVE',
    '白泉社 ベルセルク',
    'LEGENDARY SERIALIZATIONS',
    '墨と光の芸術',
    'NOIR INK & SCREENTONE',
  ];

  return (
    <div className="relative w-full overflow-hidden border-y border-[var(--ink-border)] bg-[#070609] py-2.5 select-none transition-colors duration-400">
      <div
        ref={marqueeRef}
        className="flex items-center gap-10 whitespace-nowrap will-change-transform w-fit"
      >
        {[...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-10 text-xs font-tech tracking-widest uppercase">
            <span className={idx % 2 === 0 ? 'font-kanji text-gray-400' : 'text-gray-500 font-bold'}>
              {text}
            </span>
            <span className={`w-1 h-1 rounded-full ${noirMode ? 'bg-white/40' : 'bg-[var(--vermilion)]'}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
