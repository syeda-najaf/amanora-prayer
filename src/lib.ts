import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Coords, PrayerTime, Surah } from "./types";

/* ---------- saved data (stays on the device) ---------- */
export function useStored<T>(key: string, init: T): [T, Dispatch<SetStateAction<T>>] {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem("amanora:" + key);
      return raw ? (JSON.parse(raw) as T) : init;
    } catch { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem("amanora:" + key, JSON.stringify(v)); } catch { /* storage full or blocked */ }
  }, [key, v]);
  return [v, setV];
}

const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const dayOfYear = (d = new Date()) => Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);

/* ---------- audio policy ---------- */
// Amanora does not generate synthetic narration or use browser text-to-speech.
// Quran audio, where offered, must come from an identified human reciter/source.
export function speak(_text: string, _lang = "en-US", onEnd?: () => void) { onEnd?.(); }
export const stopSpeak = () => {};

/* ---------- location ---------- */
export function getPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Location is not supported on this device."));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) => reject(new Error(e.code === 1 ? "Location permission was denied. Allow it in your browser settings." : "Could not get your location.")),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
    );
  });
}

export async function cityName(lat: number, lon: number): Promise<string> {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    const j = await r.json();
    return j.city || j.locality || j.principalSubdivision || "Your location";
  } catch { return "Your location"; }
}

/* ---------- prayer times (Aladhan, live) ---------- */
export const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export const METHODS = [
  { id: 3, label: "Muslim World League" },
  { id: 2, label: "ISNA (North America)" },
  { id: 1, label: "Karachi (Univ. of Islamic Sciences)" },
  { id: 5, label: "Egyptian General Authority" },
  { id: 4, label: "Umm al-Qura (Makkah)" },
  { id: 15, label: "Moonsighting Committee" },
];

export async function fetchTimings(c: Coords, method: number, date = new Date()) {
  const d = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  const url = `https://api.aladhan.com/v1/timings/${d}?latitude=${c.lat}&longitude=${c.lon}&method=${method}`;
  const res = await fetch(url);
  const json = await res.json();
  const tm = json?.data?.timings;
  if (!tm) throw new Error("Prayer times are unavailable right now.");
  const toDate = (hhmm: string) => {
    const [h, m] = String(hhmm).split(" ")[0].split(":").map((n) => parseInt(n, 10));
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0);
  };
  const times: PrayerTime[] = PRAYERS.map((name) => ({ name, date: toDate(tm[name]) }));
  const h = json?.data?.date?.hijri;
  const hijri = h ? `${h.day} ${h.month?.en} ${h.year} AH` : "";
  return { times, sunrise: toDate(tm.Sunrise), hijri };
}

export const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const fmtCountdown = (target: Date, now: Date) => {
  const s = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

/* ---------- qibla ---------- */
export function qiblaBearing(lat: number, lon: number) {
  const r = Math.PI / 180;
  const p1 = lat * r, p2 = 21.4225 * r, dl = (39.8262 - lon) * r;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) / r) + 360) % 360;
}

/* ---------- Quran surah list (loaded once) ---------- */
let surahPromise: Promise<Surah[]> | null = null;
export function getSurahs(): Promise<Surah[]> {
  if (!surahPromise) {
    surahPromise = fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((j) => { if (j.code !== 200) throw new Error("Surah list unavailable"); return j.data as Surah[]; })
      .catch((e) => { surahPromise = null; throw e; });
  }
  return surahPromise;
}

export async function shareText(title: string, text: string) {
  try {
    if (navigator.share) { await navigator.share({ title, text }); return "shared"; }
    await navigator.clipboard.writeText(`${title}\n${text}`);
    return "copied";
  } catch { return "cancelled"; }
}
