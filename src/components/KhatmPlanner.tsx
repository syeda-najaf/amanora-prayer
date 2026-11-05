import { useStored } from "../lib";

const TOTAL = 604;
const CHOICES = [7, 15, 30, 60, 90];
type Plan = { days: number; start: string } | null;

export function KhatmPlanner() {
  const [plan, setPlan] = useStored<Plan>("khatm-plan", null);
  let frac = 0;
  try { frac = Number(JSON.parse(localStorage.getItem("amanora:quran-frac") || "0")) || 0; } catch { frac = 0; }
  const read = Math.round(frac * TOTAL);

  if (!plan) return <div className="card">
    <small className="gold">KHATM PLANNER</small>
    <h3>Complete the Quran</h3>
    <p className="muted small">Choose how many days you want to take. Amanora tracks your daily target from your reading.</p>
    <div className="row gap-s wrap">{CHOICES.map((d) => <button key={d} className="chip" onClick={() => setPlan({ days: d, start: new Date().toISOString() })}>{d} days</button>)}</div>
  </div>;

  const elapsed = Math.floor((Date.now() - new Date(plan.start).getTime()) / 86400000);
  const day = Math.min(plan.days, elapsed + 1);
  const targetPages = Math.round((day / plan.days) * TOTAL);
  const behind = Math.max(0, targetPages - read);
  const perDay = Math.ceil(TOTAL / plan.days);
  const finished = read >= TOTAL - 2;
  return <div className="card">
    <div className="row between"><div><small className="gold">KHATM PLANNER</small><h3>{finished ? "Khatm complete, Masha'Allah" : `Day ${day} of ${plan.days}`}</h3></div><span className="pill">{Math.round(frac * 100)}%</span></div>
    <div className="progress"><div style={{ width: `${Math.min(100, frac * 100)}%` }} /></div>
    <p className="small" style={{ marginTop: 8 }}>{finished ? "You have reached the end of the Quran." : behind === 0 ? `You are on track. About ${perDay} pages a day keeps you there.` : `Read about ${behind} more page${behind === 1 ? "" : "s"} to reach today's target (${perDay} pages a day).`}</p>
    <button className="chip" onClick={() => setPlan(null)}>Change plan</button>
  </div>;
}
