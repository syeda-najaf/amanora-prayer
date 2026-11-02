import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type PrayerLog = Record<string, string[]>;
type Props = { log: PrayerLog; oled: boolean; onOledChange: (value: boolean) => void; homeWidgets: string[]; onHomeWidgetsChange: (value: string[]) => void; onOpenPayment: (plan: "monthly" | "yearly") => void; onOpenListen: () => void; onOpenBayan: () => void };

const TRACKS = [
  { id: "quran", icon: "📖", title: "Quran Foundations", level: "Beginner · 4 lessons", detail: "Explore how the Quran is organised, learn respectful reading habits and build a steady reading routine.", lessons: ["How the Quran is organised", "Surah and ayah: finding your place", "Building a gentle reading routine", "Reflection and revision"] },
  { id: "arabic", icon: "🔤", title: "Arabic Starter Path", level: "Beginner · 5 lessons", detail: "Start recognising Arabic letters and common Quranic words at a comfortable pace.", lessons: ["Arabic letters and sounds", "Short vowels", "Joining letters", "Common Quranic words", "Revision practice"] },
  { id: "seerah", icon: "🌿", title: "Seerah Learning Path", level: "Guided study · 4 lessons", detail: "A structured introduction to the life of Prophet Muhammad ﷺ using reviewed learning material.", lessons: ["Makkah before the message", "The first revelation", "The early Muslim community", "Lessons in character"] },
  { id: "hadith", icon: "📜", title: "Hadith Reflection Path", level: "Beginner · 5 lessons", detail: "Learn how to read a hadith with its collection, narrator, context and practical lesson. Always consult the original source.", lessons: ["What is a hadith?", "Understanding collections and references", "Narrator and chain basics", "Context before conclusions", "Turning a lesson into action"] },
  { id: "worship", icon: "🤲", title: "Daily Worship & Dua Path", level: "Everyday practice · 5 lessons", detail: "Build a gentle routine around authentic supplications, remembrance and reflection.", lessons: ["Morning remembrance", "Evening remembrance", "Duas from the Quran", "Gratitude and istighfar", "A personal worship routine"] },
];
const WEEKLY_CHALLENGE = [
  {id:"quran",day:"Day 1",title:"A few ayat with meaning",detail:"Read a short passage and reflect on one lesson."},
  {id:"dua",day:"Day 2",title:"Learn one authentic dua",detail:"Read its Arabic, translation and source."},
  {id:"kindness",day:"Day 3",title:"One quiet act of kindness",detail:"Help someone without expecting recognition."},
  {id:"seerah",day:"Day 4",title:"A moment from the Seerah",detail:"Study one event and note a character lesson."},
  {id:"dhikr",day:"Day 5",title:"Pause for dhikr",detail:"Set aside a calm moment for remembrance."},
  {id:"family",day:"Day 6",title:"Make family time meaningful",detail:"Call, help or make dua for someone close."},
  {id:"reflect",day:"Day 7",title:"Review and renew your intention",detail:"Write one thing you learned and one next step."},
];
const QUIZ = [
  { q: "How many surahs are in the Quran?", choices: ["99", "114", "120"], answer: 1, note: "The Quran contains 114 surahs." },
  { q: "Which surah opens the Quran?", choices: ["Al-Fatihah", "Al-Baqarah", "Al-Ikhlas"], answer: 0, note: "Al-Fatihah is the opening surah." },
  { q: "Which month is associated with fasting in Islam?", choices: ["Shawwal", "Ramadan", "Muharram"], answer: 1, note: "Fasting in Ramadan is one of the Five Pillars of Islam." },
];
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const readSaved = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } };
const save = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be unavailable */ } };

