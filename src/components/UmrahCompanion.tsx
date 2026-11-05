import { useEffect, useMemo, useState } from "react";
import { toast, useStored } from "../lib";
import { HaramainLive } from "./HaramainLive";

type Tab = "Live" | "Umrah" | "Hajj" | "Duas" | "Ihram" | "Ziyarah" | "Plan";
const TABS: { id: Tab; label: string }[] = [
  { id: "Live", label: "Haramain" }, { id: "Umrah", label: "Umrah" }, { id: "Hajj", label: "Hajj" }, { id: "Duas", label: "Duas" },
  { id: "Ihram", label: "Ihram & Miqat" }, { id: "Ziyarah", label: "Ziyarah" }, { id: "Plan", label: "My Trip" },
];

const UMRAH_STEPS = [
  { t: "Ihram & intention", ic: "🤍", b: "Bathe (ghusl), put on Ihram at or before the Miqat, pray if it is a prayer time, then make the intention for Umrah and begin the Talbiyah." },
  { t: "Tawaf", ic: "🕋", b: "Begin at the Black Stone line. Seven circuits with the Ka'bah on your left. Use the counter below." },
  { t: "Two rak'ahs & Zamzam", ic: "💧", b: "Pray two rak'ahs behind Maqam Ibrahim if possible, or anywhere in the mosque without blocking others. Drink Zamzam and make dua." },
  { t: "Sa'i", ic: "🚶", b: "Seven laps between Safa and Marwah, starting at Safa and ending at Marwah. Use the counter below." },
  { t: "Halq or Taqsir", ic: "✂️", b: "Men shave or trim the whole head; women trim a fingertip length from the ends. Umrah is complete." },
];

const HAJJ_DAYS = [
  { d: "8 Dhul Hijjah · Tarwiyah", b: "Enter Ihram for Hajj (from your lodging), go to Mina, pray Dhuhr, Asr, Maghrib, Isha and Fajr there (shortened, not combined)." },
  { d: "9 Dhul Hijjah · Day of Arafah", b: "After sunrise go to Arafah. Pray Dhuhr and Asr shortened and combined. Spend the afternoon in dua and dhikr until sunset. Arafah is the heart of Hajj." },
  { d: "9 night · Muzdalifah", b: "After sunset leave Arafah for Muzdalifah. Pray Maghrib and Isha combined, rest, pray Fajr, make dua, and collect pebbles for stoning." },
  { d: "10 Dhul Hijjah · Eid", b: "Stone Jamarat al-Aqabah with seven pebbles, offer the sacrifice, shave or trim, then perform Tawaf al-Ifadah and Sa'i (for Tamattu')." },
  { d: "11 & 12 Dhul Hijjah · Tashreeq", b: "Stay in Mina. After midday stone the three Jamarat in order: small, middle, large, seven pebbles each." },
  { d: "13 Dhul Hijjah (optional) & Farewell", b: "Those who stay a third day stone again. Before leaving Makkah, perform Tawaf al-Wada (farewell)." },
];

