export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export interface Coordinates {
  latitude: number;
  longitude: number;
  city: string;
}

export interface PrayerTime {
  name: PrayerName;
  date: Date;
}

export interface AppSettings {
  method: string;
  reciter: string;
}

export type Tab = "Home" | "Quran" | "Hadith" | "Shorts" | "Bayan" | "Plus" | "Worship" | "Learn" | "Subscription" | "More";

export type SubscriptionPlanId = 'free' | 'monthly' | 'annual' | 'lifetime';

export interface SubscriptionReason {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  moralImpact: string;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  period: string;
  savings?: string;
  featured?: boolean;
  benefits: string[];
}

export interface UserSubscriptionState {
  isSubscribed: boolean;
  planId: SubscriptionPlanId;
  subscribedAt?: string;
  sponsoredAccountsCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  pin?: string;
  avatar: string;
  role?: string;
  dailyGoal?: string;
  streakDays: number;
  goodDeedPoints: number;
  tasbihCount?: number;
  bookmarks?: number[];
  journalText?: string;
  isLoggedIn: boolean;
  joinedDate: string;
}

export interface MuftiBayan {
  id: string;
  speaker: string;
  title: string;
  category: "Peace" | "Family" | "Repentance" | "Jannah" | "Youth" | "Seerah";
  duration: string;
  audioUrl: string;
  coverImage: string;
  summary: string;
  keyTakeaways: string[];
  isPremium?: boolean;
}

export interface AllahName {
  number: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  explanation: string;
}

export interface HisnulDua {
  id: string;
  category: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  page: number;
  surah?: {
    englishName: string;
    name: string;
  };
}

export interface Surah {
  number: number;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  name: string;
}

export interface HadithItem {
  id: number;
  category: string;
  arabic: string;
  meaning: string;
  reference: string;
}

export interface ShortStory {
  id: number;
  tag: string;
  title: string;
  topic: string;
  video: string;
  steps: string[];
  lesson: string;
  reference: string;
  narration: string;
  actionType: "plant_seed" | "return_wallet" | "share_bread" | "dua_night" | "gentle_words";
  characterEmotion: "patient" | "honest" | "grateful" | "humble" | "gentle";
  keyMoral: string;
}
