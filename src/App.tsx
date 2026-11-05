import { useCallback, useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { ReactElement } from "react";
import type { Coords, PrayerTime, Settings } from "./types";
import { AUTHENTIC_HADITHS } from "./data/hadiths";
import { DAILY_GOOD, RECITERS, TRANSLATIONS } from "./data/content";
import UpiPayment from "./components/UpiPayment";
import {
  METHODS, PRAYERS, cityName, dateKey, dayOfYear, fetchTimings, fmtCountdown, fmtTime, getPosition, useStored, toast,
} from "./lib";
import { Gate } from "./components/Gate";
import { Quran } from "./components/Quran";
import { Reels } from "./components/Reels";
import { Listen } from "./components/Listen";
import { BayanLibrary } from "./components/BayanLibrary";
import { Hadith } from "./components/Hadith";
import { Worship } from "./components/Worship";
import { Learn } from "./components/Learn";
import { Plus } from "./components/Plus";
import { DailyDua } from "./components/DailyDua";
import { QuizSection } from "./components/QuizSection";
import { ProphetStories } from "./components/ProphetStories";
import { DailyContentFeed } from "./components/DailyContentFeed";
import { KhatmPlanner } from "./components/KhatmPlanner";
import { UmrahCompanion } from "./components/UmrahCompanion";
import { AutoInsights } from "./components/AutoInsights";

type Tab = "Home" | "Quran" | "Explore" | "Learn" | "Plus" | "Profile" | "Reels" | "Listen" | "Bayan" | "Hadith" | "Worship" | "Quiz" | "Stories" | "Umrah";

const DEFAULTS: Settings = { name: "", method: 3, reciter: "ar.alafasy", translation: "en.sahih", notify: false };

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "Home", icon: "⌂", label: "Home" },
  { id: "Quran", icon: "۞", label: "Quran" },
  { id: "Explore", icon: "✧", label: "Explore" },
  { id: "Learn", icon: "▤", label: "Learn" },
  { id: "Plus", icon: "✦", label: "Plus" },
  { id: "Profile", icon: "♡", label: "Profile" },
];

function notifyUser(title: string, body: string) {
  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((r) => r.showNotification(title, { body, icon: "icon-192.png" })).catch(() => new Notification(title, { body }));
    } else new Notification(title, { body });
  } catch { /* notifications unavailable */ }
}

let azanAudio: HTMLAudioElement | null = null;
function playAzan(onFail?: () => void) {
  try {
    azanAudio?.pause();
    azanAudio = new Audio("/audio/azan.mp3");
    azanAudio.onerror = () => onFail?.();
    azanAudio.play().catch(() => onFail?.());
  } catch { onFail?.(); }
}
function stopAzan() { try { azanAudio?.pause(); azanAudio = null; } catch { /* ignore */ } }

async function ensureChannels() {
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await LocalNotifications.createChannel({ id: "azan-v1", name: "Azan at prayer time", description: "Plays the Azan when it is time for Salah", importance: 5, visibility: 1, sound: "azan.mp3", vibration: true });
    await LocalNotifications.createChannel({ id: "reminder-v1", name: "Prayer reminders", description: "Standard notification sound", importance: 4, visibility: 1, vibration: true });
  } catch (error) { console.warn("Amanora notification channels could not be created", error); }
}

