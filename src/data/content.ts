export interface Story {
  id: number;
  tag: string;
  title: string;
  emoji: string[];
  steps: string[];
  lesson: string;
  reference: string;
  narration: string;
}

// Daily moral Animation stories. One new story comes first each day; they repeat after the last one.
export const STORIES: Story[] = [
  { id: 1, tag: "PATIENCE", title: "Patience Always Pays Off", emoji: ["🧒", "🌱", "⏳", "🌳"],
    steps: ["A boy planted a tiny seed 🌱", "He watered it every day, but nothing happened ⏳", "He felt like giving up... but he stayed patient", "Days later, the first leaf appeared 🌿", "That little seed grew into a tall, shady tree 🌳"],
    lesson: "Allah is with those who are patient.", reference: "Quran 2:153",
    narration: "A boy planted a tiny seed. He watered it every day, but nothing happened. He felt like giving up, but he stayed patient. Days later, the first leaf appeared, and in time the seed grew into a tall, shady tree. Patience always pays off. Allah is with those who are patient." },
  { id: 2, tag: "HONESTY", title: "Be Honest, Find Peace", emoji: ["👦", "👛", "🤔", "😊"],
    steps: ["A boy found a wallet on the road 👛", "Nobody was watching 🤫", "But Allah sees everything 👁️", "He returned the wallet to its owner", "The owner prayed for him, and his heart felt calm 😊"],
    lesson: "Be honest, even when nobody is watching.", reference: "Quran 9:119",
    narration: "A boy found a wallet on the road. Nobody was watching. But he remembered that Allah sees everything. He returned the wallet to its owner. The owner prayed for him, and his heart felt calm. Honesty brings real peace." },
  { id: 3, tag: "GRATITUDE", title: "Gratitude Grows Blessings", emoji: ["👧", "🍞", "💧", "🤲"],
    steps: ["A girl had one piece of bread 🍞", "She thought, this is so little", "Then she thought of people with no food at all", "She said Alhamdulillah 🤲", "Her heart felt full, and the meal felt blessed ✨"],
    lesson: "If you are grateful, I will give you more.", reference: "Quran 14:7",
    narration: "A girl had only one piece of bread. At first she thought it was too little. Then she remembered people who had no food at all. She said Alhamdulillah, and her heart felt full. Gratitude grows blessings." },
  { id: 4, tag: "DUA", title: "No Dua Is Ever Wasted", emoji: ["🧕", "🤲", "🌙", "⭐"],
    steps: ["Everyone was asleep at night 🌙", "A sister raised her hands 🤲", "She spoke to Allah from her heart", "Sometimes the answer is quick, sometimes it is delayed", "Allah answers at the best time ⭐"],
    lesson: "Call upon Me, and I will respond to you.", reference: "Quran 40:60",
    narration: "Everyone was asleep. A sister raised her hands and spoke to Allah from her heart. Sometimes the answer comes quickly, and sometimes it is delayed, but Allah always answers at the best time. No dua is ever wasted." },
  { id: 5, tag: "CHARACTER", title: "Gentleness Wins Hearts", emoji: ["🧑", "😡", "🌸", "🤝"],
    steps: ["One man spoke in anger 😡", "Another answered gently 🌸", "The anger cooled down", "They shook hands 🤝", "The Prophet ﷺ taught that gentleness beautifies everything"],
    lesson: "Allah loves gentleness in all matters.", reference: "Sahih Muslim 2594",
    narration: "One man spoke in anger. Another answered him gently, and the anger cooled down. They shook hands. The Prophet, peace be upon him, taught that gentleness beautifies everything it touches." },
  { id: 6, tag: "KINDNESS", title: "A Small Kindness Travels Far", emoji: ["👩", "🛍️", "🧓", "💛"],
    steps: ["A girl saw her neighbour carrying heavy bags 🛍️", "She was in a hurry, but she stopped", "She carried the bags to the door 🧓", "The neighbour smiled and made dua for her", "That little help made two hearts happy 💛"],
    lesson: "Do not belittle any act of kindness.", reference: "Sahih Muslim 2626",
    narration: "A girl saw her elderly neighbour carrying heavy bags. She was in a hurry, but she stopped and helped. The neighbour smiled and made dua for her. A small kindness made two hearts happy." },
  { id: 7, tag: "FORGIVENESS", title: "Forgive and Feel Light", emoji: ["🧒", "💔", "🕊️", "🤗"],
    steps: ["Two friends had an argument 💔", "Both stayed silent for days", "One of them decided to forgive first 🕊️", "He said salam and smiled", "The friendship was healed, and his heart felt light 🤗"],
    lesson: "Pardon and overlook. Would you not love Allah to forgive you?", reference: "Quran 24:22",
    narration: "Two friends had an argument and stayed silent for days. One of them decided to forgive first. He said salam and smiled. The friendship was healed, and his heart felt light." },
  { id: 8, tag: "HUMILITY", title: "The Tallest Tree Bends", emoji: ["🧑", "🌳", "🌬️", "🙇"],
    steps: ["A strong wind blew through the forest 🌬️", "The proud oak stood stiff and broke", "The humble grass bent low and stayed safe 🌱", "Humble people rise in Allah's sight", "Be humble, and Allah will raise you 🙇"],
    lesson: "Whoever humbles himself for Allah, Allah will raise him.", reference: "Sahih Muslim 2588",
    narration: "A strong wind blew through the forest. The proud oak stood stiff and broke, but the humble grass bent low and stayed safe. Whoever humbles himself for Allah, Allah will raise him." },
  { id: 9, tag: "PARENTS", title: "Paradise at Mother's Feet", emoji: ["👩‍👧", "🍲", "🤲", "🌹"],
    steps: ["A mother cooked for her children every day 🍲", "She rarely complained and never asked for thanks", "One day, her daughter hugged her and said thank you", "The mother raised her hands in dua 🤲", "A kind word to parents is worth more than gold 🌹"],
    lesson: "Be kind to your parents and speak to them gently.", reference: "Quran 17:23",
    narration: "A mother cooked for her children every day and never asked for thanks. One day her daughter hugged her and said thank you. The mother raised her hands in dua. Being kind to parents is one of the greatest acts of worship." },
  { id: 10, tag: "SHARING", title: "Even Half a Date Counts", emoji: ["🧒", "🌴", "🤝", "✨"],
    steps: ["A boy had only a few dates 🌴", "A hungry traveller passed by", "The boy shared half of what he had 🤝", "He felt happier than if he had eaten them all", "Small giving, given sincerely, is big in Allah's sight ✨"],
    lesson: "Protect yourself from the Fire, even with half a date.", reference: "Sahih al-Bukhari 1417",
    narration: "A boy had only a few dates. A hungry traveller passed by, and the boy shared half of what he had. He felt happier than if he had eaten them all. Even a small gift, given sincerely, is big in Allah's sight." },
  { id: 11, tag: "CLEANLINESS", title: "Remove Harm from the Path", emoji: ["👦", "🪨", "🧹", "⭐"],
    steps: ["Sharp stones lay across a busy path ⚠️", "Many people walked by without noticing", "A boy stopped his game and cleared them 🧹", "He remembered that removing harm is part of faith", "He felt the quiet joy of doing good ⭐"],
    lesson: "Removing harm from the road is an act of charity.", reference: "Sahih Muslim 1009",
    narration: "Sharp stones lay across a busy path. Many people walked by, but a boy stopped his game and cleared them away. He remembered that removing harm from the road is an act of charity, and he felt a quiet joy in his heart." },
  { id: 12, tag: "TRUST", title: "Keep Your Promise", emoji: ["🧒", "🤝", "🌧️", "✅"],
    steps: ["A boy promised to meet his friend at noon", "Then it started to rain 🌧️", "He could have stayed home, but he had given his word", "He arrived on time, soaked but smiling", "His friend trusted him even more after that ✅"],
    lesson: "Fulfil your promises. A promise is a responsibility.", reference: "Quran 17:34",
    narration: "A boy promised to meet his friend at noon. Then it started to rain. He could have stayed home, but he had given his word. He arrived on time, and his friend trusted him even more after that. Always keep your promises." },
  { id: 13, tag: "KNOWLEDGE", title: "Seek Knowledge Every Day", emoji: ["👧", "📖", "💡", "🌟"],
    steps: ["A girl read one page every night 📖", "Some days she felt too tired", "But she kept going, page after page", "Slowly, she began to understand more 💡", "A little each day became a big treasure 🌟"],
    lesson: "My Lord, increase me in knowledge.", reference: "Quran 20:114",
    narration: "A girl read one page every night. Some days she felt tired, but she kept going. Slowly she began to understand more. A little each day became a big treasure. Seek knowledge every day." },
  { id: 14, tag: "MERCY", title: "Be Kind to Animals", emoji: ["🧒", "🐱", "🥣", "💞"],
    steps: ["A thin little cat sat outside a shop 🐱", "Most people ignored it", "A boy brought it water and some food 🥣", "The cat purred and followed him with trust", "Allah rewards kindness to every living being 💞"],
    lesson: "There is a reward for kindness to every living creature.", reference: "Sahih al-Bukhari 2363",
    narration: "A thin little cat sat outside a shop. Most people ignored it, but a boy brought it water and some food. The cat purred and followed him with trust. There is a reward for kindness to every living creature." },
];

