import React, { useState } from 'react';
import { IslamicButton, ButtonVariant } from './IslamicButton';
import { Play, Sparkles, Check, Heart, BookOpen, Volume2, Shield, Flame } from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

export const ButtonShowcase: React.FC = () => {
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'anatomy'>('preview');

  const handleTestClick = (name: string, hapticType: 'subtle' | 'gold' | 'chime' = 'gold') => {
    setClickedButton(name);
    playTactileClick(hapticType);
    setTimeout(() => setClickedButton(null), 1000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#C9A24D] text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Islamic Craftsmanship</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#173D33] tracking-tight">
            Modified Inner Button Design & Haptics
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Crafted with multi-layered specular highlights, dual-tone gold bevels, and tactile micro-interactions.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'preview' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Live Buttons
          </button>
          <button
            onClick={() => setActiveTab('anatomy')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'anatomy' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Inner Anatomy
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="space-y-6">
          {/* Main Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Gilded Bullion Button */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex flex-col items-center text-center gap-3">
              <span className="text-[10px] font-bold text-amber-800 tracking-wider uppercase">
                Gilded Bullion
              </span>
              <IslamicButton
                variant="gold"
                size="md"
                arabicFlourish={true}
                shimmer={true}
                haptic="gold"
                onClick={() => handleTestClick('Gilded Bullion', 'gold')}
              >
                Enter Jannah
              </IslamicButton>
              <span className="text-[11px] text-stone-500 leading-tight">
                Dual metallic gold sheen with embossed Arabesque stars and top specular light.
              </span>
            </div>

            {/* 2. Jannah Emerald Inset */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 flex flex-col items-center text-center gap-3">
              <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase">
                Jannah Emerald
              </span>
              <IslamicButton
                variant="jannah"
                size="md"
                arabicFlourish={true}
                haptic="chime"
                onClick={() => handleTestClick('Jannah Emerald', 'chime')}
              >
                Listen Recitation
              </IslamicButton>
              <span className="text-[11px] text-stone-500 leading-tight">
                Deep sanctuary emerald with dual-layer inset bevels and gold filigree border.
              </span>
            </div>

            {/* 3. Soft Parchment Bevel */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center text-center gap-3">
              <span className="text-[10px] font-bold text-stone-700 tracking-wider uppercase">
                Soft Parchment
              </span>
              <IslamicButton
                variant="secondary"
                size="md"
                arabicFlourish={false}
                haptic="subtle"
                onClick={() => handleTestClick('Soft Parchment', 'subtle')}
              >
                Save Reflection
              </IslamicButton>
              <span className="text-[11px] text-stone-500 leading-tight">
                Clean parchment surface with subtle inner rim highlight and crisp contrast.
              </span>
            </div>

            {/* 4. Ruby Stop / Active */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 flex flex-col items-center text-center gap-3">
              <span className="text-[10px] font-bold text-rose-800 tracking-wider uppercase">
                Ruby Stop State
              </span>
              <IslamicButton
                variant="ruby"
                size="md"
                arabicFlourish={true}
                haptic="subtle"
                onClick={() => handleTestClick('Ruby Stop', 'subtle')}
              >
                Stop Recitation
              </IslamicButton>
              <span className="text-[11px] text-stone-500 leading-tight">
                Illuminated ruby core for active playback controls and immediate tactile response.
              </span>
            </div>
          </div>

          {/* Feedback banner */}
          {clickedButton && (
            <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold text-center animate-fade-in flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Pressed <strong>{clickedButton}</strong>: Synthetic audio click & physical scale fired!</span>
            </div>
          )}
        </div>
      ) : (
        /* Anatomy Explanation */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-[#173D33] text-sm">Dual Inset Bevels</h4>
            <p className="leading-relaxed">
              Engineered with multi-layered inner shadows and subtle edge gradients to produce true tactile depth that mirrors engraved Islamic brassware.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-[#173D33] text-sm">Specular Highlights</h4>
            <p className="leading-relaxed">
              A delicate upper rim highlight captures ambient light like polished gold leaf, providing visual feedback during hover and touch.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-[#173D33] text-sm">Arabesque Micro-Flourishes</h4>
            <p className="leading-relaxed">
              Traditional eight-pointed geometric star motifs flank the title, expanding subtly during interaction for an authentic spiritual aesthetic.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
