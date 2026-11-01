import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { STORIES, Story } from "../data/content";
import type { MyLink } from "../types";
import { dayOfYear, shareText, speak, stopSpeak, useStored, youtubeId } from "../lib";

function StoryReel({ story, active, isToday }: { story: Story; active: boolean; isToday: boolean }) {
  const [step, setStep] = useState(0);
  const [talking, setTalking] = useState(false);
  const [liked, setLiked] = useStored<boolean>("like-" + story.id, false);

  useEffect(() => {
    setStep(0);
    if (!active) { setTalking(false); return; }
    const t = setInterval(() => setStep((v) => (v < story.steps.length - 1 ? v + 1 : v)), 2400);
    return () => clearInterval(t);
  }, [active, story.steps.length]);

  useEffect(() => { if (!active) { stopSpeak(); setTalking(false); } }, [active]);

  const emoji = story.emoji[Math.min(step, story.emoji.length - 1)];
  const toggleVoice = () => {
    if (talking) { stopSpeak(); setTalking(false); return; }
    setTalking(true);
    speak(story.narration, "en-US", () => setTalking(false));
  };
  const share = () => shareText(story.title, `${story.lesson} (${story.reference})`);

  return (
    <section className="reel" data-active={active}>
      <div className="reel-top">
        <span className="reel-tag">{isToday ? "NEW TODAY · " : ""}{story.tag}</span>
      </div>

      <div className="board">
        <div className="board-emoji" key={step}>{emoji}</div>
        <h3>{story.title}</h3>
        <ol className="board-steps">
          {story.steps.slice(0, step + 1).map((line, i) => (
            <li key={i} className={i === step ? "now" : ""}>{line}</li>
          ))}
        </ol>
      </div>

      <div className="rail">
        <button onClick={() => setLiked(!liked)}><span>{liked ? "❤️" : "🤍"}</span><small>Like</small></button>
        <button onClick={share}><span>↗️</span><small>Share</small></button>
      </div>

      <div className="reel-bottom">
        <small className="gold">DAILY GOOD THING</small>
        <p className="reel-lesson">{story.lesson}</p>
        <small className="soft">{story.reference}</small>
        <button className="btn gold-btn wide" onClick={toggleVoice}>{talking ? "■ Stop story" : "▶ Listen to story"}</button>
      </div>
    </section>
  );
}

function LinkReel({ item, active, onRemove }: { item: MyLink; active: boolean; onRemove: () => void }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const yt = youtubeId(item.url);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => {}); else v.pause();
  }, [active]);
  return (
    <section className="reel" data-active={active}>
      <div className="reel-top">
        <span className="reel-tag">MY VIDEO</span>
        <button className="chip" onClick={onRemove}>Remove</button>
      </div>
      <div className="video-box">
        {yt ? (
          active ? <iframe title={item.title} src={`https://www.youtube-nocookie.com/embed/${yt}?playsinline=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                 : <div className="center muted">Scroll here to play</div>
        ) : (
          <video ref={ref} src={item.url} controls loop playsInline muted />
        )}
      </div>
      <div className="reel-bottom">
        <p className="reel-lesson">{item.title}</p>
      </div>
    </section>
  );
}

export function Reels() {
  const [links, setLinks] = useStored<MyLink[]>("my-reels", []);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [idx, setIdx] = useState(0);
  const feed = useRef<HTMLDivElement | null>(null);

  const stories = useMemo(() => {
    const k = dayOfYear() % STORIES.length;
    return [...STORIES.slice(k), ...STORIES.slice(0, k)];
  }, []);

  // Which reel is on screen?
  useEffect(() => {
    const root = feed.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting && e.intersectionRatio > 0.6) setIdx(Number((e.target as HTMLElement).dataset.i)); }),
      { root, threshold: 0.6 }
    );
    root.querySelectorAll("[data-i]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [links.length]);

  useEffect(() => () => stopSpeak(), []);

  const add = () => {
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) { setErr("Paste a full link that starts with https://"); return; }
    setLinks([{ id: "v" + Date.now(), title: title.trim() || "My video", url: u }, ...links]);
    setTitle(""); setUrl(""); setErr(""); setAdding(false);
  };

  const items: { key: string; node: (active: boolean) => ReactElement }[] = [
    ...links.map((l) => ({ key: l.id, node: (a: boolean) => <LinkReel item={l} active={a} onRemove={() => setLinks(links.filter((x) => x.id !== l.id))} /> })),
    ...stories.map((s, i) => ({ key: "s" + s.id, node: (a: boolean) => <StoryReel story={s} active={a} isToday={i === 0} /> })),
  ];

  return (
    <div className="reels-screen">
      <div className="reels-head">
        <div>
          <b>DEEN REELS</b>
          <small>A new story every day · swipe up ↑</small>
        </div>
        <button className="chip on" onClick={() => setAdding(!adding)}>＋ Add video</button>
      </div>

      {adding && (
        <div className="reels-add">
          <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="input" placeholder="YouTube link or direct .mp4 link" value={url} onChange={(e) => setUrl(e.target.value)} autoCapitalize="none" />
          {err && <p className="err">{err}</p>}
          <button className="btn wide" onClick={add}>Add to my reels</button>
          <small className="soft">Only add videos you have the right to use. They are saved on this device.</small>
        </div>
      )}

      <div className="reels-feed" ref={feed}>
        {items.map((it, i) => (
          <div key={it.key} data-i={i} className="reel-slot">{it.node(i === idx)}</div>
        ))}
      </div>
    </div>
  );
}
