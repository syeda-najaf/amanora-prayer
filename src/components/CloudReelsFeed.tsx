import { useEffect, useState } from "react";
import {
  fetchPublishedContent,
  sharedContentConfigured,
  type SharedContentItem,
} from "../services/sharedContent";

export function CloudReelsFeed() {
  const [items, setItems] = useState<SharedContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const all = await fetchPublishedContent(50);
        if (active) {
          setItems(all.filter((item) => item.content_type === "reel"));
          setError("");
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load published Reels.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!sharedContentConfigured) {
    return <section className="card"><h3>Published Amanora Reels</h3><p className="muted small">Cloud publishing is not configured yet.</p></section>;
  }

  return (
    <section className="cloud-reels-section">
      <div className="row between">
        <div><small className="gold">AMANORA · PUBLISHED MEDIA</small><h3>From the Amanora community</h3></div>
        <span className="pill">{items.length} published</span>
      </div>
      {loading && <p className="muted small">Loading published Reels…</p>}
      {error && <p className="err small">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div className="card"><p className="muted small">No published Reels yet. Upload a Reel in Owner Studio, submit it for review, approve it and publish it to make it appear here.</p></div>
      )}
      {items.map((item) => (
        <article className="card cloud-reel-card" key={item.id}>
          <div className="row between">
            <span className="pill">Reel</span>
            <small className="muted">{item.language.toUpperCase()}{item.presenter_type ? ` · ${item.presenter_type === "ai" ? "AI presenter" : "Human presenter"}` : ""}</small>
          </div>
          <h3>{item.title}</h3>
          {(item.body || item.body_ur || item.body_ar) && <p>{item.body || item.body_ur || item.body_ar}</p>}
          {item.media_url && item.media_kind === "image" && (
            <img className="cloud-reel-media" src={item.media_url} alt={item.title} loading="lazy" />
          )}
          {item.media_url && item.media_kind === "video" && (
            <video className="cloud-reel-media" src={item.media_url} controls playsInline preload="metadata" />
          )}
          {item.media_url && item.media_kind === "audio" && (
            <audio className="cloud-reel-audio" src={item.media_url} controls preload="none" />
          )}
          {item.media_kind && !item.media_url && (
            <p className="muted small">Media is attached, but its secure link could not be created. Check the Supabase Storage read policy.</p>
          )}
          {item.reference && <small className="muted">Reference: {item.reference}</small>}
          {item.source_name && <small className="muted">Source: {item.source_name}</small>}
        </article>
      ))}
    </section>
  );
}
