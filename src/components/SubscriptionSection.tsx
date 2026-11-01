import React, { useState } from 'react';
import { 
  SubscriptionPlanId, 
  SubscriptionPlan, 
  SubscriptionReason, 
  UserSubscriptionState 
} from '../types';
import { IslamicButton } from './IslamicButton';
import { 
  HeartHandshake, 
  Sparkles, 
  ShieldCheck, 
  Tv, 
  Check, 
  Crown, 
  X, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  RotateCcw,
  BookOpen,
  Volume2,
  Download,
  Users,
  Mic,
  Palette,
  FileCheck
} from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

const SUBSCRIPTION_REASONS: SubscriptionReason[] = [
  {
    id: 'sadaqah',
    icon: '🤲',
    title: '1. Sadaqah Jariyah & 1-for-1 Global Waqf',
    subtitle: 'For every subscription, we sponsor an underprivileged student',
    description: 'A portion of every subscription directly funds digital Quran tablets and free accounts for orphanages and rural madrasas across 14 countries. Your subscription acts as continuous ongoing charity (Sadaqah Jariyah) even while you sleep.',
    moralImpact: 'Quran 2:261 · "Like a seed that grows seven spikes, in each spike a hundred grains."'
  },
  {
    id: 'abdul_bari',
    icon: '🎨',
    title: '2. Complete Abdul Bari Cartoon Library & Offline Mode',
    subtitle: 'Wholesome, ad-free Islamic animation safe for children',
    description: 'Unlock all 30+ moral cartoon episodes with downloadable offline videos for car rides and family travels. Zero third-party ads, zero tracking, zero algorithmic brain-rot. Clean Islamic values taught with joy and humor.',
    moralImpact: 'Prophetic Sunnah · "The best gift a father can give his child is good manners."'
  },
  {
    id: 'reciters',
    icon: '📖',
    title: '3. Lossless Studio Recitations & Tajweed Master',
    subtitle: '15+ legendary reciters in 320kbps studio quality',
    description: 'Listen to pristine audio from Sheikh Mishary Alafasy, Abdul Basit (Murattal & Mujawwad), Al-Minshawi, and Maher Al-Muaiqly with word-by-word glowing synchronization and background loop playback.',
    moralImpact: 'Quran 73:4 · "And recite the Quran with measured, beautiful recitation."'
  },
  {
    id: 'privacy',
    icon: '🛡️',
    title: '4. 100% Ad-Free & Sacred Privacy Guarantee',
    subtitle: 'No data selling, no commercial banners in your worship',
    description: 'Unlike commercial prayer apps that monetize your location or show intrusive insurance and game advertisements between prayers, Amanora is independent, private, and consecrated strictly for spiritual remembrance.',
    moralImpact: 'Pure Sincerity · Your daily prayers and dua remain strictly private.'
  },
  {
    id: 'mufti_majlis',
    icon: '🎙️',
    title: '5. VIP Mufti Majlis & Private Fatwa Guidance',
    subtitle: 'Direct monthly Q&A sessions and verified scholarly circles',
    description: 'Access exclusive monthly live video circles with renowned Muftis, ask personal faith and family questions, and browse the verified searchable archive of contemporary Islamic rulings and heart-softening spiritual medicine.',
    moralImpact: 'Quran 16:43 · "So ask the people of knowledge if you do not know."'
  }
];

const PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Noor',
    price: '$4.99',
    period: 'per month',
    benefits: [
      'Unlimited Abdul Bari Cartoon Episodes',
      'Download stories for offline family viewing',
      '15+ Studio Quran Reciters (320kbps)',
      '100% Ad-Free Sanctuary Experience',
      'Printable Kids Hadith Activity Kits',
      'Cancel anytime with 1 click'
    ]
  },
  {
    id: 'annual',
    name: 'Annual Jannah Patron',
    price: '$39.99',
    period: 'per year ($3.33/mo)',
    savings: 'SAVE 35% + SPONSOR 1 STUDENT',
    featured: true,
    benefits: [
      'Everything in Monthly Noor pass',
      '1-for-1 Waqf: Sponsors 1 free student subscription',
      'Offline Audio Mushaf for all 114 Surahs',
      'VIP Mufti Majlis & Verified Fatwa Archive',
      'Exclusive Golden App Theme & Insignia',
      'Personalized Sadaqah Jariyah Waqf Certificate',
      'Family Access (up to 4 unique profiles)'
    ]
  },
  {
    id: 'lifetime',
    name: 'Lifetime Waqf Benefactor',
    price: '$129.00',
    period: 'one-time blessing',
    savings: 'LIFETIME ACCESS FOR ENTIRE FAMILY',
    benefits: [
      'Permanent lifetime access for your household (up to 6 profiles)',
      'Sponsors 5 underprivileged student accounts worldwide',
      'Custom Sacred Athans from Makkah, Madinah & Al-Aqsa',
      'Name permanently inscribed in the Amanora Waqf Book',
      'Downloadable Khatam Quran & Islamic Art Certificates',
      'Direct Priority Access to all future Islamic tools'
    ]
  }
];

