import React, { useState } from 'react';
import { IslamicButton } from './IslamicButton';
import { RotateCcw, Volume2, Sparkles, Check } from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

const DHIKR_LIST = [
  { arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", meaning: "Glory be to Allah" },
  { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", meaning: "All praise belongs to Allah" },
  { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", meaning: "Allah is the Greatest" },
  { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", meaning: "I seek forgiveness from Allah" },
  { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", meaning: "There is no deity worthy of worship except Allah" },
];

const DAILY_ADHKAR = [
  {
    title: "Morning Remembrance",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    meaning: "Glory and praise belong to Allah.",
    count: "Repeat 100 times",
  },
  {
    title: "Seeking Forgiveness",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    meaning: "I seek forgiveness of Allah and repent to Him.",
    count: "Repeat 70 to 100 times",
  },
  {
    title: "Trust in Allah",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    meaning: "Allah is sufficient for us, and He is the best disposer of affairs.",
    count: "Quran 3:173",
  },
];

interface WorshipSectionProps {
  tasbihCount: number;
  onIncrementTasbih: () => void;
  onResetTasbih: () => void;
}

export const WorshipSection: React.FC<WorshipSectionProps> = ({
  tasbihCount,
  onIncrementTasbih,
  onResetTasbih,
}) => {
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const currentDhikr = DHIKR_LIST[dhikrIndex];

  const handleTap = () => {
    playTactileClick('bead');
    onIncrementTasbih();
  };

  const handleReset = () => {
    playTactileClick('subtle');
    onResetTasbih();
  };

  const nextDhikr = () => {
    playTactileClick('subtle');
    setDhikrIndex((dhikrIndex + 1) % DHIKR_LIST.length);
  };

  const progressPercent = Math.min(100, (tasbihCount % 33) / 33 * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Flagship Tasbih Counter with Modified Concentric Inner Bevels */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md text-center space-y-6">
        <div>
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#C9A24D] uppercase">
            Illuminated Digital Tasbih
          </span>
          <p className="font-arabic text-3xl sm:text-4xl text-[#173D33] mt-2 font-bold">
            {currentDhikr.arabic}
          </p>
          <p className="text-sm font-bold text-stone-700 mt-1">
            {currentDhikr.transliteration}
          </p>
          <p className="text-xs text-stone-500">
            "{currentDhikr.meaning}"
          </p>
        </div>

        {/* Concentric Tactile Tap Disk */}
        <div className="flex flex-col items-center justify-center py-2">
          <button
            onClick={handleTap}
            className="tasbih-disk w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center select-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400/40"
          >
            {/* Concentric gold inner ring */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-amber-300/30 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {tasbihCount}
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#E5C985] uppercase mt-1">
                TAP BEAD
              </span>
            </div>
          </button>
        </div>

        {/* Goal Indicator & Progress */}
        <div className="max-w-xs mx-auto space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
            <span>Cycle Round: {Math.floor(tasbihCount / 33) + 1}</span>
            <span>{tasbihCount % 33} / 33 Beads</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-[#C9A24D] rounded-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls Bar with Modified Inner Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <IslamicButton
            variant="secondary"
            size="sm"
            onClick={nextDhikr}
          >
            Change Dhikr ↻
          </IslamicButton>

          <IslamicButton
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReset}
          >
            Reset
          </IslamicButton>
        </div>
      </div>

      {/* Daily Adhkar Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md space-y-4">
        <h3 className="text-lg font-extrabold text-[#173D33]">Daily Adhkar & Supplications</h3>

        <div className="space-y-3">
          {DAILY_ADHKAR.map(a => (
            <div key={a.title} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#C9A24D] uppercase tracking-wider">{a.title}</p>
                <p dir="rtl" className="font-arabic text-2xl text-[#173D33] mt-1 text-right sm:text-left">{a.arabic}</p>
                <p className="text-xs text-stone-600 font-medium mt-1">"{a.meaning}"</p>
                <span className="text-[10px] text-stone-400 font-semibold">{a.count}</span>
              </div>

              <IslamicButton
                variant="jannah"
                size="sm"
                icon={<Volume2 className="w-3 h-3" />}
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(a.arabic);
                    u.lang = 'ar-SA';
                    window.speechSynthesis.speak(u);
                  }
                }}
              >
                Listen
              </IslamicButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
