import { toast } from "../lib";
import React, { useState } from 'react';
import { HadithItem } from '../types';
import { IslamicButton } from './IslamicButton';
import { 
  Play, 
  Square, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Search, 
  Bookmark, 
  CheckCircle2, 
  Volume2, 
  Share2, 
  Award,
  Layers
} from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

interface HadithSectionProps {
  hadiths: HadithItem[];
}

export const HadithSection: React.FC<HadithSectionProps> = ({ hadiths }) => {
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [memorizedIds, setMemorizedIds] = useState<number[]>([]);
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);

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
      toast("Speech synthesis is not supported on your browser.");
      return;
    }

    stopAudio();
    setSpeakingId(h.id);
    playTactileClick('gold');

    // 1. Speak Arabic text first
    const arabicUtterance = new SpeechSynthesisUtterance(h.arabic);
    arabicUtterance.lang = 'ar-SA';
    arabicUtterance.rate = 0.85;

    // 2. Then speak English translation and narrator
    arabicUtterance.onend = () => {
      const narratorText = h.narrator ? `Narrated by ${h.narrator}. ` : '';
      const englishUtterance = new SpeechSynthesisUtterance(
        `${narratorText}The Prophet peace be upon him said: ${h.meaning}. Recorded in ${h.reference}.`
      );
      englishUtterance.lang = 'en-US';
      englishUtterance.rate = 0.9;
      englishUtterance.onend = () => setSpeakingId(null);
      englishUtterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(englishUtterance);
    };

    arabicUtterance.onerror = () => {
      // Fallback: speak English directly if Arabic engine is missing
      const narratorText = h.narrator ? `Narrated by ${h.narrator}. ` : '';
      const englishUtterance = new SpeechSynthesisUtterance(
        `${narratorText}The Prophet said: ${h.meaning}. ${h.reference}.`
      );
      englishUtterance.lang = 'en-US';
      englishUtterance.rate = 0.9;
      englishUtterance.onend = () => setSpeakingId(null);
      englishUtterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(englishUtterance);
    };

    window.speechSynthesis.speak(arabicUtterance);
  };

  const handleCopy = (h: HadithItem) => {
    const textToCopy = `"${h.arabic}"\n\nNarrated by: ${h.narrator || 'Sahabi'}\n"${h.meaning}"\n\nReference: ${h.reference}\nAmanora Sanctuary`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(h.id);
    playTactileClick('subtle');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    playTactileClick('subtle');
  };

  const toggleMemorized = (id: number) => {
    setMemorizedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    playTactileClick('chime');
  };

  const filteredHadiths = hadiths.filter(h => {
    const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      `${h.meaning} ${h.arabic} ${h.reference} ${h.narrator || ''} ${h.category}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesBookmark = !onlyBookmarked || bookmarkedIds.includes(h.id);

    return matchesCategory && matchesSearch && matchesBookmark;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none">
      {/* Top Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#174D3D] via-[#103A2E] to-[#0A261E] p-6 sm:p-8 text-white border-2 border-[#C9A24D]/50 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[#E7CF9B] text-xs font-black tracking-widest uppercase">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Authentic Prophetic Traditions · كَلَامُ النَّبِيِّ ﷺ</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Sahih Hadith & Prophetic Wisdom
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Explore authentic narrations from Sahih al-Bukhari, Sahih Muslim, and the Sunan. Listen to pristine Arabic recitation with English meanings, narrator chains, and spiritual reflections.
            </p>
          </div>

          {/* Memorization Progress Pill */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-[#C9A24D] text-[#0E2B24] px-4 py-2.5 rounded-2xl font-black text-xs shadow-md">
              <Award className="w-4 h-4 fill-current" />
              <span>{memorizedIds.length} of {hadiths.length} Memorized</span>
            </div>
            <span className="text-[11px] text-amber-200/80 font-medium">
              ★ {bookmarkedIds.length} Saved in Favorites
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, narrator (e.g. Abu Hurairah), book, or meaning..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
          />
        </div>

        {/* Bookmarks Only Toggle */}
        <button
          onClick={() => {
            playTactileClick('subtle');
            setOnlyBookmarked(!onlyBookmarked);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            onlyBookmarked
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-current' : ''}`} />
          <span>Favorites Only ({bookmarkedIds.length})</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'all' 
            ? hadiths.length 
            : hadiths.filter(h => h.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => {
                playTactileClick('subtle');
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#1C4E40] text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <span>{cat === 'all' ? 'All Wisdom' : cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hadith Cards Grid (Responsive Multi-Column) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredHadiths.map(h => {
          const isPlaying = speakingId === h.id;
          const isCopied = copiedId === h.id;
          const isBookmarked = bookmarkedIds.includes(h.id);
          const isMemorized = memorizedIds.includes(h.id);

          return (
            <div
              key={h.id}
              className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                isPlaying 
                  ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/20' 
                  : isMemorized 
                    ? 'border-amber-300 bg-[#FFFDF8]' 
                    : 'border-stone-200/90'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header: Category Badge + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                      {h.category}
                    </span>
                    {h.narrator && (
                      <span className="text-[10px] text-stone-500 font-bold truncate max-w-[150px]">
                        via {h.narrator}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleBookmark(h.id)}
                      className="p-1.5 text-stone-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-stone-50"
                      title="Bookmark"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleCopy(h)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors rounded-lg hover:bg-stone-50"
                      title="Copy Hadith"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Arabic Calligraphy with Vowels */}
                <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-amber-100/80">
                  <p dir="rtl" className="font-arabic text-xl sm:text-2xl text-[#173D33] text-right leading-loose select-text font-medium">
                    {h.arabic}
                  </p>
                </div>

                {/* English Meaning */}
                <p className="text-sm text-stone-800 font-semibold leading-relaxed">
                  "{h.meaning}"
                </p>

                {/* Reflection Prompt */}
                {h.reflection && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-900 leading-snug font-medium">
                      <strong className="font-bold">Life Lesson:</strong> {h.reflection}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] font-black text-[#173D33] block truncate">
                    {h.reference}
                  </span>
                  <button
                    onClick={() => toggleMemorized(h.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-stone-400 hover:text-amber-700 transition-colors"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isMemorized ? 'text-amber-600 fill-amber-100' : ''}`} />
                    <span>{isMemorized ? 'Memorized ✓' : 'Mark Memorized'}</span>
                  </button>
                </div>

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

      {filteredHadiths.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <span className="text-4xl block">🔍</span>
          <h4 className="text-base font-bold text-stone-800">No hadiths found</h4>
          <p className="text-xs text-stone-500">Try adjusting your search query or switching categories.</p>
          <IslamicButton
            variant="jannah"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyBookmarked(false);
            }}
          >
            Reset Filters
          </IslamicButton>
        </div>
      )}
    </div>
  );
};
