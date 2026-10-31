import React, { useState } from 'react';
import { IslamicButton } from './IslamicButton';
import { Sparkles, Moon, Crown, Check, Heart, Shield, Award } from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

interface JannahGateProps {
  userName?: string;
  onEnter: () => void;
}

const EIGHT_GATES = [
  { name: "Baab As-Salah", desc: "For those steadfast in prayer", icon: "🕌" },
  { name: "Baab Ar-Rayyan", desc: "For those who observe fasting", icon: "🌙" },
  { name: "Baab As-Sadaqah", desc: "For the generous in charity", icon: "🤲" },
  { name: "Baab Adh-Dhikr", desc: "For those who remember Allah", icon: "📿" },
  { name: "Baab Al-Hajj", desc: "For those who completed pilgrimage", icon: "🕋" },
  { name: "Baab Al-Kazimeen", desc: "For those who restrain anger", icon: "🌸" },
  { name: "Baab Al-Ayman", desc: "For those with complete trust", icon: "⭐" },
  { name: "Baab Al-Ilm", desc: "For those who seek sacred knowledge", icon: "📖" },
];

const CELESTIAL_STATEMENTS = [
  {
    arabic: "وَسِيقَ الَّذِينَ اتَّقَوْا رَبَّهُمْ إِلَى الْجَنَّةِ زُمَرًا",
    translation: "And those who feared their Lord will be driven to Paradise in groups.",
    reference: "Surah Az-Zumar 39:73"
  },
  {
    arabic: "سَلَامٌ عَلَيْكُمْ طِبْتُمْ فَادْخُلُوهَا خَالِدِينَ",
    translation: "“Peace be upon you; you have done well; so enter it to abide eternally.”",
    reference: "Surah Az-Zumar 39:73"
  },
  {
    arabic: "دَعْوَاهُمْ فِيهَا سُبْحَانَكَ اللَّهُمَّ وَتَحِيَّتُهُمْ فِيهَا سَلَامٌ",
    translation: "Their call therein will be: 'Exalted are You, O Allah!' and their greeting will be: 'Peace!'",
    reference: "Surah Yunus 10:10"
  },
  {
    arabic: "لَا يَمَسُّهُمْ فِيهَا نَصَبٌ وَمَا هُم مِّنْهَا بِمُخْرَجِينَ",
    translation: "No fatigue will touch them therein, nor from it will they ever be removed.",
    reference: "Surah Al-Hijr 15:48"
  }
];

