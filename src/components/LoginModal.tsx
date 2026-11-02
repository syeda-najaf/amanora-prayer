import React, { useState } from 'react';
import { UserProfile } from '../types';
import { IslamicButton } from './IslamicButton';
import { 
  Sparkles, 
  Heart, 
  Check, 
  X, 
  Crown, 
  Shield, 
  UserPlus, 
  Users, 
  KeyRound, 
  Lock, 
  Unlock, 
  LogOut,
  Flame,
  Award,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

const AVATARS = [
  { id: 'fatima', label: 'Sister Fatima', icon: '🧕' },
  { id: 'abdul_bari', label: 'Abdul Bari', icon: '🧒' },
  { id: 'tariq', label: 'Brother Tariq', icon: '👳' },
  { id: 'aminah', label: 'Little Aminah', icon: '🌸' },
  { id: 'crescent', label: 'Crescent Noor', icon: '🌙' },
  { id: 'mosque', label: 'Haramain', icon: '🕌' },
  { id: 'lantern', label: 'Fanous Lantern', icon: '🏮' },
  { id: 'oasis', label: 'Jannah Palm', icon: '🌴' },
  { id: 'tasbih', label: 'Amber Dhikr', icon: '📿' },
  { id: 'quran', label: 'Sacred Book', icon: '📖' },
  { id: 'dove', label: 'Peace Dove', icon: '🕊️' },
];

const ROLES = [
  'Seeker of Jannah',
  'Student of Ilm',
  'Parent / Guide',
  'Young Believer',
  'Hafiz in Training',
];

interface LoginModalProps {
  currentProfile: UserProfile;
  savedProfiles: UserProfile[];
  isOpen: boolean;
  onSelectProfile: (profile: UserProfile) => void;
  onCreateProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  currentProfile,
  savedProfiles,
  isOpen,
  onSelectProfile,
  onCreateProfile,
  onClose,
}) => {
  const [mode, setMode] = useState<'switch' | 'create' | 'pin'>('switch');
  
  // New account form state
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newAvatar, setNewAvatar] = useState<string>('🧒');
  const [newRole, setNewRole] = useState<string>('Seeker of Jannah');
  const [newPin, setNewPin] = useState<string>('');
  const [newGoal, setNewGoal] = useState<string>('Daily Salah & Quran Reflection');
  
  // PIN verification state
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  if (!isOpen) return null;

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    playTactileClick('gold');

    const created: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@jannah.me`,
      avatar: newAvatar,
      role: newRole as any,
      pin: newPin.trim() || '1234',
      dailyGoal: newGoal,
      streakDays: 1,
      goodDeedPoints: 50,
      tasbihCount: 0,
      bookmarks: [1],
      journalText: '',
      isLoggedIn: true,
      joinedDate: new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    };

    onCreateProfile(created);
    setMode('switch');
    onClose();
  };

  const handlePickAccount = (p: UserProfile) => {
    playTactileClick('subtle');
    if (p.pin && p.pin.length > 0 && p.id !== currentProfile.id) {
      setTargetProfile(p);
      setEnteredPin('');
      setPinError('');
      setMode('pin');
    } else {
      onSelectProfile(p);
      onClose();
    }
  };

  const handleVerifyPin = () => {
    if (!targetProfile) return;
    if (targetProfile.pin && targetProfile.pin !== enteredPin) {
      setPinError('Incorrect 4-digit PIN. Please try again.');
      playTactileClick('subtle');
      return;
    }

    playTactileClick('gold');
    onSelectProfile(targetProfile);
    setMode('switch');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#FFFDF7] rounded-3xl max-w-lg w-full p-6 sm:p-7 border-4 border-[#C9A24D] shadow-2xl space-y-5 animate-scale-in relative max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold absolute top-5 right-5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-2">
          <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-[#C9A24D] flex items-center justify-center text-3xl mx-auto shadow-md">
            {mode === 'create' ? newAvatar : currentProfile.avatar}
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase block pt-1">
            INDIVIDUAL & FAMILY ACCESS
          </span>
          <h3 className="text-2xl font-black text-[#173D33]">
            {mode === 'switch' && 'Choose Your Unique Account'}
            {mode === 'create' && 'Create Your Unique Sanctuary Login'}
            {mode === 'pin' && `Enter PIN for ${targetProfile?.name}`}
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            {mode === 'switch' && 'Everyone gets their own private good deed score, tasbih dhikr, and streaks.'}
            {mode === 'create' && 'Set up your unique personal profile with your custom avatar and goals.'}
            {mode === 'pin' && 'Enter your 4-digit security PIN to access your personal journal and deeds.'}
          </p>
        </div>

        {/* Mode Navigation Tabs */}
        {mode !== 'pin' && (
          <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-2xl">
            <button
              onClick={() => {
                playTactileClick('subtle');
                setMode('switch');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === 'switch'
                  ? 'bg-white text-[#173D33] shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Saved Accounts ({savedProfiles.length})</span>
            </button>

            <button
              onClick={() => {
                playTactileClick('subtle');
                setMode('create');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === 'create'
                  ? 'bg-[#1C4E40] text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ New Account</span>
            </button>
          </div>
        )}

        {/* ==============================================================
            MODE 1: SWITCH / SELECT SAVED UNIQUE ACCOUNT
            ============================================================== */}
        {mode === 'switch' && (
          <div className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {savedProfiles.map(p => {
                const isActive = p.id === currentProfile.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handlePickAccount(p)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#FFFBEF] border-[#C9A24D] shadow-sm ring-2 ring-[#C9A24D]/20'
                        : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-xs">
                        {p.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-[#173D33]">{p.name}</h4>
                          {isActive && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                              Active Now
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium">
                          {p.role || 'Believer'} · {p.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div className="hidden sm:block">
                        <span className="text-xs font-black text-amber-700 flex items-center gap-1 justify-end">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          ★ {p.goodDeedPoints}
                        </span>
                        <span className="text-[10px] text-stone-500 flex items-center gap-1 justify-end">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {p.streakDays}d streak
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action to Add Another Member */}
            <button
              onClick={() => {
                playTactileClick('subtle');
                setMode('create');
              }}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#C9A24D]/60 hover:bg-amber-50/50 text-[#9A7432] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Another Family Member or User</span>
            </button>
          </div>
        )}

        {/* ==============================================================
            MODE 2: CREATE NEW UNIQUE ACCOUNT
            ============================================================== */}
        {mode === 'create' && (
          <form onSubmit={handleCreateNew} className="space-y-4">
            {/* Cute Avatar Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                1. Choose Your Unique Avatar:
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      playTactileClick('subtle');
                      setNewAvatar(av.icon);
                    }}
                    className={`p-2 rounded-xl border text-xl transition-all ${
                      newAvatar === av.icon
                        ? 'bg-amber-100 border-[#C9A24D] scale-110 shadow-sm ring-2 ring-[#C9A24D]/40'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                    title={av.label}
                  >
                    {av.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                2. Your Name:
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Brother Zaid, Sister Maryam, Little Hamzah"
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-bold text-[#173D33] focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
              />
            </div>

            {/* Role & PIN 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  3. Spiritual Role:
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#173D33] focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block flex items-center justify-between">
                  <span>4. 4-Digit PIN (Private):</span>
                  <span className="text-[10px] text-stone-400">Default: 1234</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold text-center tracking-widest text-[#173D33] focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
                />
              </div>
            </div>

            {/* Daily Spiritual Intention Goal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                5. Personal Goal:
              </label>
              <input
                type="text"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                placeholder="e.g. 5 Daily Prayers & Recite Surah Al-Mulk"
                className="w-full p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium text-[#173D33] focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
              />
            </div>

            <IslamicButton
              type="submit"
              variant="gold"
              size="lg"
              arabicFlourish={true}
              shimmer={true}
              haptic="chime"
              className="w-full shadow-lg"
            >
              Create Account & Enter Jannah ✦
            </IslamicButton>
          </form>
        )}

        {/* ==============================================================
            MODE 3: PIN UNLOCK
            ============================================================== */}
        {mode === 'pin' && targetProfile && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-[#C9A24D] flex items-center justify-center text-3xl mx-auto shadow-sm">
              {targetProfile.avatar}
            </div>
            
            <div>
              <h4 className="text-base font-black text-[#173D33]">{targetProfile.name}</h4>
              <p className="text-xs text-stone-500">Enter your 4-digit PIN to access your private account</p>
            </div>

            <div className="max-w-[200px] mx-auto space-y-2">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={enteredPin}
                onChange={e => {
                  setPinError('');
                  setEnteredPin(e.target.value.replace(/\D/g, ''));
                }}
                placeholder="• • • •"
                className="w-full p-3 rounded-2xl bg-stone-50 border-2 border-[#C9A24D] text-lg font-black text-center tracking-widest text-[#173D33] focus:ring-2 focus:ring-[#C9A24D] focus:outline-none"
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-bold">{pinError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('switch')}
                className="flex-1 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
              >
                Back to Accounts
              </button>
              
              <IslamicButton
                variant="gold"
                size="md"
                onClick={handleVerifyPin}
                className="flex-1"
              >
                Unlock Account
              </IslamicButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
