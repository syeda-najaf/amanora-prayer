import { useEffect, useState } from 'react';
import { fetchPublishedContent, sharedContentConfigured, type SharedContentItem } from '../services/sharedContent';

const labels: Record<string, string> = { hadith: 'Hadith', dua: 'Dua', story: 'Story', quiz: 'Quiz', bayan: 'Bayan', reel: 'Reel', reflection: 'Reflection' };

export function DailyContentFeed() {
  const [items, setItems] = useState<SharedContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const next = await fetchPublishedContent(30);
        if (active) { setItems(next); setError(''); }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load shared content.');
      } finally { if (active) setLoading(false); }
    };
    load();
    const timer = window.setInterval(load, 5 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return <section className="card" aria-live="polite">
    <div className="row between"><div><small className="gold">AMANORA · DAILY FROM THE CLOUD</small><h3>Fresh for the Ummah</h3></div><span className="chip">{sharedContentConfigured ? 'Cloud feed' : 'Setup needed'}</span></div>
    {!sharedContentConfigured ? <p className="muted small">Connect the Supabase project using the setup guide to receive approved, shared daily content on every device. Your existing app content remains available.</p> : loading ? <p className="muted small">Checking today's published content…</p> : error ? <p className="err small">{error}</p> : items.length === 0 ? <p className="muted small">No cloud items have been published yet. Add and approve content in the owner workflow, then schedule its publication.</p> : <div className="daily-cloud-list">{items.map(item => <article key={item.id} className="daily-cloud-item">
      <div className="row between"><small className="gold">{labels[item.content_type] ?? item.content_type}{item.presenter_type ? ` · ${item.presenter_type === 'ai' ? 'AI presenter' : 'Human recording'}` : ''}</small><small className="muted">{item.language.toUpperCase()}</small></div>
      <b>{item.title}</b>
      {(item.body || item.body_ur || item.body_ar) && <p className="small">{item.body || item.body_ur || item.body_ar}</p>}
      {item.reference && <small className="muted">Reference: {item.reference}</small>}
      {item.source_name && <small className="muted">Source: {item.source_name}</small>}
      {item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer">View source</a>}
      {item.media_url && item.media_kind === 'image' && <img className="cloud-reel-media" src={item.media_url} alt={item.title} loading="lazy" />}
      {item.media_url && item.media_kind === 'audio' && <audio controls preload="none" src={item.media_url} />}
      {item.media_url && item.media_kind === 'video' && <video controls playsInline preload="metadata" src={item.media_url} />}
    </article>)}</div>}
    <small className="muted">Cloud feed refreshes every five minutes. Only content approved and published by an administrator is shown.</small>
  </section>;
}
