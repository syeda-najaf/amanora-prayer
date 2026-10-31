import React, { useState, useEffect } from 'react';
import { Tab, Coordinates, AppSettings, ShortStory, HadithItem, PrayerName, UserSubscriptionState, UserProfile } from './types';
import { JannahGate } from './components/JannahGate';
import { IslamicButton } from './components/IslamicButton';
import { AbdulBariReels } from './components/AbdulBariReels';
import { AbdulBariCartoon } from './components/AbdulBariCartoon';
import { MuftiBayanSection } from './components/MuftiBayanSection';
import { IslamicPlusFeatures } from './components/IslamicPlusFeatures';
import { LoginModal } from './components/LoginModal';
import { ButtonShowcase } from './components/ButtonShowcase';
import { QuranReader } from './components/QuranReader';
import { PrayerSection } from './components/PrayerSection';
import { HadithSection } from './components/HadithSection';
import { WorshipSection } from './components/WorshipSection';
import { LearnSection } from './components/LearnSection';
import { MySanctuarySection } from './components/MySanctuarySection';
import { SubscriptionSection } from './components/SubscriptionSection';
import { 
  Sparkles, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Circle, 
  Crown, 
  DoorOpen, 
  MapPin, 
  Clock, 
  HeartHandshake,
  Mic,
  Compass,
  User,
  Flame,
  Award
} from 'lucide-react';
import { playTactileClick } from './utils/audioHaptics';