export const DAILY_GOOD = [
  { text: "Start your day with Bismillah. It brings blessing to everything you do.", ref: "Sunnah" },
  { text: "Smiling at your brother or sister is charity. Smile at someone today. 😊", ref: "Jami at-Tirmidhi 1956" },
  { text: "Serving your parents opens a door to Paradise. Speak to them kindly today.", ref: "Jami at-Tirmidhi 1900" },
  { text: "The best of you are those who learn the Quran and teach it.", ref: "Sahih al-Bukhari 5027" },
  { text: "Hearts find peace in remembering Allah. Say Astaghfirullah 100 times today.", ref: "Quran 13:28" },
  { text: "When you feel angry, make wudu. It helps the anger cool down.", ref: "Sunan Abi Dawud 4784" },
  { text: "Giving water to someone is ongoing charity. Help someone today.", ref: "Sunan Ibn Majah 3684" },
];

export const DHIKR = [
  { ar: "سُبْحَانَ اللَّهِ", en: "Glory be to Allah" },
  { ar: "الْحَمْدُ لِلَّهِ", en: "All praise belongs to Allah" },
  { ar: "اللَّهُ أَكْبَرُ", en: "Allah is the Greatest" },
  { ar: "أَسْتَغْفِرُ اللَّهَ", en: "I seek forgiveness from Allah" },
  { ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", en: "There is no deity worthy of worship except Allah" },
];

export const ADHKAR = [
  { title: "Glorify Allah", ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", en: "Glory and praise belong to Allah.", note: "Say 100 times in the morning and evening" },
  { title: "Seek forgiveness", ar: "أَسْتَغْفِرُ اللَّهَ", en: "I seek forgiveness from Allah.", note: "Repeat with sincerity" },
  { title: "Trust in Allah", ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", en: "Allah is sufficient for us, and He is the best disposer of affairs.", note: "Quran 3:173" },
  { title: "Before sleeping", ar: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", en: "In Your name, O Allah, I die and I live.", note: "Sahih al-Bukhari 6324" },
  { title: "Leaving home", ar: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ", en: "In the name of Allah, I trust in Allah.", note: "Sunan Abi Dawud 5095" },
];

export const LEARN = [
  { title: "Quran studies", icon: "۞", sub: "Understand the message of the Quran", body: "Begin with the meaning of Surah Al-Fatihah. Study the themes of worship, mercy, guidance and accountability. Read reliable tafsir alongside the Arabic text." },
  { title: "Seerah", icon: "☾", sub: "Life of Prophet Muhammad ﷺ", body: "Study the Prophet's early life, the first revelation, the migration to Madinah, the building of the Muslim community and his exemplary character." },
  { title: "Stories of the Prophets", icon: "✧", sub: "Lessons from the Prophets", body: "Explore the Quranic accounts of Adam, Nuh, Ibrahim, Musa, Isa and other Prophets. Reflect on faith, patience, courage and reliance upon Allah." },
  { title: "Arabic learning", icon: "ع", sub: "Letters, vocabulary and Quranic Arabic", body: "Start with Arabic letters and their written forms. Practise pronunciation, short vowels, long vowels and common Quranic vocabulary." },
  { title: "Aqeedah", icon: "◇", sub: "Foundations of Islamic belief", body: "Belief in Allah, His angels, His books, His messengers, the Last Day and divine decree. Use reliable introductory material and qualified teachers." },
  { title: "Fiqh", icon: "📖", sub: "Everyday Islamic practice", body: "Purification, prayer, fasting, charity and daily worship. Rulings can differ between schools, so consult a qualified scholar for personal questions." },
  { title: "Duas", icon: "🤲", sub: "Supplications from Quran and Sunnah", body: "Build a collection of authentic supplications for daily life. Learn their meanings, sources and the occasions in which they are narrated." },
];

export const RECITERS = [
  { id: "ar.alafasy", label: "Mishary Alafasy" },
  { id: "ar.husary", label: "Mahmoud Khalil Al-Husary" },
  { id: "ar.abdulbasitmurattal", label: "Abdul Basit (Murattal)" },
  { id: "ar.minshawi", label: "Mohamed Siddiq Al-Minshawi" },
];

export const TRANSLATIONS = [
  { id: "en.sahih", label: "English (Saheeh International)" },
  { id: "ur.jalandhry", label: "Urdu (Jalandhry)" },
  { id: "hi.hindi", label: "Hindi" },
];
