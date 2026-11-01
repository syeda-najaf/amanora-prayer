import { useState } from "react";
import { LEARN } from "../data/content";

export function Learn() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="screen">
      <header className="head">
        <span className="kicker">GROW IN KNOWLEDGE</span>
        <h2>Learn</h2>
        <p className="muted">Gain knowledge, step by step.</p>
      </header>
      {LEARN.map((l, i) => (
        <button key={l.title} className="hall" onClick={() => setOpen(open === i ? null : i)}>
          <span className="hall-icon">{l.icon}</span>
          <span className="grow">
            <b>{l.title}</b>
            <small>{l.sub}</small>
            {open === i && <p className="hall-body">{l.body}</p>}
          </span>
          <span className="gold">{open === i ? "⌃" : "⌄"}</span>
        </button>
      ))}
      <div className="card center">
        <p className="ar big-ar" dir="rtl">وَقُل رَّبِّ زِدْنِي عِلْمًا</p>
        <p>"My Lord, increase me in knowledge."</p>
        <small className="muted">Quran 20:114</small>
      </div>
    </div>
  );
}
