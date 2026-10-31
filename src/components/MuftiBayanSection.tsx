import React, { useState } from 'react';
import { MuftiBayan } from '../types';
import { IslamicButton } from './IslamicButton';
import { 
  Play, 
  Square, 
  Volume2, 
  Bookmark, 
  Sparkles, 
  Clock, 
  User, 
  Share2, 
  Check, 
  Crown,
  Search
} from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

const MUFTI_BAYANS: MuftiBayan[] = [
  {
    id: 'menk-peace',
    speaker: 'Mufti Ismail Menk',
    title: 'Finding Deep Peace When Your Heart Is Heavy',
    category: 'Peace',
    duration: '24 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    summary: 'A heart-soothing lecture on dealing with anxiety, heartbreak, and sadness by realigning your trust in Allah’s divine decree (Tawakkul).',
    keyTakeaways: [
      'No hardship is permanent; relief is always paired with difficulty.',
      'Tahajjud prayer in the quiet night dissolves overwhelming worry.',
      'Saying Alhamdulillah in distress unlocks divine closeness.'
    ]
  },
  {
    id: 'menk-repentance',
    speaker: 'Mufti Ismail Menk',
    title: 'The Repentance That Erases Every Past Sin',
    category: 'Repentance',
    duration: '18 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80',
    summary: 'Understanding the vastness of Allah’s mercy. Why you should never let guilt keep you away from returning to your Lord.',
    keyTakeaways: [
      'Allah rejoices more over a repenting servant than one who finds lost camels in the desert.',
      'Sincere Astaghfirullah transforms bad deeds into good deeds (Quran 25:70).',
      'Never allow Shaytan to convince you that your sins are too great for Allah’s mercy.'
    ]
  },
  {
    id: 'taqi-halal',
    speaker: 'Mufti Muhammad Taqi Usmani',
    title: 'Purifying Your Wealth & The True Barakah of Halal',
    category: 'Family',
    duration: '32 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    summary: 'Renowned scholar Mufti Taqi Usmani explains how honest earnings and giving Zakat bring exponential blessings into children and household peace.',
    keyTakeaways: [
      'A small halal income carries peace; mountains of dubious wealth carry inner turmoil.',
      'Giving charity (Sadaqah) never decreases wealth; it shields against calamities.',
      'Purity of food directly impacts the acceptance of your daily prayers.'
    ]
  },
  {
    id: 'suleiman-meeting',
    speaker: 'Sheikh Omar Suleiman',
    title: 'Meeting the One You Prayed To: The Soul’s Jannah Journey',
    category: 'Jannah',
    duration: '28 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    summary: 'An evocative description of the believer’s transition, entering through the fragrant gates of Jannah, and beholding the Divine Countenance.',
    keyTakeaways: [
      'The angels greet the righteous soul with sweet perfume and words of tranquility.',
      'Every tear shed in secret for Allah will be traded for radiant crowns.',
      'The greatest blessing of Jannah is looking upon the Majesty of Allah.'
    ]
  },
  {
    id: 'jameel-mercy',
    speaker: 'Maulana Tariq Jameel',
    title: 'The Unconditional Love of Allah for His Servants',
    category: 'Repentance',
    duration: '21 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    summary: 'A heartfelt, tear-filled reminder on turning back to Allah with broken humility and experiencing the warmth of divine forgiveness.',
    keyTakeaways: [
      'Even if your sins reach the clouds of the sky, turn to Him and He will forgive without hesitation.',
      'A single sincere tear of regret extinguishes the fire of remorse.',
      'Kindness towards creation attracts the boundless mercy of the Creator.'
    ]
  },
  {
    id: 'qadhi-trials',
    speaker: 'Dr. Yasir Qadhi',
    title: 'Lessons of Sabr from the Life of Prophet Yusuf (AS)',
    category: 'Seerah',
    duration: '35 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    summary: 'How Prophet Yusuf endured betrayal, enslavement, and prison through beautiful patience (Sabr Jameel) before rising to divine honor.',
    keyTakeaways: [
      'Behind every apparent trial lies a masterplan orchestrated with infinite wisdom.',
      'True patience does not mean not crying; it means refusing to utter words of discontent.',
      'Forgiving those who harmed you opens the highest doors of spiritual elevation.'
    ]
  }
];

