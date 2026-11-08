import { useEffect, useState } from "react";
import { usePlus } from "../services/plusStatus";
import { PRAYERS, dateKey, shareText } from "../lib";
import { toast } from "../lib";

const get = <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem("amanora:" + key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } };
const lastDays = (n: number) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return dateKey(d); });

type Report = { score: number; lines: { icon: string; title: string; text: string }[]; focus: string[] };

function analyse(): Report {
  const log = get<Record<string, string[]>>("prayer-log", {});
  const reading = get<Record<string, number[]>>("quran-reading-pages", {});
  const quranFrac = get<number>("quran-frac", 0);
  const quranMarks = get<number[]>("quran-bookmarks", []);
  const quizBest = get<number>("quiz-best", 0);
  const lessons = get<string[]>("saved-original-lessons", []);
  const hifz = get<unknown[]>("hifz-items", []);
  const academy = get<Record<string, string[]>>("academy-completed", {});
  const journal = get<string>("journal", "");
  const packing = get<string[]>("umrah-packing", []);
  const bayanFav = get<string[]>("bayan-favorites", []);

  const d30 = lastDays(30), d7 = lastDays(7);
  const perPrayer = PRAYERS.map((p) => ({ p, n: d30.filter((d) => (log[d] || []).includes(p)).length }));
  const prayed30 = perPrayer.reduce((a, x) => a + x.n, 0);
  const prayed7 = d7.reduce((a, d) => a + (log[d] || []).length, 0);
  const weakest = [...perPrayer].sort((a, b) => a.n - b.n)[0];
  const strongest = [...perPrayer].sort((a, b) => b.n - a.n)[0];
  const readDays7 = d7.filter((d) => (reading[d] || []).length > 0).length;
  const pages7 = d7.reduce((a, d) => a + (reading[d] || []).length, 0);
  const lessonCount = Object.values(academy).reduce((a, v) => a + v.length, 0);

  const prayerScore = Math.min(100, Math.round((prayed7 / 35) * 100));
  const quranScore = Math.min(100, Math.round((readDays7 / 7) * 100));
  const learnScore = Math.min(100, Math.round(((lessonCount + lessons.length + (quizBest > 0 ? 1 : 0)) / 8) * 100));
  const reflectScore = journal.trim().length > 20 ? 100 : journal.trim().length > 0 ? 50 : 0;
  const score = Math.round(prayerScore * 0.45 + quranScore * 0.3 + learnScore * 0.15 + reflectScore * 0.1);

  const lines = [
    { icon: "🕌", title: "Salah", text: prayed30 === 0 ? "No prayers logged in the last 30 days yet. Tick each prayer on Home to begin tracking." : `${prayed7}/35 prayers this week and ${prayed30}/150 over 30 days. Strongest: ${strongest.p} (${strongest.n} days). Needs attention: ${weakest.p} (${weakest.n} days).` },
    { icon: "📖", title: "Quran", text: `Opened the Quran on ${readDays7} of the last 7 days (${pages7} page${pages7 === 1 ? "" : "s"}). You have read about ${Math.round(quranFrac * 100)}% of the Quran with ${quranMarks.length} saved page${quranMarks.length === 1 ? "" : "s"}.` },
    { icon: "🎓", title: "Learning", text: `${lessonCount} academy lesson${lessonCount === 1 ? "" : "s"} done, ${lessons.length} saved reflection${lessons.length === 1 ? "" : "s"}, ${hifz.length} Hifz target${hifz.length === 1 ? "" : "s"}, quiz best ${quizBest}.` },
    { icon: "✍️", title: "Reflection", text: journal.trim() ? `Your journal has ${journal.trim().split(/\s+/).length} words.` : "Your journal is empty. A few lines of gratitude each day builds the habit." },
    { icon: "🎧", title: "Listening", text: `${bayanFav.length} saved Bayan${bayanFav.length === 1 ? "" : "s"}.` },
  ];
  if (packing.length) lines.push({ icon: "🕋", title: "Umrah preparation", text: `${packing.length}/10 packing items ready.` });

  const focus: string[] = [];
  if (prayed30 > 0 && weakest.n < strongest.n) focus.push(`Prepare early for ${weakest.p} this week; it is your least-logged prayer.`);
  if (prayed7 < 35) focus.push(`Aim for ${Math.min(35, prayed7 + 3)} prayers logged this week.`);
  if (readDays7 < 4) focus.push("Open the Quran for even one page on more days; consistency matters more than length.");
  if (reflectScore < 100) focus.push("Write three lines in your journal today.");
  if (lessonCount === 0) focus.push("Complete your first Academy lesson.");
  return { score, lines, focus: focus.slice(0, 4) };
}

export function AutoInsights() {
  const plus = usePlus();
  const [report, setReport] = useState<Report | null>(null);
  const [stamp, setStamp] = useState("");

  useEffect(() => {
    const run = () => { if (plus.active) { setReport(analyse()); setStamp(new Date().toLocaleString()); } else setReport(null); };
    run();
    const t = window.setInterval(() => { if (document.visibilityState === "visible") run(); }, 60000);
    document.addEventListener("visibilitychange", run);
    return () => { window.clearInterval(t); document.removeEventListener("visibilitychange", run); };
  }, [plus.active]);

  if (plus.loading) return null;
  if (!plus.active || !report) return <div className="card">
    <small className="gold">AMANORA PLUS · AUTO INSIGHTS</small>
    <h3>Your complete progress analysis</h3>
    <p className="muted small">With Plus, Amanora automatically analyses your prayers, Quran reading, learning and reflections across the whole app and builds your report here.</p>
  </div>;

  const text = `Amanora progress report (${stamp})\nOverall: ${report.score}/100\n` + report.lines.map((l) => `${l.title}: ${l.text}`).join("\n") + (report.focus.length ? "\nFocus:\n- " + report.focus.join("\n- ") : "");
  return <div className="card">
    <div className="row between"><div><small className="gold">AMANORA PLUS · AUTO INSIGHTS</small><h3>Your progress analysis</h3></div><span className="pill">{report.score}/100</span></div>
    <div className="progress"><div style={{ width: `${report.score}%` }} /></div>
    {report.lines.map((l) => <div key={l.title} style={{ margin: "12px 0" }}><b>{l.icon} {l.title}</b><p className="muted small" style={{ margin: "2px 0 0" }}>{l.text}</p></div>)}
    {report.focus.length > 0 && <div className="dua-translation"><b>This week's focus</b>{report.focus.map((f) => <p key={f} className="small" style={{ margin: "4px 0" }}>• {f}</p>)}</div>}
    <div className="row between" style={{ marginTop: 10 }}><small className="muted">Updated {stamp} · refreshes automatically</small><button className="chip" onClick={async () => { const r = await shareText("Amanora progress report", text); toast(r === "copied" ? "Report copied." : r === "shared" ? "Report shared." : "Not shared."); }}>Share report</button></div>
  </div>;
}