export const JannahGate: React.FC<JannahGateProps> = ({ userName = "Seeker of Noor", onEnter }) => {
  // Phase 1: 'closed' | Phase 2: 'opening' | Phase 3: 'revealed_statements'
  const [phase, setPhase] = useState<'closed' | 'opening' | 'revealed'>('closed');
  const [selectedGate, setSelectedGate] = useState<number>(1); // Default Ar-Rayyan

  const handleOpenDoor = () => {
    if (phase !== 'closed') return;
    playTactileClick('chime');
    setPhase('opening');

    setTimeout(() => {
      setPhase('revealed');
      playTactileClick('gold');
    }, 1400);
  };

  const handleEnterSanctuary = () => {
    playTactileClick('chime');
    onEnter();
  };

  return (
    <div className="relative w-full min-h-screen bg-[#071B14] flex items-center justify-center overflow-x-hidden p-4 sm:p-6 select-none">
      
      {/* Background Celestial Jannah Aura */}
      <div className="absolute inset-0 bg-radial from-[#134D3D] via-[#0B251E] to-[#04120D] pointer-events-none" />

      {/* Floating celestial stars & lanterns */}
      <div className="absolute top-10 left-12 text-amber-200/50 text-2xl animate-pulse">✦</div>
      <div className="absolute top-24 right-20 text-amber-300/40 text-lg animate-ping">✧</div>
      <div className="absolute bottom-20 left-16 text-amber-100/40 text-xl">✦</div>
      <div className="absolute bottom-28 right-24 text-amber-200/50 text-2xl animate-pulse">✧</div>

      {/* Radiant Jannah Noor Halo */}
      <div
        className={`absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#FFF2B8] via-[#E2C47E] to-amber-200/30 blur-3xl transition-all duration-1000 ${
          phase === 'revealed' ? 'scale-150 opacity-100' : 'scale-90 opacity-40 animate-pulse'
        }`}
      />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center space-y-6">
        
        {/* Top Divine Invocation */}
        <div className="space-y-1">
          <p className="font-arabic text-2xl sm:text-3xl text-[#E5C985] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1 className="text-2xl sm:text-4xl font-black tracking-[0.2em] text-white uppercase font-cinzel drop-shadow-md">
            THE GATES OF PARADISE
          </h1>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#C9A24D] uppercase">
            A M A N O R A · Welcome, {userName}
          </p>
        </div>

        {/* ============================================================
            STAGE 1: THE GRAND ARCH & DOUBLE DOORS
            ============================================================ */}
        <div className="relative w-80 sm:w-96 h-[380px] rounded-t-[200px] border-4 border-[#C9A24D] shadow-[0_16px_50px_rgba(0,0,0,0.9),inset_0_0_24px_rgba(201,162,77,0.4)] bg-[#FFF8E7] overflow-hidden flex flex-col justify-between">
          
          {/* Inner Light Chamber (Seen inside as doors open) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-gradient-to-b from-[#FFFDF2] to-[#F5EEDB]">
            <span className="text-5xl text-[#C9A24D] mb-1 animate-pulse filter drop-shadow">
              {EIGHT_GATES[selectedGate].icon}
            </span>
            <span className="text-[10px] font-black text-[#9A7432] tracking-widest uppercase">
              {EIGHT_GATES[selectedGate].name}
            </span>
            <p className="font-arabic text-xl sm:text-2xl text-[#173D33] leading-relaxed mt-2 font-bold">
              سَلَامٌ عَلَيْكُمْ طِبْتُمْ فَادْخُلُوهَا
            </p>
            <p className="text-xs font-extrabold text-[#173D33] mt-1">
              "Peace be upon you; you are blessed, enter in peace"
            </p>
            <p className="text-[10px] text-[#74857A] mt-1 font-semibold">
              {EIGHT_GATES[selectedGate].desc}
            </p>
          </div>

          {/* Opening Gilded Double Doors */}
          <div className="absolute inset-0 flex z-10 pointer-events-none">
            {/* Left Door */}
            <div
              className={`w-1/2 h-full bg-gradient-to-br from-[#1E5C49] via-[#124234] to-[#0A261E] border-r-2 border-[#C9A24D] flex flex-col items-center justify-around py-8 transition-transform duration-1000 ease-in-out shadow-2xl ${
                phase !== 'closed' ? '-translate-x-full' : 'translate-x-0'
              }`}
            >
              <span className="text-2xl text-[#E5C985]">۞</span>
              <span className="text-xl text-[#C9A24D]">✧</span>
              <span className="text-2xl text-[#E5C985]">۞</span>
              <div className="w-4 h-4 rounded-full bg-[#C9A24D] border-2 border-amber-200 self-end mr-3 shadow-md" />
            </div>

            {/* Right Door */}
            <div
              className={`w-1/2 h-full bg-gradient-to-bl from-[#1E5C49] via-[#124234] to-[#0A261E] border-l-2 border-[#C9A24D] flex flex-col items-center justify-around py-8 transition-transform duration-1000 ease-in-out shadow-2xl ${
                phase !== 'closed' ? 'translate-x-full' : 'translate-x-0'
              }`}
            >
              <span className="text-2xl text-[#E5C985]">۞</span>
              <span className="text-xl text-[#C9A24D]">✧</span>
              <span className="text-2xl text-[#E5C985]">۞</span>
              <div className="w-4 h-4 rounded-full bg-[#C9A24D] border-2 border-amber-200 self-start ml-3 shadow-md" />
            </div>
          </div>
        </div>

        {/* ============================================================
            STAGE 2: CELESTIAL STATEMENTS (Revealed upon opening)
            ============================================================ */}
        {phase === 'revealed' ? (
          <div className="w-full space-y-4 animate-fade-in">
            {/* Statements Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-2 border-[#C9A24D] shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Divine Glad Tidings of Jannah</span>
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Gate Opened
                </span>
              </div>

              {/* Quranic Statements List */}
              <div className="space-y-3">
                {CELESTIAL_STATEMENTS.map((st, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <p dir="rtl" className="font-arabic text-lg sm:text-xl text-[#0E2B24] font-bold text-right">
                      {st.arabic}
                    </p>
                    <p className="text-xs font-extrabold text-[#173D33] leading-snug">
                      "{st.translation}"
                    </p>
                    <p className="text-[10px] font-mono text-stone-500 font-semibold">
                      {st.reference}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs text-stone-600 font-medium italic mb-3">
                  "May Allah make you and your family among the joyful dwellers of Firdaus."
                </p>

                {/* THE INNER PAGE PROCEED BUTTON */}
                <IslamicButton
                  variant="gold"
                  size="xl"
                  arabicFlourish={true}
                  shimmer={true}
                  haptic="chime"
                  onClick={handleEnterSanctuary}
                  className="w-full shadow-xl"
                >
                  Enter the Inner Sanctuary ✦
                </IslamicButton>
              </div>
            </div>
          </div>
        ) : (
          /* Closed Gate Action & Eight Gates Selector */
          <div className="w-full space-y-4">
            {/* Eight Gates Selector Bar */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black tracking-widest text-amber-200/80 uppercase">
                Choose the Gate you strive for:
              </span>
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {EIGHT_GATES.map((g, idx) => (
                  <button
                    key={g.name}
                    onClick={() => {
                      playTactileClick('subtle');
                      setSelectedGate(idx);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                      selectedGate === idx
                        ? 'bg-[#C9A24D] text-[#0E2B24] shadow-md scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10'
                    }`}
                  >
                    <span>{g.icon}</span>
                    <span>{g.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tap to Open Gate Button */}
            <div className="pt-2 flex flex-col items-center gap-2">
              <IslamicButton
                variant="gold"
                size="lg"
                arabicFlourish={true}
                shimmer={true}
                haptic="chime"
                onClick={handleOpenDoor}
                disabled={phase === 'opening'}
                className="w-72 sm:w-80 shadow-2xl"
              >
                {phase === 'opening' ? 'Opening the Gates of Jannah...' : 'Open the Gate of Jannah ✦'}
              </IslamicButton>

              <span className="text-[10px] tracking-[0.2em] text-[#E5C985]/70 uppercase font-bold">
                Tap to open the gilded doors & view statements
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
