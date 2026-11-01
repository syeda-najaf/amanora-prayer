import React, { useState } from 'react';
import { CheckCircle2, Circle, Sparkles, Award, Star, Flame, Sun, Moon } from 'lucide-react';
import { playTactileClick } from '../utils/audioHaptics';

interface DailySunnahHabit {
  id: string;
  title: string;
  arabicPrompt: string;
  points: number;
  timeOfDay: 'morning' | 'anytime' | 'night';
  sunnahProof: string;
}

const SUNNAH_HABITS: DailySunnahHabit[] = [
  {
    id: 'fajr_kursi',
    title: 'Pray Fajr on Time & Recite Ayat al-Kursi',
    arabicPrompt: 'الصَّلَاةُ عَلَى وَقْتِهَا',
    points: 25,
    timeOfDay: 'morning',
    sunnahProof: 'An-Nasa\'i 9848 · "Nothing stands between him and Jannah except death."'
  },
  {
    id: 'morning_adhkar',
    title: 'Say "Astaghfirullah" & "SubhanAllah" 100x',
    arabicPrompt: 'الِاسْتِغْفَارُ وَالتَّسْبِيحُ',
    points: 15,
    timeOfDay: 'morning',
    sunnahProof: 'Sahih Muslim · "I seek Allah\'s forgiveness seventy to a hundred times daily."'
  },
  {
    id: 'quran_recitation',
    title: 'Read or Listen to 10 Ayahs of Noble Quran',
    arabicPrompt: 'تِلَاوَةُ آيَاتٍ مِنَ الذِّكْرِ',
    points: 25,
    timeOfDay: 'anytime',
    sunnahProof: 'At-Tirmidhi · "For every letter recited, there is a ten-fold reward."'
  },
  {
    id: 'smile_sadaqah',
    title: 'Greet Family with a Warm Smile & Good Word',
    arabicPrompt: 'التَّبَسُّمُ وَالْكَلِمَةُ الطَّيِّبَةُ',
    points: 10,
    timeOfDay: 'anytime',
    sunnahProof: 'Bukhari & Tirmidhi · "Your smile in the face of your brother is charity."'
  },
  {
    id: 'daily_charity',
    title: 'Give Sadaqah, Water a Plant, or Feed a Bird',
    arabicPrompt: 'الصَّدَقَةُ وَالإِحْسَانُ',
    points: 20,
    timeOfDay: 'anytime',
    sunnahProof: 'Sahih al-Bukhari · "There is a divine reward for serving every living creature."'
  },
  {
    id: 'night_surah',
    title: 'Recite Surah Al-Mulk & Sleep in Wudhu',
    arabicPrompt: 'سُورَةُ الْمُلْكِ قَبْلَ النَّوْمِ',
    points: 20,
    timeOfDay: 'night',
    sunnahProof: 'At-Tirmidhi 2891 · "Surah Al-Mulk intercedes until its reciter is forgiven."'
  }
];

interface DailyDeenTrackerProps {
  userPoints: number;
  onAddPoints: (points: number) => void;
}

export const DailyDeenTracker: React.FC<DailyDeenTrackerProps> = ({
  userPoints,
  onAddPoints,
}) => {
  const [completedHabits, setCompletedHabits] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amanora_completed_habits_today');
      return saved ? JSON.parse(saved) : ['fajr_kursi'];
    } catch {
      return ['fajr_kursi'];
    }
  });

  const toggleHabit = (habit: DailySunnahHabit) => {
    const isAlreadyDone = completedHabits.includes(habit.id);
    let updated: string[];

    if (isAlreadyDone) {
      updated = completedHabits.filter(id => id !== habit.id);
      playTactileClick('subtle');
      onAddPoints(-habit.points);
    } else {
      updated = [...completedHabits, habit.id];
      playTactileClick('chime');
      onAddPoints(habit.points);
    }

    setCompletedHabits(updated);
    try {
      localStorage.setItem('amanora_completed_habits_today', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const progressPercent = Math.round((completedHabits.length / SUNNAH_HABITS.length) * 100);
  const isAllComplete = completedHabits.length === SUNNAH_HABITS.length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-md space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#9A7432] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Daily Sunnah & Deen Habits</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#173D33] tracking-tight mt-0.5">
            Today's Good Deeds Checklist
          </h3>
          <p className="text-xs text-stone-500">
            Check off daily sunnahs to earn Good Deed points (★) and build your house in Jannah.
          </p>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-[#FFFBEF] border border-[#C9A24D]/50 px-4 py-2 rounded-2xl">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#9A7432]">Good Deeds</p>
              <p className="text-sm font-black text-[#173D33]">{userPoints} pts</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-2xl">
            <Award className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-800">Completed</p>
              <p className="text-sm font-black text-emerald-950">{completedHabits.length} / {SUNNAH_HABITS.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-stone-600">
          <span>Daily Sunnah Progress</span>
          <span className="text-[#173D33] font-black">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#1C4E40] to-[#C9A24D] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {SUNNAH_HABITS.map(h => {
          const isDone = completedHabits.includes(h.id);

          return (
            <div
              key={h.id}
              onClick={() => toggleHabit(h)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                  : 'bg-[#FCFDF9] border-stone-200/90 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#9A7432] uppercase tracking-wide">
                    {h.timeOfDay === 'morning' ? '🌅 Morning Sunnah' : h.timeOfDay === 'night' ? '🌙 Night Sunnah' : '☀️ Daily Sunnah'}
                  </span>
                  <h4 className={`text-sm font-black leading-snug ${isDone ? 'text-emerald-950 line-through opacity-80' : 'text-[#173D33]'}`}>
                    {h.title}
                  </h4>
                </div>

                <div className="shrink-0 pt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100/80 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-stone-500 truncate max-w-[180px]">
                  {h.sunnahProof}
                </span>
                <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                  isDone ? 'bg-emerald-200/60 text-emerald-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  +{h.points} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Celebration Banner */}
      {isAllComplete && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shadow-md animate-scale-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div>
              <h5 className="text-sm font-black">All Daily Sunnahs Completed!</h5>
              <p className="text-xs text-amber-100">May Allah reward you with the highest gardens in Firdaus today.</p>
            </div>
          </div>
          <span className="text-xs font-black bg-white text-amber-900 px-3 py-1.5 rounded-xl shadow-xs">
            +115 pts Earned ✨
          </span>
        </div>
      )}
    </div>
  );
};
