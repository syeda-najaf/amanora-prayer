import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent } from "react";
import type { Ayah, Surah, Settings } from "../types";
import { dateKey, getSurahs, useStored } from "../lib";
import { KhatmPlanner } from "./KhatmPlanner";

/* Indo-Pak 16-line mushaf (548 pages) with real per-word line numbers. Falls back to the 604-page flow layout if the line service is unreachable. */
const API = (import.meta.env.VITE_QURAN_API_BASE as string | undefined) || "https://api.quran.com/api/v4";
const MUSHAF = 7;
const LINE_PAGES = 548;
const FLOW_PAGES = 604;
const LINES = 16;
const BASMALA_WORDS = 4;
const toAr = (n: number | string) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Word = { t: string; end: boolean; ayah: number; n: number };
type Slot = { k: "words"; w: Word[]; start?: number } | { k: "banner"; s: number } | { k: "bism" } | { k: "empty" };
type PageData = { mode: "lines"; slots: Slot[]; ayahs: Ayah[] } | { mode: "flow"; ayahs: Ayah[] };
type Block = { kind: "head"; ay: Ayah } | { kind: "para"; items: Ayah[] };

async function fetchLinePage(p: number, surahs: Surah[]): Promise<PageData> {
  const cum: number[] = []; let run = 0;
  surahs.forEach((s, i) => { cum[i] = run; run += s.numberOfAyahs; });
  let verses: any[] = [];
  let next = 1;
  while (next && next < 6) {
    const url = `${API}/verses/by_page/${p}?mushaf=${MUSHAF}&words=true&word_fields=text_indopak,text_uthmani,line_number,page_number&per_page=50&page=${next}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("line service unavailable");
    const j = await r.json();
    if (!Array.isArray(j.verses)) throw new Error("bad line data");
    verses = verses.concat(j.verses);
    next = j.pagination?.next_page || 0;
  }
  if (!verses.length) throw new Error("empty page");
  const lines = new Map<number, Word[]>();
  const starts = new Map<number, number>();
  const ayahs: Ayah[] = [];
  for (const v of verses) {
    const [sn, vn] = String(v.verse_key).split(":").map(Number);
    const sur = surahs[sn - 1];
    const global = (cum[sn - 1] || 0) + vn;
    const words = ((v.words || []) as any[]).filter((w) => Number(w.page_number ?? p) === p);
    const text = words.filter((w) => w.char_type_name !== "end").map((w) => w.text_indopak || w.text_uthmani || w.text || "").join(" ");
    ayahs.push({ number: global, numberInSurah: vn, text, page: p, juz: v.juz_number, manzil: v.manzil_number, surah: sur ? { number: sur.number, englishName: sur.englishName, name: sur.name, numberOfAyahs: sur.numberOfAyahs, revelationType: sur.revelationType } : undefined });
    words.forEach((w, i) => {
      const ln = Number(w.line_number);
      if (!ln) return;
      const arr = lines.get(ln) || [];
      arr.push({ t: w.text_indopak || w.text_uthmani || w.text || "", end: w.char_type_name === "end", ayah: global, n: vn });
      lines.set(ln, arr);
      if (vn === 1 && i === 0 && !starts.has(ln)) starts.set(ln, sn);
    });
  }
  const max = Math.max(LINES, ...Array.from(lines.keys()));
  const slots: Slot[] = [];
  for (let i = 1; i <= max; i++) slots.push(lines.has(i) ? { k: "words", w: lines.get(i)!, start: starts.get(i) } : { k: "empty" });
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (s.k !== "words" || !s.start) continue;
    const need = s.start === 1 || s.start === 9 ? 1 : 2;
    const e1 = slots[i - 1]?.k === "empty", e2 = slots[i - 2]?.k === "empty";
    if (need === 2 && e1 && e2) { slots[i - 2] = { k: "banner", s: s.start }; slots[i - 1] = { k: "bism" }; }
    else if (need === 1 && e1) slots[i - 1] = { k: "banner", s: s.start };
    else if (e1) slots[i - 1] = { k: "banner", s: s.start };
    else { const add: Slot[] = need === 2 ? [{ k: "banner", s: s.start }, { k: "bism" }] : [{ k: "banner", s: s.start }]; slots.splice(i, 0, ...add); i += add.length; }
  }
  return { mode: "lines", slots, ayahs };
}

async function fetchFlowPage(p: number): Promise<PageData> {
  const a = await fetch(`https://api.alquran.cloud/v1/page/${p}/quran-uthmani`).then((r) => r.json());
  if (a.code !== 200) throw new Error("The Quran service is busy. Please try again.");
  return { mode: "flow", ayahs: a.data.ayahs };
}

function LinePage({ slots, surahs, selected, playing, onPick }: { slots: Slot[]; surahs: Surah[]; selected: number | null; playing: number | null; onPick: (n: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(20);
  const [ctr, setCtr] = useState<boolean[]>([]);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const el = box.current; if (!el || !w) return;
    el.classList.add("measuring"); el.style.setProperty("--mf-fs", "100px");
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".mf-words"));
    const nat = rows.map((r) => r.getBoundingClientRect().width + Math.max(0, r.children.length - 1) * 22);
    el.classList.remove("measuring");
    const max = Math.max(1, ...nat);
    setFs(Math.max(12, Math.min((100 * w) / max * 0.995, w * 0.074)));
    setCtr(nat.map((x) => x < max * 0.62));
  }, [slots, w]);
  const rows = Math.max(LINES, slots.length);
  const filled = slots.filter((s) => s.k !== "empty").length;
  let wi = -1;
  return <div ref={box} className={"mf-pagebox" + (filled <= 9 ? " short" : "")} style={{ ["--mf-fs" as string]: fs + "px", ["--mf-rows" as string]: filled <= 9 ? filled : rows } as React.CSSProperties}
    onClick={(e) => { const el = (e.target as HTMLElement).closest("[data-ayah]"); if (el) onPick(Number(el.getAttribute("data-ayah"))); }}>
    {slots.slice(0, filled <= 9 ? (() => { let l = slots.length; while (l > 0 && slots[l - 1].k === "empty") l--; return l; })() : slots.length).map((s, i) => {
      if (s.k === "empty") return <div key={i} className="mf-line" />;
      if (s.k === "banner") { const sur = surahs[s.s - 1]; return <div key={i} className="mf-line"><div className="mf-head"><span className="mf-side">آیاتھا<b>{toAr(sur?.numberOfAyahs ?? "")}</b></span><span className="mf-mid">{sur?.name} {sur?.revelationType === "Medinan" ? "مدنیہ" : "مکیہ"} ({toAr(s.s)})</span><span className="mf-side">سورۃ<b>{toAr(s.s)}</b></span></div></div>; }
      if (s.k === "bism") return <div key={i} className="mf-line"><div className="mf-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div></div>;
      wi++;
      const idx = wi;
      return <div key={i} className="mf-line"><div className={"mf-words" + (ctr[idx] ? " ctr" : "")}>
        {s.w.map((x, k) => x.end
          ? <span key={k} className={"end" + (selected === x.ayah ? " selected" : "") + (playing === x.ayah ? " playing" : "")} data-ayah={x.ayah}>{toAr(x.n)}</span>
          : <span key={k} className={"mw" + (selected === x.ayah ? " selected" : "") + (playing === x.ayah ? " playing" : "")} data-ayah={x.ayah}>{x.t}</span>)}
      </div></div>;
    })}
  </div>;
}

