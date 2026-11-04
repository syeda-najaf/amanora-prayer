import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as RTouchEvent } from "react";
import type { Ayah, Surah, Settings } from "../types";
import { dateKey, getSurahs, useStored } from "../lib";

const BASMALA_WORDS = 4;

export function Quran({ settings }: { settings: Settings }) {
  const [page, setPage] = useStored<number>("quran-page", 1);
  const [, setLastAyah] = useStored<number>("quran-last-ayah", 0);
  const [bookmarks, setBookmarks] = useStored<number[]>("quran-bookmarks", []);
  const [readingPages, setReadingPages] = useStored<Record<string, number[]>>("quran-reading-pages", {});
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [trans, setTrans] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTr, setShowTr] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [picker, setPicker] = useState(false);
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const queue = useRef<Ayah[]>([]);
  const touchX = useRef<number | null>(null);

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

  const load = useCallback(async (n: number) => {
    const p = Math.max(1, Math.min(604, n));
    setLoading(true); setError(""); setSelected(null);
    try {
      const [a, t] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/page/${p}/quran-uthmani`).then((r) => r.json()),
        fetch(`https://api.alquran.cloud/v1/page/${p}/${settings.translation}`).then((r) => r.json()),
      ]);
      if (a.code !== 200 || t.code !== 200) throw new Error("The Quran service is busy. Please try again.");
      const map: Record<number, string> = {};
      (t.data.ayahs as any[]).forEach((v) => (map[v.number] = v.text));
      setAyahs(a.data.ayahs);
      setTrans(map);
      setPage(p);
    } catch (e: any) {
      setError(e?.message?.includes("Failed") ? "No internet connection. Pages you have opened before still load offline." : e?.message || "Could not load this page.");
    } finally { setLoading(false); }
  }, [settings.translation, setPage]);

  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [settings.translation]);

  const turn = (n: number) => { stop(); load(n); window.scrollTo({ top: 0 }); };

  // Arabic books turn right-to-left: swipe right = next page
  const onTouchEnd = (e: RTouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (dx > 70) turn(page + 1);
    else if (dx < -70) turn(page - 1);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") turn(page + 1);
      if (e.key === "ArrowRight") turn(page - 1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line
  }, [page]);

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
  }, [settings.reciter, page, recordPageRead]);

  const toggleAyah = (ay: Ayah) => (playing === ay.number ? stop() : playFrom([ay]));
  const playPage = () => (playing ? stop() : playFrom(ayahs));
  const playFromHere = (ay: Ayah) => { const i = ayahs.findIndex((x) => x.number === ay.number); playFrom(ayahs.slice(i)); };

  const openSurah = async (n: number) => {
    setPicker(false); setQ(""); stop();
    try {
      const j = await fetch(`https://api.alquran.cloud/v1/ayah/${n}:1`).then((r) => r.json());
      load(j.data.page);
    } catch { setError("Could not open that surah. Check your internet connection."); }
  };

  const strip = (ay: Ayah) => {
    // The first ayah of each surah arrives with the Bismillah attached. Show it once, as a heading.
    if (ay.numberInSurah === 1 && ay.surah && ay.surah.number !== 1 && ay.surah.number !== 9) {
      return ay.text.split(" ").slice(BASMALA_WORDS).join(" ");
    }
    return ay.text;
  };

  const saved = bookmarks.includes(page);
  const sel = ayahs.find((a) => a.number === selected) || null;
  const currentSurah = ayahs[0]?.surah;
  const filtered = surahs.filter((s) => `${s.englishName} ${s.name} ${s.number}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="screen">
      <header className="quran-heading">
        <span className="kicker">THE NOBLE QURAN</span>
        <div className="quran-heading-row"><div><h2>Quran</h2><p className="muted">A calm, page-by-page Mushaf experience</p></div><span className="quran-seal">۞</span></div>
      </header>

      <p className="muted small">Reading activity today: {(readingPages[dateKey()] || []).length} page(s) opened through ayah interaction or recitation.</p>

      <div className="quran-controls">
        <button className="select" onClick={() => setPicker(!picker)}>
          <small>SURAH</small>
          <b>{currentSurah?.englishName || "Choose"} ⌄</b>
        </button>
        <button className="select" onClick={() => setShowTr(!showTr)}>
          <small>TRANSLATION</small>
          <b>{showTr ? "Shown" : "Hidden"}</b>
        </button>
      </div>

      {picker && (
        <div className="card">
          <input className="input" placeholder="Search surah name or number" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="surah-list">
            {filtered.map((s) => (
              <button key={s.number} className="surah-item" onClick={() => openSurah(s.number)}>
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
        <button className={"btn quran-play " + (playing ? "danger" : "")} onClick={playPage} disabled={loading || !ayahs.length}>
          {playing ? "■ Stop recitation" : "▶ Play this page"}
        </button>
        <button className="chip" onClick={() => { const n = saved ? bookmarks.filter((x) => x !== page) : [...bookmarks, page]; setBookmarks(n); }}>{saved ? "★ Saved" : "☆ Save page"}</button>
      </div>

      <div className="quran-page-nav">
        <button className="chip" disabled={page <= 1} onClick={() => turn(page - 1)}>‹ Previous</button>
        <b>Page {page} <span className="muted">/ 604</span></b>
        <button className="chip" disabled={page >= 604} onClick={() => turn(page + 1)}>Next ›</button>
      </div>

      <div className="mushaf" onTouchStart={(e) => (touchX.current = e.touches[0].clientX)} onTouchEnd={onTouchEnd}>
        <div className="ribbon" />
        <div className="mushaf-inner">
          <div className="mushaf-topline"><span>{currentSurah?.englishName || "Al-Quran"}</span><span>الْقُرْآنُ الْكَرِيمُ</span><span>{page} / ٦٠٤</span></div>
          {loading ? (
            <div className="center pad">Loading page…</div>
          ) : error ? (
            <div className="center pad">
              <p className="err">{error}</p>
              <button className="btn" onClick={() => load(page)}>Try again</button>
            </div>
          ) : (
            <div className="ar mushaf-text" dir="rtl">
              {ayahs.map((ay) => (
                <div className="mushaf-ayah-group" key={ay.number}>
                  {ay.numberInSurah === 1 && ay.surah && (
                    <div className="surah-banner">
                      <span>۞ {ay.surah.name} ۞</span>
                      {ay.surah.number !== 1 && ay.surah.number !== 9 && <span className="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>}
                    </div>
                  )}
                  <button
                    type="button"
                    className={"mushaf-ayah" + (playing === ay.number ? " playing" : "") + (selected === ay.number ? " selected" : "")}
                    onClick={() => { setSelected(selected === ay.number ? null : ay.number); setLastAyah(ay.number); recordPageRead(); }}
                    aria-label={`${ay.surah?.englishName || "Quran"}, ayah ${ay.numberInSurah}`}
                  >
                    <span className="mushaf-ayah-text">{strip(ay)}</span>
                    <span className="end" aria-hidden="true">۞{ay.numberInSurah}۞</span>
                  </button>
                  <div className="ayah-rule" aria-hidden="true"><span>◇</span></div>
                </div>
              ))}
            </div>
          )}
          <div className="mushaf-bottomline"><span>۞</span><span>{currentSurah?.name || "القرآن الكريم"}</span><span>۞</span></div>
          <div className="page-no">{page}</div>
        </div>
      </div>

      {sel && (
        <div className="ayah-sheet card">
          <div className="muted small">{sel.surah?.englishName} · Ayah {sel.numberInSurah}</div>
          <p className="trans">{trans[sel.number]}</p>
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
          {ayahs.map((ay) => (
            <p key={ay.number} className="trans-row"><b>{ay.surah?.englishName} {ay.numberInSurah}.</b> {trans[ay.number]}</p>
          ))}
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="card">
          <h3>Saved pages</h3>
          <div className="row wrap gap-s">
            {[...bookmarks].sort((a, b) => a - b).map((b) => (
              <button key={b} className="chip" onClick={() => turn(b)}>Page {b}</button>
            ))}
          </div>
        </div>
      )}
      <p className="note quran-note">Quran text and recitation are loaded from AlQuran Cloud and Islamic Network. Swipe right for the next page, or use the page controls.</p>
    </div>
  );
}
