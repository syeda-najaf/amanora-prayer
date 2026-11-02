import { useEffect, useRef, useState } from "react";
import { getSurahs } from "../lib";
import type { Surah } from "../types";

interface Radio { id: number; name: string; url: string }
interface Reciter { id: number; name: string; moshaf: { id: number; name: string; server: string; surah_list: string }[] }

export function Listen() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [now, setNow] = useState<string>("");
  const [playingKey, setPlayingKey] = useState<string>("");
  const [status, setStatus] = useState("");

  // live radio
  const [radios, setRadios] = useState<Radio[]>([]);
  const [radioErr, setRadioErr] = useState("");

  // reciters
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [rq, setRq] = useState("");
  const [rec, setRec] = useState<Reciter | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);


  useEffect(() => {
    fetch("https://www.mp3quran.net/api/v3/radios?language=eng").then((r) => r.json())
      .then((j) => setRadios((j.radios || []).filter((x: Radio) => x.url)))
      .catch(() => setRadioErr("Live radio needs an internet connection."));
    fetch("https://www.mp3quran.net/api/v3/reciters?language=eng").then((r) => r.json())
      .then((j) => setReciters(j.reciters || [])).catch(() => {});
    getSurahs().then(setSurahs).catch(() => {});
    return () => { audio.current?.pause(); };
  }, []);

  const play = (key: string, src: string, label: string) => {
    if (!audio.current) audio.current = new Audio();
    const a = audio.current;
    if (playingKey === key) { a.pause(); setPlayingKey(""); setNow(""); setStatus(""); return; }
    a.pause();
    a.src = src;
    a.onerror = () => { setStatus("This audio could not load. Try another one."); setPlayingKey(""); };
    a.onended = () => { setPlayingKey(""); setNow(""); };
    setStatus("Loading…");
    a.play().then(() => { setPlayingKey(key); setNow(label); setStatus(""); }).catch(() => { setStatus("Tap again to start audio."); });
  };



  const filtered = reciters.filter((r) => r.name.toLowerCase().includes(rq.toLowerCase())).slice(0, 25);
  const moshaf = rec?.moshaf?.[0];
  const available = moshaf ? moshaf.surah_list.split(",").map((n) => parseInt(n, 10)) : [];

  return (
    <div className="screen">
      <header className="head">
        <span className="kicker">LISTEN AND LEARN</span>
        <h2>Listen</h2>
        <p className="muted">Quran radio and full-surah recitations from listed human reciters.</p>
      </header>

      {now && (
        <div className="now-playing">
          <span>🎧 Now playing</span>
          <b>{now}</b>
          <button className="chip" onClick={() => { audio.current?.pause(); setPlayingKey(""); setNow(""); }}>■ Stop</button>
        </div>
      )}
      {status && <p className="muted center">{status}</p>}

      <div className="card">
        <h3>🔴 Live Quran radio</h3>
        {radioErr && <p className="err">{radioErr}</p>}
        {!radioErr && radios.length === 0 && <p className="muted">Loading stations…</p>}
        <div className="list">
          {radios.slice(0, 30).map((r) => (
            <div key={r.id} className="list-row">
              <button className={"round " + (playingKey === "r" + r.id ? "on" : "")} onClick={() => play("r" + r.id, r.url, r.name)}>{playingKey === "r" + r.id ? "■" : "▶"}</button>
              <span className="grow"><b>{r.name}</b><small>Live stream</small></span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>📖 Full-surah recitations</h3>
        {!rec ? (
          <>
            <input className="input" placeholder="Search a reciter" value={rq} onChange={(e) => setRq(e.target.value)} />
            <div className="list">
              {filtered.map((r) => (
                <button key={r.id} className="list-row btn-row" onClick={() => setRec(r)}>
                  <span className="grow"><b>{r.name}</b></span><span>›</span>
                </button>
              ))}
              {reciters.length === 0 && <p className="muted">Loading reciters…</p>}
            </div>
          </>
        ) : (
          <>
            <div className="row between">
              <b>{rec.name}</b>
              <button className="chip" onClick={() => setRec(null)}>Change</button>
            </div>
            <div className="list scroll">
              {surahs.filter((s) => available.includes(s.number)).map((s) => {
                const key = `q${rec.id}-${s.number}`;
                const src = `${moshaf!.server}${String(s.number).padStart(3, "0")}.mp3`;
                return (
                  <div key={s.number} className="list-row">
                    <button className={"round " + (playingKey === key ? "on" : "")} onClick={() => play(key, src, `${s.englishName} · ${rec.name}`)}>{playingKey === key ? "■" : "▶"}</button>
                    <span className="grow"><b>{s.number}. {s.englishName}</b><small>{s.englishNameTranslation}</small></span>
                    <span className="ar">{s.name}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>📚 Amanora reading library</h3>
        <p className="muted small">Prefer written learning? Open Read & Reflect for original English reflections with Quran references, practical exercises and saved readings. No third-party video or lecture links are used in Amanora.</p>
      </div>
    </div>
  );
}
