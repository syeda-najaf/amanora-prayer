import { useEffect, useRef, useState } from "react";
import { ADHKAR, DHIKR } from "../data/content";
import type { Coords } from "../types";
import { qiblaBearing, speak, stopSpeak, useStored } from "../lib";

function Qibla({ coords }: { coords: Coords | null }) {
  const [heading, setHeading] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const handler = useRef<((e: any) => void) | null>(null);
  const bearing = coords ? qiblaBearing(coords.lat, coords.lon) : null;

  const stopCompass = () => {
    if (handler.current) {
      window.removeEventListener("deviceorientationabsolute", handler.current as any, true);
      window.removeEventListener("deviceorientation", handler.current as any, true);
      handler.current = null;
    }
  };
  useEffect(() => stopCompass, []);

  const start = async () => {
    try {
      const D: any = (window as any).DeviceOrientationEvent;
      if (D && typeof D.requestPermission === "function") {
        const r = await D.requestPermission();
        if (r !== "granted") { setMsg("Compass permission was denied."); return; }
      }
      stopCompass();
      const h = (e: any) => {
        let a: number | null = null;
        if (typeof e.webkitCompassHeading === "number") a = e.webkitCompassHeading;
        else if (e.alpha != null && (e.absolute || e.type === "deviceorientationabsolute")) a = 360 - e.alpha;
        if (a != null) setHeading(a);
      };
      handler.current = h;
      window.addEventListener("deviceorientationabsolute", h as any, true);
      window.addEventListener("deviceorientation", h as any, true);
      setMsg("Hold your phone flat and turn until the Kaaba symbol points up.");
    } catch { setMsg("A compass is not available on this device."); }
  };

  if (!coords || bearing == null) {
    return <div className="card"><h3>🧭 Qibla</h3><p className="muted">Set your location on the Home screen to find the Qibla direction.</p></div>;
  }
  const rot = heading == null ? bearing : (bearing - heading + 360) % 360;
  const aligned = heading != null && (rot < 6 || rot > 354);

  return (
    <div className="card center">
      <h3>🧭 Qibla</h3>
      <div className={"compass" + (aligned ? " aligned" : "")}>
        <div className="compass-ring" />
        <div className="needle" style={{ transform: `rotate(${rot}deg)` }}><span>🕋</span></div>
        <div className="compass-n">N</div>
      </div>
      <b>{Math.round(bearing)}° from North</b>
      <p className="muted small">{aligned ? "You are facing the Qibla ✓" : msg || "Face North, then turn to the angle above. Or turn on the live compass."}</p>
      <button className="btn" onClick={start}>{heading == null ? "Use live compass" : "Compass on"}</button>
    </div>
  );
}

export function Worship({ coords }: { coords: Coords | null }) {
  const [count, setCount] = useStored<number>("tasbih", 0);
  const [total, setTotal] = useStored<number>("tasbih-total", 0);
  const [di, setDi] = useState(0);
  const [talking, setTalking] = useState<number | null>(null);
  useEffect(() => () => stopSpeak(), []);

  const tap = () => {
    setCount(count + 1); setTotal(total + 1);
    try { navigator.vibrate?.(count + 1 === 33 ? [60, 40, 60] : 12); } catch { /* not supported */ }
  };

  return (
    <div className="screen">
      <header className="head">
        <span className="kicker">YOUR DAILY CONNECTION</span>
        <h2>Worship</h2>
        <p className="muted">Qibla, tasbih and daily remembrance.</p>
      </header>

      <Qibla coords={coords} />

      <div className="card center">
        <small className="muted">TASBIH COUNTER</small>
        <div className="ar big-ar">{DHIKR[di].ar}</div>
        <small className="muted">{DHIKR[di].en}</small>
        <button className="tasbih" onClick={tap}><b>{count}</b><small>TAP</small></button>
        <div className="progress"><div style={{ width: `${Math.min(100, ((count % 33) / 33) * 100 || (count > 0 && count % 33 === 0 ? 100 : 0))}%` }} /></div>
        <small className="muted">{count % 33 === 0 && count > 0 ? "33 complete ✓" : `${count % 33} / 33`} · Lifetime {total}</small>
        <div className="row between wide">
          <button className="chip" onClick={() => setDi((di + 1) % DHIKR.length)}>Change dhikr ↻</button>
          <button className="chip" onClick={() => setCount(0)}>Reset ↺</button>
        </div>
      </div>

      <div className="card">
        <h3>Daily adhkar</h3>
        {ADHKAR.map((a, i) => (
          <div key={a.title} className="adhkar">
            <div className="grow">
              <b>{a.title}</b>
              <p className="ar adhkar-ar" dir="rtl">{a.ar}</p>
              <p className="muted small">{a.en}</p>
              <small className="gold">{a.note}</small>
            </div>
            <button className={"round " + (talking === i ? "on" : "")} onClick={() => {
              if (talking === i) { stopSpeak(); setTalking(null); return; }
              setTalking(i); speak(a.ar, "ar-SA", () => setTalking(null));
            }}>{talking === i ? "■" : "▶"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