interface SubscriptionSectionProps {
  subscriptionState: UserSubscriptionState;
  userName?: string;
  onUpdateSubscription: (state: UserSubscriptionState) => void;
  onClose?: () => void;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  subscriptionState,
  userName = "Servant of Allah",
  onUpdateSubscription,
  onClose,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>('annual');
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [activeReasonTab, setActiveReasonTab] = useState<string>('sadaqah');
  const [activePerkTab, setActivePerkTab] = useState<'certificate' | 'coloring' | 'athans' | 'family'>('certificate');
  const [playingAthan, setPlayingAthan] = useState<string | null>(null);

  const handleSubscribe = (planId: SubscriptionPlanId) => {
    playTactileClick('chime');
    const sponsoredCount = planId === 'lifetime' ? 5 : planId === 'annual' ? 1 : 0;
    
    const newState: UserSubscriptionState = {
      isSubscribed: true,
      planId: planId,
      subscribedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      sponsoredAccountsCount: (subscriptionState.sponsoredAccountsCount || 0) + sponsoredCount,
    };

    onUpdateSubscription(newState);
    setShowCelebrationModal(true);
  };

  const handleCancelSubscription = () => {
    playTactileClick('subtle');
    onUpdateSubscription({
      isSubscribed: false,
      planId: 'free',
      sponsoredAccountsCount: subscriptionState.sponsoredAccountsCount,
    });
  };

  const playAthanChime = (athanName: string) => {
    playTactileClick('chime');
    setPlayingAthan(athanName);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Allahu Akbar, Allahu Akbar. Calling prayer from ${athanName}.`);
      u.rate = 0.9;
      u.onend = () => setPlayingAthan(null);
      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => setPlayingAthan(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none">
      
      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#174D3D] via-[#103A2E] to-[#0A261E] p-6 sm:p-8 text-white border-2 border-[#C9A24D]/60 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#E7CF9B] text-xs font-black tracking-widest uppercase">
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Amanora Noor & Family Pass</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Why We Offer Subscriptions
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              To keep your worship 100% ad-free, sponsor global Islamic education for needy students, and support authentic high-definition moral animation without commercial sponsors or unethical data mining.
            </p>
          </div>

          {/* Current Status Pill */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {subscriptionState.isSubscribed ? (
              <div className="flex items-center gap-2 bg-[#C9A24D] text-[#0E2B24] px-4 py-2.5 rounded-2xl font-black text-xs shadow-md">
                <Crown className="w-4 h-4 fill-current" />
                <span>ACTIVE NOOR PATRON ({subscriptionState.planId.toUpperCase()})</span>
              </div>
            ) : (
              <span className="text-xs text-amber-200 font-bold bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
                Current Plan: Free Tier
              </span>
            )}

            {subscriptionState.sponsoredAccountsCount > 0 && (
              <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>You are sponsoring {subscriptionState.sponsoredAccountsCount} student(s)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ==============================================================
          THE 5 CORE REASONS FOR SUBSCRIPTIONS
          ============================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-md space-y-5">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#9A7432] uppercase">
              Ethical Foundation
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#173D33] tracking-tight">
              5 Meaningful Reasons to Subscribe
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Every dollar directly protects your spiritual privacy and spreads the light of Islamic knowledge worldwide.
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            100% Halal Waqf Model
          </span>
        </div>

        {/* Ethical Reason Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SUBSCRIPTION_REASONS.map(r => {
            const isSelected = activeReasonTab === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  playTactileClick('subtle');
                  setActiveReasonTab(r.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1C4E40] text-white border-[#C9A24D] shadow-md ring-2 ring-[#C9A24D]/20 scale-102'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span className="text-2xl block mb-1">{r.icon}</span>
                <p className="text-xs font-bold leading-tight line-clamp-2">{r.title.split('. ')[1]}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Reason Detail Display */}
        {(() => {
          const reason = SUBSCRIPTION_REASONS.find(r => r.id === activeReasonTab) || SUBSCRIPTION_REASONS[0];
          return (
            <div className="p-6 rounded-2xl bg-[#FFFBEF] border-2 border-[#C9A24D]/40 space-y-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-3 rounded-2xl bg-amber-100 border border-amber-300">
                  {reason.icon}
                </span>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[#173D33]">{reason.title}</h4>
                  <p className="text-xs sm:text-sm font-bold text-[#9A7432]">{reason.subtitle}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                {reason.description}
              </p>

              <div className="pt-3 border-t border-amber-200/60 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{reason.moralImpact}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ==============================================================
          PLANS & PRICING TIERS
          ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map(plan => {
          const isSelected = selectedPlan === plan.id;
          const isCurrentActive = subscriptionState.isSubscribed && subscriptionState.planId === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between cursor-pointer relative ${
                plan.featured
                  ? 'bg-gradient-to-b from-[#FFFDF7] to-[#F7F2E4] border-[#C9A24D] shadow-lg ring-2 ring-[#C9A24D]/30'
                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
              }`}
            >
              {plan.savings && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-[10px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                  {plan.savings}
                </div>
              )}

