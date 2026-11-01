import React, { useState, useEffect, useRef } from 'react';
import { ShortStory } from '../types';
import { AbdulBariCartoon } from './AbdulBariCartoon';
import { IslamicButton } from './IslamicButton';
import { 
  Play, 
  Square, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Sparkles, 
  Film, 
  Bookmark, 
  RotateCcw,
  Volume2,
  Crown
} from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

interface AbdulBariReelsProps {
  stories: ShortStory[];
  onOpenSubscription?: () => void;
  onClose?: () => void;
}

export const AbdulBariReels: React.FC<AbdulBariReelsProps> = ({
  stories,
  onOpenSubscription,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<'cartoon' | 'video'>('cartoon');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [savedStories, setSavedStories] = useState<number[]>([]);

  const currentStory = stories[currentIndex] || stories[0];

  const stopNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    stopNarration();
    setActiveStep(0);
  }, [currentIndex, mode]);

  useEffect(() => {
    return () => {
      stopNarration();
    };
  }, []);

  // Step-by-step cartoon progression while speaking
  useEffect(() => {
    if (mode !== 'cartoon' || !isSpeaking) return;

    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev < currentStory.steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800 / playbackSpeed);

    return () => clearInterval(interval);
  }, [mode, isSpeaking, currentStory.steps.length, playbackSpeed]);

  const toggleNarration = () => {
    if (isSpeaking) {
      stopNarration();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentStory.narration);
    utterance.rate = 0.88 * playbackSpeed;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const nextStory = () => {
    stopNarration();
    setCurrentIndex(prev => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    stopNarration();
    setCurrentIndex(prev => (prev - 1 + stories.length) % stories.length);
  };

  const toggleSave = () => {
    setSavedStories(prev =>
      prev.includes(currentStory.id) ? prev.filter(id => id !== currentStory.id) : [...prev, currentStory.id]
    );
    playTactileClick('subtle');
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0E2B24] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C9A24D]/60 text-white select-none">
      
      {/* ==============================================================
          STUDIO TOP BAR (Full-width, clean controls, no overlapping)
          ============================================================== */}
      <div className="px-6 py-4 bg-[#0A221C] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={() => {
                stopNarration();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 text-xs font-bold transition-colors"
            >
              ← Back to Sanctuary
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
                DEEN SHORTS STUDIO
              </span>
              <span className="text-stone-500">·</span>
              <span className="text-xs text-stone-300 font-bold">
                Story {currentIndex + 1} of {stories.length}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {currentStory.title}
            </h2>
          </div>
        </div>

        {/* Action Controls & Mode Switch */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/15">
            <button
              onClick={() => {
                stopNarration();
                setMode('cartoon');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'cartoon'
                  ? 'bg-[#C9A24D] text-[#0E2B24] shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>🎨 Cartoon Studio</span>
            </button>

            <button
              onClick={() => {
                stopNarration();
                setMode('video');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'video'
                  ? 'bg-[#C9A24D] text-[#0E2B24] shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>🎬 Video Mode</span>
            </button>
          </div>

          {/* Noor Pass Link */}
          {onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#C9A24D] text-[#0E2B24] text-xs font-black flex items-center gap-1 shadow-xs hover:brightness-105 transition-all"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Noor Pass</span>
            </button>
          )}
        </div>
      </div>

      {/* ==============================================================
          STUDIO MAIN VIEWPORT (2-Column Responsive Layout - Zero Overlap)
          ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-stretch">
        
        {/* Left Column (7 cols): Animated Character Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[420px] bg-black/20 rounded-2xl border border-white/10 p-2 overflow-hidden">
          {mode === 'cartoon' ? (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              <AbdulBariCartoon
                story={currentStory}
                currentStep={activeStep}
                isSpeaking={isSpeaking}
                size="full"
                showWhiteboardText={false}
              />
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[400px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <video
                src={currentStory.video}
                controls
                playsInline
                loop
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          )}

          {/* Next / Previous Overlay Buttons */}
          <div className="absolute right-4 bottom-4 flex items-center gap-2 z-30">
            <button
              onClick={prevStory}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md"
              title="Previous Story"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSave}
              className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-md ${
                savedStories.includes(currentStory.id)
                  ? 'bg-amber-400 text-stone-900 border-amber-300'
                  : 'bg-black/60 text-white border-white/20'
              }`}
              title="Save Story"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={nextStory}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md"
              title="Next Story"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Storyboard Step Cards & Lesson Audio Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-[#0A221C] p-5 rounded-2xl border border-white/10">
          
          <div className="space-y-3">
            {/* Tag & Reference */}
            <div className="flex items-center justify-between">
              <span className="bg-[#C9A24D] text-[#0E2B24] px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase">
                {currentStory.tag}
              </span>
              <span className="text-xs text-amber-200 font-semibold font-mono">
                {currentStory.reference}
              </span>
            </div>

            {/* Main Lesson Quote */}
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#E9D19A] uppercase block">
                MORAL PRINCIPLE
              </span>
              <h3 className="text-lg font-black text-white leading-snug mt-1">
                "{currentStory.lesson}"
              </h3>
            </div>

            {/* Storyboard Step-by-Step Scenes */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Story Scenes (Step {activeStep + 1} of {currentStory.steps.length})
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {currentStory.steps.map((st, i) => {
                  const isCurrent = i === activeStep;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`w-full text-left text-xs p-2.5 rounded-xl transition-all flex items-start gap-2.5 border ${
                        isCurrent
                          ? 'bg-amber-100 font-extrabold text-[#0E2B24] border-amber-300 shadow-xs'
                          : 'bg-white/5 text-stone-300 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className={`font-mono font-bold shrink-0 ${isCurrent ? 'text-amber-800' : 'text-stone-500'}`}>
                        {i + 1}.
                      </span>
                      <span className="leading-snug">{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <IslamicButton
                variant={isSpeaking ? 'ruby' : 'gold'}
                size="md"
                arabicFlourish={true}
                shimmer={!isSpeaking}
                haptic={isSpeaking ? 'subtle' : 'gold'}
                icon={isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                onClick={toggleNarration}
                className="flex-1"
              >
                {isSpeaking ? 'Stop Story' : 'Listen with Abdul Bari'}
              </IslamicButton>

              {/* Speed Switcher */}
              <button
                onClick={() => setPlaybackSpeed(s => s === 1.0 ? 1.25 : s === 1.25 ? 0.75 : 1.0)}
                className="px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold border border-white/20 transition-colors"
                title="Change narration speed"
              >
                {playbackSpeed}x
              </button>

              {/* Restart */}
              <button
                onClick={() => {
                  setActiveStep(0);
                  if (isSpeaking) {
                    stopNarration();
                    setTimeout(() => toggleNarration(), 200);
                  }
                }}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                title="Restart Story"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