interface MuftiBayanSectionProps {
  isSubscribed?: boolean;
  onOpenSubscription?: () => void;
}

export const MuftiBayanSection: React.FC<MuftiBayanSectionProps> = ({
  isSubscribed = false,
  onOpenSubscription,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeBayanId, setActiveBayanId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [savedBayans, setSavedBayans] = useState<string[]>([]);

  const categories = ['All', 'Peace', 'Family', 'Repentance', 'Jannah', 'Seerah'];

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveBayanId(null);
  };

  const handleToggleBayan = (b: MuftiBayan) => {
    if (activeBayanId === b.id && isPlaying) {
      stopAudio();
      return;
    }

    stopAudio();
    setActiveBayanId(b.id);
    playTactileClick('gold');

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Audio speech synthesis is not supported on your browser.");
      return;
    }

    const narration = `Now playing lecture by ${b.speaker}. ${b.title}. ${b.summary} Key takeaways: ${b.keyTakeaways.join(". ")}`;
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Male') || v.name.includes('Natural')));
    if (deepVoice) utterance.voice = deepVoice;

    utterance.onend = () => {
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleBookmark = (id: string) => {
    setSavedBayans(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    playTactileClick('subtle');
  };

  const filteredBayans = MUFTI_BAYANS.filter(b => {
    const matchCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchSearch = `${b.title} ${b.speaker} ${b.summary}`.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#174D3D] via-[#103A2E] to-[#0A261E] rounded-3xl p-6 sm:p-8 text-white border-2 border-[#C9A24D]/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[#E7CF9B] text-xs font-black tracking-widest uppercase">
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Bayanat & Authentic Islamic Lectures</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Wisdom of the Muftis & Scholars
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Listen to life-changing reminders from Mufti Menk, Mufti Taqi Usmani, Sheikh Omar Suleiman, and Maulana Tariq Jameel. Purify your heart and find solace in times of trial.
            </p>
          </div>

          {!isSubscribed && onOpenSubscription && (
            <IslamicButton
              variant="gold"
              size="md"
              arabicFlourish={true}
              shimmer={true}
              onClick={onOpenSubscription}
              icon={<Crown className="w-4 h-4 fill-current" />}
            >
              Unlock All 100+ Masterclasses
            </IslamicButton>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                playTactileClick('subtle');
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1C4E40] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scholar or topic..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
          />
        </div>
      </div>

      {/* Bayans Grid (Responsive Multi-Column) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBayans.map(b => {
          const isCurrentActive = activeBayanId === b.id && isPlaying;
          const isSaved = savedBayans.includes(b.id);

          return (
            <div
              key={b.id}
              className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                isCurrentActive
                  ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-400/20'
                  : 'bg-white border-stone-200/80'
              }`}
            >
              <div className="p-5 space-y-3">
                {/* Speaker & Category */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                    {b.category}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-stone-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{b.duration}</span>
                    <button
                      onClick={() => toggleBookmark(b.id)}
                      className="p-1 hover:text-stone-600 transition-colors ml-1"
                      title="Bookmark Lecture"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Speaker Name */}
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#173D33]">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>{b.speaker}</span>
                </div>

                {/* Title */}
                <h3 className="text-base font-black text-[#0E2B24] leading-snug">
                  {b.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {b.summary}
                </p>

                {/* Key Takeaways */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1.5">
                  <span className="text-[9px] font-black text-[#9A7432] tracking-widest uppercase block">
                    Key Spiritual Lessons
                  </span>
                  {b.keyTakeaways.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                      <span className="text-amber-600 font-bold">•</span>
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-stone-500">
                  {isCurrentActive ? '🔊 Playing Audio Bayan' : 'Authentic Discourse'}
                </span>

                <IslamicButton
                  variant={isCurrentActive ? 'ruby' : 'jannah'}
                  size="sm"
                  arabicFlourish={false}
                  icon={isCurrentActive ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  onClick={() => handleToggleBayan(b)}
                >
                  {isCurrentActive ? 'Stop' : 'Listen Bayan'}
                </IslamicButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