export function Plus({ log, oled, onOledChange, homeWidgets, onHomeWidgetsChange, onOpenPayment, onOpenListen, onOpenBayan }: Props) {
  const [completed, setCompleted] = useState<string[]>(() => readSaved("amanora:plus-lessons", []));
  const [challengeDone, setChallengeDone] = useState<string[]>(() => readSaved("amanora:plus-weekly-challenge", []));
  const [goals, setGoals] = useState<{ title: string; target: number; progress?: number }[]>(() => readSaved("amanora:plus-goals", [{ title: "Quran reading", target: 10, progress: 0 }, { title: "Learning minutes", target: 15, progress: 0 }]));
  const [family, setFamily] = useState<string[]>(() => readSaved("amanora:plus-family", []));
  const [memberName, setMemberName] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("10");
  const [openTrack, setOpenTrack] = useState("quran");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6-i)); const key = dayKey(d); return { label: d.toLocaleDateString(undefined, { weekday: "short" }), count: (log[key] || []).length }; }), [log]);
  const total = useMemo(() => Object.values(log).reduce((n, v) => n + v.length, 0), [log]);
  const average = Math.round(days.reduce((n, d) => n + d.count, 0) / 7 * 10) / 10;
  const max = Math.max(5, ...days.map(d => d.count));
  const toggleLesson = (id: string) => { const next = completed.includes(id) ? completed.filter(x => x !== id) : [...completed, id]; setCompleted(next); save("amanora:plus-lessons", next); };
  const addGoal = () => { const title = goalName.trim(); const target = Math.max(1, Math.min(120, Number(goalTarget) || 10)); if (!title) return; const next = [...goals, { title, target, progress: 0 }]; setGoals(next); save("amanora:plus-goals", next); setGoalName(""); };
  const addFamily = () => { const name = memberName.trim(); if (!name || family.length >= 5) return; const next = [...family, name]; setFamily(next); save("amanora:plus-family", next); setMemberName(""); };
  const answerQuiz = () => { if (quizChoice === null) return; setQuizScore(score => score + (quizChoice === QUIZ[quizIndex].answer ? 1 : 0)); if (quizIndex === QUIZ.length - 1) setQuizDone(true); else { setQuizIndex(quizIndex + 1); setQuizChoice(null); } };
  const resetQuiz = () => { setQuizIndex(0); setQuizChoice(null); setQuizScore(0); setQuizDone(false); };

  return <div className="screen plus-screen">
    <header className="head plus-heading"><span className="kicker">A MORE PERSONAL WAY TO GROW</span><h2>Amanora <span>Plus</span></h2><p className="muted">A deeper learning journey with guided paths, weekly challenges and personal progress.</p></header>
    <section className="plus-hero"><div className="plus-orbit">✦</div><span className="plus-eyebrow">THE AMANORA PLUS EXPERIENCE</span><h3>Make space for meaningful growth.</h3><p>Structured learning, thoughtful progress tools and a calmer listening experience, all in one place.</p><div className="plus-pills"><span>Ad-free sanctuary</span><span>Personal progress</span><span>Family-friendly</span></div></section>

    <section className="plus-section"><div className="row between"><div><span className="kicker">01 · LEARN WITH PURPOSE</span><h3>Amanora Academy</h3></div><span className="plus-icon">🎓</span></div><p className="muted small">Follow a learning path at your own pace. Lesson completion is saved on this device.</p>
      {TRACKS.map(track => <article className="academy-track" key={track.id}><button className="track-head" onClick={() => setOpenTrack(openTrack === track.id ? "" : track.id)}><span className="track-icon">{track.icon}</span><span className="grow"><b>{track.title}</b><small>{track.level}</small></span><span className="track-progress">{track.lessons.filter((_,i) => completed.includes(`${track.id}-${i}`)).length}/{track.lessons.length}</span><span>{openTrack === track.id ? "⌃" : "⌄"}</span></button>
        {openTrack === track.id && <div className="track-body"><p>{track.detail}</p>{track.lessons.map((lesson,i) => { const id = `${track.id}-${i}`; const done = completed.includes(id); return <button className={`lesson-row${done ? " done" : ""}`} key={id} onClick={() => toggleLesson(id)}><span className="lesson-check">{done ? "✓" : "○"}</span><span>{lesson}</span><small>{done ? "Completed" : "Mark complete"}</small></button>; })}</div>}</article>)}
      <p className="tiny-note">Course progress records personal study. It is not a religious qualification or scholarly certification. Lesson content should be reviewed by qualified teachers before publication.</p>
    </section>

    <section className="plus-section"><div className="row between"><div><span className="kicker">02 · YOUR 7-DAY JOURNEY</span><h3>Guided Deen reset</h3></div><span className="plus-icon">🌱</span></div><p className="muted small">A gentle weekly plan that turns learning into small, achievable actions. Your check-ins are saved on this device.</p><div className="stats plus-stats"><div><b>{challengeDone.length}/7</b><small>Days completed</small></div><div><b>{Math.round(challengeDone.length/7*100)}%</b><small>Journey progress</small></div></div>{WEEKLY_CHALLENGE.map(item=>{const done=challengeDone.includes(item.id);return <button className={`lesson-row${done?' done':''}`} key={item.id} onClick={()=>{const next=done?challengeDone.filter(x=>x!==item.id):[...challengeDone,item.id];setChallengeDone(next);save("amanora:plus-weekly-challenge",next);}}><span className="lesson-check">{done?'✓':'○'}</span><span className="grow"><b>{item.day} · {item.title}</b><small>{item.detail}</small></span><small>{done?'Done':'Mark done'}</small></button>;})}</section>

    <section className="plus-section"><div className="row between"><div><span className="kicker">03 · CHECK YOUR UNDERSTANDING</span><h3>Knowledge micro-quiz</h3></div><span className="plus-icon">✍️</span></div>
      {!quizDone ? <div className="quiz-card"><div className="row between"><span className="pill">Question {quizIndex+1} of {QUIZ.length}</span><span className="muted tiny">Quick knowledge check</span></div><h4>{QUIZ[quizIndex].q}</h4><div className="quiz-options">{QUIZ[quizIndex].choices.map((choice,i) => <button key={choice} className={quizChoice === i ? "chosen" : ""} onClick={() => setQuizChoice(i)}>{choice}</button>)}</div><button className="btn wide" disabled={quizChoice === null} onClick={answerQuiz}>Check answer</button></div> : <div className="quiz-result"><b>{quizScore} / {QUIZ.length} correct</b><p>{quizScore === QUIZ.length ? "Excellent work. Keep learning steadily." : "Good effort. Review the topics and try again."}</p><button className="chip" onClick={resetQuiz}>Try again</button></div>}
      {!quizDone && quizChoice !== null && <p className="tiny-note">{quizChoice === QUIZ[quizIndex].answer ? "Correct. " : "Not quite. "}{QUIZ[quizIndex].note}</p>}
    </section>

    <section className="plus-section"><div className="row between"><div><span className="kicker">04 · YOUR JOURNEY</span><h3>Personal progress</h3></div><span className="plus-icon">📈</span></div><div className="stats plus-stats"><div><b>{total}</b><small>Prayers logged</small></div><div><b>{average}</b><small>Daily avg · 7 days</small></div><div><b>{completed.length}</b><small>Lessons completed</small></div></div>
      <div className="chart-card"><div className="row between"><b>Prayer check-ins</b><small className="muted">Last 7 days</small></div><div className="bar-chart">{days.map(d => <div className="bar-col" key={d.label}><div className="bar-track"><div className="bar-fill" style={{ "--bar-height": `${d.count/max*100}%` } as CSSProperties} /></div><small>{d.label}</small><b>{d.count}</b></div>)}</div><small className="tiny-note">Based on prayer check-ins saved on this device. This is a personal reflection tool, not a measure of faith.</small></div>
    </section>

    <section className="plus-section"><div className="row between"><div><span className="kicker">05 · BUILD A ROUTINE</span><h3>Your goals</h3></div><span className="plus-icon">🎯</span></div>
      {goals.map((g,i) => <div className="goal-row" key={`${g.title}-${i}`}><span className="grow"><b>{g.title}</b><small>{Math.min(g.target,g.progress || 0)} / {g.target} minutes today</small><span className="goal-progress"><i style={{width:`${Math.min(100,(g.progress || 0)/g.target*100)}%`}} /></span></span><button className="chip" onClick={() => { const next=goals.map((item,j)=>j===i?{...item,progress:(item.progress||0)+5}:item); setGoals(next); save("amanora:plus-goals",next); }}>+5 min</button><button className="chip" onClick={() => { const next=goals.filter((_,j)=>j!==i); setGoals(next); save("amanora:plus-goals",next); }}>Remove</button></div>)}
      <div className="goal-form"><input className="input" value={goalName} onChange={e=>setGoalName(e.target.value)} placeholder="e.g. Quran reflection"/><input className="input goal-number" type="number" min="1" max="120" value={goalTarget} onChange={e=>setGoalTarget(e.target.value)} aria-label="Daily minutes"/><button className="btn" onClick={addGoal} disabled={!goalName.trim()}>Add goal</button></div>
    </section>

    <section className="plus-section"><div className="row between"><div><span className="kicker">06 · GROW TOGETHER</span><h3>Family circle</h3></div><span className="plus-icon">🤍</span></div><p className="muted small">Create a simple shared-device reminder list for family learning and encouragement.</p>
      {family.map((name,i)=><div className="goal-row" key={`${name}-${i}`}><span>♡</span><b className="grow">{name}</b><button className="chip" onClick={()=>{const next=family.filter((_,j)=>j!==i);setFamily(next);save("amanora:plus-family",next);}}>Remove</button></div>)}
      <div className="goal-form"><input className="input" value={memberName} onChange={e=>setMemberName(e.target.value)} placeholder="Family member name"/><button className="btn" onClick={addFamily} disabled={!memberName.trim() || family.length>=5}>Add</button></div><p className="tiny-note">This list stays on this device. Shared accounts and cross-device syncing require a secure account backend.</p>
    </section>

    <section className="plus-section bayan-plus-card"><div className="row between"><div><span className="kicker">07 · LISTEN DEEPER</span><h3>Bayan Listening Studio</h3></div><span className="plus-icon">🎙️</span></div><p className="muted small">A dedicated place for full-length lectures, topic collections and focused listening. Start with publisher-linked Mufti Menk talks, save favourites and build a queue.</p><div className="bayan-plus-grid"><div><b>Full talks</b><small>Long-form lectures, not short clips</small></div><div><b>Personal library</b><small>Favourites, queue and listening history</small></div><div><b>Focus tools</b><small>Playback speed and sleep timer for your own audio files</small></div><div><b>English + Urdu</b><small>Separate language shelves, with Urdu catalogue under review</small></div></div><button className="btn wide" onClick={onOpenBayan}>Explore Bayan Library →</button><p className="tiny-note">Premium licensed audio packs, offline downloads and cross-device listening will be activated only after content permissions and the secure audio service are in place.</p></section>

    <section className="plus-section"><div className="row between"><div><span className="kicker">08 · YOUR SANCTUARY</span><h3>Premium experience</h3></div><span className="plus-icon">🌙</span></div>
      <button className={`theme-option${oled ? " selected" : ""}`} onClick={()=>onOledChange(!oled)}><span className="theme-preview"/><span className="grow"><b>OLED night theme</b><small>Deep black surfaces for low-light reading</small></span><span className="pill">{oled ? "ON" : "OFF"}</span></button>
      <div className="widget-picker"><b>Customise Home shortcuts</b><small className="muted">Choose which quick-access tiles appear on your Home screen, including Prophet Stories.</small><div className="widget-options">{["Quran","Stories","Reels","Listen","Hadith","Worship","Learn","Quiz"].map(name=><button key={name} className={homeWidgets.includes(name)?"widget-chip active":"widget-chip"} onClick={()=>{const next=homeWidgets.includes(name)?homeWidgets.filter(x=>x!==name):[...homeWidgets,name];onHomeWidgetsChange(next);}}>{homeWidgets.includes(name)?"✓ ":"＋ "}{name}</button>)}</div></div>
      <button className="btn wide" onClick={onOpenListen}>Open Quran audio library →</button>
      <p className="tiny-note">Offline audio downloads, background loops and additional licensed high-quality reciters require an authorised audio catalogue and download service before they can be offered.</p>
    </section>

    <section className="plus-pricing"><span className="plus-eyebrow">SUPPORT THE NEXT CHAPTER</span><h3>Amanora Plus</h3><p>Choose a membership option and continue to the existing Amanora UPI checkout.</p>
      <div className="plan-switch"><button className={selectedPlan === "monthly" ? "active" : ""} onClick={()=>setSelectedPlan("monthly")}>Monthly</button><button className={selectedPlan === "yearly" ? "active" : ""} onClick={()=>setSelectedPlan("yearly")}>Yearly · Save more</button></div>
      <div className="price-line"><b>{selectedPlan === "yearly" ? "₹799" : "₹99"}</b><span>/{selectedPlan === "yearly" ? "year" : "month"}</span></div>
      <ul><li>Guided Academy paths for Quran foundations, Arabic, Seerah, Hadith and daily dua</li><li>Bayan Listening Studio with full-lecture discovery, saved favourites and queues</li><li>7-day Guided Deen Reset, daily micro-quizzes and personal check-ins</li><li>Learning progress charts, study history and custom goals</li><li>OLED night reading and personalised Home shortcuts</li><li>Family learning planner and saved study notes on this device</li><li>New reviewed audio and study packs as licensed content becomes available</li></ul>
      <button className="btn wide gold-btn" onClick={() => onOpenPayment(selectedPlan)}>Continue to UPI checkout →</button>
      <p className="tiny-note">UPI checkout opens the existing QR and payment form in your Profile tab. Payment must be verified securely before Plus membership is activated. The current frontend does not activate paid access automatically.</p>
    </section>
  </div>;
}
