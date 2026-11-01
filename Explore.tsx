import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { Coords } from "../types";
import { NAMES } from "../data/names";
import { CONFIG } from "../config";

type View = null | "zakat" | "names" | "ramadan" | "finder" | "support";

function Back({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="row between">
      <button className="chip" onClick={onBack}>‹ Back</button>
      <h2 style={{ fontSize: 20 }}>{title}</h2>
      <span style={{ width: 60 }} />
    </div>
  );
}

/* ---------------- Zakat calculator ---------------- */
function Zakat({ onBack }: { onBack: () => void }) {
  const [cur, setCur] = useState("₹");
  const [basis, setBasis] = useState<"silver" | "gold">("silver");
  const [v, setV] = useState({ cash: "", gold: "", silver: "", invest: "", business: "", debts: "", goldPrice: "", silverPrice: "" });
  const n = (k: keyof typeof v) => Math.max(0, parseFloat(v[k]) || 0);
  const set = (k: keyof typeof v) => (e: ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  const wealth = n("cash") + n("gold") * n("goldPrice") + n("silver") * n("silverPrice") + n("invest") + n("business");
  const net = Math.max(0, wealth - n("debts"));
  const nisab = basis === "silver" ? 612.36 * n("silverPrice") : 87.48 * n("goldPrice");
  const ready = nisab > 0;
  const due = ready && net >= nisab ? net * 0.025 : 0;
  const f = (x: number) => `${cur}${x.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const field = (k: keyof typeof v, label: string, hint?: string) => (
    <label key={k}>{label}<input className="input" inputMode="decimal" value={v[k]} onChange={set(k)} placeholder={hint || "0"} /></label>
  );

  return (
    <div className="screen">
      <Back onBack={onBack} title="Zakat calculator" />
      <div className="card">
        <label>Currency symbol<input className="input" value={cur} onChange={(e) => setCur(e.target.value)} /></label>
        {field("goldPrice", `Gold price per gram (${cur})`, "Check today's price")}
        {field("silverPrice", `Silver price per gram (${cur})`, "Check today's price")}
        <div className="chips">
          <button className={"chip" + (basis === "silver" ? " on" : "")} onClick={() => setBasis("silver")}>Nisab: silver (612.36 g)</button>
          <button className={"chip" + (basis === "gold" ? " on" : "")} onClick={() => setBasis("gold")}>Nisab: gold (87.48 g)</button>
        </div>
      </div>
      <div className="card">
        <h3>Your wealth</h3>
        {field("cash", `Cash and bank savings (${cur})`)}
        {field("gold", "Gold you own (grams)")}
        {field("silver", "Silver you own (grams)")}
        {field("invest", `Investments and shares (${cur})`)}
        {field("business", `Business stock / money owed to you (${cur})`)}
        {field("debts", `Debts you must pay soon (${cur})`)}
      </div>
      <div className="hero-card">
        <small>RESULT</small>
        {!ready ? <p className="hero-time">Enter today's gold or silver price to see the nisab.</p> : (
          <>
            <div className="row between"><span>Net wealth</span><b>{f(net)}</b></div>
            <div className="row between"><span>Nisab</span><b>{f(nisab)}</b></div>
            <div className="hero-name">{due > 0 ? `Zakat due: ${f(due)}` : "No zakat due"}</div>
            <small style={{ color: "#D9E7DD" }}>{due > 0 ? "That is 2.5% of your net wealth held for a full lunar year." : "Your wealth is below the nisab."}</small>
          </>
        )}
      </div>
      <p className="note">This is a simple guide. Zakat applies to wealth held for one lunar year. Ask a qualified scholar about your situation.</p>
    </div>
  );
}

/* ---------------- 99 Names ---------------- */
function Names({ onBack }: { onBack: () => void }) {
  const [q, setQ] = useState("");
  const list = NAMES.filter((x) => `${x.tr} ${x.en} ${x.n}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="screen">
      <Back onBack={onBack} title="99 Names of Allah" />
      <input className="input" placeholder="Search a name or meaning" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="names">
        {list.map((x) => (
          <div key={x.n} className="name-card">
            <small className="gold">{x.n}</small>
            <div className="ar name-ar">{x.ar}</div>
            <b>{x.tr}</b>
            <small className="muted">{x.en}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Ramadan countdown (live Hijri conversion) ---------------- */
function Ramadan({ onBack }: { onBack: () => void }) {
  const [info, setInfo] = useState<{ date: Date; hijriYear: number } | null>(null);
  const [err, setErr] = useState("");
  const [now] = useState(new Date());

  useEffect(() => {
    const pad = (x: number) => String(x).padStart(2, "0");
    (async () => {
      try {
        const t = await fetch(`https://api.aladhan.com/v1/gToH/${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`).then((r) => r.json());
        const h = t.data.hijri;
        let year = parseInt(h.year, 10);
        const month = parseInt(h.month.number, 10);
        if (month > 9) year += 1;
        const g = await fetch(`https://api.aladhan.com/v1/hToG/01-09-${year}`).then((r) => r.json());
        const [d, m, y] = g.data.gregorian.date.split("-").map((x: string) => parseInt(x, 10));
        const date = new Date(y, m - 1, d);
        setInfo({ date, hijriYear: year });
      } catch { setErr("Could not load the date. Check your internet connection."); }
    })();
  }, [now]);

  const days = info ? Math.ceil((info.date.getTime() - now.getTime()) / 86400000) : null;
  return (
    <div className="screen">
      <Back onBack={onBack} title="Ramadan" />
      <div className="hero-card center">
        <small>COUNTDOWN</small>
        {err ? <p className="err light">{err}</p> : !info ? <p className="hero-time">Loading…</p> : days! > 0 ? (
          <>
            <div className="hero-name" style={{ fontSize: 56 }}>{days}</div>
            <p className="hero-time">days until Ramadan {info.hijriYear} AH<br />expected around {info.date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>
          </>
        ) : <p className="hero-name">Ramadan Mubarak 🌙</p>}
      </div>
      <div className="card">
        <h3>Prepare for Ramadan</h3>
        <ul className="plain">
          <li>Make up any missed fasts from last year.</li>
          <li>Plan to finish the Quran: about 20 pages a day for 30 days.</li>
          <li>Prepare a dua list for Laylatul Qadr.</li>
          <li>Plan your zakat and sadaqah.</li>
        </ul>
      </div>
      <p className="note">The start of Ramadan depends on moon sighting and may differ by a day.</p>
    </div>
  );
}

/* ---------------- Mosque & halal food finder ---------------- */
function Finder({ coords, onBack }: { coords: Coords | null; onBack: () => void }) {
  const open = (q: string) => {
    const at = coords ? `/@${coords.lat},${coords.lon},14z` : "";
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}${at}`, "_blank", "noopener");
  };
  return (
    <div className="screen">
      <Back onBack={onBack} title="Find nearby" />
      {!coords && <p className="muted">Tip: set your location on the Home screen for results near you.</p>}
      <div className="grid">
        {[["🕌", "Mosques", "mosque"], ["🍽️", "Halal food", "halal restaurant"], ["🛒", "Halal stores", "halal grocery store"], ["🕋", "Islamic centres", "Islamic center"], ["📚", "Islamic books", "Islamic bookstore"], ["💧", "Wudu / prayer room", "prayer room"]].map(([ic, label, q]) => (
          <button key={q} className="tile" onClick={() => open(q)}><span className="tile-ic">{ic}</span>{label}</button>
        ))}
      </div>
      <p className="note">Opens Google Maps in a new tab.</p>
    </div>
  );
}

/* ---------------- Support (sadaqah) ---------------- */
function Support({ onBack }: { onBack: () => void }) {
  const upi = CONFIG.upiId ? `upi://pay?pa=${encodeURIComponent(CONFIG.upiId)}&pn=${encodeURIComponent(CONFIG.upiName)}&cu=INR&tn=${encodeURIComponent("Support Amanora")}` : "";
  const none = !upi && !CONFIG.paymentLink;
  return (
    <div className="screen">
      <Back onBack={onBack} title="Support Amanora" />
      <div className="card center">
        <div style={{ fontSize: 44 }}>🤲</div>
        <h3>Be part of the reward</h3>
        <p className="muted">Amanora is free and has no ads. Your support keeps it running and growing, in shaa Allah. The Prophet ﷺ taught that whoever guides to good has a reward like the one who does it.</p>
        {upi && <a className="btn gold-btn wide" href={upi}>Support with UPI</a>}
        {CONFIG.paymentLink && <a className="btn wide" href={CONFIG.paymentLink} target="_blank" rel="noopener noreferrer">Support by card or other methods</a>}
        {none && <p className="muted small">Support options are coming soon.</p>}
        {CONFIG.supportEmail && <a className="muted small" href={`mailto:${CONFIG.supportEmail}`}>{CONFIG.supportEmail}</a>}
        {CONFIG.whatsapp && <a className="chip" href={`https://wa.me/${CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>}
      </div>
      <button className="chip" onClick={() => navigator.share?.({ title: "Amanora", text: "Quran, prayer times, Hadith and daily stories in one free app.", url: location.href }).catch(() => {})}>↗ Share Amanora with friends</button>
    </div>
  );
}

/* ---------------- Hub ---------------- */
export function Explore({ coords, start, onGo }: { coords: Coords | null; start: View; onGo: (t: string) => void }) {
  const [view, setView] = useState<View>(start);
  useEffect(() => setView(start), [start]);
  const back = () => setView(null);

  if (view === "zakat") return <Zakat onBack={back} />;
  if (view === "names") return <Names onBack={back} />;
  if (view === "ramadan") return <Ramadan onBack={back} />;
  if (view === "finder") return <Finder coords={coords} onBack={back} />;
  if (view === "support") return <Support onBack={back} />;

  const rows: [string, string, string, () => void][] = [
    ["🎧", "Listen", "Live Quran radio, recitations, bayans", () => onGo("Listen")],
    ["📿", "Worship", "Qibla, tasbih, daily adhkar", () => onGo("Worship")],
    ["🕌", "Hadith", "Read and listen", () => onGo("Hadith")],
    ["🎓", "Learn", "Quran, Seerah, Arabic and more", () => onGo("Learn")],
    ["🧮", "Zakat calculator", "Know what you owe", () => setView("zakat")],
    ["✨", "99 Names of Allah", "Arabic, meaning and search", () => setView("names")],
    ["🌙", "Ramadan countdown", "Days until Ramadan", () => setView("ramadan")],
    ["📍", "Find nearby", "Mosques and halal food", () => setView("finder")],
    ["🤲", "Support Amanora", "Sadaqah and sharing", () => setView("support")],
    ["♡", "Me & settings", "Profile, journal, reminders", () => onGo("Me")],
  ];
  return (
    <div className="screen">
      <header className="head">
        <span className="kicker">ALL IN ONE</span>
        <h2>Explore</h2>
        <p className="muted">Everything for your deen in one place.</p>
      </header>
      {rows.map(([ic, t, s, fn]) => (
        <button key={t} className="hall" onClick={fn}>
          <span className="hall-icon">{ic}</span>
          <span className="grow"><b>{t}</b><small>{s}</small></span>
          <span className="gold">›</span>
        </button>
      ))}
    </div>
  );
}