const GARDEN_IMAGE = "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1400&q=85";
const DEFAULT_COORDS: Coordinates = { latitude: 21.4225, longitude: 39.8262, city: "Makkah Al-Mukarramah" };
const DEFAULT_SETTINGS: AppSettings = { method: "MuslimWorldLeague", reciter: "ar.alafasy" };
const DEMO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const SHORTS: ShortStory[] = [
  {
    id: 1,
    tag: "PATIENCE",
    title: "Patience Always Pays Off",
    topic: "Planting a tiny seed and watering it with steadfast patience",
    video: DEMO_VIDEO,
    steps: [
      "A young boy planted a tiny seed in the rich soil 🌱",
      "He watered it every single day, but nothing seemed to happen ⏳",
      "He felt like giving up... but he remembered Allah loves the patient",
      "Days later, the very first green leaf appeared 🌿",
      "In time, that little seed grew into a tall, fruitful shady tree 🌳"
    ],
    lesson: "Allah is with those who are patient.",
    reference: "Quran 2:153",
    narration: "A young boy planted a tiny seed in the soil. He watered it every morning with devotion, but days passed and nothing appeared. He felt discouraged, but remembered that Allah loves those who persevere. Soon, a vibrant green leaf pushed through the earth, blossoming into a mighty tree. Truly, patience always brings blessed fruit.",
    actionType: "plant_seed",
    characterEmotion: "patient",
    keyMoral: "Sabr (patience) is a radiant light that transforms humble beginnings into great blessings."
  },
  {
    id: 2,
    tag: "HONESTY",
    title: "Be Honest, Find Peace",
    topic: "Returning a lost leather wallet when no one is watching",
    video: DEMO_VIDEO,
    steps: [
      "A boy found a lost wallet full of coins on the pathway 👛",
      "Nobody was looking around him 🤫",
      "He remembered that Allah sees and knows everything 👁️",
      "He walked straight to the market and returned it to its owner",
      "The grateful elder made dua for him, and his heart filled with serenity 😊"
    ],
    lesson: "Be honest and truthful, even when nobody is watching.",
    reference: "Quran 9:119",
    narration: "While walking along the quiet road, a boy found a leather wallet. No one was watching, but in his heart he knew that Allah is the All-Seeing. He sought out the rightful owner and returned it completely. The owner prayed for his barakah, and a deep peace settled in his soul. Honesty brings genuine tranquility.",
    actionType: "return_wallet",
    characterEmotion: "honest",
    keyMoral: "Amanah (trustworthiness) purifies the heart and earns divine protection."
  },
  {
    id: 3,
    tag: "GRATITUDE",
    title: "Gratitude Grows Blessings",
    topic: "Sharing a single loaf of bread and saying Alhamdulillah",
    video: DEMO_VIDEO,
    steps: [
      "A girl had only one small piece of bread for the evening 🍞",
      "At first, she wondered if it was too little to be satisfied",
      "Then she remembered those who have neither bread nor clean water",
      "She smiled warmly, raised her hands, and said Alhamdulillah 🤲",
      "Her heart felt rich, and the simple meal tasted like a feast ✨"
    ],
    lesson: "If you are grateful, I will surely increase you in favor.",
    reference: "Quran 14:7",
    narration: "A girl had only one crust of bread. Instead of despair, she remembered families with nothing at all. She said Alhamdulillah from the depths of her heart, broke the bread in peace, and shared half with a traveler. True richness is the richness of the grateful soul.",
    actionType: "share_bread",
    characterEmotion: "grateful",
    keyMoral: "Gratitude turns what we have into more than enough."
  },
  {
    id: 4,
    tag: "DUA",
    title: "The Power of a Sincere Dua",
    topic: "Lifting trembling hands in the quiet silence of late night",
    video: DEMO_VIDEO,
    steps: [
      "The stars shone brightly in the quiet midnight sky 🌌",
      "A child woke up feeling anxious and unsure about tomorrow",
      "He performed gentle wudhu and raised his small hands in dua 🤲",
      "He poured out every fear and secret sorrow to Allah",
      "A soothing coolness wrapped around his chest, and he slept in peace 🕊️"
    ],
    lesson: "Call upon Me; I will answer you.",
    reference: "Quran 40:60",
    narration: "In the quiet stillness of the late night, a heart felt heavy with worries. Instead of tossing in fear, the child made wudhu and whispered a sincere prayer to Allah. Allah hears the unspoken whisper of every soul. Comfort descended upon his heart like morning dew.",
    actionType: "dua_night",
    characterEmotion: "humble",
    keyMoral: "Dua is the believer's shield and the direct bridge to divine tranquility."
  },
  {
    id: 5,
    tag: "CLEANLINESS",
    title: "Cleanliness Brings Radiance",
    topic: "Clearing thorns and debris from a busy public path",
    video: DEMO_VIDEO,
    steps: [
      "Sharp thorns and stones were lying across the pathway ⚠️",
      "Many travelers were walking hurriedly without noticing",
      "The young boy stopped his game and bent down to clear them all 🧹",
      "He remembered the Prophet taught that removing harm is a branch of faith",
      "He wiped his hands clean, feeling the radiant pleasure of Allah ⭐"
    ],
    lesson: "Purity and cleanliness are half of faith.",
    reference: "Sahih Muslim 223",
    narration: "Seeing harmful thorns on the village road, the boy did not pass by indifferently. He stopped, carefully cleared every sharp stone, and smiled knowing the Prophet Muhammad taught that removing harm from the path is an act of charity and faith.",
    actionType: "gentle_words",
    characterEmotion: "gentle",
    keyMoral: "Small selfless acts of keeping the world pure earn immense reward in Jannah."
  }
];

const DAILY_GOOD = [
  { text: "Smile warmly at someone you meet today — it is Sadaqah (charity).", ref: "Jami at-Tirmidhi 1956" },
  { text: "Recite Ayat al-Kursi after your mandatory prayer for protection until the next.", ref: "Sunan an-Nasa'i" },
  { text: "Say 'SubhanAllah wa bihamdihi' 100 times to have your sins pardoned.", ref: "Sahih al-Bukhari 6405" },
  { text: "Feed an animal or pour water for a bird to earn immense divine reward.", ref: "Sahih al-Bukhari 2466" },
  { text: "Call or message a family member today to strengthen ties of kinship.", ref: "Sahih al-Bukhari 5986" },
];

