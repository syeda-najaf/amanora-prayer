import React, { useState, useEffect } from 'react';
import { PrayerName, Coordinates, PrayerTime, AppSettings } from '../types';
import { IslamicButton } from './IslamicButton';
import { MapPin, RefreshCw, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

const PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const METHOD_ID: Record<string, number> = {
  MuslimWorldLeague: 3,
  NorthAmerica: 2,
  Egyptian: 5,
  Karachi: 1,
};

interface PrayerSectionProps {
  coords: Coordinates;
  settings: AppSettings;
  lights: Record<string, boolean>;
  onToggleLight: (p: PrayerName) => void;
  onRefreshLocation: () => void;
  isLocating: boolean;
}

export const PrayerSection: React.FC<PrayerSectionProps> = ({
  coords,
  settings,
  lights,
  onToggleLight,
  onRefreshLocation,
  isLocating,
}) => {
  const [times, setTimes] = useState<PrayerTime[]>([]);
  const [now, setNow] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch prayer timings
  useEffect(() => {
    let alive = true;
    const fetchTimings = async () => {
      setLoading(true);
      try {
        const d = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
        const methodNum = METHOD_ID[settings.method] ?? 3;
        const url = `https://api.aladhan.com/v1/timings/${d}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${methodNum}`;
        const res = await fetch(url);
        const json = await res.json();
        const tm = json?.data?.timings;

        if (tm && alive) {
          const list: PrayerTime[] = PRAYERS.map(name => {
            const [h, m] = String(tm[name]).split(':').map(n => parseInt(n, 10));
            return {
              name,
              date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0),
            };
          });
          setTimes(list);
        }
      } catch {
        // Fallback default
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchTimings();
    return () => {
      alive = false;
    };
  }, [coords, settings.method]);

  // Find next upcoming prayer
  const nextPrayer = times.find(p => p.date.getTime() > now.getTime()) || (times.length > 0 ? {
    name: times[0].name,
    date: new Date(times[0].date.getTime() + 86400000), // tomorrow's Fajr
  } : null);

  const formatCountdown = (target: Date, current: Date) => {
    const sec = Math.max(0, Math.floor((target.getTime() - current.getTime()) / 1000));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const doneCount = Object.values(lights).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Next Prayer Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1C4E40] via-[#123A2F] to-[#0A261E] p-6 text-white border border-[#C9A24D]/40 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#E7CF9B] text-xs font-bold tracking-widest uppercase">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Next Obligatory Prayer</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {nextPrayer?.name || 'Prayer Schedule'}
            </h2>

            <div className="flex items-center gap-2 text-stone-300 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{coords.city}</span>
              <span>·</span>
              <span>
                {nextPrayer ? nextPrayer.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
            </div>
          </div>

          {/* Countdown Clock Disk */}
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-full border-2 border-[#C9A24D] bg-[#0E261E]/80 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-[inset_0_2px_8px_rgba(201,162,77,0.3)]">
              <span className="font-mono text-xl font-black text-white tracking-wider">
                {nextPrayer ? formatCountdown(nextPrayer.date, now) : '--:--:--'}
              </span>
              <span className="text-[9px] font-bold tracking-widest text-[#E7CF9B] uppercase mt-0.5">
                Remaining
              </span>
            </div>

            <IslamicButton
              variant="gold"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />}
              onClick={onRefreshLocation}
              disabled={isLocating}
            >
              {isLocating ? 'Locating...' : 'Refresh GPS'}
            </IslamicButton>
          </div>
        </div>
      </div>

      {/* Today's Prayers Checklist */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#173D33]">Daily Prayer Rhythm</h3>
            <p className="text-xs text-stone-500">Track and fulfill your 5 daily obligatory prayers</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {doneCount}/5 Fulfilled
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-[#C9A24D] to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / 5) * 100}%` }}
          />
        </div>

        {/* Prayer Rows */}
        <div className="divide-y divide-stone-100">
          {PRAYERS.map(p => {
            const prayerInfo = times.find(t => t.name === p);
            const isCompleted = lights[p] || false;

            return (
              <div key={p} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#173D33]">{p}</p>
                  <p className="text-xs text-stone-400 font-mono">
                    {prayerInfo ? prayerInfo.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playTactileClick('subtle');
                    onToggleLight(p);
                  }}
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#1C4E40] text-amber-300 border-[#C9A24D] shadow-sm'
                      : 'bg-stone-50 text-stone-300 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