export default function App() {
  const [gate, setGate] = useState(() => !sessionStorage.getItem("amanora:entered"));
  const [tab, setTab] = useState<Tab>("Home");
  const [language, setLanguage] = useStored<"en" | "ur">("language", "en");
  const isUrdu = language === "ur";
  useEffect(() => { document.documentElement.lang = isUrdu ? "ur" : "en"; document.documentElement.dir = isUrdu ? "rtl" : "ltr"; }, [isUrdu]);
  const [settings, setSettings] = useStored<Settings>("settings", DEFAULTS);
  const [coords, setCoords] = useStored<Coords | null>("coords", null);
  const [log, setLog] = useStored<Record<string, string[]>>("prayer-log", {});
  const [journal, setJournal] = useStored<string>("journal", "");
  const [oled, setOled] = useStored<boolean>("oled-theme", false);
  const [paymentPlan, setPaymentPlan] = useState<"monthly" | "yearly">("monthly");
  const [homeWidgets, setHomeWidgets] = useStored<string[]>("home-widgets", ["Quran", "Stories", "Reels", "Listen", "Hadith", "Worship", "Learn", "Quiz"]);

  const [azanSound, setAzanSound] = useStored<boolean>("azan-sound", true);
  const [azanPrefs, setAzanPrefs] = useStored<Record<string, boolean>>("azan-prayer-prefs", { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true });
  const [times, setTimes] = useState<PrayerTime[]>([]);
  const [hijri, setHijri] = useState("");
  const [timesErr, setTimesErr] = useState("");
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState("");
  const [now, setNow] = useState(new Date());
  const [resumeTick, setResumeTick] = useState(0);
  const [installEvt, setInstallEvt] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState("");
  useEffect(() => {
    let t: number | undefined;
    const show = (e: Event) => { setToastMsg(String((e as CustomEvent).detail || "")); window.clearTimeout(t); t = window.setTimeout(() => setToastMsg(""), 4500); };
    window.addEventListener("amanora-toast", show);
    return () => { window.removeEventListener("amanora-toast", show); window.clearTimeout(t); };
  }, []);

  const s: Settings = { ...DEFAULTS, ...settings };
  const today = dateKey(now);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  // Re-check prayer reminders whenever the app returns from the background.
  // Native alarms remain scheduled by Android/iOS while the app is closed; this
  // refresh repairs the rolling window after a timezone, date, or permission change.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        setNow(new Date());
        setResumeTick((value) => value + 1);
      }
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  useEffect(() => { document.title = `Amanora – ${tab}`; }, [tab]);
  useEffect(() => {
    const syncInstallPrompt = () => setInstallEvt((window as any).__amanoraInstallPrompt ?? null);
    const clearInstallPrompt = () => setInstallEvt(null);
    syncInstallPrompt();
    window.addEventListener("amanora-install-ready", syncInstallPrompt);
    window.addEventListener("amanora-app-installed", clearInstallPrompt);
    return () => {
      window.removeEventListener("amanora-install-ready", syncInstallPrompt);
      window.removeEventListener("amanora-app-installed", clearInstallPrompt);
    };
  }, []);

  /* ---- location ---- */
  const locate = useCallback(async () => {
    setLocating(true); setLocErr("");
    try {
      const p = await getPosition();
      const city = await cityName(p.lat, p.lon);
      setCoords({ lat: p.lat, lon: p.lon, city });
    } catch (e: any) { setLocErr(e?.message || "Could not get your location."); }
    finally { setLocating(false); }
  }, [setCoords]);

  // If permission was already granted, refresh the location quietly on launch
  useEffect(() => {
    (navigator as any).permissions?.query?.({ name: "geolocation" }).then((r: any) => { if (r.state === "granted") locate(); }).catch(() => {});
    // eslint-disable-next-line
  }, []);

  /* ---- live prayer times ---- */
  useEffect(() => {
    if (!coords) return;
    let alive = true;
    setTimesErr("");
    fetchTimings(coords, s.method, new Date())
      .then((r) => { if (alive) { setTimes(r.times); setHijri(r.hijri); } })
      .catch(() => { if (alive) setTimesErr("Could not load prayer times. Check your internet connection."); });
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [coords, s.method, today]);

  const next = useMemo(() => {
    if (!times.length) return null;
    const n = times.find((t) => t.date.getTime() > now.getTime());
    if (n) return { ...n, label: n.name };
    return { name: "Fajr", date: new Date(times[0].date.getTime() + 86400000), label: "Fajr (tomorrow)" };
  }, [times, now]);

  // Native Android/iOS schedules a rolling two-day reminder window on-device.
  // The window is refreshed on launch, app resume, and prayer-setting changes.
  // Web reminders remain foreground-only because a browser timer cannot wake a closed app.
  useEffect(() => {
    let cancelled = false;
    let webTimer: number | undefined;
    const reminderId = 51001;
    const schedule = async () => {
      if (!Capacitor.isNativePlatform()) {
        if (!s.notify || !times.length || typeof Notification === "undefined" || Notification.permission !== "granted") return;
        const upcomingWeb = times.filter((p) => azanPrefs[p.name] !== false)
          .map((p) => p.date.getTime() > Date.now() ? p : { ...p, date: new Date(p.date.getTime() + 86400000) })
          .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
        if (!upcomingWeb) return;
        const ms = upcomingWeb.date.getTime() - Date.now();
        if (ms > 0 && ms <= 2147483000) {
          webTimer = window.setTimeout(() => { notifyUser(`It's time for ${upcomingWeb.name} Salah`, "Amanora prayer reminder 🤲"); if (azanSound) playAzan(); }, ms);
        }
        return;
      }
      try {
        const ids = Array.from({ length: 10 }, (_, index) => reminderId + index);
        await ensureChannels();
        await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
        if (cancelled || !s.notify || !times.length || !coords) return;
        const permission = await LocalNotifications.checkPermissions();
        if (permission.display !== "granted") return;

        // Schedule every enabled prayer for today and tomorrow. Refreshing Amanora
        // replaces this rolling window, avoiding a single fragile next-prayer alarm.
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowResult = await fetchTimings(coords, s.method, tomorrow);
        if (cancelled) return;
        const upcoming = [...times, ...tomorrowResult.times]
          .filter((prayer) => azanPrefs[prayer.name] !== false && prayer.date.getTime() > Date.now())
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        if (!upcoming.length) return;
        await LocalNotifications.schedule({
          notifications: upcoming.slice(0, 10).map((prayer, index) => ({
            id: reminderId + index,
            title: `It's time for ${prayer.name} Salah`,
            body: "Amanora prayer reminder 🤲",
            schedule: { at: prayer.date, allowWhileIdle: true },
            channelId: azanSound ? "azan-v1" : "reminder-v1",
            sound: azanSound ? "azan.mp3" : undefined,
            extra: { prayer: prayer.name, source: "amanora-prayer-times" }
          }))
        });
      } catch (error) { console.warn("Amanora prayer reminders could not be scheduled", error); }
    };
    void schedule();
    return () => { cancelled = true; if (webTimer !== undefined) window.clearTimeout(webTimer); };
  }, [times, s.notify, azanPrefs, azanSound, today, coords, s.method, resumeTick]);

  /* ---- prayer log and streak (real, from what you tick) ---- */
  const doneToday = log[today] || [];
  const toggle = (p: string) => {
    const cur = log[today] || [];
    setLog({ ...log, [today]: cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p] });
  };
  const streak = useMemo(() => {
    let n = 0;
    const d = new Date();
    if ((log[dateKey(d)] || []).length < 5) d.setDate(d.getDate() - 1);
    while ((log[dateKey(d)] || []).length >= 5) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [log]);
  const totalPrayers = useMemo(() => Object.values(log).reduce((a, v) => a + v.length, 0), [log]);

  const enter = () => { sessionStorage.setItem("amanora:entered", "1"); setGate(false); };
  const go = (t: Tab) => { setTab(t); window.scrollTo({ top: 0 }); };
  const umrahDepart = (() => { try { return JSON.parse(localStorage.getItem("amanora:umrah-depart") || '""') as string; } catch { return ""; } })();
  const umrahDays = umrahDepart ? Math.ceil((new Date(umrahDepart + "T00:00:00").getTime() - now.getTime()) / 86400000) : null;
  const quranPage = (() => { try { const lines = localStorage.getItem("amanora:quran-mode") === JSON.stringify("lines"); return Number(JSON.parse(localStorage.getItem(lines ? "amanora:quran-ip16-page" : "amanora:quran-page") || "1")) || 1; } catch { return 1; } })();
  const good = DAILY_GOOD[dayOfYear() % DAILY_GOOD.length];
  const hadith = AUTHENTIC_HADITHS[dayOfYear() % AUTHENTIC_HADITHS.length];

  const toggleNotify = async () => {
    if (s.notify) { setSettings({ ...s, notify: false }); return; }
    try {
      if (Capacitor.isNativePlatform()) {
        let permission = await LocalNotifications.checkPermissions();
        if (permission.display !== "granted") permission = await LocalNotifications.requestPermissions();
        if (permission.display === "granted") setSettings({ ...s, notify: true });
        else toast("Allow notifications for Amanora in your phone settings.");
        return;
      }
      if (typeof Notification === "undefined") { toast("This browser does not support notifications."); return; }
      const r = await Notification.requestPermission();
      if (r === "granted") setSettings({ ...s, notify: true });
      else toast("Notifications are blocked. Allow them in your browser settings.");
    } catch { toast("Could not enable notifications. Please check Amanora's notification permission in Settings."); }
  };
  const testPrayerNotification = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        let permission = await LocalNotifications.checkPermissions();
        if (permission.display !== "granted") permission = await LocalNotifications.requestPermissions();
        if (permission.display !== "granted") {
          toast("Allow notifications for Amanora in your phone settings, then try again.");
          return;
        }
        await LocalNotifications.schedule({
          notifications: [{
            id: 51999,
            title: "Amanora test reminder",
            body: "Your prayer reminder notifications are working on this device. 🤲",
            schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
            channelId: azanSound ? "azan-v1" : "reminder-v1",
            sound: azanSound ? "azan.mp3" : undefined,
          }],
        });
        await ensureChannels();
        toast("Test reminder arrives in about 5 seconds.");
        return;
      }
      if (typeof Notification === "undefined" || Notification.permission !== "granted") {
        toast("Turn on Prayer-time reminders and allow browser notifications first.");
        return;
      }
      notifyUser("Amanora test reminder", "Notifications are enabled on this device.");
      if (azanSound) playAzan(() => toast("Azan audio file not found. Add azan.mp3 to public/audio."));
    } catch (error) {
      console.warn("Amanora test notification failed", error);
      toast("The test notification could not be scheduled. Check Amanora's notification permission in Settings.");
    }
  };

  const install = async () => {
    const promptEvent = installEvt ?? (window as any).__amanoraInstallPrompt;
    if (!promptEvent) {
      toast("Amanora is not ready for automatic installation in this browser. In Chrome, open the menu and choose Install app or Add to Home screen.");
      return;
    }
    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } catch (error) {
      console.error("Amanora install prompt failed:", error);
    } finally {
      (window as any).__amanoraInstallPrompt = null;
      setInstallEvt(null);
    }
  };
  const [confirmReset, setConfirmReset] = useState(false);
  const resetAll = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    Object.keys(localStorage).filter((k) => k.startsWith("amanora:")).forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  /* ---------------- screens ---------------- */
  const home = (
    <div className="screen amanora-home">
      <div className="row between home-topline">
        <div>
          <span className="kicker">AMANORA · YOUR WORLD OF DEEN</span>
          <h2 className="hello">{isUrdu ? `السلام علیکم${s.name ? `، ${s.name}` : ""}` : `Assalamu Alaikum${s.name ? `, ${s.name}` : ""}`} 🌙</h2>
          <p className="muted small">{[coords?.city, hijri].filter(Boolean).join(" · ") || (isUrdu ? "آپ کے ایمان اور روزمرہ زندگی کا ساتھی" : "Your companion for faith and everyday life")}</p>
        </div>
        <div className="home-actions"><button className="language-switch" onClick={() => setLanguage(isUrdu ? "en" : "ur")} aria-label="Change language">{isUrdu ? "English" : "اردو"}</button><button className="avatar" onClick={() => go("Profile")} aria-label="Settings">☾</button></div>
      </div>

      <div className="hero-card">
        <small>{isUrdu ? "اگلی نماز" : "NEXT PRAYER"}</small>
        {next ? (
          <div className="row between">
            <div>
              <div className="hero-name">{next.label}</div>
              <div className="hero-time">{fmtTime(next.date)}</div>
            </div>
            <div className="ring"><b>{fmtCountdown(next.date, now)}</b><small>{isUrdu ? "باقی" : "LEFT"}</small></div>
          </div>
        ) : (
          <div>
            <div className="hero-name">Prayer times</div>
            <p className="hero-time">{coords ? (timesErr || "Loading…") : (isUrdu ? "نماز کے اوقات دیکھنے کے لیے مقام کی اجازت دیں۔" : "Allow location to see live prayer times for your city.")}</p>
          </div>
        )}
        <button className="hero-btn" onClick={locate} disabled={locating}>
          {locating ? "Finding your location…" : coords ? "↻ Refresh location" : "📍 Use my location"}
        </button>
        {locErr && <p className="err light">{locErr}</p>}
      </div>

      <button className="daily" onClick={() => go("Reels")}>
        <small className="gold">✨ TODAY'S REFLECTION</small>
        <p>{good.text}</p>
        <span className="row between"><small className="muted">{good.ref}</small><b className="gold">Read today's reflection →</b></span>
      </button>

      <button className="daily" onClick={() => go("Umrah")}>
        <small className="gold">🕋 UMRAH & HAJJ COMPANION</small>
        <p>{umrahDays !== null && umrahDays > 0 ? `${umrahDays} day${umrahDays === 1 ? "" : "s"} until your journey` : "Tawaf and Sa'i counters, Hajj day-by-day, duas, Miqat guide and your trip planner."}</p>
        <span className="row between"><small className="muted">Works fully inside Amanora</small><b className="gold">Open companion →</b></span>
      </button>

      <div className="grid">
        {([
          ["Quran", "📖"], ["Stories", "📜"], ["Reels", "📚"], ["Listen", "🎧"], ["Hadith", "🕌"], ["Worship", "📿"], ["Learn", "🎓"], ["Quiz", "🧠"],
        ] as [Tab, string][]).filter(([t]) => homeWidgets.includes(t)).map(([t, i]) => (
          <button key={t} className="tile" onClick={() => go(t)}><span className="tile-ic">{i}</span>{t === "Reels" ? "Read & Reflect" : t}</button>
        ))}
      </div>

      <div className="card">
        <div className="row between"><h3>{isUrdu ? "آج کی نمازیں" : "Today's prayers"}</h3><span className="pill">{doneToday.length}/5</span></div>
        {PRAYERS.map((p) => {
          const t = times.find((x) => x.name === p);
          const on = doneToday.includes(p);
          return (
            <div key={p} className="prayer-row">
              <b>{p}</b>
              <span className="muted">{t ? fmtTime(t.date) : "--:--"}</span>
              <button className={"check" + (on ? " on" : "")} onClick={() => toggle(p)} aria-label={`Mark ${p}`}>{on ? "✓" : ""}</button>
            </div>
          );
        })}
        <div className="progress"><div style={{ width: `${doneToday.length * 20}%` }} /></div>
        <div className="row between"><small className="muted">🔥 {isUrdu ? `مسلسل ${streak} دن` : `Streak: ${streak} day${streak === 1 ? "" : "s"}`}</small><small className="muted">{totalPrayers} prayers logged</small></div>
      </div>

      <button className="card continue" onClick={() => go("Quran")}>
        <span className="tile-ic">📖</span>
        <span className="grow"><b>{isUrdu ? "قرآن پڑھنا جاری رکھیں" : "Continue reading"}</b><small>Quran · page {quranPage}</small></span>
        <span className="gold">›</span>
      </button>

      <KhatmPlanner />

      <DailyDua />

      <div className="card">
        <small className="gold">HADITH OF THE DAY</small>
        <p className="hadith-en">{hadith.meaning}</p>
        <div className="row between"><small className="muted">{hadith.reference}</small><button className="chip" onClick={() => go("Hadith")}>Open Hadith Library ›</button></div>
      </div>
    </div>
  );

  const explore = (
    <div className="screen">
      <header className="head">
        <span className="kicker">DISCOVER YOUR SANCTUARY</span>
        <h2>Explore</h2>
        <p className="muted">A place for remembrance, reflection and discovery.</p>
      </header>
      <button className="hall" onClick={() => go("Umrah")}>
        <span className="hall-icon">🕋</span><span className="grow"><b>Umrah & Hajj Companion</b><small>Tawaf and Sa'i counters, Hajj days, duas, Miqat, Ziyarah and trip planner</small></span><span className="gold">›</span>
      </button>
      <DailyContentFeed />
      <button className="hall" onClick={() => go("Stories")}>
        <span className="hall-icon">📜</span><span className="grow"><b>Prophet Stories · English + Urdu audio</b><small>Quran references, lessons, bookmarks and human-narration audio slots.</small></span><span className="gold">›</span>
      </button>
      <button className="hall" onClick={() => go("Reels")}>
        <span className="hall-icon">📚</span><span className="grow"><b>Read & Reflect</b><small>Original English reflections with Quran references, reflection prompts and saved readings. Urdu editions are being prepared with careful review.</small></span><span className="gold">›</span>
      </button>
      <button className="hall" onClick={() => go("Listen")}>
        <span className="hall-icon">🎧</span><span className="grow"><b>Quran Recitations</b><small>Human reciters and Quran radio streams</small></span><span className="gold">›</span>
      </button>
      <button className="hall bayan-hall" onClick={() => go("Bayan")}>
        <span className="hall-icon">🎙️</span><span className="grow"><b>Full Bayan Audio Library</b><small>Long-form talks, Mufti Menk audio, favourites, playlists and Urdu collection</small></span><span className="gold">›</span>
      </button>
      <button className="hall" onClick={() => go("Hadith")}>
        <span className="hall-icon">📜</span><span className="grow"><b>Hadith Library</b><small>Browse narrations, meanings and references</small></span><span className="gold">›</span>
      </button>
      <button className="hall" onClick={() => go("Worship")}>
        <span className="hall-icon">🧭</span><span className="grow"><b>Worship & Qibla</b><small>Adhkar, tasbih and direction to the Kaaba</small></span><span className="gold">›</span>
      </button>
      <button className="hall" onClick={() => go("Quiz")}><span className="hall-icon">🧠</span><span className="grow"><b>Daily Deen Quiz</b><small>Fresh daily questions, explanations and score tracking</small></span><span className="gold">›</span></button>
      <button className="hall" onClick={() => go("Learn")}>
        <span className="hall-icon">🎓</span><span className="grow"><b>Islamic Learning</b><small>Continue your learning paths and lessons</small></span><span className="gold">›</span>
      </button>
    </div>
  );

  const me = (
    <div className="screen">
      <header className="head">
        <span className="kicker">YOUR SPACE</span>
        <h2>Profile</h2>
      </header>

      <div className="stats">
        <div><b>{streak}</b><small>Day streak</small></div>
        <div><b>{totalPrayers}</b><small>Prayers logged</small></div>
        <div><b>{doneToday.length}/5</b><small>Today</small></div>
      </div>

      <button className="plus-hero me-plus-link" onClick={() => go("Plus")}><span className="plus-eyebrow">YOUR NEXT STEP</span><h3>Amanora Plus ✦</h3><p>Explore Academy tracks, personal progress and premium sanctuary features.</p><b>Explore Plus →</b></button>

      <div className="card">
        <h3>Settings</h3>
        <div className="row between"><span><b>App language</b><small className="muted" style={{display:"block"}}>English / اردو</small></span><button className="chip on" onClick={() => setLanguage(isUrdu ? "en" : "ur")}>{isUrdu ? "Switch to English" : "اردو منتخب کریں"}</button></div>
        <label>Your name<input className="input" value={s.name} onChange={(e) => setSettings({ ...s, name: e.target.value })} placeholder="Optional" /></label>
        <label>Prayer calculation method
          <select className="input" value={s.method} onChange={(e) => setSettings({ ...s, method: Number(e.target.value) })}>
            {METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label>Quran reciter
          <select className="input" value={s.reciter} onChange={(e) => setSettings({ ...s, reciter: e.target.value })}>
            {RECITERS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>
        <label>Quran translation
          <select className="input" value={s.translation} onChange={(e) => setSettings({ ...s, translation: e.target.value })}>
            {TRANSLATIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>
        <button className={"toggle" + (s.notify ? " on" : "")} onClick={toggleNotify}>
          <span>Prayer-time reminders</span><b>{s.notify ? "ON" : "OFF"}</b>
        </button>
        <small className="muted">Prayer reminders use your calculated local Salah times. Allow notifications when prompted.</small>
        <div className="azan-settings">
          <b>Choose which Salah reminders you want</b>
          <div className="row gap-s wrap">
            {PRAYERS.map((prayer) => <label className="chip" key={prayer} style={{display:"inline-flex",alignItems:"center",gap:6}}><input type="checkbox" checked={azanPrefs[prayer] !== false} onChange={(e) => setAzanPrefs({ ...azanPrefs, [prayer]: e.target.checked })} />{prayer}</label>)}
          </div>
          <button className="chip" onClick={() => void testPrayerNotification()}>Test notification</button>
          <button className={"toggle" + (azanSound ? " on" : "")} onClick={() => setAzanSound(!azanSound)}><span>Play Azan sound at prayer time</span><b>{azanSound ? "ON" : "OFF"}</b></button>
          <div className="row gap-s"><button className="chip" onClick={() => playAzan(() => toast("Azan audio file not found. Add azan.mp3 to public/audio."))}>▶ Hear Azan</button><button className="chip" onClick={stopAzan}>■ Stop</button></div>
        </div>
        <button className="btn wide" onClick={locate}>{locating ? "مقام تلاش ہو رہا ہے…" : "📍 Update my location"}</button>
        {locErr && <p className="err">{locErr}</p>}
        {installEvt && <button className="btn gold-btn wide" onClick={install}>⬇ Install Amanora on this device</button>}
      </div>

      <UpiPayment initialPlan={paymentPlan} />

      <div className="card">
        <h3>My journal</h3>
        <textarea className="input" rows={6} value={journal} onChange={(e) => setJournal(e.target.value)} placeholder="Today, I am grateful for…" />
        <small className="muted">Saved automatically on this device only.</small>
      </div>

      <div className="card">
        <h3>More</h3>
        <div className="row gap-s wrap">
          <button className="chip" onClick={() => go("Hadith")}>🕌 Hadith</button>
          <button className="chip" onClick={() => go("Bayan")}>🎙️ Bayans</button>
          <button className="chip" onClick={() => go("Learn")}>🎓 Learn</button>
          <button className="chip" onClick={() => { sessionStorage.removeItem("amanora:entered"); setGate(true); }}>✦ Jannah gate</button>
        </div>
      </div>

      <div className="card">
        <h3>About Amanora</h3>
        <p className="muted small">Live data comes from Aladhan (prayer times), AlQuran Cloud and Islamic Network (Quran and recitation) and MP3Quran (radio and reciters). Everything you save stays on your device. There are no ads, no accounts and no tracking.</p>
        {confirmReset && <p className="err small">This deletes bookmarks, prayer log and journal on this device. Tap again to confirm.</p>}
        <div className="row gap-s"><button className="chip danger-chip" onClick={resetAll}>{confirmReset ? "Yes, delete everything" : "Delete my saved data"}</button>{confirmReset && <button className="chip" onClick={() => setConfirmReset(false)}>Cancel</button>}</div>
      </div>
    </div>
  );

  const screen: Record<Tab, ReactElement> = {
    Home: home,
    Quran: <Quran settings={s} />,
    Explore: explore,
    Learn: <Learn />,
    Plus: <><div className="screen" style={{ paddingBottom: 0 }}><AutoInsights onSubscribe={() => { setPaymentPlan("yearly"); go("Profile"); }} /></div><Plus log={log} oled={oled} onOledChange={setOled} homeWidgets={homeWidgets} onHomeWidgetsChange={setHomeWidgets} onOpenPayment={(plan) => { setPaymentPlan(plan); go("Profile"); }} onOpenListen={() => go("Listen")} onOpenBayan={() => go("Bayan")} /></>,
    Profile: me,
    Reels: <Reels />,
    Listen: <Listen />,
    Bayan: <BayanLibrary />,
    Hadith: <Hadith />,
    Worship: <Worship coords={coords} />,
    Quiz: <QuizSection />,
    Stories: <ProphetStories />,
    Umrah: <UmrahCompanion />,
  };

  if (gate) return <Gate onDone={enter} />;

  return (
    <div className={"app" + (oled ? " oled-theme" : "")} data-language={language}>
      {toastMsg && <div role="status" aria-live="polite" onClick={() => setToastMsg("")} style={{position:"fixed",left:12,right:12,bottom:84,zIndex:9999,padding:"12px 14px",borderRadius:14,background:"#0f3d33",color:"#fff",border:"1px solid #d4af37",fontSize:14,textAlign:"center"}}>{toastMsg}</div>}
      <main className="main">{screen[tab]}</main>
      <nav className="nav">
        {NAV.map((n) => (
          <button key={n.id} className={tab === n.id ? "on" : ""} onClick={() => go(n.id)} aria-current={tab === n.id ? "page" : undefined} aria-label={n.label}>
            <span aria-hidden="true">{n.icon}</span><small>{isUrdu ? ({Home:"گھر",Quran:"قرآن",Explore:"دریافت",Learn:"سیکھیں",Plus:"پلس",Profile:"پروفائل"}[n.id] || n.label) : n.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}
