import { useEffect, useMemo, useState } from "react";

const HARAMAIN = [
  { name: "Makkah — Masjid al-Haram", lat: 21.4225, lon: 39.8262 },
  { name: "Madinah — Al-Masjid an-Nabawi", lat: 24.4672, lon: 39.6111 },
];
const ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function HaramainLive() {
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [err, setErr] = useState("");
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    let alive = true;
    const load = () => Promise.all(HARAMAIN.map(async (h) => {
      const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${h.lat}&longitude=${h.lon}&method=4`);
      const j = await r.json();
      return [h.name, j.data.timings as Record<string, string>] as const;
    })).then((rows) => { if (alive) { setData(Object.fromEntries(rows)); setErr(""); } })
      .catch(() => { if (alive) setErr("Could not load live Haramain times. Check your internet connection."); });
    void load();
    const t = setInterval(load, 30 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return <>
    {err && <p className="err small">{err}</p>}
    {HARAMAIN.map((h) => <div className="card" key={h.name}>
      <div className="row between"><h3>{h.name}</h3><span className="pill">{now.toLocaleTimeString("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", second: "2-digit" })} AST</span></div>
      {ORDER.map((p) => <div className="prayer-row" key={p}><b>{p}</b><span className="muted">{data[h.name]?.[p] ?? "--:--"}</span></div>)}
    </div>)}
  </>;
}


type Section = "Live" | "Umrah" | "Cities" | "Trip";

const UMRAH_STEPS = [
  { title: "Before the Miqat", icon: "🧳", body: "Prepare for Ihram, make ghusl if possible, wear appropriate Ihram clothing, and learn the Miqat for your route. Do not pass your applicable Miqat intending Umrah without entering Ihram.", note: "Women wear modest normal clothing; there is no special colour or uniform for women." },
  { title: "Enter Ihram and make intention", icon: "🤲", body: "Make the intention for Umrah and recite the Talbiyah: لَبَّيْكَ اللَّهُمَّ عُمْرَةً. Continue the Talbiyah regularly until beginning Tawaf.", note: "Ihram includes specific restrictions. Learn them before travel and ask a qualified scholar about personal circumstances." },
  { title: "Tawaf", icon: "🕋", body: "When you reach Al-Masjid Al-Haram, begin Tawaf at the line of the Black Stone and complete seven circuits around the Ka'bah, keeping it to your left. Make dua and remembrance; there is no single required dua for every circuit.", note: "Follow mosque staff instructions and avoid pushing or harming others to reach the Black Stone." },
  { title: "Two rak'ahs and Zamzam", icon: "💧", body: "After Tawaf, pray two rak'ahs where safely and conveniently possible, without obstructing people. Drink Zamzam if available and make dua.", note: "Do not block walkways or crowd access points." },
  { title: "Sa'i between Safa and Marwah", icon: "🚶", body: "Complete seven lengths between Safa and Marwah, beginning at Safa and ending at Marwah. Remember Allah and make personal dua.", note: "The route is accessible; use designated mobility services if needed." },
  { title: "Trim or shave the hair", icon: "✂️", body: "After Sa'i, men shave or shorten the hair; shaving is commonly considered more virtuous. Women trim a small amount from the ends of their hair. This completes Umrah and exits Ihram.", note: "For detailed rulings and differences between schools of law, consult a trusted scholar." },
];

const PACKING = [
  "Passport, visa and travel documents", "Hotel and transport confirmations", "Comfortable walking footwear", "Ihram clothing / modest prayer clothing", "Small unscented toiletries for Ihram", "Regular medication and prescriptions", "Phone charger and power bank", "Refillable water bottle", "Small prayer mat and dua notes", "Emergency contacts and meeting point",
];

const CITY_GUIDES = [
  { city: "Makkah", arabic: "مكة المكرمة", icon: "🕋", places: ["Masjid al-Haram and the Ka'bah", "Mataf and Sa'i areas", "Jabal al-Nour (Mount Hira)", "Jabal Thawr", "Mina, Arafat and Muzdalifah (Hajj sites)"], note: "Prioritise the Haram and follow current official access, transport and crowd instructions. Some historical sites are outside the central Haram area." },
  { city: "Madinah", arabic: "المدينة المنورة", icon: "🕌", places: ["Al-Masjid an-Nabawi", "Rawdah (booking and access rules apply)", "Quba Mosque", "Mount Uhud", "Al-Baqi cemetery (access rules apply)"], note: "Show respect in the Prophet's Mosque, observe current Rawdah permits and time slots, and follow local guidance at all sites." },
];

export function PilgrimCompanion() {
  const [section, setSection] = useState<Section>("Live");
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("amanora-pilgrim-checklist-v1") || "[]"); } catch { return []; }
  });
  const [tripNotes, setTripNotes] = useState(() => localStorage.getItem("amanora-pilgrim-notes-v1") || "");
  const [departure, setDeparture] = useState(() => localStorage.getItem("amanora-pilgrim-date-v1") || "");
  const toggle = (item: string) => {
    const next = done.includes(item) ? done.filter(x => x !== item) : [...done, item];
    setDone(next);
    localStorage.setItem("amanora-pilgrim-checklist-v1", JSON.stringify(next));
  };
  const progress = useMemo(() => Math.round((done.length / PACKING.length) * 100), [done]);
  const saveNotes = (value: string) => { setTripNotes(value); localStorage.setItem("amanora-pilgrim-notes-v1", value); };
  const saveDate = (value: string) => { setDeparture(value); localStorage.setItem("amanora-pilgrim-date-v1", value); };

  return <section className="screen pilgrim-screen">
    <header className="head">
      <span className="kicker">AMANORA · THE SACRED JOURNEY</span>
      <h2>Pilgrim Companion</h2>
      <p className="muted">A calm companion for Makkah, Madinah and the journey of Umrah.</p>
    </header>
    <div className="pilgrim-tabs" role="tablist" aria-label="Pilgrim sections">
      {(["Live", "Umrah", "Cities", "Trip"] as Section[]).map(item => <button key={item} className={"chip" + (section === item ? " on" : "")} onClick={() => setSection(item)}>{({Live:"Haramain Live",Umrah:"Umrah Guide",Cities:"Holy Cities",Trip:"My Journey"} as Record<Section,string>)[item]}</button>)}
    </div>

    {section === "Live" && <div className="pilgrim-stack">
      <div className="pilgrim-live-hero"><span>الحرمين الشريفين</span><h3>Stay connected to the Two Holy Mosques</h3><p>Live prayer times, the next Salah and Qibla guidance for the Haramain, all inside Amanora.</p></div>
      <HaramainLive />
    </div>}

    {section === "Umrah" && <div className="pilgrim-stack">
      <div className="card">
        <div className="row between"><span className="kicker">STEP {step + 1} OF {UMRAH_STEPS.length}</span><span className="pill">{Math.round(((step + 1) / UMRAH_STEPS.length) * 100)}%</span></div>
        <div className="progress"><div style={{width:`${((step + 1) / UMRAH_STEPS.length) * 100}%`}} /></div>
        <div className="umrah-step-icon">{UMRAH_STEPS[step].icon}</div>
        <h3>{UMRAH_STEPS[step].title}</h3>
        <p>{UMRAH_STEPS[step].body}</p>
        <div className="pilgrim-note"><b>Remember</b><p>{UMRAH_STEPS[step].note}</p></div>
        <div className="row between"><button className="chip" disabled={step === 0} onClick={() => setStep(v => Math.max(0,v-1))}>← Previous</button><button className="btn" onClick={() => setStep(v => Math.min(UMRAH_STEPS.length-1,v+1))}>{step === UMRAH_STEPS.length-1 ? "Review final step" : "Next step →"}</button></div>
      </div>
      <div className="card"><b>Important</b><p className="muted small">This is a general learning guide, not a fatwa. Details can differ by madhhab and personal circumstances. Confirm your route's Miqat and current permit requirements with your travel operator and official Saudi services before departure.</p></div>
    </div>}

    {section === "Cities" && <div className="pilgrim-stack">
      {CITY_GUIDES.map(city => <div className="card" key={city.city}>
        <div className="row"><span className="pilgrim-icon">{city.icon}</span><div><h3>{city.city}</h3><span className="muted ar">{city.arabic}</span></div></div>
        <div className="city-place-list">{city.places.map(place => <div key={place}><span>✧</span>{place}</div>)}</div>
        <p className="muted small">{city.note}</p>
      </div>)}
    </div>}

    {section === "Trip" && <div className="pilgrim-stack">
      <div className="card"><h3>My pilgrimage planner</h3><label>Departure date<input className="input" type="date" value={departure} onChange={e => saveDate(e.target.value)} /></label><label>Private travel notes<textarea className="input" rows={4} value={tripNotes} onChange={e => saveNotes(e.target.value)} placeholder="Hotel, group meeting point, transport details…" /></label><small className="muted">Saved on this device only. Avoid storing passport numbers or payment details here.</small></div>
      <div className="card">
        <div className="row between"><h3>Packing checklist</h3><span className="pill">{done.length}/{PACKING.length}</span></div>
        <div className="progress"><div style={{width:`${progress}%`}} /></div>
        {PACKING.map(item => <label className="pilgrim-check" key={item}><input type="checkbox" checked={done.includes(item)} onChange={() => toggle(item)} /><span>{item}</span></label>)}
        <button className="chip" onClick={() => {setDone([]);localStorage.removeItem("amanora-pilgrim-checklist-v1");}}>Reset checklist</button>
      </div>
    </div>}
  </section>;
}
