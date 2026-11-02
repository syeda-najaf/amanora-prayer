import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { Coords, PrayerTime, Settings } from "./types";
import { AUTHENTIC_HADITHS } from "./data/hadiths";
import { DAILY_GOOD, RECITERS, TRANSLATIONS } from "./data/content";
import UpiPayment from "./components/UpiPayment";
import {
  METHODS, PRAYERS, cityName, dateKey, dayOfYear, fetchTimings, fmtCountdown, fmtTime, getPosition, useStored,
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

type Tab = "Home" | "Quran" | "Explore" | "Learn" | "Plus" | "Profile" | "Reels" | "Listen" | "Bayan" | "Hadith" | "Worship" | "Quiz" | "Stories";

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
  const [quranPage] = useStored<number>("quran-page", 1);
  const [homeFeedback, setHomeFeedback] = useStored<"yes" | "no" | null>("feedback-home", null);
  const [oled, setOled] = useStored<boolean>("oled-theme", false);
  const [paymentPlan, setPaymentPlan] = useState<"monthly" | "yearly">("monthly");
  const [homeWidgets, setHomeWidgets] = useStored<string[]>("home-widgets", ["Quran", "Stories", "Reels", "Listen", "Hadith", "Worship", "Learn", "Quiz"]);

  const [azanPrefs, setAzanPrefs] = useStored<Record<string, boolean>>("azan-prayer-prefs", { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true });
  const [times, setTimes] = useState<PrayerTime[]>([]);
  const [hijri, setHijri] = useState("");
  const [timesErr, setTimesErr] = useState("");
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState("");
  const [now, setNow] = useState(new Date());
  const [installEvt, setInstallEvt] = useState<any>(null);

  const s: Settings = { ...DEFAULTS, ...settings };
  const today = dateKey(now);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
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

  // Schedule the next enabled prayer while Amanora is running. A web PWA cannot
  // wake itself at an exact time after the browser has been fully closed; that
  // requires a push service/backend and platform-specific notification setup.
  useEffect(() => {
    if (!s.notify || !times.length || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const upcoming = times
      .filter((p) => azanPrefs[p.name] !== false)
      .map((p) => p.date.getTime() > Date.now() ? p : { ...p, date: new Date(p.date.getTime() + 86400000) })
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
    if (!upcoming) return;
    const ms = upcoming.date.getTime() - Date.now();
    if (ms <= 0 || ms > 2147483000) return;
    const t = window.setTimeout(() => notifyUser(`It's time for ${upcoming.name} Salah`, "Amanora prayer reminder 🤲"), ms);
    return () => window.clearTimeout(t);
  }, [times, s.notify, azanPrefs, today]);

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
  const good = DAILY_GOOD[dayOfYear() % DAILY_GOOD.length];
  const hadith = AUTHENTIC_HADITHS[dayOfYear() % AUTHENTIC_HADITHS.length];

  const toggleNotify = async () => {
    if (s.notify) { setSettings({ ...s, notify: false }); return; }
    if (typeof Notification === "undefined") { alert("This browser does not support notifications."); return; }
    const r = await Notification.requestPermission();
    if (r === "granted") setSettings({ ...s, notify: true });
    else alert("Notifications are blocked. Allow them in your browser settings.");
  };
  const install = async () => {
    const promptEvent = installEvt ?? (window as any).__amanoraInstallPrompt;
    if (!promptEvent) {
      alert("Amanora is not ready for automatic installation in this browser. In Chrome, open the menu and choose Install app or Add to Home screen.");
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
  const resetAll = () => {
    if (!confirm("Delete all saved data on this device (bookmarks, prayer log, journal, my links)?")) return;
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

      <div className="card">
        <div className="row between"><h3>Was today’s home helpful?</h3><small className="muted">Private feedback</small></div>
        {homeFeedback ? (
          <div className="row between"><span className="muted small">Thank you for sharing.</span><button className="chip" onClick={() => setHomeFeedback(null)}>Change answer</button></div>
        ) : (
          <div className="row gap-s">
            <button className="chip" onClick={() => setHomeFeedback("yes")}>♡ Yes, helpful</button>
            <button className="chip" onClick={() => setHomeFeedback("no")}>Not quite</button>
          </div>
        )}
        <small className="muted">Your answer is saved only on this device.</small>
      </div>

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
      <div className="card">
        <small className="gold">A GENTLE REMINDER</small>
        <p className="hadith-en">Take one small step today. Consistency in good deeds matters.</p>
      </div>
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
          <button className="chip" onClick={() => { if (typeof Notification !== "undefined" && Notification.permission === "granted") notifyUser("Amanora test reminder", "Notifications are enabled on this device."); else alert("Turn on Prayer-time reminders first and allow notifications."); }}>Test notification</button>
          <small className="muted">The notification sound is controlled by your phone/browser. Full Azan audio at an exact time while the browser is completely closed needs a push-notification server and native platform support. This web version schedules reminders while Amanora is running.</small>
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
        <button className="chip danger-chip" onClick={resetAll}>Delete my saved data</button>
      </div>
    </div>
  );

  const screen: Record<Tab, ReactElement> = {
    Home: home,
    Quran: <Quran settings={s} />,
    Explore: explore,
    Learn: <Learn />,
    Plus: <Plus log={log} oled={oled} onOledChange={setOled} homeWidgets={homeWidgets} onHomeWidgetsChange={setHomeWidgets} onOpenPayment={(plan) => { setPaymentPlan(plan); go("Profile"); }} onOpenListen={() => go("Listen")} onOpenBayan={() => go("Bayan")} />,
    Profile: me,
    Reels: <Reels />,
    Listen: <Listen />,
    Bayan: <BayanLibrary />,
    Hadith: <Hadith />,
    Worship: <Worship coords={coords} />,
    Quiz: <QuizSection />,
    Stories: <ProphetStories />,
  };

  if (gate) return <Gate onDone={enter} />;

  return (
    <div className={"app" + (oled ? " oled-theme" : "")} data-language={language}>
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
