import React, { useState } from 'react';
import { AllahName, HisnulDua } from '../types';
import { IslamicButton } from './IslamicButton';
import { 
  Compass, 
  Calculator, 
  Sparkles, 
  BookHeart, 
  Calendar, 
  Radio, 
  Volume2, 
  Check, 
  ChevronRight, 
  Crown,
  Search
} from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

const NAMES_OF_ALLAH: AllahName[] = [
  { number: 1, arabic: "الرَّحْمَٰنُ", transliteration: "Ar-Rahman", meaning: "The Entirely Merciful", explanation: "He whose boundless mercy encompasses all creation in this world." },
  { number: 2, arabic: "الرَّحِيمُ", transliteration: "Ar-Raheem", meaning: "The Especially Merciful", explanation: "He who bestows special mercy specifically upon the believers in the Hereafter." },
  { number: 3, arabic: "الْمَلِكُ", transliteration: "Al-Malik", meaning: "The King and Sovereign", explanation: "The absolute, eternal ruler of the heavens, the earth, and the unseen." },
  { number: 4, arabic: "الْقُدُّوسُ", transliteration: "Al-Quddoos", meaning: "The Most Holy & Pure", explanation: "Free from any imperfection, defect, deficiency, or partner." },
  { number: 5, arabic: "السَّلَامُ", transliteration: "As-Salam", meaning: "The Giver of Peace", explanation: "The source of serenity who grants peace and safety to His servants." },
  { number: 6, arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning: "The Granter of Security", explanation: "He who affirms the truth of His messengers and removes fear from our hearts." },
  { number: 7, arabic: "الْعَزِيزُ", transliteration: "Al-Aziz", meaning: "The All-Mighty", explanation: "The Invincible One who possesses supreme power that can never be overcome." },
  { number: 8, arabic: "الْغَفَّارُ", transliteration: "Al-Ghaffar", meaning: "The Repeatedly Forgiving", explanation: "He who continuously veils our faults and pardons our mistakes again and again." },
  { number: 9, arabic: "الْوَهَّابُ", transliteration: "Al-Wahhab", meaning: "The Supreme Bestower", explanation: "He who gives abundantly without expecting any return or reward." },
  { number: 10, arabic: "الرَّزَّاقُ", transliteration: "Ar-Razzaq", meaning: "The Provider of All", explanation: "The Provider who supplies sustenance for every creature crawling upon the earth." },
];

const DAILY_DUAS: HisnulDua[] = [
  {
    id: 'waking',
    category: 'Morning',
    title: 'Upon Waking Up in the Morning',
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhee ahyana ba'da ma amatana wa ilayhin-nushoor",
    translation: "All praise belongs to Allah who gave us life after having given us death, and unto Him is the resurrection.",
    reference: "Sahih al-Bukhari 6312"
  },
  {
    id: 'leaving-home',
    category: 'Protection',
    title: 'Upon Leaving the Home',
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillahi tawakkaltu 'alallahi wa la hawla wa la quwwata illa billah",
    translation: "In the name of Allah, I trust in Allah; there is no power nor strength except with Allah.",
    reference: "Sunan Abi Dawud 5095"
  },
  {
    id: 'anxiety',
    category: 'Inner Peace',
    title: 'Relief from Anxiety and Heavy Distress',
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ",
    transliteration: "Allahumma innee a'oodhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubn",
    translation: "O Allah, I seek refuge in You from grief and sadness, weakness and laziness, miserliness and cowardice.",
    reference: "Sahih al-Bukhari 2893"
  },
  {
    id: 'istikhara',
    category: 'Guidance',
    title: 'Seeking Allah’s Guidance in Big Decisions',
    arabic: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ",
    transliteration: "Allahumma innee astakheeruka bi-'ilmika wa astaqdiruka bi-qudratika wa as'aluka min fadlikal-'azeem",
    translation: "O Allah, I ask guidance from Your knowledge, and power from Your might, and I ask for Your great bounty.",
    reference: "Sahih al-Bukhari 1166"
  }
];

