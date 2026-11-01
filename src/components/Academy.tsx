import { useEffect, useState } from "react";

type Course = { id: string; title: string; category: string; level: string; lessons: number; description: string; premium: boolean; lessonsText: string[]; quiz: { q: string; options: string[]; answer: number; explain: string }[] };
const COURSES: Course[] = [
  { id: "salah", title: "Build a confident Salah", category: "Everyday practice", level: "Beginner", lessons: 4, description: "A step-by-step learning path for understanding the structure and meaning of prayer.", premium: false, lessonsText: ["The purpose and place of Salah", "Preparing for prayer", "Understanding the prayer sequence", "Building a steady prayer routine"], quiz: [{ q: "How many obligatory daily prayers are there?", options: ["Three", "Five", "Seven"], answer: 1, explain: "The five daily obligatory prayers are Fajr, Dhuhr, Asr, Maghrib and Isha." }, { q: "What helps make a new worship habit sustainable?", options: ["A realistic routine", "Trying to do everything at once", "Ignoring consistency"], answer: 0, explain: "A manageable routine makes consistency easier." }] },
  { id: "arabic", title: "Quranic Arabic foundations", category: "Language", level: "Beginner", lessons: 6, description: "Start recognising recurring Arabic words and simple sentence patterns found in Quranic study.", premium: true, lessonsText: ["Arabic letters refresher", "Pronouns you will meet often", "Common Quranic words", "Nouns and simple patterns", "Recognising verb forms", "Your first vocabulary review"], quiz: [{ q: "What is a useful first step when learning Quranic vocabulary?", options: ["Memorise random lists", "Learn common words in context", "Skip meanings"], answer: 1, explain: "Learning recurring words in context supports understanding." }] },
  { id: "seerah", title: "Seerah: lessons from the Prophetic life", category: "Seerah", level: "Guided", lessons: 5, description: "A structured introduction to key periods, themes and character lessons from the Seerah.", premium: true, lessonsText: ["Makkah before the message", "The first revelation", "Patience and perseverance", "The Hijrah", "Building the Madinah community"], quiz: [{ q: "The Hijrah refers to the migration from which city to which city?", options: ["Makkah to Madinah", "Madinah to Taif", "Jerusalem to Makkah"], answer: 0, explain: "The Hijrah was the migration from Makkah to Madinah." }] },
  { id: "tajweed", title: "Tajweed listening foundations", category: "Quran recitation", level: "Beginner", lessons: 5, description: "Learn how to listen attentively to recitation and identify foundational pronunciation topics.", premium: true, lessonsText: ["Why Tajweed matters", "Makharij: places of articulation", "Madd: lengthening", "Noon sakinah overview", "A guided listening checklist"], quiz: [{ q: "What does Makharij refer to in Tajweed?", options: ["Places of articulation", "Translation", "Chapter order"], answer: 0, explain: "Makharij are the articulation points from which letters are pronounced." }] },
];

type HifzItem = { id: number; surah: string; passage: string; status: "learning" | "review" | "strong"; last: string };
type FamilyMember = { id: number; name: string; goal: string };
const read = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(`amanora:${key}`); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } };

export function Academy({ onViewPlans }: { onViewPlans: () => void }) {
  const [section, setSection] = useState<"academy" | "hifz" | "insights" | "family">("academy");
  const [completed, setCompleted] = useState<Record<string, string[]>>(() => read("academy-completed", {}));
  const [quizPassed, setQuizPassed] = useState<string[]>(() => read("academy-quizzes", []));
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [hifz, setHifz] = useState<HifzItem[]>(() => read("hifz-items", []));
  const [surah, setSurah] = useState("");
  const [passage, setPassage] = useState("");
  const [family, setFamily] = useState<FamilyMember[]>(() => read("family-circle", []));
  const [memberName, setMemberName] = useState("");
  const [memberGoal, setMemberGoal] = useState("Read Quran daily");
  const [theme, setTheme] = useState(() => read<string>("plus-theme", "garden"));
  const [goal, setGoal] = useState(() => read<number>("weekly-goal", 5));
  const [sessionCount, setSessionCount] = useState(() => read<number>("hifz-sessions", 0));
  const [notice, setNotice] = useState("");

  useEffect(() => { localStorage.setItem("amanora:academy-completed", JSON.stringify(completed)); }, [completed]);
  useEffect(() => { localStorage.setItem("amanora:academy-quizzes", JSON.stringify(quizPassed)); }, [quizPassed]);
  useEffect(() => { localStorage.setItem("amanora:hifz-items", JSON.stringify(hifz)); }, [hifz]);
  useEffect(() => { localStorage.setItem("amanora:family-circle", JSON.stringify(family)); }, [family]);
  useEffect(() => { localStorage.setItem("amanora:plus-theme", JSON.stringify(theme)); }, [theme]);
  useEffect(() => { localStorage.setItem("amanora:weekly-goal", JSON.stringify(goal)); }, [goal]);
  useEffect(() => { localStorage.setItem("amanora:hifz-sessions", JSON.stringify(sessionCount)); }, [sessionCount]);

  const active = COURSES.find(c => c.id === activeCourse);
  const totalLessons = COURSES.reduce((n, c) => n + c.lessonsText.length, 0);
  const doneLessons = Object.values(completed).reduce((n, a) => n + a.length, 0);
  const overall = Math.round((doneLessons / totalLessons) * 100);
  const markLesson = (courseId: string, index: number) => {
    setCompleted(old => ({ ...old, [courseId]: Array.from(new Set([...(old[courseId] || []), String(index)])) }));
    setNotice("Lesson progress saved on this device.");
  };
  const addHifz = () => {
    if (!surah.trim() || !passage.trim()) { setNotice("Enter a Surah name and passage to add your memorisation target."); return; }
    setHifz(old => [...old, { id: Date.now(), surah: surah.trim(), passage: passage.trim(), status: "learning", last: "Not practised yet" }]);
    setSurah(""); setPassage(""); setNotice("Your Hifz target has been added.");
  };
  const practise = (id: number) => {
    setHifz(old => old.map(item => item.id === id ? { ...item, status: item.status === "learning" ? "review" : item.status === "review" ? "strong" : "learning", last: new Date().toLocaleDateString() } : item));
    setSessionCount(n => n + 1); setNotice("Practice session recorded. Keep revising at a comfortable pace.");
  };
  const addMember = () => {
    if (!memberName.trim()) return;
    setFamily(old => [...old, { id: Date.now(), name: memberName.trim(), goal: memberGoal }]); setMemberName("");
  };
  const courseProgress = (c: Course) => Math.round(((completed[c.id] || []).length / c.lessonsText.length) * 100);
  const sections = [{ id: "academy", label: "Academy", icon: "🎓" }, { id: "hifz", label: "Hifz studio", icon: "📖" }, { id: "insights", label: "My progress", icon: "📈" }, { id: "family", label: "Family", icon: "🤍" }] as const;

  return <div className="screen academy-screen" data-sanctuary={theme}>
    <header className="head"><span className="kicker">AMANORA LEARNING SANCTUARY</span><h2>Grow with intention.</h2><p className="muted">A gentle, guided space to learn, memorise and stay consistent.</p></header>
    <div className="academy-hero"><div className="academy-moon">☾</div><span className="academy-eyebrow">YOUR JOURNEY, ONE STEP AT A TIME</span><h2>Knowledge becomes practice.</h2><p>Learn a little. Revise with purpose. Build habits that last.</p><div className="academy-hero-stats"><span><b>{doneLessons}</b><small>Lessons completed</small></span><span><b>{sessionCount}</b><small>Practice sessions</small></span><span><b>{overall}%</b><small>Learning journey</small></span></div></div>
    <div className="academy-tabs">{sections.map(item => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => { setSection(item.id); setActiveCourse(null); }}><span>{item.icon}</span>{item.label}</button>)}</div>
    {notice && <div className="academy-notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}

    {section === "academy" && !active && <>
      <div className="row between"><div><span className="kicker">LEARNING PATHS</span><h3>Choose your next step</h3></div><span className="pill">{COURSES.length} paths</span></div>
      {COURSES.map(c => <article className="academy-course" key={c.id}><div className="academy-course-top"><span className="academy-course-icon">{c.id === "salah" ? "🕌" : c.id === "arabic" ? "🔤" : c.id === "seerah" ? "🌙" : "🎙️"}</span><div className="grow"><small className="kicker">{c.category} · {c.level}</small><h3>{c.title}</h3></div>{c.premium && <span className="plus-tag">PLUS</span>}</div><p className="muted small">{c.description}</p><div className="progress"><div style={{ width: `${courseProgress(c)}%` }} /></div><div className="row between"><small className="muted">{(completed[c.id] || []).length}/{c.lessonsText.length} lessons · {courseProgress(c)}%</small><button className="academy-link" onClick={() => { if (c.premium) { onViewPlans(); return; } setActiveCourse(c.id); setLessonIndex(0); setAnswers({}); }}> {c.premium ? "Explore Plus →" : "Start learning →"}</button></div></article>)}
      <div className="academy-note"><b>Designed for steady learning</b><p>Lessons are bite-sized and progress is saved on this device. Religious learning content should be reviewed by qualified teachers before being treated as a formal ruling.</p></div>
    </>}

    {section === "academy" && active && <div className="card"><button className="academy-back" onClick={() => setActiveCourse(null)}>← All learning paths</button><span className="kicker">{active.category.toUpperCase()}</span><h3>{active.title}</h3><p className="muted small">Lesson {lessonIndex + 1} of {active.lessonsText.length}</p><div className="academy-lesson"><span>✦</span><h3>{active.lessonsText[lessonIndex]}</h3><p>This learning step is a guided prompt. Read the topic, reflect on what you already know, and use a trusted teacher or reliable source for deeper study.</p><p className="muted small">Take a moment to write one thing you learned and one question you would like to explore.</p></div><div className="row between"><button className="chip" disabled={lessonIndex === 0} onClick={() => setLessonIndex(i => i - 1)}>Previous</button><button className="btn" onClick={() => { markLesson(active.id, lessonIndex); if (lessonIndex < active.lessonsText.length - 1) setLessonIndex(i => i + 1); else setSection("insights"); }}>{lessonIndex === active.lessonsText.length - 1 ? "Complete path" : "Mark done & continue"}</button></div><div className="academy-quiz"><h3>Quick knowledge check</h3><p className="muted small">Answer to reinforce the key idea.</p>{active.quiz.map((q, qi) => <div className="quiz-question" key={qi}><b>{q.q}</b>{q.options.map((option, oi) => <button key={oi} className={`quiz-option ${answers[qi] === oi ? "chosen" : ""}`} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}>{String.fromCharCode(65 + oi)}. {option}</button>)}{answers[qi] !== undefined && <small className={answers[qi] === q.answer ? "quiz-correct" : "muted"}>{answers[qi] === q.answer ? `Correct. ${q.explain}` : "Try again. Re-read the question and choose another answer."}</small>}</div>)}<button className="btn wide" onClick={() => { if (active.quiz.every((q, i) => answers[i] === q.answer)) { setQuizPassed(old => Array.from(new Set([...old, active.id]))); setNotice("Knowledge check passed and saved."); } else setNotice("Complete all answers correctly to pass this knowledge check."); }}>Submit knowledge check</button></div></div>}

    {section === "hifz" && <>
      <div className="card"><span className="kicker">MEMORISATION STUDIO</span><h3>Small portions. Repeated with care.</h3><p className="muted small">Create your own memorisation list, then record each practice session. Use the Quran audio player to listen and repeat.</p><label>Surah name<input className="input" value={surah} onChange={e => setSurah(e.target.value)} placeholder="e.g. Al-Mulk" /></label><label>Ayah range or passage<input className="input" value={passage} onChange={e => setPassage(e.target.value)} placeholder="e.g. Ayah 1–5" /></label><button className="btn wide" onClick={addHifz}>＋ Add memorisation target</button></div>
      <div className="row between"><h3>My revision list</h3><span className="pill">{hifz.length} targets</span></div>
      {hifz.length === 0 ? <div className="card center"><div className="academy-empty">📖</div><b>Your Hifz plan starts here</b><p className="muted small">Add a Surah and a short passage above. Start with a portion you can revise comfortably.</p></div> : hifz.map(item => <div className="academy-hifz" key={item.id}><div className="grow"><b>{item.surah}</b><p className="muted small">{item.passage} · Last practised: {item.last}</p><span className={`hifz-status ${item.status}`}>{item.status === "strong" ? "Feeling strong" : item.status === "review" ? "Needs revision" : "Learning"}</span></div><button className="chip" onClick={() => practise(item.id)}>Record practice</button><button className="academy-remove" aria-label="Remove target" onClick={() => setHifz(old => old.filter(x => x.id !== item.id))}>×</button></div>)}
      <div className="academy-note"><b>Honest progress, not a judgement</b><p>The status is your own reflection, not an AI assessment of recitation accuracy. For Tajweed correction, learn with a qualified teacher.</p></div>
    </>}

    {section === "insights" && <>
      <div className="academy-insight-grid"><div className="card"><small className="muted">Learning completed</small><b className="insight-number">{overall}%</b><div className="progress"><div style={{ width: `${overall}%` }} /></div><small className="muted">{doneLessons} of {totalLessons} lessons</small></div><div className="card"><small className="muted">Practice sessions</small><b className="insight-number">{sessionCount}</b><small className="muted">Recorded by you</small></div><div className="card"><small className="muted">Quiz passes</small><b className="insight-number">{quizPassed.length}</b><small className="muted">Learning checks passed</small></div><div className="card"><small className="muted">Hifz targets</small><b className="insight-number">{hifz.length}</b><small className="muted">In your revision list</small></div></div>
      <div className="card"><span className="kicker">A GOAL YOU CAN KEEP</span><h3>Set a weekly learning goal</h3><p className="muted small">Choose how many short learning or revision sessions you want to aim for this week.</p><div className="row between"><button className="chip" onClick={() => setGoal(g => Math.max(1, g - 1))}>−</button><b className="goal-value">{goal} sessions / week</b><button className="chip" onClick={() => setGoal(g => Math.min(21, g + 1))}>＋</button></div><small className="muted">Your goal is a personal target, not a measure of faith.</small></div>
      <div className="card"><h3>Learning path progress</h3>{COURSES.map(c => <div className="insight-course" key={c.id}><div className="row between"><b>{c.title}</b><small className="muted">{courseProgress(c)}%</small></div><div className="progress"><div style={{ width: `${courseProgress(c)}%` }} /></div></div>)}</div>
      <div className="academy-note"><b>Your privacy matters</b><p>These insights are calculated from activity saved in this browser on this device. They are not uploaded to a server or shared with anyone.</p></div>
    </>}

    {section === "family" && <>
      <div className="card"><span className="kicker">FAMILY CIRCLE</span><h3>Encourage one another gently.</h3><p className="muted small">Create a local family goal board with names and intentions. This version stays on this device; invitations and cross-device syncing need a secure account service.</p><label>Family member name<input className="input" value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Enter a name" /></label><label>Personal goal<select className="input" value={memberGoal} onChange={e => setMemberGoal(e.target.value)}><option>Read Quran daily</option><option>Learn one lesson weekly</option><option>Revise memorised Surahs</option><option>Remember morning and evening adhkar</option><option>Pray on time</option></select></label><button className="btn wide" onClick={addMember} disabled={!memberName.trim()}>＋ Add to family board</button></div>
      {family.map(m => <div className="academy-family" key={m.id}><span className="family-avatar">{m.name.slice(0, 1).toUpperCase()}</span><div className="grow"><b>{m.name}</b><small className="muted">{m.goal}</small></div><button className="academy-remove" onClick={() => setFamily(old => old.filter(x => x.id !== m.id))} aria-label={`Remove ${m.name}`}>×</button></div>)}
      <div className="academy-note"><b>Keep encouragement kind</b><p>Family goals should support each other, never shame or compare anyone's worship.</p></div>
    </>}

    <div className="academy-plus-card"><span className="plus-tag">AMANORA PLUS</span><h3>Make your learning journey deeper.</h3><p>Unlock the full Academy paths, advanced revision tools, richer insights and premium sanctuary themes.</p><button className="btn gold-btn wide" onClick={onViewPlans}>Explore Amanora Plus membership →</button><small>Core Quran access and essential worship tools remain free.</small></div>
    <div className="academy-theme"><b>Sanctuary appearance</b><p className="muted small">Preview a calm look for your learning space.</p><div className="row gap-s"><button className={`chip ${theme === "garden" ? "on" : ""}`} onClick={() => setTheme("garden")}>🌿 Garden</button><button className={`chip ${theme === "night" ? "on" : ""}`} onClick={() => setTheme("night")}>🌙 Night</button><button className={`chip ${theme === "sand" ? "on" : ""}`} onClick={() => setTheme("sand")}>☀ Sand</button></div></div>
  </div>;
}
