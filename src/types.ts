export interface HadithItem {
  id: number;
  category: string;
  arabic: string;
  meaning: string;
  reference: string;
  narrator?: string;
  reflection?: string;
  chapter?: string;
}

export interface Surah {
  number: number;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  name: string;
  revelationType?: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  page: number;
  juz?: number;
  manzil?: number;
  surah?: { number: number; englishName: string; name: string; numberOfAyahs?: number; revelationType?: string };
}

export interface Coords { lat: number; lon: number; city: string }
export interface PrayerTime { name: string; date: Date }

export interface Settings {
  name: string;
  method: number;
  reciter: string;
  translation: string;
  notify: boolean;
}

