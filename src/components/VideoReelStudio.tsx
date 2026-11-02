import { useCallback, useEffect, useRef, useState } from "react";

type StoredClip = { id: string; name: string; caption: string; blob: Blob; createdAt: number };
type Clip = { id: string; name: string; caption: string; url: string; createdAt: number };
const DB_NAME = "amanora-media-v1";
const STORE = "reels";

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("This browser does not support local media storage."));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local media storage."));
  });
}

async function readClips(): Promise<StoredClip[]> {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => { db.close(); resolve((request.result as StoredClip[]).sort((a, b) => a.createdAt - b.createdAt)); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function writeClip(clip: StoredClip): Promise<void> {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(clip);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

async function deleteClip(id: string): Promise<void> {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

const readIds = (key: string): string[] => {
  try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
};

/** Local-first vertical video feed. Owner-uploaded clips persist in this browser using IndexedDB. */
export function VideoReelStudio() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [active, setActive] = useState(0);
  const [likes, setLikes] = useState<string[]>(() => readIds("amanora:reel-likes"));
  const [saved, setSaved] = useState<string[]>(() => readIds("amanora:reel-saved"));
  const [filter, setFilter] = useState<"For you" | "Saved">("For you");
  const [status, setStatus] = useState("Loading your saved videos…");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const feed = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const clipsRef = useRef<Clip[]>([]);
  clipsRef.current = clips;

  const hydrate = useCallback(async () => {
    try {
      const rows = await readClips();
      const next = rows.map(row => ({ id: row.id, name: row.name, caption: row.caption, createdAt: row.createdAt, url: URL.createObjectURL(row.blob) }));
      setClips(current => { current.forEach(c => URL.revokeObjectURL(c.url)); return next; });
      setStatus(next.length ? `${next.length} videos saved on this device` : "Your personal Reels shelf is ready. Add your first video.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load saved videos.");
    }
  }, []);

  useEffect(() => { void hydrate(); return () => clipsRef.current.forEach(c => URL.revokeObjectURL(c.url)); }, [hydrate]);
  useEffect(() => { localStorage.setItem("amanora:reel-likes", JSON.stringify(likes)); }, [likes]);
  useEffect(() => { localStorage.setItem("amanora:reel-saved", JSON.stringify(saved)); }, [saved]);

  const visibleClips = filter === "Saved" ? clips.filter(c => saved.includes(c.id)) : clips;

  useEffect(() => {
    const root = feed.current;
    if (!root || !visibleClips.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          setActive(Number(video.dataset.index || 0));
          video.muted = true;
          video.play().catch(() => { /* autoplay may be blocked until the user taps */ });
        } else video.pause();
      });
    }, { root, threshold: [0, 0.7, 1] });
    videoRefs.current.forEach(video => observer.observe(video));
    return () => observer.disconnect();
  }, [visibleClips]);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const valid = Array.from(files).filter(file => file.type.startsWith("video/"));
    if (!valid.length) { setStatus("Choose MP4, MOV or another browser-supported video file."); return; }
    const total = valid.reduce((sum, file) => sum + file.size, 0);
    if (total > 500 * 1024 * 1024) { setStatus("Please add up to 500 MB of videos at a time."); return; }
    setBusy(true); setStatus("Saving videos on this device…");
    try {
      for (const file of valid) {
        const id = `${file.name}-${file.lastModified}-${file.size}`;
        const caption = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        await writeClip({ id, name: file.name, caption, blob: file, createdAt: file.lastModified || Date.now() });
      }
      setFilter("For you");
      await hydrate();
      setStatus(`${valid.length} video${valid.length === 1 ? "" : "s"} saved. They will remain here after refresh on this device.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Storage is full or unavailable. Try fewer or smaller videos.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async (clip: Clip) => {
    try {
      await deleteClip(clip.id);
      URL.revokeObjectURL(clip.url);
      setClips(current => current.filter(item => item.id !== clip.id));
      setLikes(current => current.filter(id => id !== clip.id));
      setSaved(current => current.filter(id => id !== clip.id));
      setStatus("Video removed from this device.");
    } catch { setStatus("Could not remove this video. Please try again."); }
  };

  const toggleLike = (id: string) => setLikes(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  const toggleSave = (id: string) => setSaved(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);

  return <section className="reels-experience" aria-label="Amanora vertical Reels feed">
    <header className="reels-experience-head">
      <div><span className="kicker">AMANORA SHORTS</span><h2>Daily Reels</h2><p>Swipe through reminders and talks without leaving Amanora.</p></div>
      <button className="btn" type="button" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Saving…" : "＋ Add Reels"}</button>
      <input ref={input} type="file" accept="video/*" multiple hidden onChange={event => void addFiles(event.target.files)} />
    </header>
    <div className="reels-controls"><div className="row gap-s"><button className={`chip ${filter === "For you" ? "on" : ""}`} onClick={() => { setFilter("For you"); setActive(0); }}>For you · {clips.length}</button><button className={`chip ${filter === "Saved" ? "on" : ""}`} onClick={() => { setFilter("Saved"); setActive(0); }}>♥ Saved · {saved.filter(id => clips.some(c => c.id === id)).length}</button></div><span className="tiny-note">{status}</span></div>
    {visibleClips.length === 0 ? <div className="reels-empty">
      <div className="reels-empty-icon">▶</div><h3>{filter === "Saved" ? "No saved Reels yet" : "Your Reels shelf is ready"}</h3>
      <p>{filter === "Saved" ? "Tap the save icon on a video to keep it in your personal collection." : "Add original, licensed or owner-approved vertical videos. Your uploads are stored privately in this browser, not published to other users."}</p>
      {filter === "For you" && <button className="btn" disabled={busy} onClick={() => input.current?.click()}>Choose video files</button>}
      <small>No copied YouTube videos, fake human footage or unlicensed speaker recordings are bundled with this project.</small>
    </div> : <>
      <div className="reels-feed-topline"><span>{visibleClips.length} {filter === "Saved" ? "saved" : "personal"} videos</span><span>Swipe up · {Math.min(active + 1, visibleClips.length)}/{visibleClips.length}</span></div>
      <div className="reels-feed" ref={feed}>
        {visibleClips.map((clip, index) => <article className="reel-slide" key={clip.id}>
          <video ref={node => { if (node) videoRefs.current.set(clip.id, node); else videoRefs.current.delete(clip.id); }} data-index={index} src={clip.url} controls playsInline preload="metadata" onError={() => setStatus(`Could not play ${clip.name}. Try an MP4 (H.264) video.`)} />
          <div className="reel-shade" />
          <div className="reel-caption"><span className="reel-brand">AMANORA · DAILY REMINDER</span><h3>{clip.caption}</h3><p>{clip.name}</p><div className="row gap-s wrap"><button className="chip" onClick={() => toggleLike(clip.id)}>{likes.includes(clip.id) ? "♥ Liked" : "♡ Like"}</button><button className="chip" onClick={() => toggleSave(clip.id)}>{saved.includes(clip.id) ? "★ Saved" : "☆ Save"}</button><button className="chip" onClick={() => void remove(clip)}>Remove</button><span className="reel-counter">{index + 1}/{visibleClips.length}</span></div></div>
        </article>)}
      </div>
      <div className="reels-feed-tools"><button className="chip" disabled={busy} onClick={() => input.current?.click()}>＋ Add more videos</button><span className="muted tiny">Videos auto-pause when you swipe away. Tap sound to unmute.</span></div>
    </>}
    <p className="reels-privacy-note">Privacy: videos, likes and saved items stay in this browser on this device. They are not uploaded, shared or visible to other Amanora users. A shared public feed requires a secure media backend and moderation.</p>
  </section>;
}