const HADITHS: HadithItem[] = [
  { id: 1, category: "Kindness", arabic: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ", meaning: "Whoever does not show mercy will not be shown mercy.", reference: "Sahih al-Bukhari 6013" },
  { id: 2, category: "Good character", arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", meaning: "A good word is charity.", reference: "Sahih al-Bukhari 2989" },
  { id: 3, category: "Gratitude", arabic: "مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ", meaning: "Whoever does not thank people has not thanked Allah.", reference: "Jami at-Tirmidhi 1954" },
  { id: 4, category: "Anger", arabic: "لَا تَغْضَبْ", meaning: "Do not become angry.", reference: "Sahih al-Bukhari 6116" },
  { id: 5, category: "Intentions", arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", meaning: "Actions are judged by intentions.", reference: "Sahih al-Bukhari 1" },
];

const DEFAULT_SAVED_PROFILES: UserProfile[] = [
  {
    id: 'user_fatima',
    name: 'Sister Fatima',
    email: 'fatima@jannah.app',
    pin: '1234',
    avatar: '🧕',
    role: 'Parent / Guide',
    dailyGoal: '5 Daily Prayers & Surah Al-Mulk',
    streakDays: 7,
    goodDeedPoints: 340,
    tasbihCount: 33,
    bookmarks: [1, 255],
    journalText: 'Grateful for morning serenity and peaceful Fajr wudhu.',
    isLoggedIn: true,
    joinedDate: 'Shawwal 1447',
  },
  {
    id: 'user_abdul',
    name: 'Abdul Bari',
    email: 'abdulbari@jannah.app',
    pin: '1234',
    avatar: '🧒',
    role: 'Young Believer',
    dailyGoal: 'Water seeds with patience and smile at elders',
    streakDays: 14,
    goodDeedPoints: 520,
    tasbihCount: 99,
    bookmarks: [1, 112, 113, 114],
    journalText: 'Helped mom in the kitchen and cleared thorns from the pathway.',
    isLoggedIn: true,
    joinedDate: 'Ramadan 1447',
  },
  {
    id: 'user_tariq',
    name: 'Brother Tariq',
    email: 'tariq@jannah.app',
    pin: '1234',
    avatar: '👳',
    role: 'Student of Ilm',
    dailyGoal: 'Listen to Mufti Menk Bayan & Pray Tahajjud',
    streakDays: 21,
    goodDeedPoints: 680,
    tasbihCount: 100,
    bookmarks: [36, 67],
    journalText: 'Studied Sahih Bukhari Hadith on sincerity of intention.',
    isLoggedIn: true,
    joinedDate: 'Sha’ban 1447',
  }
];

export default function App() {
  const [gateVisible, setGateVisible] = useState<boolean>(true);
  const [tab, setTab] = useState<Tab>("Home");
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COORDS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [lights, setLights] = useState<Record<string, boolean>>({});
  const [tasbih, setTasbih] = useState<number>(33);
  const [bookmarks, setBookmarks] = useState<number[]>([1, 255]);
  const [journal, setJournal] = useState<string>("Grateful for morning serenity and peaceful Fajr wudhu.");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  
  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>(DEFAULT_SAVED_PROFILES);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_SAVED_PROFILES[0]);

  const [subscription, setSubscription] = useState<UserSubscriptionState>({
    isSubscribed: false,
    planId: 'free',
    sponsoredAccountsCount: 0,
  });

  const dailyBaat = DAILY_GOOD[new Date().getDate() % DAILY_GOOD.length];

  // Load persistent storage
  useEffect(() => {
    try {
      const savedAccountsStr = localStorage.getItem('amanora_saved_profiles');
      let accountsList = DEFAULT_SAVED_PROFILES;
      if (savedAccountsStr) {
        try {
          const parsed = JSON.parse(savedAccountsStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            accountsList = parsed;
            setSavedProfiles(parsed);
          }
        } catch {}
      }

      const activeUserId = localStorage.getItem('amanora_active_user_id');
      const activeUser = accountsList.find(a => a.id === activeUserId) || accountsList[0];
      setUserProfile(activeUser);
      setTasbih(activeUser.tasbihCount || 0);
      setBookmarks(activeUser.bookmarks || [1]);
      setJournal(activeUser.journalText || '');

      const savedLights = localStorage.getItem('amanora_lights');
      if (savedLights) {
        const parsed = JSON.parse(savedLights);
        if (parsed.date === new Date().toDateString()) {
          setLights(parsed.value);
        }
      }

      const savedSub = localStorage.getItem('amanora_subscription');
      if (savedSub) setSubscription(JSON.parse(savedSub));

      const gateOpened = sessionStorage.getItem('amanora_gate_opened');
      if (gateOpened === 'true') {
        setGateVisible(false);
      }
    } catch {}
  }, []);

  const handleEnterSanctuary = () => {
    setGateVisible(false);
    try {
      sessionStorage.setItem('amanora_gate_opened', 'true');
    } catch {}
  };

  const persistProfileChange = (updated: UserProfile) => {
    setUserProfile(updated);
    const updatedList = savedProfiles.map(p => p.id === updated.id ? updated : p);
    setSavedProfiles(updatedList);
    try {
      localStorage.setItem('amanora_saved_profiles', JSON.stringify(updatedList));
      localStorage.setItem('amanora_active_user_id', updated.id);
    } catch {}
  };

  const handleSelectProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    setTasbih(profile.tasbihCount || 0);
    setBookmarks(profile.bookmarks || [1]);
    setJournal(profile.journalText || '');
    try {
      localStorage.setItem('amanora_active_user_id', profile.id);
    } catch {}
  };

  const handleCreateProfile = (newProfile: UserProfile) => {
    const nextList = [...savedProfiles, newProfile];
    setSavedProfiles(nextList);
    setUserProfile(newProfile);
    setTasbih(0);
    setBookmarks([1]);
    setJournal('');
    try {
      localStorage.setItem('amanora_saved_profiles', JSON.stringify(nextList));
      localStorage.setItem('amanora_active_user_id', newProfile.id);
    } catch {}
  };

  const locateUser = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert("Location is not available on this device.");
      return;
    }
    setIsLocating(true);
    playTactileClick('subtle');

    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          city: "Your Location",
        });
        setIsLocating(false);
        playTactileClick('gold');
      },
      () => {
        setIsLocating(false);
        alert("Please allow location access to calculate prayer times.");
      },
      { timeout: 8000 }
    );
  };

  const toggleLight = (p: PrayerName) => {
    const next = { ...lights, [p]: !lights[p] };
    setLights(next);
    try {
      localStorage.setItem('amanora_lights', JSON.stringify({
        date: new Date().toDateString(),
        value: next,
      }));
    } catch {}
  };

  const incrementTasbih = () => {
    const next = tasbih + 1;
    setTasbih(next);
    persistProfileChange({
      ...userProfile,
      tasbihCount: next,
      goodDeedPoints: userProfile.goodDeedPoints + 1,
    });
  };

  const resetTasbih = () => {
    setTasbih(0);
    persistProfileChange({
      ...userProfile,
      tasbihCount: 0,
    });
  };

  const toggleBookmark = (num: number) => {
    const next = bookmarks.includes(num) ? bookmarks.filter(n => n !== num) : [...bookmarks, num];
    setBookmarks(next);
    persistProfileChange({
      ...userProfile,
      bookmarks: next,
    });
    playTactileClick('gold');
  };

  const saveJournalText = (txt: string) => {
    setJournal(txt);
    persistProfileChange({
      ...userProfile,
      journalText: txt,
    });
  };

  const updateSubscription = (state: UserSubscriptionState) => {
    setSubscription(state);
    try {
      localStorage.setItem('amanora_subscription', JSON.stringify(state));
    } catch {}
  };

  // Phase 1, 2, 3 Jannah Gate Flow
  if (gateVisible) {
    return <JannahGate userName={userProfile.name} onEnter={handleEnterSanctuary} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F3EA] text-[#173D33] flex flex-col justify-between selection:bg-[#C9A24D]/30 selection:text-[#0E2B24]">
      
      {/* ==============================================================
          FULL-SITE TOP NAVIGATION BAR (Spans Entire Browser Width)
          ============================================================== */}
      <header className="sticky top-0 z-50 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#C9A24D]/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => {
              playTactileClick('subtle');
              setTab('Home');
            }}
            className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-widest text-[#0E2B24] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <span className="text-[#C9A24D] text-2xl select-none">☾</span>
            <span className="font-cinzel tracking-[0.2em]">AMANORA</span>
          </button>

          {/* Zone 2: Navigation Links (Single-Line, Whitespace-Nowrap) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-extrabold text-stone-700">
            {[
              { id: 'Home', label: 'Home' },
              { id: 'Shorts', label: 'Shorts 🎬' },
              { id: 'Bayan', label: 'Mufti Bayan 🎙️' },
              { id: 'Plus', label: 'Islam Plus ✨' },
              { id: 'Quran', label: 'Quran 📖' },
              { id: 'Hadith', label: 'Hadith 🕌' },
              { id: 'Worship', label: 'Tasbih 📿' },
              { id: 'Learn', label: 'Knowledge 🎓' },
              { id: 'Subscription', label: 'Noor Pass 👑' },
              { id: 'More', label: 'Sanctuary ♡' },
            ].map(item => {
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playTactileClick('subtle');
                    setTab(item.id as Tab);
                  }}
                  className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors ${
                    isActive ? 'text-[#0E2B24] font-black' : 'hover:text-[#0E2B24]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#C9A24D] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cute Profile & Unique Account Switcher Status */}
            <button
              onClick={() => {
                playTactileClick('subtle');
                setIsLoginModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-2xl bg-white hover:bg-stone-50 border border-amber-300/80 shadow-xs flex items-center gap-2 text-xs font-bold text-[#0E2B24] transition-all hover:scale-102"
              title="Click to Switch User Account or Create New Unique Login"
            >
              <span className="text-base select-none">{userProfile.avatar}</span>
              <span className="hidden sm:inline font-black max-w-[110px] truncate">{userProfile.name}</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-amber-100 text-[#9A7432] text-[10px] font-black">
                ★ {userProfile.goodDeedPoints}
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 font-bold">
                Switch ▾
              </span>
            </button>

            {/* Noor Patron Status Button */}
            <button
              onClick={() => {
                playTactileClick('gold');
                setTab('Subscription');
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                subscription.isSubscribed
                  ? 'bg-gradient-to-r from-amber-400 via-[#C9A24D] to-amber-600 text-[#0E2B24] border border-amber-200'
                  : 'bg-[#F8EDD3] text-[#9A7432] border border-[#C9A24D]/50 hover:bg-[#F3E3BD]'
              }`}
              title="Waqf & Subscriptions"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">{subscription.isSubscribed ? 'PATRON' : 'NOOR PASS'}</span>
            </button>

            {/* Replay Jannah Gate */}
            <IslamicButton
              variant="jannah"
              size="sm"
              arabicFlourish={true}
              onClick={() => {
                playTactileClick('chime');
                setGateVisible(true);
              }}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gate</span>
            </IslamicButton>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scrollbar */}
        <div className="lg:hidden flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar border-t border-stone-200/60 bg-stone-50/80">
          {[
            { id: 'Home', label: 'Home ⌂' },
            { id: 'Shorts', label: 'Shorts 🎬' },
            { id: 'Bayan', label: 'Mufti Bayan 🎙️' },
            { id: 'Plus', label: 'Islam Plus ✨' },
            { id: 'Quran', label: 'Quran 📖' },
            { id: 'Hadith', label: 'Hadith 🕌' },
            { id: 'Worship', label: 'Tasbih 📿' },
            { id: 'Learn', label: 'Learn 🎓' },
            { id: 'Subscription', label: 'Pass 👑' },
            { id: 'More', label: 'Sanctuary ♡' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                playTactileClick('subtle');
                setTab(m.id as Tab);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                tab === m.id
                  ? 'bg-[#1C4E40] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* ==============================================================
          FULL SITE MAIN CONTENT WRAPPER (Max 1440px / 7xl)
          ============================================================== */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        
        {/* ============================================================
            TAB 1: HOME (Responsive Full Web Layout)
            ============================================================ */}
        {tab === 'Home' && (
          <div className="space-y-8">
            
            {/* Top Full-Width Hero: Jannah Paradise Greeting */}
            <div
              className="relative rounded-3xl overflow-hidden p-8 sm:p-10 text-white shadow-xl border border-[#C9A24D]/40"
              style={{
                backgroundImage: `linear-gradient(rgba(10, 35, 28, 0.72), rgba(10, 35, 28, 0.85)), url(${GARDEN_IMAGE})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-[#E7CF9B] text-xs font-black tracking-widest uppercase">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Your Spiritual Sanctuary of Noor</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                    Assalamu Alaikum, {userProfile.name} {userProfile.avatar}
                  </h1>
                  
                  <p className="text-sm sm:text-base text-[#F4EDE0] leading-relaxed">
                    Welcome to Amanora — full Islam in one app. Deepen your soul with Mufti lectures, the complete Noble Quran, authentic Hadith, Abdul Bari moral cartoon shorts, and interactive Islamic Plus tools.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-amber-200/90 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {coords.city}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      {userProfile.streakDays} Day Deen Streak
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-yellow-300" />
                      {userProfile.goodDeedPoints} Good Deed Points
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <IslamicButton
                    variant="gold"
                    size="lg"
                    arabicFlourish={true}
                    shimmer={true}
                    icon={<Play className="w-4 h-4 fill-current" />}
                    onClick={() => setTab('Shorts')}
                  >
                    Watch Shorts
                  </IslamicButton>

                  <IslamicButton
                    variant="jannah"
                    size="lg"
                    arabicFlourish={true}
                    icon={<Mic className="w-4 h-4" />}
                    onClick={() => setTab('Bayan')}
                  >
                    Mufti Bayanat
                  </IslamicButton>

                  <IslamicButton
                    variant="secondary"
                    size="lg"
                    icon={<Crown className="w-4 h-4 text-amber-600" />}
                    onClick={() => setTab('Plus')}
                  >
                    Islam Plus ✨
                  </IslamicButton>
                </div>
              </div>
            </div>

            {/* 2-Column Balanced Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column (7 cols): Next Prayer Schedule + GPS */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <PrayerSection
                  coords={coords}
                  settings={settings}
                  lights={lights}
                  onToggleLight={toggleLight}
                  onRefreshLocation={locateUser}
                  isLocating={isLocating}
                />
              </div>

              {/* Right Column (5 cols): Today's Moral Cartoon Spotlight */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#FFFDF7] to-[#F7F2E4] rounded-3xl p-6 border-2 border-[#C9A24D]/50 shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase">
                      DAILY GOOD THING SPOTLIGHT
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {SHORTS[0].tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#173D33]">
                    {SHORTS[0].title}
                  </h3>

                  <p className="text-sm font-bold text-stone-700 leading-snug">
                    "{SHORTS[0].lesson}"
                  </p>

                  <p className="text-xs text-stone-500 font-medium">
                    {SHORTS[0].reference} · Authentic Moral Cartoon
                  </p>
                </div>

                {/* Animated Character Preview Card */}
                <div className="w-full h-56 bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden p-2 flex items-center justify-center">
                  <AbdulBariCartoon
                    story={SHORTS[0]}
                    currentStep={2}
                    isSpeaking={false}
                    interactive={false}
                    showWhiteboardText={false}
                  />
                </div>

                <IslamicButton
                  variant="gold"
                  size="md"
                  arabicFlourish={true}
                  icon={<Play className="w-4 h-4 fill-current" />}
                  onClick={() => setTab('Shorts')}
                  className="w-full"
                >
                  Watch Full Story with Abdul Bari
                </IslamicButton>
              </div>
            </div>

            {/* Quick Access Portals Grid (8-Columns Responsive Grid) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[#173D33] tracking-tight">
                  Full Islam in One App — Sacred Portals
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full">
                  All 8 Pillars Active
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { t: "Deen Shorts", i: "🎬", c: "#F6E4E1", tab: "Shorts" as Tab, desc: "Abdul Bari Cartoons" },
                  { t: "Mufti Bayan", i: "🎙️", c: "#EAE7FA", tab: "Bayan" as Tab, desc: "Scholars & Wisdom" },
                  { t: "Islam Plus", i: "✨", c: "#FEF3C7", tab: "Plus" as Tab, desc: "99 Names & Zakat" },
                  { t: "Noble Quran", i: "📖", c: "#E9F1EA", tab: "Quran" as Tab, desc: "604 Pages & Audio" },
                  { t: "Hadith", i: "🕌", c: "#F8EDD3", tab: "Hadith" as Tab, desc: "Prophetic Sunnah" },
                  { t: "Tasbih & Dhikr", i: "📿", c: "#E3F0F5", tab: "Worship" as Tab, desc: "Concentric Beads" },
                  { t: "Knowledge", i: "🎓", c: "#D7E7DA", tab: "Learn" as Tab, desc: "Seerah & Arabic" },
                  { t: "Noor Pass", i: "👑", c: "#FFF2B8", tab: "Subscription" as Tab, desc: "Waqf & Full Library" },
                ].map(x => (
                  <button
                    key={x.t}
                    onClick={() => {
                      playTactileClick('subtle');
                      setTab(x.tab);
                    }}
                    className="p-4 rounded-3xl bg-white border border-[#E4E8DD] shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col items-center text-center gap-2 group"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: x.c }}
                    >
                      {x.i}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#173D33]">{x.t}</p>
                      <p className="text-[10px] text-stone-500 font-medium mt-0.5 line-clamp-1">{x.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modified Buttons Inner Craftsmanship Showcase */}
            <ButtonShowcase />

            {/* Full-Width Jannah Celestial Quote Banner */}
            <div
              className="relative rounded-3xl overflow-hidden p-8 text-center text-white shadow-lg border border-[#C9A24D]/40"
              style={{
                backgroundImage: `linear-gradient(rgba(10, 35, 28, 0.75), rgba(10, 35, 28, 0.85)), url(${GARDEN_IMAGE})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <p className="font-arabic text-3xl sm:text-4xl text-white">فَاذْكُرُونِي أَذْكُرْكُمْ</p>
              <p className="text-sm sm:text-base text-[#F4EDE0] font-bold mt-2">“Remember Me; I will remember you.”</p>
              <p className="text-xs font-black tracking-widest text-[#E7CF9B] uppercase mt-2">QURAN 2:152</p>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: SHORTS (Deen Shorts Studio - Full Web Viewport)
            ============================================================ */}
        {tab === 'Shorts' && (
          <div className="space-y-6">
            <AbdulBariReels
              stories={SHORTS}
              onOpenSubscription={() => setTab('Subscription')}
              onClose={() => setTab('Home')}
            />
          </div>
        )}

        {/* ============================================================
            TAB 3: MUFTI BAYANAT (Lectures by Renowned Scholars)
            ============================================================ */}
        {tab === 'Bayan' && (
          <div className="space-y-6">
            <MuftiBayanSection
              isSubscribed={subscription.isSubscribed}
              onOpenSubscription={() => setTab('Subscription')}
            />
          </div>
        )}

        {/* ============================================================
            TAB 4: ISLAM PLUS FEATURES (99 Names, Zakat, Qibla, Duas, Hijri)
            ============================================================ */}
        {tab === 'Plus' && (
          <div className="space-y-6">
            <IslamicPlusFeatures
              isSubscribed={subscription.isSubscribed}
              onOpenSubscription={() => setTab('Subscription')}
            />
          </div>
        )}

        {/* ============================================================
            TAB 5: QURAN (Full-Width Reader)
            ============================================================ */}
        {tab === 'Quran' && (
          <div className="space-y-6">
            <QuranReader
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
            />
          </div>
        )}

        {/* ============================================================
            TAB 6: HADITH (Prophetic Wisdom Grid)
            ============================================================ */}
        {tab === 'Hadith' && (
          <div className="space-y-6">
            <HadithSection hadiths={HADITHS} />
          </div>
        )}

        {/* ============================================================
            TAB 7: WORSHIP & TASBIH
            ============================================================ */}
        {tab === 'Worship' && (
          <div className="space-y-6">
            <WorshipSection
              tasbihCount={tasbih}
              onIncrementTasbih={incrementTasbih}
              onResetTasbih={resetTasbih}
            />
          </div>
        )}

        {/* ============================================================
            TAB 8: LEARN (Islamic Knowledge Halls)
            ============================================================ */}
        {tab === 'Learn' && (
          <div className="space-y-6">
            <LearnSection />
          </div>
        )}

        {/* ============================================================
            TAB 9: SUBSCRIPTIONS & WAQF (5 Moral Reasons)
            ============================================================ */}
        {tab === 'Subscription' && (
          <div className="space-y-6">
            <SubscriptionSection
              subscriptionState={subscription}
              userName={userProfile.name}
              onUpdateSubscription={updateSubscription}
              onClose={() => setTab('Home')}
            />
          </div>
        )}

        {/* ============================================================
            TAB 10: MY SANCTUARY (Journal, Bookmarks & Settings)
            ============================================================ */}
        {tab === 'More' && (
          <div className="space-y-6">
            <MySanctuarySection
              journal={journal}
              onSaveJournal={saveJournalText}
              bookmarks={bookmarks}
              settings={settings}
              onChangeSettings={setSettings}
              onReopenGate={() => setGateVisible(true)}
            />
          </div>
        )}
      </main>

      {/* Unique Multi-User Login & Account Switcher Modal */}
      <LoginModal
        currentProfile={userProfile}
        savedProfiles={savedProfiles}
        isOpen={isLoginModalOpen}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* ==============================================================
          FULL-SITE FOOTER (Spans entire desktop width)
          ============================================================== */}
      <footer className="mt-16 bg-[#0E261E] text-stone-300 border-t border-[#C9A24D]/30 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-amber-400 font-cinzel text-lg font-black tracking-widest">AMANORA</span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-300 font-semibold">Full Islam in One Sanctuary</span>
            </div>
            <p className="text-stone-400">
              An Islamic sanctuary for Quranic reflection, Mufti lectures, authentic Sunnah, and wholesome animated moral education.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-stone-300 font-bold">
            <button onClick={() => setTab('Home')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => setTab('Shorts')} className="hover:text-white transition-colors">Moral Shorts</button>
            <button onClick={() => setTab('Bayan')} className="hover:text-amber-300 transition-colors">Mufti Bayan 🎙️</button>
            <button onClick={() => setTab('Plus')} className="hover:text-amber-300 transition-colors">Islam Plus ✨</button>
            <button onClick={() => setTab('Quran')} className="hover:text-white transition-colors">Noble Quran</button>
            <button onClick={() => setTab('Subscription')} className="hover:text-amber-300 transition-colors">Noor Pass & Waqf</button>
            <button onClick={() => setGateVisible(true)} className="hover:text-amber-300 transition-colors">Replay Gate ✦</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
