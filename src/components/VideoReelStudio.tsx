import { useEffect, useRef, useState } from "react";

type Clip = { id: string; name: string; caption: string; url: string; poster?: string; createdAt: number; sourceType?: "human" | "ai" };
type FeedItem = { id: string; title?: string; caption?: string; videoUrl: string; sourceType?: "human" | "ai"; approved: boolean; published?: boolean; publishedAt?: string };
const PUBLIC_FEED_URL = import.meta.env.VITE_AMANORA_REELS_FEED_URL as string | undefined;

const BUNDLED: Clip[] = [
  { id: "bundled-salah", name: "Salah", caption: "Make Salah the anchor of your day", url: "/reels/salah.mp4", poster: "/reels/salah-poster.jpg", createdAt: 3, sourceType: "ai" },
  { id: "bundled-family", name: "Family", caption: "Kindness begins at home", url: "/reels/family.mp4", poster: "/reels/family-poster.jpg", createdAt: 2, sourceType: "ai" },
  { id: "bundled-neighbor", name: "Neighbour", caption: "Be a good neighbour today", url: "/reels/neighbor.mp4", poster: "/reels/neighbor-poster.jpg", createdAt: 1, sourceType: "ai" },
];

const readIds = (key: string): string[] => {
  try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
};

/** Live vertical video feed: bundled Amanora reels plus approved reels from the public feed. Plays entirely inside the app. */
export function VideoReelStudio() {
  const [remoteClips, setRemoteClips] = useState<Clip[]>([]);
  const [feedStatus, setFeedStatus] = useState(PUBLIC_FEED_URL ? "Connecting to the live Amanora feed…" : "");
  const [active, setActive] = useState(0);
  const [likes, setLikes] = useState<string[]>(() => readIds("amanora:reel-likes"));
  const [saved, setSaved] = useState<string[]>(() => readIds("amanora:reel-saved"));
  const [filter, setFilter] = useState<"For you" | "Saved">("For you");
  const feed = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => { localStorage.setItem("amanora:reel-likes", JSON.stringify(likes)); }, [likes]);
  useEffect(() => { localStorage.setItem("amanora:reel-saved", JSON.stringify(saved)); }, [saved]);

  useEffect(() => {
    if (!PUBLIC_FEED_URL) return;
    let alive = true;
    const loadPublicFeed = async () => {
      try {
        const response = await fetch(PUBLIC_FEED_URL, { headers: { Accept: "application/json" }, cache: "no-store" });
        if (!response.ok) throw new Error(`Feed returned ${response.status}`);
        const payload = await response.json() as FeedItem[] | { items?: FeedItem[] };
        const items = Array.isArray(payload) ? payload : (payload.items || []);
        const approved = items.filter(item => item && item.approved === true && item.published !== false && typeof item.videoUrl === "string" && /^https?:\/\//i.test(item.videoUrl));
        if (!alive) return;
        setRemoteClips(approved.map(item => ({ id: `public-${item.id}`, name: item.title || "Amanora daily reel", caption: item.caption || item.title || "Daily reminder", url: item.videoUrl, createdAt: item.publishedAt ? Date.parse(item.publishedAt) || Date.now() : Date.now(), sourceType: item.sourceType === "ai" ? "ai" : "human" })));
        setFeedStatus("Live · refreshes every 5 minutes");
      } catch {
        if (alive) setFeedStatus("Live feed unavailable right now.");
      }
    };
    void loadPublicFeed();
    const timer = window.setInterval(() => void loadPublicFeed(), 5 * 60 * 1000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const allClips = [...remoteClips, ...BUNDLED].sort((a, b) => b.createdAt - a.createdAt);
  const visibleClips = filter === "Saved" ? allClips.filter(c => saved.includes(c.id)) : allClips;

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
  }, [visibleClips.length, filter]);

  const toggleLike = (id: string) => setLikes(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  const toggleSave = (id: string) => setSaved(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);

  return <section className="reels-experience" aria-label="Amanora vertical Reels feed">
    <header className="reels-experience-head">
      <div><span className="kicker">AMANORA SHORTS</span><h2>Daily Reels</h2><p>Swipe through reminders without leaving Amanora.</p></div>
    </header>
    <div className="reels-controls"><div className="row gap-s"><button className={`chip ${filter === "For you" ? "on" : ""}`} onClick={() => { setFilter("For you"); setActive(0); }}>For you · {allClips.length}</button><button className={`chip ${filter === "Saved" ? "on" : ""}`} onClick={() => { setFilter("Saved"); setActive(0); }}>♥ Saved · {saved.filter(id => allClips.some(c => c.id === id)).length}</button></div>{feedStatus && <span className="tiny-note">{feedStatus}</span>}</div>
    {visibleClips.length === 0 ? <div className="reels-empty">
      <div className="reels-empty-icon">▶</div><h3>No saved Reels yet</h3><p>Tap the save icon on a video to keep it in your collection.</p>
    </div> : <>
      <div className="reels-feed-topline"><span>{visibleClips.length} {filter === "Saved" ? "saved" : "live"} videos</span><span>Swipe up · {Math.min(active + 1, visibleClips.length)}/{visibleClips.length}</span></div>
      <div className="reels-feed" ref={feed}>
        {visibleClips.map((clip, index) => <article className="reel-slide" key={clip.id}>
          <video ref={node => { if (node) videoRefs.current.set(clip.id, node); else videoRefs.current.delete(clip.id); }} data-index={index} src={clip.url} poster={clip.poster} controls playsInline preload="metadata" />
          <div className="reel-shade" />
          <div className="reel-caption"><span className="reel-brand">AMANORA · DAILY REMINDER</span><h3>{clip.caption}</h3><p>{clip.sourceType === "ai" ? "AI presenter" : "Human recording"}</p><div className="row gap-s wrap"><button className="chip" onClick={() => toggleLike(clip.id)}>{likes.includes(clip.id) ? "♥ Liked" : "♡ Like"}</button><button className="chip" onClick={() => toggleSave(clip.id)}>{saved.includes(clip.id) ? "★ Saved" : "☆ Save"}</button><span className="reel-counter">{index + 1}/{visibleClips.length}</span></div></div>
        </article>)}
      </div>
    </>}
  </section>;
}