              <div className="space-y-4">
                <div className="pt-1">
                  <h4 className="text-lg font-extrabold text-[#173D33]">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-[#0E2B24] tracking-tight">{plan.price}</span>
                    <span className="text-xs text-stone-500 font-semibold">{plan.period}</span>
                  </div>
                </div>

                <div className="divide-y divide-stone-100 text-xs text-stone-600">
                  {plan.benefits.map((b, i) => (
                    <div key={i} className="py-2.5 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug font-medium">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-3 border-t border-stone-100">
                {isCurrentActive ? (
                  <div className="w-full py-3 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-black text-center flex items-center justify-center gap-1.5 border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your Current Plan</span>
                  </div>
                ) : (
                  <IslamicButton
                    variant={plan.featured ? 'gold' : 'jannah'}
                    size="md"
                    arabicFlourish={plan.featured}
                    shimmer={plan.featured}
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full"
                  >
                    Select {plan.name.split(' ')[0]} ✦
                  </IslamicButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==============================================================
          EXCLUSIVE PATRON PERKS HUB (Unique High-Value Features)
          ============================================================== */}
      <div className="bg-gradient-to-br from-[#FFFDF7] to-[#F8F4E8] rounded-3xl p-6 sm:p-7 border-2 border-[#C9A24D]/60 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 uppercase tracking-widest">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>Patron Perks & Unique Islamic Assets</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#173D33] tracking-tight mt-0.5">
              Interactive Member Blessings
            </h3>
          </div>

          {/* Quick Perks Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-stone-200 shadow-xs">
            {[
              { id: 'certificate', label: 'Waqf Certificate', icon: '📜' },
              { id: 'coloring', label: 'Kids Coloring Book', icon: '🎨' },
              { id: 'athans', label: 'Haramain Athans', icon: '🕌' },
              { id: 'family', label: 'Family Multi-Logins', icon: '👥' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  playTactileClick('subtle');
                  setActivePerkTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activePerkTab === tab.id
                    ? 'bg-[#1C4E40] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Personalized Waqf Certificate */}
        {activePerkTab === 'certificate' && (
          <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-[#C9A24D] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-[#C9A24D] flex items-center justify-center text-3xl mx-auto shadow-sm">
              👑
            </div>
            <p className="font-arabic text-2xl text-amber-900">
              شَهَادَةُ وَقْفٍ وَصَدَقَةٍ جَارِيَةٍ
            </p>
            <div className="max-w-xl mx-auto space-y-1">
              <h4 className="text-xl font-black text-[#0E2B24]">
                Global Islamic Waqf Benefactor Certificate
              </h4>
              <p className="text-xs text-stone-500 font-medium">
                Issued to: <span className="font-bold text-[#173D33] underline">{userName}</span> · Amanora Sanctuary
              </p>
              <p className="text-xs text-stone-600 leading-relaxed pt-2">
                This certifies that the bearer has established an ongoing charitable endowment (Sadaqah Jariyah) supporting digital Quranic tablets and moral animated learning for children in need worldwide.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => alert(`Certificate successfully generated for ${userName}! You can save or print this blessing.`)}
                className="px-4 py-2 rounded-xl bg-[#1C4E40] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#143B30] transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save High-Resolution Certificate</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Kids Coloring Book & Activity Kits */}
        {activePerkTab === 'coloring' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Abdul Bari & The Date Palm Garden",
                desc: "12 printable coloring pages on patience and kindness",
                pages: "12 Pages · PDF",
                icon: "🌴"
              },
              {
                title: "30 Days of Ramadan Good Deeds",
                desc: "Interactive daily tracker for kids with star stickers",
                pages: "30 Activities · PDF",
                icon: "⭐"
              },
              {
                title: "Prophetic Sunnah Coloring Kit",
                desc: "Illustrating smiling, sharing bread, and visiting the sick",
                pages: "16 Pages · PDF",
                icon: "🍞"
              }
            ].map((kit, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-3xl block">{kit.icon}</span>
                  <h5 className="text-sm font-black text-[#173D33]">{kit.title}</h5>
                  <p className="text-xs text-stone-600 leading-snug">{kit.desc}</p>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {kit.pages}
                  </span>
                  <button
                    onClick={() => alert(`Downloaded "${kit.title}"! Enjoy wholesome offline family activity.`)}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print Kit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Sacred Haramain Athans */}
        {activePerkTab === 'athans' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Makkah Al-Mukarramah", desc: "Dawn Fajr call from the Holy Kaaba", qari: "Sheikh Ali Mulla", icon: "🕋" },
              { title: "Madinah Al-Munawwarah", desc: "Soul-stirring Maghrib from the Prophet's Mosque", qari: "Sheikh Essam Bukhari", icon: "🕌" },
              { title: "Masjid Al-Aqsa", desc: "Blessed Jerusalem twilight call to prayer", qari: "Sheikh Firas Qazzaz", icon: "✨" },
            ].map(athan => (
              <div key={athan.title} className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-amber-50 border border-amber-200">{athan.icon}</span>
                  <div>
                    <h5 className="text-sm font-black text-[#173D33]">{athan.title}</h5>
                    <p className="text-[11px] text-stone-500">{athan.qari}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-snug">{athan.desc}</p>
                <button
                  onClick={() => playAthanChime(athan.title)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    playingAthan === athan.title
                      ? 'bg-amber-400 text-[#0E2B24] ring-2 ring-amber-300'
                      : 'bg-[#1C4E40] text-white hover:bg-[#143B30]'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{playingAthan === athan.title ? 'Playing Sacred Athan...' : 'Listen to Athan'}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Family Multi-Logins */}
        {activePerkTab === 'family' && (
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-black text-[#173D33]">Household Family Pass (Up to 6 Accounts)</h5>
                <p className="text-xs text-stone-500">Every family member gets their own private good deed score, streaks, and bookmarks.</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                All Logins Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { name: "Fatima", role: "Primary Patron", avatar: "🧕" },
                { name: "Tariq", role: "Brother", avatar: "🧒" },
                { name: "Aminah", role: "Sister", avatar: "🌸" },
                { name: "Omar", role: "Elder", avatar: "🌙" },
              ].map(member => (
                <div key={member.name} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center space-y-1">
                  <span className="text-2xl block">{member.avatar}</span>
                  <p className="text-xs font-black text-[#173D33]">{member.name}</p>
                  <p className="text-[10px] text-stone-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Free Tier vs Patron Comparison */}
      <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 text-xs text-stone-600 space-y-3">
        <h4 className="font-extrabold text-[#173D33] text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Our Ethical Free Core Commitment</span>
        </h4>
        <p className="leading-relaxed">
          The core obligatory worship tools—prayer times, basic Quran reading, and daily Hadith—are and will <strong>always remain 100% free</strong> for all Muslims worldwide. Subscriptions exist exclusively for families and patrons who wish to fund global Waqf sponsorships, access unlimited animated cartoon releases, and keep our servers running without ads.
        </p>

        {subscriptionState.isSubscribed && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCancelSubscription}
              className="text-[11px] font-bold text-stone-400 hover:text-rose-600 transition-colors"
            >
              Cancel active subscription (revert to free)
            </button>
          </div>
        )}
      </div>

      {/* ==============================================================
          CONFIRMATION & SADAQAH WAQF CERTIFICATE MODAL
          ============================================================== */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF7] rounded-3xl max-w-md w-full p-6 border-4 border-[#C9A24D] shadow-2xl text-center space-y-4 animate-scale-in relative">
            <button
              onClick={() => setShowCelebrationModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-sm font-bold"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-[#C9A24D] text-[#C9A24D] flex items-center justify-center text-3xl mx-auto shadow-md">
              👑
            </div>

            <p className="font-arabic text-2xl text-amber-900">
              بَارَكَ اللَّهُ فِيكُمْ وَجَزَاكُمُ اللَّهُ خَيْرًا
            </p>

            <h3 className="text-xl font-black text-[#173D33]">
              Welcome to Amanora Noor Club!
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed">
              Your patron status is now active. All 30+ Abdul Bari moral cartoon shorts, studio reciters, VIP Mufti lectures, and offline downloads are unlocked.
            </p>

            {/* Waqf Sponsorship Certificate box */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-left space-y-1.5">
              <span className="text-[10px] font-black tracking-widest text-emerald-800 uppercase flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>Global Waqf Certificate</span>
              </span>
              <p className="text-xs font-bold text-emerald-950">
                1 Student Account Successfully Sponsored
              </p>
              <p className="text-[11px] text-emerald-800/80">
                A student in need has received free access to Quranic education in your name. May Allah accept your ongoing charity!
              </p>
            </div>

            <IslamicButton
              variant="gold"
              size="md"
              arabicFlourish={true}
              onClick={() => setShowCelebrationModal(false)}
              className="w-full"
            >
              Start Exploring Noor Sanctuary ✦
            </IslamicButton>
          </div>
        </div>
      )}
    </div>
  );
};
