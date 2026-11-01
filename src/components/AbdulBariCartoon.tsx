import React, { useEffect, useState } from 'react';
import { ShortStory } from '../types';

interface AbdulBariCartoonProps {
  story?: ShortStory;
  currentStep?: number;
  isSpeaking?: boolean;
  emotionOverride?: 'patient' | 'honest' | 'grateful' | 'humble' | 'gentle' | 'speaking';
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showWhiteboardText?: boolean;
}

export const AbdulBariCartoon: React.FC<AbdulBariCartoonProps> = ({
  story,
  currentStep = 0,
  isSpeaking = false,
  emotionOverride,
  interactive = true,
  showWhiteboardText = true,
}) => {
  // Animation states
  const [breathTick, setBreathTick] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // Smooth 60fps breathing cycle
  useEffect(() => {
    let frameId: number;
    let start = performance.now();

    const loop = (now: number) => {
      setBreathTick((now - start) / 1000);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Natural eye blinking timer (every 2.5 to 4 seconds)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let closeTimer: NodeJS.Timeout;

    const scheduleBlink = () => {
      timer = setTimeout(() => {
        setIsBlinking(true);
        closeTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, 2500 + Math.random() * 2000);
    };

    scheduleBlink();
    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, []);

  // Lip-sync phoneme frames while speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthFrame(prev => (prev + 1) % 4);
    }, 130);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const effectiveEmotion = selectedEmotion || emotionOverride || story?.characterEmotion || 'patient';
  const actionType = story?.actionType || 'plant_seed';

  // Smooth character movement physics
  const bodyBobY = Math.sin(breathTick * 2.2) * 2.8;
  const headBobAngle = Math.sin(breathTick * 1.6) * 1.8;
  const armBob = Math.cos(breathTick * 2.5) * 2.5;

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden rounded-2xl bg-[#FFFDF7]">
      
      {/* ==============================================================
          REAL CARTOON SCENERY STAGE (Lush Paradise / Moral Story World)
          ============================================================== */}
      <div className="relative w-full flex-1 min-h-[340px] flex items-center justify-center p-3 overflow-hidden">
        
        {/* Animated Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          {actionType === 'dua_night' ? (
            // Magnificent Jannah Nocturnal Sky
            <div className="w-full h-full bg-gradient-to-b from-[#081726] via-[#0E2836] to-[#123B33] relative">
              {/* Luminous Golden Crescent Moon */}
              <div className="absolute top-6 right-8 flex flex-col items-center">
                <span className="text-5xl text-amber-200 filter drop-shadow-[0_0_18px_rgba(255,230,120,0.8)] animate-pulse">
                  ☾
                </span>
                <span className="text-[9px] font-bold text-amber-200/80 tracking-widest mt-1">NOOR</span>
              </div>
              {/* Twinkling celestial stars */}
              <div className="absolute top-8 left-12 text-amber-100/70 text-sm animate-ping">✦</div>
              <div className="absolute top-16 left-28 text-amber-200/90 text-xs">✧</div>
              <div className="absolute top-12 right-28 text-amber-100/60 text-xs">✦</div>
              <div className="absolute top-28 right-16 text-amber-300/80 text-sm animate-pulse">✧</div>
              <div className="absolute bottom-16 left-8 text-amber-100/50 text-xs">✦</div>
              {/* Soft celestial mountain silhouette */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0A241C] to-transparent opacity-80" />
            </div>
          ) : actionType === 'plant_seed' ? (
            // Lush Jannah Garden with Blooming Trees & Sunlight
            <div className="w-full h-full bg-gradient-to-b from-[#E7F3FA] via-[#F4F9F2] to-[#E5F1E6] relative">
              {/* Golden morning sunbeam */}
              <div className="absolute -top-10 left-10 w-64 h-64 bg-radial from-amber-300/30 via-amber-200/10 to-transparent rounded-full blur-2xl" />
              {/* Distant soft garden hills */}
              <div className="absolute bottom-0 inset-x-0 h-28 bg-[#D3E8D6] rounded-t-[80px] opacity-60" />
              <div className="absolute bottom-0 inset-x-0 h-16 bg-[#B9DEC0] rounded-t-[60px]" />
            </div>
          ) : actionType === 'return_wallet' ? (
            // Warm Village Pathway of Honesty
            <div className="w-full h-full bg-gradient-to-b from-[#FFF5E5] via-[#FFF9EE] to-[#EFE2C8] relative">
              <div className="absolute top-4 right-10 w-44 h-44 bg-amber-400/15 rounded-full blur-2xl" />
              <div className="absolute bottom-0 inset-x-0 h-20 bg-[#E0D2B4] rounded-t-[50px]" />
            </div>
          ) : actionType === 'share_bread' ? (
            // Peaceful Riverside of Gratitude
            <div className="w-full h-full bg-gradient-to-b from-[#EBF6FB] via-[#F3F9EE] to-[#DEF0E5] relative">
              <div className="absolute bottom-0 inset-x-0 h-14 bg-[#B5E0D5] opacity-70" />
            </div>
          ) : (
            // Garden of Gentleness & Peace
            <div className="w-full h-full bg-gradient-to-b from-[#FDF0F0] via-[#FCF6EB] to-[#E9F3EB] relative">
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-200/20 rounded-full blur-2xl" />
            </div>
          )}
        </div>

        {/* ==============================================================
            INTERACTIVE REAL CARTOON PROPS (Seed/Tree, Wallet, Bread, Dua)
            ============================================================== */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {actionType === 'plant_seed' && (
            <div className="absolute bottom-4 right-6 flex flex-col items-center">
              {currentStep >= 3 ? (
                // Fully Bloomed Fruitful Tree with Leaves & Fruit
                <div className="flex flex-col items-center animate-bounce">
                  <div className="relative w-28 h-28 bg-gradient-to-tr from-[#1E6B4A] via-[#2F9E6E] to-[#4ED495] rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-300">
                    <span className="text-3xl filter drop-shadow">🌳</span>
                    <span className="absolute top-3 left-4 text-xs">🍎</span>
                    <span className="absolute top-4 right-5 text-xs">🍎</span>
                    <span className="absolute bottom-5 left-7 text-xs">🍎</span>
                  </div>
                  <div className="w-5 h-12 bg-amber-900 rounded-b-md shadow-xs -mt-1" />
                  <span className="text-[10px] font-black text-emerald-900 bg-white/90 px-2 py-0.5 rounded-full border border-emerald-300 shadow-xs mt-1">
                    Tree of Sabr
                  </span>
                </div>
              ) : currentStep >= 2 ? (
                // Fresh Sprouting Plant
                <div className="flex flex-col items-center animate-pulse">
                  <span className="text-4xl filter drop-shadow">🌿</span>
                  <div className="w-16 h-3 bg-amber-900/40 rounded-full mt-1" />
                  <span className="text-[10px] font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-full border border-amber-300 mt-1">
                    Sprouting...
                  </span>
                </div>
              ) : (
                // Tiny Seed in Garden Bed
                <div className="flex flex-col items-center">
                  <span className="text-2xl">🌱</span>
                  <div className="w-14 h-3 bg-amber-950/30 rounded-full mt-1" />
                  <span className="text-[9px] font-bold text-stone-600 bg-white/80 px-1.5 py-0.5 rounded border border-stone-200 mt-1">
                    Watered with Love
                  </span>
                </div>
              )}
            </div>
          )}

          {actionType === 'return_wallet' && (
            <div className="absolute top-10 right-6 flex flex-col items-center gap-1 animate-bounce">
              <div className="p-3 bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-400 rounded-2xl shadow-md flex items-center gap-2">
                <span className="text-2xl">👛</span>
                <div>
                  <p className="text-[10px] font-black text-amber-950 uppercase tracking-wider">Amanah</p>
                  <p className="text-[9px] text-amber-800 font-bold">Returned with Peace</p>
                </div>
              </div>
            </div>
          )}

          {actionType === 'share_bread' && (
            <div className="absolute bottom-8 right-6 flex flex-col items-center gap-1 animate-pulse">
              <div className="flex items-center gap-1">
                <span className="text-3xl filter drop-shadow">🥖</span>
                <span className="text-xl filter drop-shadow">✨</span>
              </div>
              <span className="text-[10px] font-black text-amber-950 bg-white/95 px-2.5 py-1 rounded-xl border border-amber-300 shadow-sm">
                Alhamdulillah
              </span>
            </div>
          )}

          {actionType === 'dua_night' && (
            <div className="absolute top-8 left-6 flex items-center gap-1.5 text-xs text-amber-200 font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-400/40 animate-pulse">
              <span>🤲</span>
              <span>Whispered in the Night</span>
            </div>
          )}

          {actionType === 'gentle_words' && (
            <div className="absolute top-10 right-6 flex flex-col items-center gap-1 animate-pulse">
              <div className="flex items-center gap-1 text-2xl">
                <span>🌸</span>
                <span>🤝</span>
                <span>✨</span>
              </div>
              <span className="text-[10px] font-bold text-rose-900 bg-white/90 px-2 py-0.5 rounded-full border border-rose-300">
                Anger Cools Down
              </span>
            </div>
          )}
        </div>

        {/* ==============================================================
            REAL ABDUL BARI CARTOON CHARACTER (Detailed Vector Rig)
            ============================================================== */}
        <div
          className="relative z-20 flex flex-col items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `translateY(${bodyBobY}px)`,
          }}
        >
          <svg
            viewBox="0 0 240 310"
            className="w-56 sm:w-64 h-[280px] sm:h-[300px] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)]"
          >
            <defs>
              {/* Skin Tone Gradient */}
              <linearGradient id="abdulSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFE0BA" />
                <stop offset="100%" stopColor="#F5C99B" />
              </linearGradient>

              {/* Islamic Cap Emerald & Gold */}
              <linearGradient id="abdulCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E5C49" />
                <stop offset="100%" stopColor="#0E3328" />
              </linearGradient>

              <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E5C578" />
                <stop offset="50%" stopColor="#FFF2B8" />
                <stop offset="100%" stopColor="#C9A24D" />
              </linearGradient>

              {/* Emerald Vest */}
              <linearGradient id="vestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E5C49" />
                <stop offset="100%" stopColor="#0B261D" />
              </linearGradient>

              {/* Kurta White Sheen */}
              <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#ECEEEA" />
              </linearGradient>

              {/* Soft Rosy Cheeks */}
              <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF7A7A" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FF7A7A" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 1. Body: White Kurta Thobe & Emerald Vest */}
            <g id="body-group" transform="translate(0, 150)">
              {/* White Kurta Base */}
              <path
                d="M 75,20 Q 120,16 165,20 L 178,145 Q 120,152 62,145 Z"
                fill="url(#kurtaGrad)"
                stroke="#D4DACF"
                strokeWidth="1.8"
              />

              {/* Mandarin Collar */}
              <path
                d="M 100,18 Q 120,24 140,18 L 138,28 Q 120,34 102,28 Z"
                fill="#FFFFFF"
                stroke="#D4DACF"
                strokeWidth="1.2"
              />

              {/* Emerald Green Open Vest */}
              <path
                d="M 74,22 L 102,24 L 106,145 L 64,145 Z"
                fill="url(#vestGrad)"
                stroke="#0B2B21"
                strokeWidth="1.5"
              />
              <path
                d="M 166,22 L 138,24 L 134,145 L 176,145 Z"
                fill="url(#vestGrad)"
                stroke="#0B2B21"
                strokeWidth="1.5"
              />

              {/* Gold Embroidered Trim on Vest Edges */}
              <line x1="102" y1="24" x2="106" y2="145" stroke="url(#goldTrim)" strokeWidth="2.5" />
              <line x1="138" y1="24" x2="134" y2="145" stroke="url(#goldTrim)" strokeWidth="2.5" />

              {/* Golden Brass Buttons */}
              <circle cx="120" cy="50" r="3" fill="url(#goldTrim)" stroke="#9E7628" strokeWidth="0.8" />
              <circle cx="120" cy="74" r="3" fill="url(#goldTrim)" stroke="#9E7628" strokeWidth="0.8" />
              <circle cx="120" cy="98" r="3" fill="url(#goldTrim)" stroke="#9E7628" strokeWidth="0.8" />
              <circle cx="120" cy="122" r="3" fill="url(#goldTrim)" stroke="#9E7628" strokeWidth="0.8" />
            </g>

            {/* 2. Articulated Arms & Hands (Animated per Story Action) */}
            <g id="arms-group" transform={`translate(0, ${armBob})`}>
              {actionType === 'dua_night' ? (
                // Hands raised in sincere Dua 🤲
                <g>
                  {/* Left arm */}
                  <path d="M 74,175 Q 85,140 102,130" stroke="#0B2B21" strokeWidth="18" strokeLinecap="round" fill="none" />
                  {/* Right arm */}
                  <path d="M 166,175 Q 155,140 138,130" stroke="#0B2B21" strokeWidth="18" strokeLinecap="round" fill="none" />
                  {/* Palms cupped together */}
                  <ellipse cx="108" cy="128" rx="7" ry="10" fill="url(#abdulSkinGrad)" transform="rotate(-15 108 128)" stroke="#E8B884" strokeWidth="1" />
                  <ellipse cx="132" cy="128" rx="7" ry="10" fill="url(#abdulSkinGrad)" transform="rotate(15 132 128)" stroke="#E8B884" strokeWidth="1" />
                  {/* Light radiating from palms */}
                  <circle cx="120" cy="124" r="14" fill="url(#goldTrim)" opacity="0.35" className="animate-ping" />
                </g>
              ) : actionType === 'plant_seed' ? (
                // Holding watering can & pointing
                <g>
                  {/* Left arm holding watering can */}
                  <path d="M 74,175 Q 52,190 42,210" stroke="#0B2B21" strokeWidth="18" strokeLinecap="round" fill="none" />
                  <circle cx="42" cy="210" r="8" fill="url(#abdulSkinGrad)" stroke="#E8B884" strokeWidth="1" />
                  {/* Watering can */}
                  <g transform="translate(20, 202)">
                    <rect x="0" y="6" width="24" height="18" rx="3" fill="#2E7075" stroke="#184246" strokeWidth="1.2" />
                    <path d="M 24,9 L 36,2" stroke="#2E7075" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <circle cx="37" cy="2" r="2.5" fill="#C9A24D" />
                    {/* Water drops */}
                    <circle cx="43" cy="9" r="2" fill="#60A5FA" className="animate-pulse" />
                    <circle cx="48" cy="18" r="1.8" fill="#60A5FA" className="animate-pulse" />
                  </g>
                  {/* Right arm guiding forward */}
                  <path d="M 166,175 Q 186,185 204,200" stroke="#0B2B21" strokeWidth="18" strokeLinecap="round" fill="none" />
                  <circle cx="204" cy="200" r="8" fill="url(#abdulSkinGrad)" stroke="#E8B884" strokeWidth="1" />
                </g>
              ) : actionType === 'return_wallet' ? (
                // Holding lost wallet forward
                <g>
                  <path d="M 74,175 Q 92,198 108,194" stroke="#0B2B21" strokeWidth="18" strokeLinecap="round" fill="none" />
                  <path d="M 166,175 Q 148,198 132,194" stroke="#0B2B21" strokeWidth="18" strokeLinecap="round" fill="none" />
                  {/* Leather Wallet */}
                  <g transform="translate(104, 184)">
                    <rect x="0" y="0" width="32" height="20" rx="3" fill="#8B4513" stroke="#5A2D0C" strokeWidth="1.2" />
                    <path d="M 0,8 L 32,8" stroke="#DAA520" strokeWidth="1.2" strokeDasharray="2,2" />
                    <circle cx="16" cy="14" r="2.5" fill="#DAA520" />
                  </g>
                  <circle cx="104" cy="194" r="7" fill="url(#abdulSkinGrad)" stroke="#E8B884" strokeWidth="1" />
                  <circle cx="136" cy="194" r="7" fill="url(#abdulSkinGrad)" stroke="#E8B884" strokeWidth="1" />
                </g>
              ) : (
                // Friendly welcoming gesture
                <g>
                  <path d="M 74,175 Q 60,195 56,215" stroke="#0B2B21" strokeWidth="18" strokeLinecap="round" fill="none" />
                  <circle cx="56" cy="215" r="8" fill="url(#abdulSkinGrad)" stroke="#E8B884" strokeWidth="1" />
                  <path d="M 166,175 Q 182,190 196,182" stroke="#0B2B21" strokeWidth="18" strokeLinecap="round" fill="none" />
                  <circle cx="196" cy="182" r="8" fill="url(#abdulSkinGrad)" stroke="#E8B884" strokeWidth="1" />
                </g>
              )}
            </g>

            {/* 3. Head & Facial Expressions (Tilts and animates) */}
            <g
              id="head-group"
              style={{
                transformOrigin: '120px 130px',
                transform: `rotate(${headBobAngle}deg)`,
              }}
            >
              {/* Neck */}
              <rect x="108" y="125" width="24" height="24" rx="5" fill="#F0C393" stroke="#DCAE7E" strokeWidth="1" />

              {/* Neat Black Hair */}
              <path d="M 70,80 Q 64,115 80,128 Q 120,135 160,128 Q 176,115 170,80 Z" fill="#202224" />

              {/* Round Friendly Face */}
              <circle cx="120" cy="95" r="48" fill="url(#abdulSkinGrad)" stroke="#EAB480" strokeWidth="1.8" />

              {/* Soft Ears */}
              <circle cx="72" cy="98" r="11" fill="url(#abdulSkinGrad)" stroke="#EAB480" strokeWidth="1.2" />
              <circle cx="168" cy="98" r="11" fill="url(#abdulSkinGrad)" stroke="#EAB480" strokeWidth="1.2" />

              {/* Hair Bangs under cap */}
              <path d="M 82,68 Q 94,76 102,70 Q 116,78 126,70 Q 140,76 158,68 Z" fill="#202224" />

              {/* Rosy Cheeks */}
              <circle cx="92" cy="106" r="12" fill="url(#cheekBlush)" />
              <circle cx="148" cy="106" r="12" fill="url(#cheekBlush)" />

              {/* Signature Islamic Green & Gold Kufi Cap */}
              <g id="cap-group">
                {/* Cap Dome */}
                <path d="M 72,66 Q 120,20 168,66 Q 120,69 72,66 Z" fill="url(#abdulCapGrad)" stroke="#0B2B21" strokeWidth="1.8" />
                {/* Embroidered Gold Brim */}
                <path d="M 70,65 Q 120,72 170,65 L 170,72 Q 120,79 70,72 Z" fill="url(#goldTrim)" stroke="#9E7628" strokeWidth="1.2" />
                {/* Geometric Star stitch */}
                <circle cx="120" cy="45" r="4" fill="none" stroke="url(#goldTrim)" strokeWidth="1.4" />
                <path d="M 116,45 L 124,45 M 120,41 L 120,49" stroke="url(#goldTrim)" strokeWidth="1.4" />
              </g>

              {/* Expressive Eyebrows */}
              <path d="M 88,68 Q 98,64 108,68" stroke="#26282A" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 132,68 Q 142,64 152,68" stroke="#26282A" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Eyes with Natural Blinking */}
              {isBlinking ? (
                <g id="blinking">
                  <path d="M 90,88 Q 98,92 106,88" stroke="#1F2326" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 134,88 Q 142,92 150,88" stroke="#1F2326" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                <g id="open-eyes">
                  {/* Left Eye */}
                  <ellipse cx="98" cy="88" rx="7" ry="8.5" fill="#1C2124" />
                  <circle cx="96" cy="85" r="2.8" fill="#FFFFFF" />
                  <circle cx="100" cy="90" r="1.3" fill="#FFFFFF" />
                  {/* Right Eye */}
                  <ellipse cx="142" cy="88" rx="7" ry="8.5" fill="#1C2124" />
                  <circle cx="140" cy="85" r="2.8" fill="#FFFFFF" />
                  <circle cx="144" cy="90" r="1.3" fill="#FFFFFF" />
                </g>
              )}

              {/* Gentle Nose */}
              <path d="M 118,94 Q 120,99 122,94" stroke="#DCAE7E" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              {/* Speech-Synchronized Lip-Sync Mouth */}
              <g id="mouth">
                {mouthFrame === 1 ? (
                  // Small talking mouth
                  <ellipse cx="120" cy="112" rx="6" ry="6.5" fill="#8E2018" stroke="#54120C" strokeWidth="1.2">
                    <path d="M 116,109 Q 120,107 124,109" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
                  </ellipse>
                ) : mouthFrame === 2 ? (
                  // Wide talking mouth
                  <path d="M 112,110 Q 120,122 128,110 Z" fill="#9C271E" stroke="#5C1610" strokeWidth="1.2">
                    <path d="M 114,110 Q 120,113 126,110" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
                    <circle cx="120" cy="117" r="3" fill="#FF8A80" />
                  </path>
                ) : mouthFrame === 3 ? (
                  // Rounded talking 'O'
                  <ellipse cx="120" cy="112" rx="5" ry="7" fill="#8E2018" stroke="#54120C" strokeWidth="1.2" />
                ) : (
                  // Gentle warm smile (idle)
                  <path d="M 112,110 Q 120,118 128,110" stroke="#7A221B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                )}
              </g>
            </g>
          </svg>
        </div>

        {/* Floating Speaking Bubble */}
        {isSpeaking && (
          <div className="absolute top-4 inset-x-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-amber-300 z-30 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-extrabold tracking-widest text-emerald-800 uppercase">
                Abdul Bari Speaking
              </span>
            </div>
            <p className="text-xs text-[#173D33] font-bold mt-1 leading-snug">
              {story?.steps[currentStep] || story?.lesson || "Remember Allah in every action."}
            </p>
          </div>
        )}
      </div>

      {/* Whiteboard chalkboard lines below */}
      {showWhiteboardText && story && (
        <div className="bg-[#FFFBEF] border-t-2 border-[#C9A24D]/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black tracking-wider text-[#9A7432] uppercase">
            <span>{story.tag} · SCENE {currentStep + 1}/{story.steps.length}</span>
            <span className="text-stone-500">Moral Cartoon Story</span>
          </div>

          <div className="space-y-1.5">
            {story.steps.map((st, i) => {
              const isCurrent = i === currentStep;
              return (
                <div
                  key={i}
                  className={`text-xs p-2 rounded-xl transition-all duration-300 flex items-start gap-2 ${
                    isCurrent
                      ? 'bg-amber-100 font-extrabold text-[#0E2B24] border border-amber-300 shadow-xs'
                      : i < currentStep
                      ? 'text-stone-400 line-through opacity-70'
                      : 'text-stone-400'
                  }`}
                >
                  <span className="font-bold text-amber-800">{i + 1}.</span>
                  <span className="leading-snug">{st}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Emotion Bar */}
      {interactive && (
        <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-1 text-[10px]">
          <span className="font-bold text-stone-500 shrink-0">Emotion:</span>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'patient', label: 'Patience 🌱' },
              { id: 'honest', label: 'Honesty 👛' },
              { id: 'grateful', label: 'Gratitude 🍞' },
              { id: 'humble', label: 'Dua 🤲' },
              { id: 'gentle', label: 'Peace 🌸' },
            ].map(em => (
              <button
                key={em.id}
                onClick={() => setSelectedEmotion(em.id)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  effectiveEmotion === em.id
                    ? 'bg-[#1C4E40] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                {em.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
