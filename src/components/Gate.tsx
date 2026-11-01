import { useState } from "react";

// The gate of Jannah: tap Enter and the two doors slide open with golden light.
export function Gate({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [fade, setFade] = useState(false);

  const enter = () => {
    if (open) return;
    setOpen(true);
    setTimeout(() => setFade(true), 2700);
    setTimeout(onDone, 3500);
  };

  return (
    <div className={"gate" + (open ? " open" : "") + (fade ? " fade" : "")}>
      <div className="gate-bismillah ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      <h1 className="gate-brand">AMANORA</h1>
      <div className="gate-sub">YOUR JOURNEY OF NOOR</div>

      <div className="gate-wrap">
        <div className="gate-glow" />
        <div className="gate-arch">
          <div className="gate-moon">☾</div>
          <div className="ar gate-verse">سَلَامٌ عَلَيْكُمْ طِبْتُمْ فَادْخُلُوهَا خَالِدِينَ</div>
          <div className="gate-welcome">The gates of Paradise are opening for you</div>
        </div>
        <div className="gate-door l"><span>۞</span><span>✧</span><span>۞</span></div>
        <div className="gate-door r"><span>۞</span><span>✧</span><span>۞</span></div>
      </div>

      <button className="gate-btn" onClick={enter} disabled={open}>ENTER AMANORA ✦</button>
      <div className="gate-foot">TAP TO OPEN THE GATE OF JANNAH</div>
    </div>
  );
}