export function Quran({ settings }: { settings: Settings }) {
  const [pageL, setPageL] = useStored<number>("quran-ip16-page", 1);
  const [pageF, setPageF] = useStored<number>("quran-page", 1);
  const [, setFrac] = useStored<number>("quran-frac", 0);
  const [, setMode0] = useStored<string>("quran-mode", "");
  const [, setLastAyah] = useStored<number>("quran-last-ayah", 0);
  const [bookmarks, setBookmarks] = useStored<number[]>("quran-bookmarks", []);
  const [readingPages, setReadingPages] = useStored<Record<string, number[]>>("quran-reading-pages", {});
  const [mode, setMode] = useState<"lines" | "flow" | null>(null);
  const [data, setData] = useState<PageData | null>(null);
  const [trans, setTrans] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTr, setShowTr] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [picker, setPicker] = useState(false);
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [fx, setFx] = useState("");
  const [drag, setDrag] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const queue = useRef<Ayah[]>([]);
  const cache = useRef(new Map<string, PageData>());
  const trCache = useRef(new Map<string, Record<number, string>>());
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const busy = useRef(false);

  const total = mode === "lines" ? LINE_PAGES : FLOW_PAGES;
  const page = mode === "lines" ? pageL : pageF;
  const ayahs = data?.ayahs ?? [];

  const recordPageRead = useCallback(() => {
    const key = dateKey();
    setReadingPages((previous) => {
      const pages = previous[key] || [];
      return pages.includes(page) ? previous : { ...previous, [key]: [...pages, page] };
    });
  }, [page, setReadingPages]);

  const stop = useCallback(() => {
    queue.current = [];
    if (audio.current) { audio.current.pause(); audio.current.src = ""; }
    setPlaying(null);
  }, []);

  useEffect(() => { getSurahs().then(setSurahs).catch(() => {}); }, []);
  useEffect(() => () => stop(), [stop]);

  const getPage = useCallback(async (m: "lines" | "flow", p: number): Promise<PageData> => {
    const key = m + p;
    const hit = cache.current.get(key);
    if (hit) return hit;
    const list = m === "lines" ? await getSurahs() : [];
    const d = m === "lines" ? await fetchLinePage(p, list) : await fetchFlowPage(p);
    cache.current.set(key, d);
    return d;
  }, []);

  const show = useCallback(async (m: "lines" | "flow", p0: number) => {
    const max = m === "lines" ? LINE_PAGES : FLOW_PAGES;
    const p = Math.max(1, Math.min(max, p0));
    setError(""); setSelected(null);
    try {
      const d = await getPage(m, p);
      setData(d); setMode(m);
      if (m === "lines") setPageL(p); else setPageF(p);
      setFrac(p / max);
      void getPage(m, p + 1).catch(() => {}); void getPage(m, p - 1).catch(() => {});
    } catch (e: any) {
      setError(e?.message?.includes("Failed") ? "No internet connection. Pages you have opened before still load offline." : e?.message || "Could not load this page.");
    } finally { setLoading(false); }
  }, [getPage, setPageL, setPageF, setFrac]);

  useEffect(() => {
    let alive = true;
    (async () => {
      let m: "lines" | "flow" = "flow";
      try { await getPage("lines", pageL); m = "lines"; } catch { m = "flow"; }
      if (!alive) return;
      setMode0(m);
      await show(m, m === "lines" ? pageL : pageF);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line
  }, []);

  /* translations (loaded per surah, cached) */
  useEffect(() => {
    if (!showTr && selected === null) return;
    let alive = true;
    const nums = Array.from(new Set(ayahs.map((a) => a.surah?.number).filter(Boolean))) as number[];
    Promise.all(nums.map(async (n) => {
      const key = `${settings.translation}:${n}`;
      if (!trCache.current.has(key)) {
        const j = await fetch(`https://api.alquran.cloud/v1/surah/${n}/${settings.translation}`).then((r) => r.json());
        const m: Record<number, string> = {};
        (j.data?.ayahs || []).forEach((a: any) => { m[a.number] = a.text; });
        trCache.current.set(key, m);
      }
      return trCache.current.get(key)!;
    })).then((ms) => { if (alive) setTrans(Object.assign({}, ...ms)); }).catch(() => {});
    return () => { alive = false; };
  }, [ayahs, settings.translation, showTr, selected !== null]); // eslint-disable-line

  const turn = useCallback(async (n: number, dir?: "next" | "prev") => {
    if (!mode || busy.current) return;
    const max = total;
    if (n < 1 || n > max) return;
    busy.current = true; stop();
    if (dir) { setFx("out-" + dir); await sleep(170); }
    await show(mode, n);
    if (dir) { setFx("in-" + dir); await sleep(240); setFx(""); }
    window.scrollTo({ top: 0 });
    busy.current = false;
  }, [mode, total, show, stop]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") void turn(page + 1, "next");
      if (e.key === "ArrowRight") void turn(page - 1, "prev");
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [page, turn]);

  /* swipe: the page follows the finger, then turns */
  const onDown = (e: RPointerEvent) => { start.current = { x: e.clientX, y: e.clientY }; moved.current = false; };
  const onMove = (e: RPointerEvent) => {
    const s = start.current; if (!s || busy.current) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (drag === null && Math.abs(dx) < 10) return;
    if (drag === null && Math.abs(dy) > Math.abs(dx)) { start.current = null; return; }
    moved.current = true;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
    setDrag(dx);
  };
  const onUp = () => {
    const dx = drag; start.current = null; setDrag(null);
    if (dx === null) return;
    setTimeout(() => { moved.current = false; }, 0);
    if (dx > 80) void turn(page + 1, "next");
    else if (dx < -80) void turn(page - 1, "prev");
  };

  const playFrom = useCallback((list: Ayah[]) => {
    if (!list.length) { setPlaying(null); return; }
    const [cur, ...rest] = list;
    recordPageRead();
    queue.current = rest;
    setPlaying(cur.number);
    if (!audio.current) audio.current = new Audio();
    const a = audio.current;
    const urlFor = (rec: string) => `https://cdn.islamic.network/quran/audio/128/${rec}/${cur.number}.mp3`;
    let triedFallback = false;
    a.onended = () => playFrom(queue.current);
    a.onerror = () => {
      if (!triedFallback && settings.reciter !== "ar.alafasy") { triedFallback = true; a.src = urlFor("ar.alafasy"); a.play().catch(() => {}); }
      else { setPlaying(null); setError("Audio could not load. Check your internet connection."); }
    };
    a.src = urlFor(settings.reciter);
    a.play().catch(() => setPlaying(null));
  }, [settings.reciter, recordPageRead]);

  const toggleAyah = (ay: Ayah) => (playing === ay.number ? stop() : playFrom([ay]));
  const playPage = () => (playing ? stop() : playFrom(ayahs));
  const playFromHere = (ay: Ayah) => { const i = ayahs.findIndex((x) => x.number === ay.number); playFrom(ayahs.slice(i)); };
  const pick = (n: number) => { setSelected((cur) => (cur === n ? null : n)); setLastAyah(n); recordPageRead(); };

  const openSurah = async (n: number) => {
    setPicker(false); setQ(""); stop();
    try {
      if (mode === "lines") {
        const j = await fetch(`${API}/verses/by_key/${n}:1?mushaf=${MUSHAF}&words=true&word_fields=page_number`).then((r) => r.json());
        const p = Number(j.verse?.words?.[0]?.page_number || j.verse?.page_number);
        if (!p) throw new Error("no page");
        await turn(p);
      } else {
        const j = await fetch(`https://api.alquran.cloud/v1/ayah/${n}:1`).then((r) => r.json());
        await turn(j.data.page);
      }
    } catch { setError("Could not open that surah. Check your internet connection."); }
  };

  const strip = (ay: Ayah) => {
    if (ay.numberInSurah === 1 && ay.surah && ay.surah.number !== 1 && ay.surah.number !== 9) return ay.text.split(" ").slice(BASMALA_WORDS).join(" ");
    return ay.text;
  };

  const blocks: Block[] = [];
  if (data?.mode === "flow") ayahs.forEach((ay) => {
    if (ay.numberInSurah === 1 && ay.surah) blocks.push({ kind: "head", ay });
    const last = blocks[blocks.length - 1];
    if (last && last.kind === "para") last.items.push(ay); else blocks.push({ kind: "para", items: [ay] });
  });

  const saved = bookmarks.includes(page);
  const sel = ayahs.find((a) => a.number === selected) || null;
  const first = ayahs[0];
  const currentSurah = first?.surah;
  const filtered = surahs.filter((s) => `${s.englishName} ${s.name} ${s.number}`.toLowerCase().includes(q.toLowerCase()));
  const fxClass = fx + (drag !== null ? " dragging" : "");

  return (
    <div className="screen">
      <header className="quran-heading">
        <span className="kicker">THE NOBLE QURAN</span>
        <div className="quran-heading-row"><div><h2>Quran</h2><p className="muted">{mode === "lines" ? "16-line Indo-Pak mushaf · swipe to turn pages" : "Page-by-page mushaf · swipe to turn pages"}</p></div><span className="quran-seal">۞</span></div>
      </header>

      <KhatmPlanner />

      <div className="quran-controls">
        <button className="select" onClick={() => setPicker(!picker)}><small>SURAH</small><b>{currentSurah?.englishName || "Choose"} ⌄</b></button>
        <button className="select" onClick={() => setShowTr(!showTr)}><small>TRANSLATION</small><b>{showTr ? "Shown" : "Hidden"}</b></button>
      </div>

      {picker && (
        <div className="card">
          <input className="input" placeholder="Search surah name or number" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="surah-list">
            {filtered.map((s) => (
              <button key={s.number} className="surah-item" onClick={() => void openSurah(s.number)}>
                <span className="surah-n">{String(s.number).padStart(3, "0")}</span>
                <span className="grow"><b>{s.englishName}</b><small>{s.englishNameTranslation} · {s.numberOfAyahs} verses</small></span>
                <span className="ar surah-ar">{s.name}</span>
              </button>
            ))}
            {surahs.length === 0 && <p className="muted">Loading surah list…</p>}
          </div>
        </div>
      )}

      <div className="quran-actionbar">
        <button className={"btn quran-play " + (playing ? "danger" : "")} onClick={playPage} disabled={loading || !ayahs.length}>{playing ? "■ Stop recitation" : "▶ Play this page"}</button>
        <button className="chip" onClick={() => setBookmarks(saved ? bookmarks.filter((x) => x !== page) : [...bookmarks, page])}>{saved ? "★ Saved" : "☆ Save page"}</button>
      </div>

      <div className="quran-page-nav">
        <button className="chip" disabled={page <= 1} onClick={() => void turn(page - 1, "prev")}>‹ Previous</button>
        <b>Page {page} <span className="muted">/ {total}</span></b>
        <button className="chip" disabled={page >= total} onClick={() => void turn(page + 1, "next")}>Next ›</button>
      </div>

      <div className="mushaf">
        <div className="mushaf-inner">
          <div className="mushaf-topline"><span>{toAr(page)}</span><span>{currentSurah?.name || "القرآن الكريم"}</span><span>پارہ {toAr(first?.juz ?? "")}</span></div>
          <div className={"mf-swipe " + fxClass} style={drag !== null ? { transform: `translateX(${drag}px) rotate(${drag / 70}deg)` } : undefined}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {loading ? (
              <div className="center pad">Loading page…</div>
            ) : error ? (
              <div className="center pad"><p className="err">{error}</p><button className="btn" onClick={() => { setLoading(true); void show(mode ?? "flow", page); }}>Try again</button></div>
            ) : data?.mode === "lines" ? (
              <LinePage slots={data.slots} surahs={surahs} selected={selected} playing={playing} onPick={(n) => { if (!moved.current) pick(n); }} />
            ) : (
              <div className="ar mushaf-text" dir="rtl">
                {blocks.map((blk, bi) => blk.kind === "head" ? (
                  <div key={"h" + bi}>
                    <div className="mf-head">
                      <span className="mf-side">آیاتھا<b>{toAr(blk.ay.surah?.numberOfAyahs ?? "")}</b></span>
                      <span className="mf-mid">{blk.ay.surah?.name} {blk.ay.surah?.revelationType === "Medinan" ? "مدنیہ" : "مکیہ"} ({toAr(blk.ay.surah?.number ?? "")})</span>
                      <span className="mf-side">پارہ<b>{toAr(blk.ay.juz ?? "")}</b></span>
                    </div>
                    {blk.ay.surah && blk.ay.surah.number !== 1 && blk.ay.surah.number !== 9 && <div className="mf-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>}
                  </div>
                ) : (
                  <p className="mf-para" key={"p" + bi}>
                    {blk.items.map((ay) => (
                      <span key={ay.number}>
                        <span role="button" tabIndex={0} className={"mushaf-ayah" + (playing === ay.number ? " playing" : "") + (selected === ay.number ? " selected" : "")}
                          onClick={() => { if (!moved.current) pick(ay.number); }}
                          onKeyDown={(e) => { if (e.key === "Enter") pick(ay.number); }}
                          aria-label={`${ay.surah?.englishName || "Quran"}, ayah ${ay.numberInSurah}`}>{strip(ay)} <span className="end" aria-hidden="true">{toAr(ay.numberInSurah)}</span></span>{" "}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="mf-footer"><span>{toAr(page)}</span><span>منزل {toAr(first?.manzil ?? "")}</span></div>
        </div>
      </div>

      {sel && (
        <div className="ayah-sheet card">
          <div className="muted small">{sel.surah?.englishName} · Ayah {sel.numberInSurah}</div>
          <p className="trans">{trans[sel.number] || "Loading translation…"}</p>
          <div className="row gap-s wrap">
            <button className="chip on" onClick={() => toggleAyah(sel)}>{playing === sel.number ? "■ Stop" : "▶ Play ayah"}</button>
            <button className="chip" onClick={() => playFromHere(sel)}>▶ Play from here</button>
            <button className="chip" onClick={() => navigator.clipboard?.writeText(`${sel.text}\n${trans[sel.number] || ""}\n(${sel.surah?.englishName} ${sel.numberInSurah})`)}>Copy</button>
          </div>
        </div>
      )}

      {showTr && !loading && !error && (
        <div className="card">
          <h3>Translation</h3>
          {ayahs.map((ay) => <p key={ay.number} className="trans-row"><b>{ay.surah?.englishName} {ay.numberInSurah}.</b> {trans[ay.number]}</p>)}
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="card">
          <h3>Saved pages</h3>
          <div className="row wrap gap-s">{[...bookmarks].sort((a, b) => a - b).map((b) => <button key={b} className="chip" onClick={() => void turn(b)}>Page {b}</button>)}</div>
        </div>
      )}
    </div>
  );
}
