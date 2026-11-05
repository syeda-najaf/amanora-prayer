import { toast } from "../lib";
import { useEffect, useMemo, useState } from "react";
import { AUTHENTIC_HADITHS } from "../data/hadiths";
import { DAILY_GOOD, STORIES } from "../data/content";

type Props = { onOpen: (tab: "Stories" | "Hadith" | "Quiz" | "Reels" | "Bayan" | "Listen") => void };

function dayIndex(date: Date, length: number) {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86400000);
  return day % Math.max(1, length);
}

export function DailyAutoPilot({ onOpen }: Props) {
  const [today, setToday] = useState(() => new Date());
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);
  const index = dayIndex(today, Math.max(DAILY_GOOD.length, AUTHENTIC_HADITHS.length, STORIES.length));
  const reflection = DAILY_GOOD[index % DAILY_GOOD.length];
  const hadith = AUTHENTIC_HADITHS[index % AUTHENTIC_HADITHS.length];
  const story = STORIES[index % STORIES.length];
  const dateLabel = today.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast("Audio narration is not supported by this browser. Try the latest Chrome or Edge.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };
  const stop = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
  };

  return <section className="screen">
    <header className="head">
      <span className="kicker">AMANORA DAILY AUTO-PILOT</span>
      <h2>Fresh for today ✨</h2>
      <p className="muted small">{dateLabel} · Daily selection updates automatically on this device</p>
    </header>
    <article className="card">
      <small className="gold">TODAY'S REFLECTION</small>
      <p className="hadith-en">{reflection.text}</p>
      <small className="muted">{reflection.ref}</small>
    </article>
    <article className="card">
      <small className="gold">HADITH OF THE DAY</small>
      <p className="arabic">{hadith.arabic}</p>
      <p>{hadith.meaning}</p>
      <small className="muted">{hadith.reference}</small>
      <button className="chip" onClick={() => onOpen("Hadith")}>Open Hadith library →</button>
    </article>
    <article className="card">
      <small className="gold">STORY OF THE DAY</small>
      <h3>{story.title}</h3>
      <p>{story.narration}</p>
      <small className="muted">{story.reference}</small>
      <div className="row gap-s wrap">
        <button className="btn" onClick={() => playing ? stop() : speak(story.narration)}>{playing ? "■ Stop audio" : "▶ Listen in English"}</button>
        <button className="chip" onClick={() => onOpen("Stories")}>Open stories →</button>
      </div>
    </article>
    <article className="card">
      <small className="gold">YOUR DAILY DEEN ROUTINE</small>
      <div className="row between"><b>Daily quiz</b><button className="chip" onClick={() => onOpen("Quiz")}>Start →</button></div>
      <div className="row between"><b>Reels</b><button className="chip" onClick={() => onOpen("Reels")}>Watch →</button></div>
      <div className="row between"><b>Audio Bayan</b><button className="chip" onClick={() => onOpen("Bayan")}>Listen →</button></div>
      <div className="row between"><b>Islamic audio</b><button className="chip" onClick={() => onOpen("Listen")}>Open →</button></div>
    </article>
    <p className="muted small">Content rotates from the Islamic material bundled with this app. This is an on-device daily schedule, not yet a cloud publishing service. New shared Reels, newly generated content and background notifications require a deployed backend and approved media sources.</p>
  </section>;
}
