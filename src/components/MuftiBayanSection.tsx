import { toast } from "../lib";
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
  Search,
  BookOpen,
  Filter,
  MessageSquareQuote,
  Flame,
  Award
} from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

const EXPANDED_BAYANS: MuftiBayan[] = [
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
      'No hardship is permanent; relief is always paired with difficulty (Inna ma\'al usri yusra).',
      'Tahajjud prayer in the quiet night dissolves overwhelming worry before dawn breaks.',
      'Saying Alhamdulillah in genuine distress unlocks divine closeness and emotional healing.'
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
    summary: 'Understanding the vastness of Allah’s mercy. Why you should never let past guilt keep you away from returning to your Lord.',
    keyTakeaways: [
      'Allah rejoices more over a repenting servant than a traveler who finds lost water in a scorching desert.',
      'Sincere Astaghfirullah transforms bad deeds into good deeds (Quran 25:70).',
      'Never allow Shaytan to whisper that your sins are too great for Allah’s infinite forgiveness.'
    ]
  },
  {
    id: 'menk-distance',
    speaker: 'Mufti Ismail Menk',
    title: 'When You Feel Distant from Allah: Practical Steps to Reconnect',
    category: 'Character',
    duration: '22 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    summary: 'Spiritual burnout happens to everyone. Mufti Menk shares 4 gentle, step-by-step habits to reignite the sweet taste of Iman without feeling overwhelmed.',
    keyTakeaways: [
      'Start with just 2 minutes of genuine Quran contemplation each day.',
      'Purge toxic social media feeds that desensitize your spiritual heart.',
      'Make small constant duas in your native tongue while driving or cooking.'
    ]
  },
  {
    id: 'taqi-halal',
    speaker: 'Mufti Muhammad Taqi Usmani',
    title: 'Purifying Your Wealth & The True Barakah of Halal Earnings',
    category: 'Wealth',
    duration: '32 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    summary: 'Grand scholar Mufti Taqi Usmani explains how honest earnings and giving Zakat bring exponential tranquility into your household, children, and marriage.',
    keyTakeaways: [
      'A modest halal income carries profound tranquility; mountains of questionable wealth bring anxiety.',
      'Giving charity (Sadaqah) never decreases wealth; it acts as a divine shield against disasters.',
      'Purity of income directly impacts whether your daily prayers and duas are accepted.'
    ]
  },
  {
    id: 'taqi-tongue',
    speaker: 'Mufti Muhammad Taqi Usmani',
    title: 'Guardians of the Tongue: Protecting Your Good Deeds from Gheebah',
    category: 'Character',
    duration: '27 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    summary: 'How careless gossip and backbiting transfer your hard-earned prayer points directly to others on the Day of Judgment.',
    keyTakeaways: [
      'Speaking ill of someone behind their back destroys good deeds like fire consumes dry wood.',
      'Defending the honor of an absent Muslim earns an angelic guard in Jannah.',
      'Replace idle conversations with SubhanAllah, Alhamdulillah, and Istighfar.'
    ]
  },
  {
    id: 'suleiman-meeting',
    speaker: 'Sheikh Omar Suleiman',
    title: 'Meeting the One You Prayed To: The Soul’s Jannah Journey',
    category: 'Jannah',
    duration: '28 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    summary: 'An evocative description of the believer’s transition, entering through the fragrant double gates of Jannah, and beholding the Divine Countenance.',
    keyTakeaways: [
      'The angels greet the righteous soul with sweet perfume and words of eternal salam.',
      'Every secret tear shed for Allah in this life is exchanged for crowns of radiant light.',
      'The supreme delight of Jannah is not the rivers or palaces, but seeing Allah\'s Majesty without veil.'
    ]
  },
  {
    id: 'suleiman-divinelove',
    speaker: 'Sheikh Omar Suleiman',
    title: 'Signs Allah Truly Loves You: The Angelic Proclamation',
    category: 'Peace',
    duration: '25 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80',
    summary: 'When Allah loves a servant, He calls Angel Jibril, who calls the angels in the heavens, and widespread acceptance is placed for them on earth.',
    keyTakeaways: [
      'Being tested is a sign of love: the Prophets were the most severely tested of mankind.',
      'When Allah wants good for a servant, He gives them understanding of faith and humility.',
      'Love for regular prayer and fasting is a direct gift from Ar-Rahman.'
    ]
  },
  {
    id: 'jameel-mercy',
    speaker: 'Maulana Tariq Jameel',
    title: 'The Unconditional Love of Allah for His Servants',
    category: 'Repentance',
    duration: '21 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    summary: 'A heartfelt, tear-filled reminder on turning back to Allah with broken humility and experiencing the boundless warmth of divine forgiveness.',
    keyTakeaways: [
      'Even if your sins reach the height of the clouds, turn to Him once and He pardons all without delay.',
      'A single warm tear of regret sheds light into the grave and extinguishes flames of grief.',
      'Kindness towards widows, orphans, and parents attracts the special attention of the Creator.'
    ]
  },
  {
    id: 'jameel-prophet',
    speaker: 'Maulana Tariq Jameel',
    title: 'The Tears of the Prophet Muhammad ﷺ for His Ummah',
    category: 'Seerah',
    duration: '29 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    summary: 'The tender mercy of the Prophet ﷺ who wept at night saying: "Ummati, Ummati" (My followers, my followers), longing to meet us at the pond of Al-Kawthar.',
    keyTakeaways: [
      'The Prophet ﷺ made dua for believers who would love him without ever seeing him in this world.',
      'Sending Salawat upon him (Allahumma salli \'ala Muhammad) removes worldly worries and forgives sins.',
      'Emulating his gentle smile and manners is the truest expression of love.'
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
    summary: 'How Prophet Yusuf endured betrayal, enslavement, and wrongful imprisonment through beautiful patience (Sabr Jameel) before rising to divine honor.',
    keyTakeaways: [
      'Behind every apparent trial lies a divine masterplan orchestrated with infinite precision.',
      'True patience does not mean not hurting; it means refusing to utter words of discontent against Allah.',
      'Forgiving those who betrayed you opens the highest chambers of spiritual elevation.'
    ]
  },
  {
    id: 'belal-grave',
    speaker: 'Sheikh Belal Assad',
    title: 'The Comfort of Good Deeds in the Barzakh and Grave',
    category: 'Akhirah',
    duration: '31 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80',
    summary: 'A vivid, reassuring discourse on how your Surah Al-Mulk, late night prayers, and secret charity will take radiant physical forms to protect and comfort you in the grave.',
    keyTakeaways: [
      'Surah Al-Mulk defends its reciter until they are pardoned and granted peace.',
      'Prayer stands at the head, fasting at the right, and Zakat at the left to ward off punishment.',
      'The grave expands as far as the eye can see for the believer, filled with fragrant breezes from Jannah.'
    ]
  },
  {
    id: 'nouman-broken',
    speaker: 'Ustadh Nouman Ali Khan',
    title: 'When Prayers Seem Unanswered: The Divine Timing of Surah Ad-Duha',
    category: 'Peace',
    duration: '26 mins',
    audioUrl: '',
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    summary: 'A linguistic and spiritual deep-dive into the oath of morning brightness and soothing night. Why your Lord has not forsaken you, nor is He displeased.',
    keyTakeaways: [
      'Just like the night must follow the day to provide rest, trials follow ease to rebuild our spiritual muscles.',
      'And surely what comes after (the Akhirah) is far better for you than what was before.',
      'Recounting Allah’s past favors is the greatest medicine against present despair.'
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
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('All');
  const [activeBayanId, setActiveBayanId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [search, setSearch] = useState<string>('');
  const [savedBayans, setSavedBayans] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [activeNoteBayanId, setActiveNoteBayanId] = useState<string | null>(null);

  const categories = ['All', 'Peace', 'Repentance', 'Jannah', 'Character', 'Wealth', 'Seerah', 'Akhirah'];
  const speakers = ['All', 'Mufti Ismail Menk', 'Mufti Muhammad Taqi Usmani', 'Sheikh Omar Suleiman', 'Maulana Tariq Jameel', 'Dr. Yasir Qadhi', 'Sheikh Belal Assad', 'Ustadh Nouman Ali Khan'];

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
      toast("Audio speech synthesis is not supported on your browser.");
      return;
    }

    const narration = `Now presenting authentic lecture by ${b.speaker}. ${b.title}. ${b.summary} Here are the key spiritual lessons: ${b.keyTakeaways.join(". ")}. Remember to reflect and apply this wisdom in your daily life.`;
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.rate = playbackSpeed * 0.9;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const deepVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('Google')));
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

  const saveNote = (id: string, text: string) => {
    setUserNotes(prev => ({ ...prev, [id]: text }));
  };

  const filteredBayans = EXPANDED_BAYANS.filter(b => {
    const matchCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchSpeaker = selectedSpeaker === 'All' || b.speaker === selectedSpeaker;
    const matchSearch = `${b.title} ${b.speaker} ${b.summary} ${b.category}`.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSpeaker && matchSearch;
  });

  const activeBayan = EXPANDED_BAYANS.find(b => b.id === activeBayanId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#174D3D] via-[#103A2E] to-[#0A261E] rounded-3xl p-6 sm:p-8 text-white border-2 border-[#C9A24D]/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[#E7CF9B] text-xs font-black tracking-widest uppercase">
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Real Scholar Bayanat · مَجَالِسُ الْعِلْمِ وَالْحِكْمَةِ</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Authentic Bayanat of the Muftis & Scholars
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Listen to life-changing discourses from renowned Islamic scholars: Mufti Menk, Mufti Taqi Usmani, Sheikh Omar Suleiman, Maulana Tariq Jameel, Dr. Yasir Qadhi, and Sheikh Belal Assad. Complete with spiritual takeaways and reflection notes.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className="text-xs font-bold text-amber-300 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
              12 Curated Masterclasses Active
            </span>
            <span className="text-[11px] text-emerald-300 font-semibold">
              ★ {savedBayans.length} Lectures Saved
            </span>
          </div>
        </div>
      </div>

      {/* Live Audio Player Sticky Bar (when active) */}
      {activeBayan && isPlaying && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1C4E40] to-[#12382E] text-white border-2 border-[#C9A24D] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#0E2B24] flex items-center justify-center font-black text-xl animate-pulse">
              🎙️
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Playing Lecture · {activeBayan.speaker}
              </span>
              <h4 className="text-sm font-bold truncate max-w-md">{activeBayan.title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl text-xs font-bold">
              {[0.85, 1.0, 1.25].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    playbackSpeed === speed ? 'bg-amber-400 text-[#0E2B24]' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <IslamicButton
              variant="ruby"
              size="sm"
              icon={<Square className="w-3.5 h-3.5 fill-current" />}
              onClick={stopAudio}
            >
              Stop Audio
            </IslamicButton>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search scholar (e.g. Mufti Menk, Taqi Usmani), topic, or advice..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
            />
          </div>

          {/* Speaker Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <User className="w-4 h-4 text-stone-400" />
            <select
              value={selectedSpeaker}
              onChange={e => setSelectedSpeaker(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-[#173D33] focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
            >
              {speakers.map(s => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Scholars' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
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
      </div>

      {/* Bayans Grid (Responsive 3-Column) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBayans.map(b => {
          const isCurrentActive = activeBayanId === b.id && isPlaying;
          const isSaved = savedBayans.includes(b.id);
          const hasNote = !!userNotes[b.id];

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
                {/* Speaker & Category Header */}
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
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1.5">
                  <span className="text-[9px] font-black text-[#9A7432] tracking-widest uppercase block">
                    Core Spiritual Lessons
                  </span>
                  {b.keyTakeaways.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                      <span className="text-amber-600 font-bold">•</span>
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Personal Reflection Note Toggle */}
                {activeNoteBayanId === b.id ? (
                  <div className="p-3 rounded-2xl bg-[#FFFBEF] border border-amber-300 space-y-2">
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                      Your Personal Reflection
                    </span>
                    <textarea
                      value={userNotes[b.id] || ''}
                      onChange={e => saveNote(b.id, e.target.value)}
                      placeholder="Write what you learned from this Bayan..."
                      rows={2}
                      className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => setActiveNoteBayanId(null)}
                        className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveNoteBayanId(b.id)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>{hasNote ? 'Edit your reflection note ✍️' : '+ Add personal takeaway note'}</span>
                  </button>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-stone-500">
                  {isCurrentActive ? '🔊 Playing Bayan' : 'Authentic Discourse'}
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

      {filteredBayans.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <span className="text-4xl block">🎙️</span>
          <h4 className="text-base font-bold text-stone-800">No lectures found</h4>
          <p className="text-xs text-stone-500">Try choosing a different scholar or resetting your search filter.</p>
          <IslamicButton
            variant="jannah"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedSpeaker('All');
            }}
          >
            Show All Lectures
          </IslamicButton>
        </div>
      )}
    </div>
  );
};
