import { useMemo, useState } from "react";
import { AUTHENTIC_HADITHS } from "../data/hadiths";
import { dayOfYear, shareText } from "../lib";

export function Hadith() {
  const cats = useMemo(() => ["All", ...Array.from(new Set(AUTHENTIC_HADITHS.map((h) => h.category)))], []);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const today = AUTHENTIC_HADITHS[dayOfYear() % AUTHENTIC_HADITHS.length];
  const list = AUTHENTIC_HADITHS.filter((h) =>
    (cat === "All" || h.category === cat) && `${h.meaning} ${h.reference} ${h.category}`.toLowerCase().includes(q.toLowerCase())
  );



  const Card = ({ h, featured }: { h: typeof today; featured?: boolean }) => (
    <div className={"card hadith" + (featured ? " featured" : "")}>
      <div className="row between"><small className="gold">{(featured ? "HADITH OF THE DAY · " : "") + h.category.toUpperCase()}</small></div>
      <p className="ar hadith-ar" dir="rtl">{h.arabic}</p>
      <p className="hadith-en">{h.meaning}</p>
      {h.narrator && <small className="muted">Narrated by {h.narrator}</small>}
      <small className="muted">{h.reference}</small>
      {h.reflection && <p className="reflection">💡 {h.reflection}</p>}
      <div className="row gap-s">
        <button className="chip" onClick={() => shareText(h.reference, `${h.meaning}\n${h.arabic}`)}>Share hadith</button>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <header className="head">
        <span className="kicker">WORDS OF THE PROPHET ﷺ</span>
        <h2>Hadith</h2>
        <p className="muted">A daily rotating hadith with Arabic, meaning, source and reflection. Text-first learning, with no video embeds or generated narration.</p>
      </header>
      <Card h={today} featured />
      <section className="card" style={{marginTop:14}}>
        <small className="gold">AMANORA STUDY NOTE</small>
        <h3>Read the source with care</h3>
        <p className="muted small">Hadith cards include a collection reference where available. Numbering can vary between editions and websites. Check the original collection, narrator details and grading before using a narration to establish a ruling.</p>
      </section>
      <input className="input" placeholder="Search hadith" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {cats.map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {list.map((h) => <Card key={h.id} h={h} />)}
      {list.length === 0 && <p className="muted center">No hadith match your search.</p>}
      <p className="note">Always check the original collection for full context. Quran recitation audio is kept separate from written Hadith narration.</p>
    </div>
  );
}
