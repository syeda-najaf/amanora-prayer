import { useEffect, useState } from "react";

const HARAMAIN = [
  { name: "Makkah — Masjid al-Haram", lat: 21.4225, lon: 39.8262 },
  { name: "Madinah — Al-Masjid an-Nabawi", lat: 24.4672, lon: 39.6111 },
];
const ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export function HaramainLive() {
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


