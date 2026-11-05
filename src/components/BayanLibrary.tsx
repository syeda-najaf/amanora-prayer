import { useEffect, useMemo, useState } from "react";

type BayanItem = { id: string; title: string; speaker: string; duration: string; topic: string; language: "en" | "ur"; date: string; description: string; url: string; featured?: boolean };

// These are links to the speaker's listed audio publisher. Amanora does not re-host these recordings.
const BAYANS: BayanItem[] = [
  { id: "peace", title: "Peace in Islam", speaker: "Mufti Menk", duration: "44:06", topic: "Character", language: "en", date: "30 Mar 2015", description: "Straight Path Convention Series Lecture Five, Kuching, Sarawak, Malaysia.", url: "https://muslimcentral.com/mufti-ismail-musa-menk-peace-in-islam", featured: true },
  { id: "judgement", title: "Day of Judgement", speaker: "Mufti Menk", duration: "44:06", topic: "Akhirah", language: "en", date: "02 Jun 2014", description: "A full talk reflecting on accountability and preparing for the Hereafter.", url: "https://muslimcentral.com/mufti-menk-day-judgement" },
  { id: "relation", title: "Revive Your Relation with Allah", speaker: "Mufti Menk", duration: "17:54", topic: "Faith", language: "en", date: "29 Oct 2022", description: "A reminder about renewing your connection with Allah and improving your relationships.", url: "https://muslimcentral.com/mufti-menk-revive-your-relation-with-allah", featured: true },
  { id: "mercy", title: "Lessons on Justice and Mercy", speaker: "Mufti Menk", duration: "32:44", topic: "Character", language: "en", date: "21 May 2018", description: "A full lecture reflecting on mercy, justice and the way we treat people.", url: "https://muslimcentral.com/mufti-menk-lessons-on-justice-and-mercy" },
  { id: "love", title: "Love for the Sake of Allah", speaker: "Mufti Menk", duration: "18:23", topic: "Faith", language: "en", date: "08 Sep 2017", description: "A reminder about sincere care, unity and good character.", url: "https://muslimcentral.com/mufti-menk-love-sake-allah" },
  { id: "connection", title: "Connecting to Allah Through the Sunnah", speaker: "Mufti Menk", duration: "28:16", topic: "Sunnah", language: "en", date: "27 Jul", description: "A lecture about gratitude and strengthening faith through the Sunnah.", url: "https://muslimcentral.com/mufti-menk-new-connecting-to-allah-through-the-sunnah" },
];
const TOPICS = ["All", "Faith", "Akhirah", "Character", "Sunnah"];
const read = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } };
const save = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be unavailable */ } };