const DUAS = [
  { n: "Talbiyah", ar: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ", tr: "Labbayk Allahumma labbayk, labbayka la sharika laka labbayk, innal hamda wan-ni'mata laka wal mulk, la sharika lak.", en: "Here I am, O Allah, here I am. You have no partner, here I am. All praise, favour and sovereignty are Yours. You have no partner." },
  { n: "Between the Yemeni Corner and the Black Stone", ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", tr: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.", en: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire. (Quran 2:201)" },
  { n: "Approaching Safa", ar: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ", tr: "Innas-Safa wal-Marwata min sha'a'irillah.", en: "Indeed Safa and Marwah are among the symbols of Allah. (Quran 2:158) Then say: I begin with what Allah began with." },
  { n: "Day of Arafah", ar: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", tr: "La ilaha illallahu wahdahu la sharika lah, lahul mulku wa lahul hamd, wa huwa 'ala kulli shay'in qadir.", en: "None has the right to be worshipped but Allah alone, with no partner. His is the dominion and the praise, and He is over all things capable." },
  { n: "Entering the mosque", ar: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", tr: "Allahumma iftah li abwaba rahmatik.", en: "O Allah, open for me the doors of Your mercy." },
  { n: "Leaving the mosque", ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", tr: "Allahumma inni as'aluka min fadlik.", en: "O Allah, I ask You of Your bounty." },
  { n: "Travel dua", ar: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ", tr: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.", en: "Glory to Him who subjected this to us, and we could not have done it ourselves. To our Lord we will return. (Quran 43:13–14)" },
];

const MIQATS = [
  { n: "Dhul Hulayfah (Abyar Ali)", w: "Pilgrims coming from Madinah" },
  { n: "Al-Juhfah (near Rabigh)", w: "From the direction of Syria, Egypt and the Maghrib" },
  { n: "Qarn al-Manazil (As-Sayl al-Kabir)", w: "From Najd and Ta'if" },
  { n: "Yalamlam", w: "From the direction of Yemen; South Asian pilgrims by air or sea usually align with it" },
  { n: "Dhat 'Irq", w: "From the direction of Iraq" },
];

const RESTRICTIONS = ["No cutting hair or nails", "No perfume or scented products", "Men: no stitched clothing and no covering the head", "No marital relations or engagement", "No hunting or uprooting plants", "No arguing or sinful speech"];

const ZIYARAH = [
  { c: "Madinah", p: [["Al-Masjid an-Nabawi", "The Prophet's ﷺ Mosque; greet the Prophet ﷺ with salam and calm manners."], ["Rawdah", "The area between the Prophet's ﷺ house and minbar; access follows official time slots."], ["Quba Mosque", "The first mosque in Islam; praying two rak'ahs there after wudu is recommended."], ["Mount Uhud", "Site of the Battle of Uhud and its martyrs."], ["Masjid al-Qiblatayn", "Where the Qiblah direction was changed toward the Ka'bah."], ["Al-Baqi'", "Cemetery of many Companions and the Prophet's ﷺ family."]] },
  { c: "Makkah", p: [["Masjid al-Haram", "The Ka'bah, Mataf, Safa and Marwah."], ["Jabal an-Nur · Cave Hira", "Where revelation began."], ["Jabal Thawr", "The cave where the Prophet ﷺ and Abu Bakr رضي الله عنه sheltered during Hijrah."], ["Mina · Arafah · Muzdalifah", "The sites of Hajj rites."]] },
];

const PACKING = ["Passport, visa and permit documents", "Ihram (men) and modest clothing", "Unscented toiletries", "Comfortable walking footwear", "Medication and prescriptions", "Power bank and charger", "Refillable water bottle", "Small prayer mat", "Dua notebook", "Emergency contacts and hotel address card"];

function Counter({ storeKey, goal, labels }: { storeKey: string; goal: number; labels?: (n: number) => string }) {
  const [n, setN] = useStored<number>(storeKey, 0);
  const tap = () => {
    if (n >= goal) return;
    const next = n + 1;
    setN(next);
    try { navigator.vibrate?.(next === goal ? [60, 40, 60] : 30); } catch { /* vibration unavailable */ }
    if (next === goal) toast("Masha'Allah, completed. May Allah accept it from you.");
  };
  return <div className="card" style={{ textAlign: "center" }}>
    <div className="progress"><div style={{ width: `${(n / goal) * 100}%` }} /></div>
    <button onClick={tap} aria-label="Count one" style={{ width: 150, height: 150, borderRadius: "50%", margin: "14px auto", display: "block", border: "3px solid #d4af37", background: "rgba(212,175,55,.12)", color: "inherit", fontSize: 44, fontWeight: 700 }}>{n}<small style={{ display: "block", fontSize: 13, fontWeight: 400 }}>of {goal}</small></button>
    <p className="muted small">{n >= goal ? "Complete" : labels ? labels(n) : "Tap after each round"}</p>
    <div className="row gap-s" style={{ justifyContent: "center" }}>
      <button className="chip" disabled={n === 0} onClick={() => setN(Math.max(0, n - 1))}>Undo</button>
      <button className="chip" disabled={n === 0} onClick={() => setN(0)}>Reset</button>
    </div>
  </div>;
}

export function UmrahCompanion() {
  const [tab, setTab] = useState<Tab>("Umrah");
  const [step, setStep] = useStored<number>("umrah-step", 0);
  const [done, setDone] = useStored<string[]>("umrah-packing", []);
  const [notes, setNotes] = useStored<string>("umrah-notes", "");
  const [depart, setDepart] = useStored<string>("umrah-depart", "");
  const [openDua, setOpenDua] = useState(0);
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  const days = useMemo(() => depart ? Math.ceil((new Date(depart + "T00:00:00").getTime() - now.getTime()) / 86400000) : null, [depart, now]);
  const s = UMRAH_STEPS[step];

  return <div className="screen">
    <header className="head">
      <span className="kicker">AMANORA · HAJJ & UMRAH COMPANION</span>
      <h2>Umrah & Hajj</h2>
      <p className="muted">Step-by-step rites, counters, duas and planning, all inside Amanora.</p>
    </header>
    <div className="row gap-s wrap" style={{ marginBottom: 12 }}>{TABS.map(x => <button key={x.id} className={"chip" + (tab === x.id ? " on" : "")} onClick={() => setTab(x.id)}>{x.label}</button>)}</div>

    {tab === "Live" && <div className="pilgrim-stack"><div className="pilgrim-live-hero"><span>الحرمين الشريفين</span><h3>Live times at the Two Holy Mosques</h3><p>Prayer times for Makkah and Madinah with the Saudi clock.</p></div><HaramainLive /></div>}

    {tab === "Umrah" && <>
      <div className="card">
        <div className="row between"><span className="kicker">STEP {step + 1} OF {UMRAH_STEPS.length}</span><span className="pill">{Math.round(((step + 1) / UMRAH_STEPS.length) * 100)}%</span></div>
        <div className="progress"><div style={{ width: `${((step + 1) / UMRAH_STEPS.length) * 100}%` }} /></div>
        <div style={{ fontSize: 40, margin: "10px 0" }}>{s.ic}</div>
        <h3>{s.t}</h3><p>{s.b}</p>
        <div className="row between"><button className="chip" disabled={step === 0} onClick={() => setStep(step - 1)}>← Previous</button><button className="btn" disabled={step === UMRAH_STEPS.length - 1} onClick={() => setStep(step + 1)}>Next →</button></div>
      </div>
      {step === 1 && <><h3>Tawaf counter</h3><Counter storeKey="umrah-tawaf" goal={7} labels={n => n === 0 ? "Start at the Black Stone line, Ka'bah on your left" : `Round ${n} done. Continue to round ${n + 1}`} /></>}
      {step === 3 && <><h3>Sa'i counter</h3><Counter storeKey="umrah-sai" goal={7} labels={n => n % 2 === 0 ? `Lap ${n + 1}: walk from Safa to Marwah` : `Lap ${n + 1}: walk from Marwah to Safa`} /></>}
      <p className="note">General educational guide, not a fatwa. Rulings differ by madhhab and circumstance; confirm with a qualified scholar and your group leader.</p>
    </>}

    {tab === "Hajj" && <div className="pilgrim-stack">{HAJJ_DAYS.map(d => <div className="card" key={d.d}><small className="gold">{d.d}</small><p>{d.b}</p></div>)}
      <div className="card"><h3>Jamarat pebble counter</h3><Counter storeKey="hajj-pebbles" goal={7} labels={n => `${n} of 7 pebbles thrown`} /></div></div>}

    {tab === "Duas" && <div className="pilgrim-stack">{DUAS.map((d, i) => <div className="card" key={d.n}>
      <button className="row between" style={{ width: "100%", background: "none", border: 0, color: "inherit" }} onClick={() => setOpenDua(openDua === i ? -1 : i)}><b>{d.n}</b><span className="gold">{openDua === i ? "−" : "+"}</span></button>
      {openDua === i && <><p className="arabic" dir="rtl" style={{ fontSize: 24, lineHeight: 2 }}>{d.ar}</p><p className="muted small"><i>{d.tr}</i></p><p>{d.en}</p></>}
    </div>)}</div>}

    {tab === "Ihram" && <div className="pilgrim-stack">
      <div className="card"><h3>The five Miqats</h3>{MIQATS.map(m => <div key={m.n} style={{ margin: "10px 0" }}><b>{m.n}</b><small className="muted" style={{ display: "block" }}>{m.w}</small></div>)}<p className="muted small">Those travelling by air should enter Ihram before passing the Miqat line; your airline or group leader announces it.</p></div>
      <div className="card"><h3>While in Ihram</h3>{RESTRICTIONS.map(r => <div key={r} className="prayer-row"><span>✧</span><span className="grow">{r}</span></div>)}<p className="muted small">Women do not wear a special garment; modest clothing with face and hands uncovered by custom.</p></div>
    </div>}

    {tab === "Ziyarah" && <div className="pilgrim-stack">{ZIYARAH.map(c => <div className="card" key={c.c}><h3>{c.c}</h3>{c.p.map(([n, d]) => <div key={n} style={{ margin: "10px 0" }}><b>{n}</b><small className="muted" style={{ display: "block" }}>{d}</small></div>)}</div>)}
      <div className="card"><h3>Emergency numbers in Saudi Arabia</h3><div className="prayer-row"><b>Unified emergency</b><span>911</span></div><div className="prayer-row"><b>Ambulance (Red Crescent)</b><span>997</span></div><p className="muted small">Save your hotel address and group leader's number on a card.</p></div>
    </div>}

    {tab === "Plan" && <div className="pilgrim-stack">
      <div className="card"><h3>My journey</h3>
        <label>Departure date<input className="input" type="date" value={depart} onChange={e => setDepart(e.target.value)} /></label>
        {days !== null && <p className="gold"><b>{days > 0 ? `${days} day${days === 1 ? "" : "s"} to go` : days === 0 ? "Departure is today" : "Journey date has passed"}</b></p>}
        <label>Private notes<textarea className="input" rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Hotel, group leader, flight, meeting point…" /></label>
        <small className="muted">Saved on this device only. Do not store passport or card numbers.</small></div>
      <div className="card"><div className="row between"><h3>Packing checklist</h3><span className="pill">{done.length}/{PACKING.length}</span></div><div className="progress"><div style={{ width: `${(done.length / PACKING.length) * 100}%` }} /></div>
        {PACKING.map(i => <label className="pilgrim-check" key={i}><input type="checkbox" checked={done.includes(i)} onChange={() => setDone(done.includes(i) ? done.filter(x => x !== i) : [...done, i])} /><span>{i}</span></label>)}
        <button className="chip" onClick={() => setDone([])}>Reset checklist</button></div>
    </div>}
  </div>;
}
