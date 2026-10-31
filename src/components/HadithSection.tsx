import React, { useState } from 'react';
import { HadithItem } from '../types';
import { IslamicButton } from './IslamicButton';
import { Play, Square, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

interface HadithSectionProps {
  hadiths: HadithItem[];
}

export const HadithSection: React.FC<HadithSectionProps> = ({ hadiths }) => {
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = ['all', ...Array.from(new Set(hadiths.map(h => h.category)))];

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  const playHadithAudio = (h: HadithItem) => {
    if (speakingId === h.id) {
      stopAudio();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported on your browser.");
      return;
    }

    stopAudio();
    setSpeakingId(h.id);

    // 1. Speak Arabic text first
    const arabicUtterance = new SpeechSynthesisUtterance(h.arabic);
    arabicUtterance.lang = 'ar-SA';
    arabicUtterance.rate = 0.85;

    // 2. Then speak English translation
    arabicUtterance.onend = () => {
      const englishUtterance = new SpeechSynthesisUtterance(`${h.meaning}. Narrated in ${h.reference}.`);
      englishUtterance.lang = 'en-US';
      englishUtterance.rate = 0.9;
      englishUtterance.onend = () => setSpeakingId(null);
      englishUtterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(englishUtterance);
    };

    arabicUtterance.onerror = () => {
      // Fallback: speak English directly if Arabic engine is missing
      const englishUtterance = new SpeechSynthesisUtterance(`${h.meaning}. ${h.reference}.`);
      englishUtterance.lang = 'en-US';
      englishUtterance.onend = () => setSpeakingId(null);
      englishUtterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(englishUtterance);
    };

    window.speechSynthesis.speak(arabicUtterance);
  };

  const handleCopy = (h: HadithItem) => {
    navigator.clipboard.writeText(`"${h.arabic}"\n\nMeaning: ${h.meaning}\nReference: ${h.reference}`);
    setCopiedId(h.id);
    playTactileClick('subtle');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredHadiths = selectedCategory === 'all'
    ? hadiths
    : hadiths.filter(h => h.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#C9A24D] text-xs font-bold tracking-widest uppercase mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Words of the Prophet ﷺ</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#173D33] tracking-tight">
            Hadith & Prophetic Wisdom
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Listen to authentic prophetic narrations: Arabic recitation followed by English translation.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1C4E40] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat === 'all' ? 'All Wisdom' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hadith Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHadiths.map(h => {
          const isPlaying = speakingId === h.id;
          const isCopied = copiedId === h.id;

          return (
            <div
              key={h.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                    {h.category}
                  </span>
                  <button
                    onClick={() => handleCopy(h)}
                    className="text-stone-400 hover:text-stone-600 transition-colors p-1"
                    title="Copy Hadith"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Arabic Calligraphy */}
                <p dir="rtl" className="font-arabic text-2xl text-[#173D33] text-right leading-relaxed select-text">
                  {h.arabic}
                </p>

                {/* English Meaning */}
                <p className="text-sm text-stone-700 font-semibold leading-relaxed">
                  "{h.meaning}"
                </p>
              </div>

              {/* Bottom Reference & Play Button */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-stone-400 truncate">
                  {h.reference}
                </span>

                <IslamicButton
                  variant={isPlaying ? 'ruby' : 'jannah'}
                  size="sm"
                  arabicFlourish={false}
                  icon={isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  onClick={() => playHadithAudio(h)}
                >
                  {isPlaying ? 'Stop' : 'Listen'}
                </IslamicButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