export function BayanLibrary() {
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [topic, setTopic] = useState("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => read("amanora:bayan-favorites", []));
  const [recent, setRecent] = useState<string[]>(() => read("amanora:bayan-recent", []));
  const [queue, setQueue] = useState<string[]>(() => read("amanora:bayan-queue", []));
  const [selectedBayan, setSelectedBayan] = useState<BayanItem | null>(null);
  const isUrdu = language === "ur";

  useEffect(() => { save("amanora:bayan-favorites", favorites); }, [favorites]);
  useEffect(() => { save("amanora:bayan-recent", recent); }, [recent]);
  useEffect(() => { save("amanora:bayan-queue", queue); }, [queue]);

  const filtered = useMemo(() => BAYANS.filter(b => (topic === "All" || b.topic === topic) && (language === "en" ? b.language === "en" : b.language === "ur") && `${b.title} ${b.speaker} ${b.topic}`.toLowerCase().includes(query.toLowerCase())), [topic, query, language]);
  const toggle = (id: string) => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const markRecent = (id: string) => setRecent(old => [id, ...old.filter(x => x !== id)].slice(0, 12));
  const openBayan = (b: BayanItem) => { markRecent(b.id); setSelectedBayan(b); };
  const addQueue = (id: string) => setQueue(old => old.includes(id) ? old : [...old, id]);

  return <div className="screen bayan-screen" dir={isUrdu ? "rtl" : "ltr"}>
    <header className="bayan-hero">
      <div className="bayan-orbit">۞</div>
      <span className="kicker">AMANORA AUDIO SANCTUARY</span>
      <h2>{isUrdu ? "بیان کی دنیا" : "The Bayan Library"}</h2>
      <p>{isUrdu ? "مکمل بیانات، محفوظ فہرستیں ۔" : "Long-form Islamic reminders and organised listening."}</p>
      <div className="bayan-hero-meta"><span>🎧 Full-length talks</span><span>♡ Saved talks</span></div>
    </header>

    <div className="bayan-toolbar card">
      <div className="row between wrap"><b>{isUrdu ? "زبان منتخب کریں" : "Choose your language"}</b><div className="bayan-language"><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button><button className={language === "ur" ? "active" : ""} onClick={() => setLanguage("ur")}>اردو</button></div></div>
      <input className="input" placeholder={isUrdu ? "بیان یا موضوع تلاش کریں" : "Search talks, speakers or topics"} value={query} onChange={e => setQuery(e.target.value)} />
      <div className="bayan-topics">{TOPICS.map(t => <button key={t} className={topic === t ? "active" : ""} onClick={() => setTopic(t)}>{t}</button>)}</div>
    </div>

    {language === "en" ? <>
      <section className="bayan-feature card"><div className="bayan-feature-art"><span>﷽</span><small>FEATURED SERIES</small></div><div className="bayan-feature-copy"><span className="kicker">FULL LECTURE · MUFTI MENK</span><h3>Peace in Islam</h3><p className="muted small">44 minutes of reflection on peace, character and how we treat others.</p><button className="btn wide" onClick={() => openBayan(BAYANS[0])}>▶ Play inside Amanora</button><small className="tiny-note">The publisher player opens here inside the Amanora screen.</small></div></section>
      <div className="row between"><h3>Explore full Bayans</h3><span className="pill">{filtered.length} talks</span></div>
      <div className="bayan-list">{filtered.map(b => <article className="bayan-item card" key={b.id}><div className="bayan-cover">{b.topic === "Akhirah" ? "🌙" : b.topic === "Sunnah" ? "۞" : b.topic === "Character" ? "🌿" : "🤍"}</div><div className="bayan-item-main"><div className="row between"><span className="pill">{b.topic}</span><span className="muted tiny">{b.duration}</span></div><h4>{b.title}</h4><p className="muted tiny">{b.speaker} · {b.date}</p><p className="muted small">{b.description}</p><div className="row gap-s wrap"><button className="btn" onClick={() => openBayan(b)}>▶ Play in app</button><button className="chip" onClick={() => toggle(b.id)}>{favorites.includes(b.id) ? "♥ Saved" : "♡ Save"}</button><button className="chip" onClick={() => addQueue(b.id)}>{queue.includes(b.id) ? "✓ Queued" : "+ Queue"}</button></div></div></article>)}</div>
      {filtered.length === 0 && <div className="card center"><h3>Urdu collection is being curated</h3><p className="muted small">We are preparing Urdu-language full Bayans with clear speaker attribution and permission checks. </p><button className="chip" onClick={() => setLanguage("ur")}>View Urdu collection</button></div>}
    </> : <section className="card bayan-urdu-empty"><div className="bayan-urdu-mark">اردو</div><h3>اردو بیانات کی لائبریری</h3><p className="muted">Urdu full-length recordings will appear here after their source and reuse permissions are checked. We will not fill this shelf with copied or unverified recordings.</p><button className="chip" onClick={() => setLanguage("en")}>Browse English full Bayans</button></section>}

    {selectedBayan && <section className="card bayan-inline-player" aria-label="In-app Bayan player">
      <div className="row between wrap"><div><span className="kicker">NOW PLAYING · INSIDE AMANORA</span><h3 style={{margin:"5px 0"}}>{selectedBayan.title}</h3><p className="muted tiny">{selectedBayan.speaker} · {selectedBayan.duration} · Publisher: Muslim Central</p></div><button className="chip" onClick={()=>setSelectedBayan(null)}>Close player ✕</button></div>
      <div className="bayan-embed-frame"><iframe key={selectedBayan.id} src={selectedBayan.url} title={`${selectedBayan.title} by ${selectedBayan.speaker}`} loading="lazy" allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" /></div>
      <p className="tiny-note">Playback is displayed inside this screen and streamed by the original publisher. Amanora does not download, re-upload or claim ownership of the recording. If the publisher blocks embedded playback, its player cannot be forced to play inside a third-party app.</p>
    </section>}

    <section className="bayan-library-grid"><div className="card"><h3>♡ Saved Bayans</h3><p className="muted small">Your saved talks stay on this device.</p>{favorites.length ? favorites.map(id => { const b = BAYANS.find(x=>x.id===id); return b ? <button className="lesson-row" key={id} onClick={()=>openBayan(b)}><span className="grow"><b>{b.title}</b><small>{b.speaker} · {b.duration}</small></span><span>▶</span></button> : null; }) : <p className="tiny-note">Save a talk to build your listening list.</p>}</div><div className="card"><h3>◷ Recently played</h3>{recent.length ? recent.map(id => { const b = BAYANS.find(x=>x.id===id); return b ? <button className="lesson-row" key={id} onClick={()=>openBayan(b)}><span className="grow"><b>{b.title}</b><small>{b.duration}</small></span><span>▶</span></button> : null; }) : <p className="tiny-note">Your listening history will appear here.</p>}</div><div className="card"><h3>☷ Up next</h3>{queue.length ? queue.map(id => { const b = BAYANS.find(x=>x.id===id); return b ? <div className="lesson-row" key={id}><span className="grow"><b>{b.title}</b><small>{b.duration}</small></span><button className="chip" onClick={()=>setQueue(old=>old.filter(x=>x!==id))}>Remove</button></div> : null; }) : <p className="tiny-note">Add talks to your queue for your next listening session.</p>}</div></section>

    <section className="card bayan-trust"><b>Content and source promise</b><p className="muted small">Amanora displays the publisher page in an in-app player where embedding is permitted. Recordings remain hosted and controlled by their publisher. AI-generated summaries are not religious authority. For rulings, consult qualified scholars and original sources.</p><p className="tiny-note">Speaker and publisher attribution remain visible in the player. No audio file is copied into Amanora.</p></section>
  </div>;
}