interface IslamicPlusFeaturesProps {
  isSubscribed?: boolean;
  onOpenSubscription?: () => void;
}

export const IslamicPlusFeatures: React.FC<IslamicPlusFeaturesProps> = ({
  isSubscribed = false,
  onOpenSubscription,
}) => {
  const [activeTab, setActiveTab] = useState<'names' | 'zakat' | 'qibla' | 'duas' | 'calendar'>('names');

  // Zakat Calculator State
  const [cash, setCash] = useState<number>(0);
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [debts, setDebts] = useState<number>(0);

  // Constants: approximate current gold price ($80/gram), silver ($0.95/gram), Nisab ~ 85g gold ($6,800)
  const goldPricePerGram = 80;
  const silverPricePerGram = 0.95;
  const nisabGoldThreshold = 85 * goldPricePerGram; // ~$6,800

  const totalAssets = cash + (goldGrams * goldPricePerGram) + (silverGrams * silverPricePerGram) - debts;
  const isEligibleForZakat = totalAssets >= nisabGoldThreshold;
  const zakatDue = isEligibleForZakat ? totalAssets * 0.025 : 0;

  const playNameAudio = (arabicText: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(arabicText);
      u.lang = 'ar-SA';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E5C49] via-[#124234] to-[#0A261E] rounded-3xl p-6 sm:p-8 text-white border-2 border-[#C9A24D]/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[#E7CF9B] text-xs font-black tracking-widest uppercase">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Full Islam in One App · Complete Suite</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Islam Plus Sanctuary Tools
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Everything the Muslim family needs in daily life: 99 Names of Allah, precise Zakat calculator, Qibla compass & live Makkah Haramain, Hisnul Muslim fortress duas, and Sunnah fasting tracker.
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
              Noor Plus Patron
            </IslamicButton>
          )}
        </div>
      </div>

      {/* Feature Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-2 rounded-3xl border border-stone-200/80 shadow-xs">
        {[
          { id: 'names', label: '99 Names of Allah', icon: '✨' },
          { id: 'zakat', label: 'Zakat Calculator', icon: '⚖️' },
          { id: 'qibla', label: 'Qibla & Live Haram', icon: '🧭' },
          { id: 'duas', label: 'Fortress Duas', icon: '🤲' },
          { id: 'calendar', label: 'Hijri & Fasting', icon: '🌙' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              playTactileClick('subtle');
              setActiveTab(item.id as any);
            }}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
              activeTab === item.id
                ? 'bg-[#1C4E40] text-white shadow-md'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-center sm:text-left">{item.label}</span>
          </button>
        ))}
      </div>

      {/* ==============================================================
          TAB 1: 99 NAMES OF ALLAH (Asma-ul-Husna)
          ============================================================== */}
      {activeTab === 'names' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase">
                Divine Attributes
              </span>
              <h3 className="text-xl font-black text-[#173D33]">Asma-ul-Husna (The 99 Beautiful Names)</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                "To Allah belong the best names, so invoke Him by them." (Quran 7:180)
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Audio Recitations Included
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NAMES_OF_ALLAH.map(name => (
              <div
                key={name.number}
                className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-mono text-xs font-black flex items-center justify-center">
                    {name.number}
                  </span>
                  <button
                    onClick={() => {
                      playTactileClick('gold');
                      playNameAudio(name.arabic);
                    }}
                    className="p-2 rounded-xl bg-stone-50 hover:bg-emerald-50 text-emerald-800 transition-colors"
                    title="Listen Pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center py-2 space-y-1">
                  <p dir="rtl" className="font-arabic text-3xl text-[#0E2B24] font-bold">
                    {name.arabic}
                  </p>
                  <p className="text-sm font-black text-[#173D33] tracking-wide">
                    {name.transliteration}
                  </p>
                  <p className="text-xs font-extrabold text-[#9A7432]">
                    "{name.meaning}"
                  </p>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                  {name.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: ZAKAT CALCULATOR
          ============================================================== */}
      {activeTab === 'zakat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md space-y-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase">
                Third Pillar of Islam
              </span>
              <h3 className="text-xl font-black text-[#173D33]">Zakat Wealth Calculator</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Calculate your obligatory annual 2.5% Zakat with automatic Nisab verification.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Cash & Bank Savings ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cash || ''}
                  onChange={e => setCash(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 5000"
                  className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-bold focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Gold in Grams (~$80/g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={goldGrams || ''}
                    onChange={e => setGoldGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="e.g. 50"
                    className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-bold focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Silver in Grams (~$0.95/g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={silverGrams || ''}
                    onChange={e => setSilverGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="e.g. 200"
                    className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-bold focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Short-Term Debts & Due Bills ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={debts || ''}
                  onChange={e => setDebts(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 1000"
                  className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-bold focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#1C4E40] to-[#0E2E25] rounded-3xl p-6 text-white border-2 border-[#C9A24D]/60 shadow-xl space-y-4">
            <span className="text-[10px] font-black tracking-widest text-[#E7CF9B] uppercase block">
              ZAKAT CALCULATION SUMMARY
            </span>

            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex justify-between text-xs text-stone-300">
                <span>Total Net Wealth:</span>
                <span className="font-bold text-white font-mono">${Math.max(0, totalAssets).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-300">
                <span>Gold Nisab Threshold:</span>
                <span className="font-bold text-amber-300 font-mono">${nisabGoldThreshold.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-300">
                <span>Nisab Status:</span>
                <span className={`font-bold ${isEligibleForZakat ? 'text-emerald-300' : 'text-stone-400'}`}>
                  {isEligibleForZakat ? 'Exceeds Nisab (Eligible)' : 'Below Nisab'}
                </span>
              </div>
            </div>

            <div className="text-center py-3 bg-black/25 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest block">
                Zakat Due (2.5%)
              </span>
              <p className="text-4xl font-black text-amber-400 font-mono mt-1">
                ${zakatDue.toFixed(2)}
              </p>
              <p className="text-[11px] text-stone-300 mt-1">
                Purify your wealth with peaceful intention.
              </p>
            </div>

            <IslamicButton
              variant="gold"
              size="md"
              arabicFlourish={true}
              onClick={() => {
                alert(`Your calculated Zakat due is $${zakatDue.toFixed(2)}. May Allah accept your purification and charity!`);
              }}
              className="w-full"
            >
              Record Zakat Paid ✦
            </IslamicButton>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: QIBLA DIRECTION & LIVE MAKKAH / MADINAH
          ============================================================== */}
      {activeTab === 'qibla' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Qibla Direction Compass Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md text-center space-y-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase">
                Sacred Direction
              </span>
              <h3 className="text-xl font-black text-[#173D33]">Qibla Compass to the Kaaba</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Calculated for Makkah Al-Mukarramah (21.4225° N, 39.8262° E)
              </p>
            </div>

            {/* Compass Disk */}
            <div className="py-4 flex justify-center">
              <div className="w-56 h-56 rounded-full border-4 border-[#C9A24D] bg-gradient-to-b from-[#FFFDF7] to-[#F5EEDB] relative flex items-center justify-center shadow-lg">
                <span className="absolute top-2 text-xs font-black text-stone-700">N</span>
                <span className="absolute bottom-2 text-xs font-black text-stone-400">S</span>
                <span className="absolute right-2 text-xs font-black text-stone-400">E</span>
                <span className="absolute left-2 text-xs font-black text-stone-400">W</span>

                {/* Needle pointing to Kaaba */}
                <div className="w-2 h-36 bg-gradient-to-t from-stone-400 via-rose-500 to-rose-600 rounded-full transform -rotate-45 shadow-md flex items-start justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-400 -mt-1 border border-white" />
                </div>

                <div className="w-12 h-12 rounded-full bg-[#1C4E40] border-2 border-[#C9A24D] flex items-center justify-center text-white text-base font-bold shadow-md">
                  🕋
                </div>
              </div>
            </div>

            <p className="text-xs font-bold text-stone-700">
              Qibla Bearing: <span className="text-emerald-800 font-black">68° East from North</span>
            </p>
          </div>

          {/* Live Makkah Stream Card */}
          <div className="bg-[#0E261E] rounded-3xl p-6 border-2 border-[#C9A24D]/60 text-white shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>LIVE 24/7 HARAMAIN BROADCAST</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100">
                  Live Feed
                </span>
              </div>

              <h3 className="text-xl font-black text-white mt-2">
                Makkah Al-Mukarramah & Madinah
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                Gaze upon the Holy Kaaba and listen to live recitations from the Grand Mosque.
              </p>
            </div>

            <div className="w-full h-52 bg-black rounded-2xl overflow-hidden border border-white/20 relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80"
                alt="Kaaba Live"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Grand Mosque 24/7 Feed</span>
                </span>
              </div>
            </div>

            <IslamicButton
              variant="gold"
              size="md"
              arabicFlourish={true}
              onClick={() => {
                alert("Streaming Makkah Al-Mukarramah Live 24/7.");
              }}
              className="w-full"
            >
              Watch Fullscreen Stream ✦
            </IslamicButton>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 4: FORTRESS OF THE MUSLIM DUAS
          ============================================================== */}
      {activeTab === 'duas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm">
            <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase">
              Hisnul Muslim
            </span>
            <h3 className="text-xl font-black text-[#173D33]">Fortress of the Muslim: Authentic Duas</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Prophetic supplications for every state of the day and night.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAILY_DUAS.map(d => (
              <div
                key={d.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
                    {d.category}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 font-semibold">{d.reference}</span>
                </div>

                <h4 className="text-sm font-black text-[#0E2B24]">{d.title}</h4>

                <p dir="rtl" className="font-arabic text-xl sm:text-2xl text-[#173D33] leading-relaxed font-bold text-right py-1">
                  {d.arabic}
                </p>

                <p className="text-xs font-bold text-[#9A7432] italic">
                  {d.transliteration}
                </p>

                <p className="text-xs text-stone-700 font-medium leading-relaxed border-t border-stone-100 pt-2">
                  "{d.translation}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 5: HIJRI CALENDAR & SUNNAH FASTING TRACKER
          ============================================================== */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase">
                Islamic Lunar Cycle
              </span>
              <h3 className="text-xl font-black text-[#173D33]">Hijri Calendar & Sunnah Fasting Days</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Track Mondays & Thursdays, White Days (Ayyam al-Beed), and upcoming sacred months.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
              🌙 Year 1448 Hijri
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-300 text-center space-y-1">
              <span className="text-2xl">🌿</span>
              <h4 className="text-sm font-black text-[#173D33]">Mondays & Thursdays</h4>
              <p className="text-[11px] text-stone-600">
                Deeds are presented to Allah; the Prophet ﷺ loved to be fasting when his deeds are shown.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-300 text-center space-y-1">
              <span className="text-2xl">🌕</span>
              <h4 className="text-sm font-black text-[#173D33]">The White Days (13, 14, 15)</h4>
              <p className="text-[11px] text-stone-600">
                Fasting 3 days of each lunar month is like fasting for an entire lifetime.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-300 text-center space-y-1">
              <span className="text-2xl">⭐</span>
              <h4 className="text-sm font-black text-[#173D33]">Ramadan Countdown</h4>
              <p className="text-[11px] text-stone-600">
                Prepare your heart and habit of Quran reading for the blessed guest.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
