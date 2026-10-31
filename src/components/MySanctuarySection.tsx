import React, { useState } from 'react';
import { AppSettings } from '../types';
import { IslamicButton } from './IslamicButton';
import { Heart, Bookmark, Settings, DoorOpen, Save, Check, Sparkles } from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

interface MySanctuarySectionProps {
  journal: string;
  onSaveJournal: (text: string) => void;
  bookmarks: number[];
  onOpenQuranPage?: (ayahNumber: number) => void;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
  onReopenGate: () => void;
}

export const MySanctuarySection: React.FC<MySanctuarySectionProps> = ({
  journal,
  onSaveJournal,
  bookmarks,
  settings,
  onChangeSettings,
  onReopenGate,
}) => {
  const [draftJournal, setDraftJournal] = useState(journal);
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = () => {
    onSaveJournal(draftJournal);
    playTactileClick('gold');
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const methods = [
    { label: 'MWL (Muslim World League)', value: 'MuslimWorldLeague' },
    { label: 'ISNA (North America)', value: 'NorthAmerica' },
    { label: 'Egyptian General Authority', value: 'Egyptian' },
    { label: 'Karachi (Univ. of Islamic Sciences)', value: 'Karachi' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Private Reflection Journal */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#173D33] flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              <span>Private Spiritual Journal</span>
            </h3>
            <p className="text-xs text-stone-500">Record your blessings, heartfelt duas, and daily reflections</p>
          </div>
          {savedStatus && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Saved Securely
            </span>
          )}
        </div>

        <textarea
          value={draftJournal}
          onChange={e => setDraftJournal(e.target.value)}
          placeholder="Today, I am grateful to Allah for... My heartfelt dua is..."
          className="w-full h-36 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-[#173D33] focus:outline-none focus:ring-2 focus:ring-[#C9A24D] resize-none leading-relaxed"
        />

        <div className="flex justify-end">
          <IslamicButton
            variant="jannah"
            size="md"
            arabicFlourish={true}
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Reflection
          </IslamicButton>
        </div>
      </div>

      {/* Bookmarks Section */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md space-y-3">
        <h3 className="text-lg font-extrabold text-[#173D33] flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-600 fill-amber-600/20" />
          <span>Saved Quran Ayahs ({bookmarks.length})</span>
        </h3>
        
        {bookmarks.length === 0 ? (
          <p className="text-xs text-stone-400 italic">No ayahs bookmarked yet. Tap the save icon while reading the Quran.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {bookmarks.map(num => (
              <span
                key={num}
                className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5"
              >
                <span>۞ Ayah Reference #{num}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md space-y-4">
        <h3 className="text-lg font-extrabold text-[#173D33] flex items-center gap-2">
          <Settings className="w-5 h-5 text-stone-600" />
          <span>Prayer Calculation Settings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {methods.map(m => (
            <button
              key={m.value}
              onClick={() => {
                playTactileClick('subtle');
                onChangeSettings({ ...settings, method: m.value });
              }}
              className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                settings.method === m.value
                  ? 'bg-[#1C4E40] text-white border-[#C9A24D] shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Replay Jannah Gate */}
      <div className="bg-gradient-to-r from-amber-50 to-stone-100 rounded-3xl p-6 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-[#173D33] text-sm">Experience the Jannah Gate</h4>
          <p className="text-xs text-stone-500 mt-0.5">Replay the celestial opening sequence and archway.</p>
        </div>

        <IslamicButton
          variant="gold"
          size="sm"
          icon={<DoorOpen className="w-4 h-4" />}
          onClick={onReopenGate}
        >
          Watch Gate Again ✦
        </IslamicButton>
      </div>
    </div>
  );
};
