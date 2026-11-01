import { useEffect, useMemo, useState } from "react";
import { AUTHENTIC_HADITHS } from "../data/hadiths";
import { dayOfYear, shareText, speak, stopSpeak } from "../lib";

export function Hadith() {
  const cats = useMemo(() => ["All", ...Array.from(new Set(AUTHENTIC_HADITHS.map((h) => h.category)))], []);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [talking, setTalking] = useState<number | null>(null);

  useEffect(() => () => stopSpeak(), []);

  const today = AUTHENTIC_HADITHS[dayOfYear() % AUTHENTIC_HADITHS.length];
  const list = AUTHENTIC_HADITHS.filter((h) =>
    (cat === "All" || h.category === cat) && `${h.meaning} ${h.reference} ${h.category}`.toLowerCase().includes(q.toLowerCase())
  );

  const play = (id: number, ar: string, en: string, ref: string) => {
    if (talking === id) { stopSpeak(); setTalking(null); return; }
    setTalking(id);
    // Arabic first, then the meaning. Needs an Arabic voice on the device; otherwise it skips to English.
    speak(ar, "ar-SA", () => speak(`${en}. ${ref}.`, "en-US", () => setTalking(null)));
  };

  const Card = ({ h, featured }: { h: typeof today; featured?: boolean }) => (
    <div className={"card hadith" + (featured ? " featured" : "")}>
      <div className="row between"><small className="gold">{(featured ? "HADITH OF THE DAY · " : "") + h.category.toUpperCase()}</small></div>
      <p className="ar hadith-ar" dir="rtl">{h.arabic}</p>
      <p className="hadith-en">{h.meaning}</p>
      {h.narrator && <small className="muted">Narrated by {h.narrator}</small>}
      <small className="muted">{h.reference}</small>
      {h.reflection && <p className="reflection">💡 {h.reflection}</p>}
      <div className="row gap-s">
        <button className={"btn " + (talking === h.id ? "danger" : "")} onClick={() => play(h.id, h.arabic, h.meaning, h.reference)}>{talking === h.id ? "■ Stop" : "▶ Play hadith"}</button>
        <button className="chip" onClick={() => shareText(h.reference, `${h.meaning}\n${h.arabic}`)}>Share</button>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <header className="head">
        <span className="kicker">WORDS OF THE PROPHET ﷺ</span>
        <h2>Hadith</h2>
        <p className="muted">Read and listen. Arabic first, then the meaning.</p>
      </header>
      <Card h={today} featured />
      <input className="input" placeholder="Search hadith" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {cats.map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {list.map((h) => <Card key={h.id} h={h} />)}
      {list.length === 0 && <p className="muted center">No hadith match your search.</p>}
      <p className="note">Audio uses your device voice. If you hear no Arabic, install an Arabic voice in your device's text-to-speech settings. Always check the original collection for full context.</p>
    </div>
  );
}
