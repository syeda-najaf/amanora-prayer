import { toast } from "../lib";
import React, { useState } from 'react';
import { HadithItem } from '../types';
import { IslamicButton } from './IslamicButton';
import { BookOpen, Sparkles, Volume2, Square, Copy, Check, RefreshCw } from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

interface HadithOfTheDayProps {
  hadiths: HadithItem[];
  onOpenHadithTab: () => void;
}

export const HadithOfTheDay: React.FC<HadithOfTheDayProps> = ({
  hadiths,
  onOpenHadithTab,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return Math.floor(Math.random() * Math.min(hadiths.length, 10));
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const hadith = hadiths[currentIndex] || hadiths[0];

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playAudio = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast("Speech synthesis is not supported on your device.");
      return;
    }

    stopAudio();
    setIsPlaying(true);
    playTactileClick('gold');

    const arabicUtterance = new SpeechSynthesisUtterance(hadith.arabic);
    arabicUtterance.lang = 'ar-SA';
    arabicUtterance.rate = 0.85;

    arabicUtterance.onend = () => {
      const englishUtterance = new SpeechSynthesisUtterance(
        `The Messenger of Allah said: ${hadith.meaning}. Recorded in ${hadith.reference}.`
      );
      englishUtterance.lang = 'en-US';
      englishUtterance.rate = 0.9;
      englishUtterance.onend = () => setIsPlaying(false);
      englishUtterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(englishUtterance);
    };

    arabicUtterance.onerror = () => {
      const englishUtterance = new SpeechSynthesisUtterance(
        `The Prophet said: ${hadith.meaning}. ${hadith.reference}.`
      );
      englishUtterance.lang = 'en-US';
      englishUtterance.onend = () => setIsPlaying(false);
      englishUtterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(englishUtterance);
    };

    window.speechSynthesis.speak(arabicUtterance);
  };

  const handleNextHadith = () => {
    stopAudio();
    playTactileClick('subtle');
    setCurrentIndex(prev => (prev + 1) % hadiths.length);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${hadith.arabic}"\n\n"${hadith.meaning}"\n\nReference: ${hadith.reference}\n— Amanora Sanctuary`);
    setCopied(true);
    playTactileClick('subtle');
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFDF7] to-[#F7F2E4] rounded-3xl p-6 sm:p-7 border-2 border-[#C9A24D]/50 shadow-md space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 uppercase tracking-widest">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Hadith of the Day · حَدِيثُ الْيَوْمِ</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNextHadith}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            title="Next Hadith"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            title="Copy"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Arabic Calligraphy with Vowels */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200/70 shadow-xs">
          <p dir="rtl" className="font-arabic text-xl sm:text-2xl text-[#173D33] text-right leading-loose select-text font-medium">
            {hadith.arabic}
          </p>
        </div>

        {/* Translation */}
        <p className="text-sm font-bold text-stone-800 leading-relaxed">
          "{hadith.meaning}"
        </p>

        {/* Narrator & Citation */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-1">
          <span className="font-bold text-[#173D33]">{hadith.reference}</span>
          {hadith.narrator && (
            <span className="text-[11px] font-medium text-stone-600">Narrated by {hadith.narrator}</span>
          )}
        </div>

        {/* Reflection */}
        {hadith.reflection && (
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-950 font-medium leading-snug">
              <strong>Contemplation:</strong> {hadith.reflection}
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-amber-200/60">
        <IslamicButton
          variant={isPlaying ? 'ruby' : 'jannah'}
          size="sm"
          icon={isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3 fill-current" />}
          onClick={playAudio}
        >
          {isPlaying ? 'Stop Voice' : 'Listen with Audio'}
        </IslamicButton>

        <button
          onClick={onOpenHadithTab}
          className="text-xs font-bold text-[#173D33] hover:text-[#C9A24D] transition-colors underline"
        >
          Browse All 24+ Sahih Hadiths →
        </button>
      </div>
    </div>
  );
};
