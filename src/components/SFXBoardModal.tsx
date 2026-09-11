import React from 'react';
import { X, Zap, Volume2, Sparkles, Flame, ShieldAlert, Award } from 'lucide-react';
import { soundFx } from '../services/audioEngine';

interface SFXBoardModalProps {
  onClose: () => void;
}

export const SFXBoardModal: React.FC<SFXBoardModalProps> = ({ onClose }) => {
  const sounds = [
    {
      name: 'DON!! (ドンッ!!)',
      desc: 'Iconic dramatic reveal impact from One Piece & JoJo',
      kanji: 'ドンッ',
      color: 'bg-[#FF2A55]',
      textColor: 'text-white',
      play: () => soundFx.playDon(),
    },
    {
      name: 'KATANA SLASH (斬撃)',
      desc: 'Razor-sharp sword strike like Demon Slayer & Bleach',
      kanji: 'ズバッ',
      color: 'bg-[#00F0FF]',
      textColor: 'text-black',
      play: () => soundFx.playSlash(),
    },
    {
      name: 'TANKŌBON FLIP (ページ)',
      desc: 'Tactile Japanese manga paper rustle',
      kanji: 'パラッ',
      color: 'bg-[#FAF3E0]',
      textColor: 'text-black',
      play: () => soundFx.playPageFlip(),
    },
    {
      name: 'VICTORY CHIME (勝利)',
      desc: 'Chapter completion anime arpeggio fanfare',
      kanji: 'ファンファーレ',
      color: 'bg-[#FFC700]',
      textColor: 'text-black',
      play: () => soundFx.playChime(),
    },
    {
      name: 'TACTILE CLICK (カチッ)',
      desc: 'Crisp neo-brutalist interaction feedback',
      kanji: 'カチッ',
      color: 'bg-[#2A2838]',
      textColor: 'text-white',
      play: () => soundFx.playClick(),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#14121A] border-4 border-black shadow-[10px_10px_0_0_#000] overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-[#00F0FF] border-b-3 border-black p-3 px-5 flex items-center justify-between text-black">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 fill-current" />
            <span className="font-manga text-2xl tracking-wide">
              ANIME & MANGA SFX SYNTHESIZER
            </span>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-300 font-mono">
            Powered by real-time Web Audio synthesis. Click any sound block to trigger pure retro anime impact effects!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {sounds.map((s, idx) => (
              <button
                key={idx}
                onClick={s.play}
                className={`${s.color} ${s.textColor} p-4 border-3 border-black shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1 hover:brightness-105 transition-all text-left flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-manga text-2xl tracking-wide">{s.name}</span>
                    <span className="font-bold text-xs opacity-75">{s.kanji}</span>
                  </div>
                  <p className="text-[11px] font-medium opacity-90 mt-1">{s.desc}</p>
                </div>
                <div className="mt-3 flex items-center gap-1 font-mono text-[10px] font-bold">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>TAP TO BLAST</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
