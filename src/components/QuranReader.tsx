import React, { useState, useEffect, useRef } from 'react';
import { Ayah, Surah } from '../types';
import { IslamicButton } from './IslamicButton';
import { Play, Square, Bookmark, ChevronLeft, ChevronRight, Search, Volume2, Sparkles } from 'lucide-react';

interface QuranReaderProps {
  bookmarks: number[];
  onToggleBookmark: (ayahNumber: number) => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({ bookmarks, onToggleBookmark }) => {
  const [page, setPage] = useState<number>(1);
  const [pageData, setPageData] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [selectedTranslation, setSelectedTranslation] = useState<string>('en.sahih');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Ayah[]>([]);

  // Load surah directory
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(res => res.json())
      .then(json => {
        if (json.code === 200) setSurahs(json.data);
      })
      .catch(() => {});
  }, []);

  // Stop active recitation
  const stopAudio = () => {
    queueRef.current = [];
    setIsPlayingAll(false);
    setPlayingAyah(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  // Play audio for an Ayah
  const playAyahAudio = (ayah: Ayah, queue: Ayah[] = []) => {
    stopAudio();
    setPlayingAyah(ayah.number);
    queueRef.current = queue;

    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      const [next, ...remaining] = queueRef.current;
      if (next) {
        playAyahAudio(next, remaining);
      } else {
        setPlayingAyah(null);
        setIsPlayingAll(false);
      }
    };

    audio.onerror = () => {
      setPlayingAyah(null);
      setIsPlayingAll(false);
    };

    audio.play().catch(() => {
      setPlayingAyah(null);
      setIsPlayingAll(false);
    });
  };

  // Load page content
  const loadPageContent = async (pageNum: number) => {
    const safePage = Math.max(1, Math.min(604, pageNum));
    setIsLoading(true);
    setErrorMsg('');
    stopAudio();

    try {
      const [arabicRes, transRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/page/${safePage}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/page/${safePage}/${selectedTranslation}`),
      ]);

      if (!arabicRes.ok || !transRes.ok) throw new Error("Could not reach Quran service.");
      const arabicJson = await arabicRes.json();
      const transJson = await transRes.json();

      if (arabicJson.code !== 200 || transJson.code !== 200) {
        throw new Error("Page data temporarily unavailable.");
      }

      const transMap: Record<number, string> = {};
      (transJson.data.ayahs as Array<{ number: number; text: string }>).forEach(a => {
        transMap[a.number] = a.text;
      });

      setPageData(arabicJson.data.ayahs);
      setTranslations(transMap);
      setPage(safePage);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error loading Quran page.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageContent(page);
    return () => {
      stopAudio();
    };
  }, [page, selectedTranslation]);

  const handlePlayPage = () => {
    if (isPlayingAll || playingAyah !== null) {
      stopAudio();
      return;
    }
    if (!pageData.length) return;
    setIsPlayingAll(true);
    const [first, ...rest] = pageData;
    playAyahAudio(first, rest);
  };

  const handleSurahSelect = async (surahNum: number) => {
    setShowPicker(false);
    setIsLoading(true);
    setErrorMsg('');
    stopAudio();

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`);
      const json = await res.json();
      if (json.code === 200 && json.data.ayahs.length > 0) {
        const targetPage = json.data.ayahs[0].page;
        loadPageContent(targetPage);
      }
    } catch {
      setErrorMsg("Unable to load selected Surah.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Quran Header Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Surah Dropdown Trigger */}
        <div className="flex-1 flex items-center gap-2">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="text-[9px] font-bold tracking-widest text-stone-400 uppercase block">Surah</span>
              <span className="text-sm font-extrabold text-[#173D33] truncate">
                {pageData[0]?.surah?.englishName || "Choose Surah"} ⌄
              </span>
            </div>
            <span className="text-sm font-arabic text-amber-700">
              {pageData[0]?.surah?.name || ""}
            </span>
          </button>

          {/* Translation selector */}
          <button
            onClick={() => setSelectedTranslation(curr => curr === 'en.sahih' ? 'ur.jalandhry' : 'en.sahih')}
            className="px-3.5 py-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left transition-colors shrink-0"
          >
            <span className="text-[9px] font-bold tracking-widest text-stone-400 uppercase block">Translation</span>
            <span className="text-xs font-bold text-[#173D33]">
              {selectedTranslation === 'en.sahih' ? 'English (Sahih)' : 'Urdu (Jalandhry)'} ↻
            </span>
          </button>
        </div>

        {/* Full Page Audio Reciter with modified button */}
        <IslamicButton
          variant={isPlayingAll ? 'ruby' : 'jannah'}
          size="md"
          arabicFlourish={true}
          shimmer={!isPlayingAll}
          icon={isPlayingAll ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          onClick={handlePlayPage}
        >
          {isPlayingAll ? 'Stop Recitation' : 'Play Full Page (Alafasy)'}
        </IslamicButton>
      </div>

      {/* Surah Picker Modal / Dropdown */}
      {showPicker && (
        <div className="bg-white rounded-3xl p-4 border border-stone-300 shadow-xl space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Surah name or number..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
            {surahs
              .filter(s => `${s.englishName} ${s.name} ${s.number}`.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(s => (
                <button
                  key={s.number}
                  onClick={() => handleSurahSelect(s.number)}
                  className="w-full py-2 px-2 hover:bg-stone-50 flex items-center justify-between text-left text-xs transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-amber-700 w-6">
                      {String(s.number).padStart(3, '0')}
                    </span>
                    <div>
                      <p className="font-bold text-[#173D33]">{s.englishName}</p>
                      <p className="text-[10px] text-stone-400">{s.englishNameTranslation} · {s.numberOfAyahs} verses</p>
                    </div>
                  </div>
                  <span className="font-arabic text-base text-stone-800">{s.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Page Navigation Toolbar */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-extrabold text-[#173D33]">
          Page {page} <span className="text-stone-400 font-normal">/ 604</span>
        </span>

        <div className="flex items-center gap-2">
          <IslamicButton
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => loadPageContent(page - 1)}
            icon={<ChevronLeft className="w-3.5 h-3.5" />}
          >
            Previous
          </IslamicButton>

          <IslamicButton
            variant="secondary"
            size="sm"
            disabled={page >= 604}
            onClick={() => loadPageContent(page + 1)}
            icon={<ChevronRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            Next
          </IslamicButton>
        </div>
      </div>

      {/* Mushaf Page Frame with Gold Border & Inner Margins */}
      <div className="bg-[#FFFDF7] rounded-3xl p-4 sm:p-8 border-2 border-[#C9A24D]/60 shadow-lg relative overflow-hidden">
        
        {/* Subtle decorative gold inner rim */}
        <div className="border border-[#C9A24D]/30 rounded-2xl p-4 sm:p-6 space-y-6">
          
          {/* Bismillah Header */}
          <div className="text-center pb-4 border-b border-amber-200/60">
            <p className="font-arabic text-2xl sm:text-3xl text-amber-800 drop-shadow-xs">
              ۞ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۞
            </p>
          </div>

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#C9A24D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-semibold tracking-wide">Loading Quranic text...</p>
            </div>
          ) : errorMsg ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
              <IslamicButton variant="secondary" size="sm" onClick={() => loadPageContent(page)}>
                Try Again
              </IslamicButton>
            </div>
          ) : (
            /* Ayahs List */
            <div className="space-y-6">
              {pageData.map(a => {
                const isPlaying = playingAyah === a.number;
                const isSaved = bookmarks.includes(a.number);

                return (
                  <div
                    key={a.number}
                    className={`p-4 rounded-2xl transition-all duration-200 ${
                      isPlaying
                        ? 'bg-emerald-50/80 border border-emerald-300 shadow-xs'
                        : 'hover:bg-amber-50/40'
                    }`}
                  >
                    {/* Arabic Verse Text */}
                    <p
                      dir="rtl"
                      className="font-arabic text-2xl sm:text-3xl text-[#173D33] text-right leading-[2.2] tracking-wide select-text"
                    >
                      {a.text}{' '}
                      <span className="inline-block text-amber-700 text-xl font-bold px-1 select-none">
                        ۝{a.numberInSurah}
                      </span>
                    </p>

                    {/* Translation */}
                    <p className="text-xs sm:text-sm text-stone-600 font-medium mt-3 leading-relaxed">
                      {translations[a.number] || ''}
                    </p>

                    {/* Ayah Actions (Modified Inner Design Buttons) */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                      <IslamicButton
                        variant={isPlaying ? 'ruby' : 'secondary'}
                        size="sm"
                        icon={isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                        onClick={() => {
                          if (isPlaying) stopAudio();
                          else playAyahAudio(a, []);
                        }}
                      >
                        {isPlaying ? 'Stop' : 'Recite'}
                      </IslamicButton>

                      <IslamicButton
                        variant={isSaved ? 'gold' : 'secondary'}
                        size="sm"
                        icon={<Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />}
                        onClick={() => onToggleBookmark(a.number)}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </IslamicButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Mushaf Ornament */}
          <div className="text-center pt-4 border-t border-amber-200/60 text-[#C9A24D] text-xs font-bold tracking-widest uppercase">
            ✧ Page {page} ✧
          </div>
        </div>
      </div>
    </div>
  );
};
