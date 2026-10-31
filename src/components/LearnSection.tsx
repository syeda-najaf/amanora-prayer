import React, { useState } from 'react';
import { IslamicButton } from './IslamicButton';
import { ChevronDown, ChevronUp, BookOpen, Sparkles, GraduationCap } from 'lucide-react';

const LEARNING_HALLS = [
  {
    title: "Quran Studies",
    icon: "۞",
    description: "Understand the core message & linguistic beauty of the Quran",
    content: "Begin with the deep reflections of Surah Al-Fatihah, known as the Mother of the Book. Study the themes of divine oneness (Tawheed), mercy, guidance, and human accountability. Pair your Arabic recitation with authentic classical tafsir (such as Ibn Kathir and Al-Sa'di) to internalize the lessons in your daily conduct.",
  },
  {
    title: "Seerah of Prophet Muhammad ﷺ",
    icon: "☾",
    description: "The exemplary character and life of the final Messenger",
    content: "Walk through the blessed life of the Prophet ﷺ: his early youth in Makkah known as Al-Ameen (the Trustworthy), the first divine revelation in the Cave of Hira, the persevering call to Islam, the miraculous night journey (Isra and Mi'raj), the Hijrah to Madinah, and the establishment of a brotherhood grounded in justice and compassion.",
  },
  {
    title: "Stories of the Prophets",
    icon: "✧",
    description: "Inspirational resilience from Adam to Isa (Jesus)",
    content: "Explore the Quranic accounts of Adam's repentance, Nuh's steadfast ark, Ibrahim's unshakeable monotheism and submission, Yusuf's beauty of patience (Sabr Jameel) through betrayal to leadership, Musa's courage confronting tyranny, and Isa's humility and miracles. Every story is a lamp for modern struggles.",
  },
  {
    title: "Arabic Learning",
    icon: "ع",
    description: "Letters, vocabulary and Quranic grammatical foundations",
    content: "Master the 28 Arabic letters with proper articulation points (Makharij). Progress through short vowels (Harakat), Madd elongations, Tanween, and Sukoon. Learn the 300 most frequent Quranic words that constitute over 70% of the entire Quranic vocabulary.",
  },
  {
    title: "Aqeedah (Foundations of Faith)",
    icon: "◇",
    description: "Unshakeable conviction in Allah and the unseen",
    content: "Delve into the 6 Pillars of Iman: Belief in Allah and His perfect attributes, His celestial angels, His revealed scriptures, His noble messengers, the Day of Resurrection, and Divine Decree (Qadar) both the pleasing and challenging facets.",
  },
  {
    title: "Fiqh of Daily Worship",
    icon: "📖",
    description: "Practical rulings for purification, Salah, and fasting",
    content: "Detailed guidance on the prerequisites and integrals of Taharah (wudu, ghusl, tayammum), the inner spirit and outward actions of the five obligatory prayers, Sajdah Sahw (prostration of forgetfulness), and the jurisprudence of Ramadan fasting.",
  },
  {
    title: "Duas & Supplications",
    icon: "🤲",
    description: "Prophetic invocations for moments of hardship and joy",
    content: "Curated comprehensive supplications from the Quran (such as 'Rabbana atina fid-dunya hasanah') and authentic Sunnah for waking up, entering and leaving the home, protection from anxiety, and seeking forgiveness in the last third of the night.",
  },
];

export const LearnSection: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#C9A24D] text-xs font-bold tracking-widest uppercase mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Islamic Learning Halls</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#173D33] tracking-tight">
            Grow in Authentic Knowledge
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Step-by-step curriculum in Quranic sciences, the prophetic Seerah, and daily practice.
          </p>
        </div>
      </div>

      {/* Accordion Halls */}
      <div className="space-y-3">
        {LEARNING_HALLS.map((hall, i) => {
          const isExpanded = expandedIndex === i;

          return (
            <div
              key={hall.title}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded ? 'bg-white border-[#C9A24D] shadow-md' : 'bg-white/80 border-stone-200 hover:border-stone-300'
              }`}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center font-bold text-lg text-amber-800 shrink-0">
                    {hall.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#173D33]">{hall.title}</h3>
                    <p className="text-xs text-stone-500">{hall.description}</p>
                  </div>
                </div>

                <div className="shrink-0 text-amber-700">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-700 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                  <p>{hall.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
