import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, Dimensions, Easing, FlatList, ImageBackground, Platform,
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from "expo-audio";
import { VideoView, useVideoPlayer } from "expo-video";
import * as Speech from "expo-speech";

/* ============================== SELF-CONTAINED HELPERS (no ./src folder needed) ============================== */
type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
type Coordinates = { latitude: number; longitude: number; city: string };
type PrayerTime = { name: PrayerName; date: Date };
type AppSettings = { method: string };
const DEFAULT_SETTINGS: AppSettings = { method: "MuslimWorldLeague" };
const DEFAULT_COORDS: Coordinates = { latitude: 12.9716, longitude: 77.5946, city: "Bengaluru" };
const PRAYERS: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const METHOD_ID: Record<string, number> = { MuslimWorldLeague: 3, NorthAmerica: 2, Egyptian: 5, Karachi: 1 };

// Works on web and mobile: Alert.alert does nothing on web, so use window.alert there
const notify = (title: string, msg: string) => {
  if (Platform.OS === "web") (globalThis as any).alert?.(`${title}\n${msg}`);
  else Alert.alert(title, msg);
};

async function fetchPrayerTimes(loc: Coordinates, cfg: AppSettings, date: Date): Promise<PrayerTime[]> {
  const d = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  const url = `https://api.aladhan.com/v1/timings/${d}?latitude=${loc.latitude}&longitude=${loc.longitude}&method=${METHOD_ID[cfg.method] ?? 3}`;
  const res = await fetch(url);
  const json = await res.json();
  const tm = json?.data?.timings;
  if (!tm) throw new Error("Prayer times unavailable.");
  return PRAYERS.map(name => {
    const [h, m] = String(tm[name]).split(":").map(n => parseInt(n, 10));
    return { name, date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0) };
  });
}
const getNextPrayer = (times: PrayerTime[], now: Date) => times.find(p => p.date.getTime() > now.getTime()) || null;
const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatCountdown = (d: Date, now: Date) => {
  const sec = Math.max(0, Math.floor((d.getTime() - now.getTime()) / 1000));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s2 = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s2).padStart(2, "0")}`;
};
const getDeviceCoordinates = () => new Promise<Coordinates>((resolve, reject) => {
  const g = (globalThis as any).navigator?.geolocation;
  if (!g) return reject(new Error("Location is not available on this device."));
  g.getCurrentPosition(
    (p: any) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, city: "Your location" }),
    (e: any) => reject(new Error(e?.message || "Please allow location access.")),
    { timeout: 10000 },
  );
});
const loadSettings = async (): Promise<AppSettings> => {
  try { const v = await AsyncStorage.getItem("amanora-settings-v1"); return v ? { ...DEFAULT_SETTINGS, ...JSON.parse(v) } : DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; }
};
const saveSettings = async (v: AppSettings) => { try { await AsyncStorage.setItem("amanora-settings-v1", JSON.stringify(v)); } catch {} };
const loadLocation = async (): Promise<Coordinates | null> => {
  try { const v = await AsyncStorage.getItem("amanora-location-v1"); return v ? JSON.parse(v) : null; } catch { return null; }
};
const saveLocation = async (v: Coordinates) => { try { await AsyncStorage.setItem("amanora-location-v1", JSON.stringify(v)); } catch {} };

/* ============================== TYPES ============================== */
type Tab = "Home" | "Quran" | "Hadith" | "Shorts" | "Worship" | "Learn" | "More";
type Ayah = { number: number; numberInSurah: number; text: string; page: number; surah?: { englishName: string; name: string } };
type Surah = { number: number; englishName: string; englishNameTranslation: string; numberOfAyahs: number; name: string };

/* ============================== THEME ============================== */
const C = {
  bg: "#F6F3EA", panel: "#FFFFFF", panel2: "#E9F1EA", panel3: "#D7E7DA",
  gold: "#C9A24D", gold2: "#9A7432", text: "#173D33", muted: "#74857A",
  line: "#E4E8DD", mint: "#2F8F6B", white: "#FFFFFF", dark: "#0E2B24", red: "#B5594C",
  pink: "#F6E4E1", sky: "#E3F0F5", sand: "#F8EDD3",
};
const { width: W, height: H } = Dimensions.get("window");
const GARDEN = "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1400&q=85";
const STORAGE = {
  page: "amanora-quran-page-v1", tasbih: "amanora-tasbih-v1", bookmarks: "amanora-bookmarks-v1",
  lights: "amanora-prayers-v1", journal: "amanora-journal-v1",
};

/* ============================== CONTENT ============================== */
const HADITHS = [
  { id: 1, category: "Kindness", arabic: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ", meaning: "Whoever does not show mercy will not be shown mercy.", reference: "Sahih al-Bukhari 6013" },
  { id: 2, category: "Good character", arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", meaning: "A good word is charity.", reference: "Sahih al-Bukhari 2989" },
  { id: 3, category: "Gratitude", arabic: "مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ", meaning: "Whoever does not thank people has not thanked Allah.", reference: "Jami at-Tirmidhi 1954" },
  { id: 4, category: "Anger", arabic: "لَا تَغْضَبْ", meaning: "Do not become angry.", reference: "Sahih al-Bukhari 6116" },
  { id: 5, category: "Intentions", arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", meaning: "Actions are judged by intentions.", reference: "Sahih al-Bukhari 1" },
];

/**
 * DAILY GOOD THING - simple, step-by-step cartoon lessons (whiteboard teacher style).
 * Each lesson reveals one line at a time. For REAL video, put your own .mp4 link in `video`.
 */
const DEMO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const SHORTS = [
  {
    id: 1, tag: "PATIENCE", title: "Patience Always Pays Off", cartoon: ["🧒", "🌱", "⏳", "🌳"], video: DEMO_VIDEO,
    steps: ["A boy planted a tiny seed 🌱", "He watered it every day, but nothing happened ⏳", "He felt like giving up... but he stayed patient", "Days later, the first leaf appeared 🌿", "That little seed grew into a tall, shady tree 🌳"],
    lesson: "Allah is with those who are patient.", reference: "Quran 2:153",
    narration: "A boy planted a tiny seed. He watered it every day, but nothing happened. He felt like giving up, but he stayed patient. Days later, the first leaf appeared, and in time the seed grew into a tall, shady tree. Patience always pays off. Allah is with those who are patient.",
  },
  {
    id: 2, tag: "HONESTY", title: "Be Honest, Find Peace", cartoon: ["👦", "👛", "🤔", "😊"], video: DEMO_VIDEO,
    steps: ["A boy found a wallet on the road 👛", "Nobody was watching 🤫", "But Allah sees everything 👁️", "He returned the wallet to its owner", "The owner prayed for him, and his heart felt calm 😊"],
    lesson: "Be honest, even when nobody is watching.", reference: "Quran 9:119",
    narration: "A boy found a wallet on the road. Nobody was watching. But he remembered that Allah sees everything. He returned the wallet to its owner. The owner prayed for him, and his heart felt calm. Honesty brings real peace.",
  },
  {
    id: 3, tag: "GRATITUDE", title: "Gratitude Grows Blessings", cartoon: ["👧", "🍞", "💧", "🤲"], video: DEMO_VIDEO,
    steps: ["A girl had one piece of bread 🍞", "She thought, this is so little", "Then she thought of people with no food at all", "She said Alhamdulillah 🤲", "Her heart felt full, and the meal felt blessed ✨"],
    lesson: "If you are grateful, I will give you more.", reference: "Quran 14:7",
    narration: "A girl had only one piece of bread. At first she thought it was too little. Then she remembered people who had no food at all. She said Alhamdulillah, and her heart felt full. Gratitude grows blessings.",
  },
  {
    id: 4, tag: "DUA", title: "No Dua Is Ever Wasted", cartoon: ["🧕", "🤲", "🌙", "⭐"], video: DEMO_VIDEO,
    steps: ["Everyone was asleep at night 🌙", "A sister raised her hands 🤲", "She spoke to Allah from her heart", "Sometimes the answer is quick, sometimes it is delayed", "Allah answers at the best time ⭐"],
    lesson: "Call upon Me, and I will respond to you.", reference: "Quran 40:60",
    narration: "Everyone was asleep. A sister raised her hands and spoke to Allah from her heart. Sometimes the answer comes quickly, and sometimes it is delayed, but Allah always answers at the best time. No dua is ever wasted.",
  },
  {
    id: 5, tag: "CHARACTER", title: "Gentleness Wins Hearts", cartoon: ["🧑", "😡", "🌸", "🤝"], video: DEMO_VIDEO,
    steps: ["One man spoke in anger 😡", "Another answered gently 🌸", "The anger cooled down", "They shook hands 🤝", "The Prophet ﷺ said gentleness beautifies everything"],
    lesson: "Allah loves gentleness in all matters.", reference: "Sahih Muslim 2594",
    narration: "One man spoke in anger. Another answered him gently, and the anger cooled down. They shook hands. The Prophet, peace be upon him, taught that gentleness beautifies everything it touches.",
  },
];

const DAILY_GOOD = [
  { title: "Today's good thing", text: "Start your day with Bismillah. It brings blessing to everything you do.", ref: "Sunnah" },
  { title: "Today's good thing", text: "Smiling at your brother or sister is charity. Smile at someone today. 😊", ref: "Jami at-Tirmidhi 1956" },
  { title: "Today's good thing", text: "Serving your parents opens a door to Paradise. Speak to them kindly today.", ref: "Jami at-Tirmidhi 1900" },
  { title: "Today's good thing", text: "The best of you are those who learn the Quran and teach it.", ref: "Sahih al-Bukhari 5027" },
  { title: "Today's good thing", text: "Hearts find peace in remembering Allah. Say Astaghfirullah 100 times today.", ref: "Quran 13:28" },
  { title: "Today's good thing", text: "When you feel angry, make wudu. It helps the anger cool down.", ref: "Sunan Abi Dawud 4784" },
  { title: "Today's good thing", text: "Giving water to someone is ongoing charity. Help someone today.", ref: "Sunan Ibn Majah 3684" },
];

const dhikrList = ["سُبْحَانَ اللَّهِ", "الْحَمْدُ لِلَّهِ", "اللَّهُ أَكْبَرُ", "أَسْتَغْفِرُ اللَّهَ", "لَا إِلَٰهَ إِلَّا اللَّهُ"];
const dhikrMeanings = ["Glory be to Allah", "All praise belongs to Allah", "Allah is the Greatest", "I seek forgiveness from Allah", "There is no deity worthy of worship except Allah"];

const ADHKAR = [
  { title: "Morning remembrance", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", meaning: "Glory and praise belong to Allah.", count: "Repeat 100 times" },
  { title: "Seeking forgiveness", arabic: "أَسْتَغْفِرُ اللَّهَ", meaning: "I seek forgiveness from Allah.", count: "Repeat with sincerity" },
  { title: "Trust in Allah", arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", meaning: "Allah is sufficient for us, and He is the best disposer of affairs.", count: "Quran 3:173" },
];

const LEARNING_HALLS = [
  { title: "Quran studies", icon: "۞", description: "Understand the message of the Quran", content: "Begin with the meaning of Surah Al-Fatihah. Study the themes of worship, mercy, guidance and accountability. Read reliable tafsir alongside the Arabic text." },
  { title: "Seerah", icon: "☾", description: "Life of Prophet Muhammad ﷺ", content: "Study the Prophet's early life, the first revelation, the migration to Madinah, the building of the Muslim community and his exemplary character." },
  { title: "Stories of the Prophets", icon: "✧", description: "Lessons from the Prophets", content: "Explore the Quranic accounts of Adam, Nuh, Ibrahim, Musa, Isa and other Prophets. Reflect on faith, patience, courage and reliance upon Allah." },
  { title: "Arabic learning", icon: "ع", description: "Letters, vocabulary and Quranic Arabic", content: "Start with Arabic letters and their written forms. Practise pronunciation, short vowels, long vowels and common Quranic vocabulary." },
  { title: "Aqeedah", icon: "◇", description: "Foundations of Islamic belief", content: "Belief in Allah, His angels, His books, His messengers, the Last Day and divine decree. Use reliable introductory material and qualified teachers." },
  { title: "Fiqh", icon: "📖", description: "Everyday Islamic practice", content: "Purification, prayer, fasting, charity and daily worship. Rulings can differ between schools, so consult a qualified scholar for personal questions." },
  { title: "Duas", icon: "🤲", description: "Supplications from Quran and Sunnah", content: "Build a collection of authentic supplications for daily life. Learn their meanings, sources and the occasions in which they are narrated." },
];

/* ============================== SMALL UI PIECES ============================== */
const Panel = ({ children, style }: { children: React.ReactNode; style?: any }) => <View style={[s.panel, style]}>{children}</View>;
const Heading = ({ children }: { children: React.ReactNode }) => <Text style={s.heading}>{children}</Text>;
const Kicker = ({ children }: { children: React.ReactNode }) => <Text style={s.kicker}>{children}</Text>;
const Action = ({ title, onPress, secondary }: { title: string; onPress: () => void; secondary?: boolean }) => (
  <TouchableOpacity onPress={onPress} style={[s.action, secondary && s.actionSecondary]} activeOpacity={0.8}>
    <Text style={[s.actionText, secondary && s.actionSecondaryText]}>{title}</Text>
  </TouchableOpacity>
);
const ScreenHeader = ({ kicker, title, sub }: { kicker: string; title: string; sub: string }) => (
  <View style={s.screenTop}>
    <Kicker>{kicker}</Kicker>
    <Text style={s.screenTitle}>{title}</Text>
    <Text style={s.body}>{sub}</Text>
  </View>
);

function VideoPane({ uri, active }: { uri: string; active: boolean }) {
  const player = useVideoPlayer(uri, p => { p.loop = true; });
  useEffect(() => { try { if (active) player.play(); else player.pause(); } catch {} }, [active, player]);
  return <VideoView player={player} style={s.video} contentFit="cover" nativeControls />;
}

/* ============================== SHORT CARD (video + cartoon board) ============================== */
function ShortCard({ item, active, height }: { item: (typeof SHORTS)[number]; active: boolean; height: number }) {
  const [step, setStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [mode, setMode] = useState<"cartoon" | "video">("cartoon");
  const bob = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;

  // Characters float up and down like a cartoon
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [bob]);

  // Board writes one line at a time (Abdul Bari style) while the card is on screen
  useEffect(() => {
    if (!active || mode !== "cartoon") { setStep(0); return; }
    setStep(0);
    const t = setInterval(() => setStep(v => (v < item.steps.length ? v + 1 : v)), 2200);
    return () => clearInterval(t);
  }, [active, mode, item.steps.length]);

  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [step, pop]);

  useEffect(() => { if (!active) { Speech.stop(); setSpeaking(false); } }, [active]);
  useEffect(() => () => { Speech.stop(); }, []);

  const toggleVoice = () => {
    if (speaking) { Speech.stop(); setSpeaking(false); return; }
    setSpeaking(true);
    Speech.speak(item.narration, { language: "en-US", rate: 0.9, onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  const emoji = item.cartoon[Math.min(step, item.cartoon.length - 1)];

  return (
    <View style={[s.shortCard, { height }]}>
      <View style={s.shortTop}>
        <View style={s.shortTag}><Text style={s.shortTagText}>{item.tag}</Text></View>
        <View style={s.modeSwitch}>
          <TouchableOpacity onPress={() => setMode("cartoon")} style={[s.modeBtn, mode === "cartoon" && s.modeBtnOn]}>
            <Text style={[s.modeText, mode === "cartoon" && s.modeTextOn]}>🎨 Cartoon</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { Speech.stop(); setSpeaking(false); setMode("video"); }} style={[s.modeBtn, mode === "video" && s.modeBtnOn]}>
            <Text style={[s.modeText, mode === "video" && s.modeTextOn]}>🎬 Video</Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === "video" ? (
        <View style={s.videoBox}>
          <VideoPane uri={item.video} active={active} />
        </View>
      ) : (
        <View style={s.board}>
          <Animated.Text style={[s.boardEmoji, {
            transform: [
              { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [6, -10] }) },
              { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
              { rotate: bob.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "4deg"] }) },
            ],
          }]}>{emoji}</Animated.Text>
          <Text style={s.boardTitle}>{item.title}</Text>
          <View style={s.boardLines}>
            {item.steps.slice(0, step + 1).map((line, i) => (
              <Text key={i} style={[s.boardLine, i === step && s.boardLineNow]}>{i + 1}. {line}</Text>
            ))}
          </View>
        </View>
      )}

      <View style={s.shortBottom}>
        <Text style={s.shortDaily}>DAILY GOOD THING</Text>
        <Text style={s.shortLesson}>{item.lesson}</Text>
        <Text style={s.shortRef}>{item.reference}</Text>
        <TouchableOpacity onPress={toggleVoice} style={s.shortPlay}>
          <Text style={s.shortPlayText}>{speaking ? "■ STOP STORY" : "▶ LISTEN TO STORY"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ============================== APP ============================== */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { err: string }> {
  state = { err: "" };
  static getDerivedStateFromError(e: any) { return { err: String(e?.message || e) }; }
  render() {
    if (this.state.err) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 24, paddingTop: 70 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#B5594C" }}>AMANORA error</Text>
          <Text selectable style={{ marginTop: 12, color: "#173D33" }}>{this.state.err}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (<ErrorBoundary><AppInner /></ErrorBoundary>);
}

function AppInner() {
  const [booting, setBooting] = useState(true);
  const [gateVisible, setGateVisible] = useState(true);
  const [tab, setTab] = useState<Tab>("Home");
  const [now, setNow] = useState(new Date());
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [times, setTimes] = useState<PrayerTime[]>([]);
  const [busy, setBusy] = useState(false);
  const [lights, setLights] = useState<Record<string, boolean>>({});
  const [tasbih, setTasbih] = useState(0);
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [journal, setJournal] = useState("");
  const [learningIndex, setLearningIndex] = useState<number | null>(null);

  // Quran
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<Ayah[]>([]);
  const [translationData, setTranslationData] = useState<Record<number, string>>({});
  const [translation, setTranslation] = useState("en.sahih");
  const [quranLoading, setQuranLoading] = useState(false);
  const [quranError, setQuranError] = useState("");
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [autoPlayAll, setAutoPlayAll] = useState(false);

  // Hadith
  const [hadithSpeaking, setHadithSpeaking] = useState<number | null>(null);

  // Shorts
  const [shortIndex, setShortIndex] = useState(0);

  const sound = useRef<AudioPlayer | null>(null);
  const queueRef = useRef<Ayah[]>([]);
  const flip = useRef(new Animated.Value(0)).current;
  const gateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const dailyBaat = useMemo(() => DAILY_GOOD[new Date().getDate() % DAILY_GOOD.length], []);
  const doneCount = Object.values(lights).filter(Boolean).length;

  /* ---------- prayer ---------- */
  const refreshPrayerData = useCallback(async (location: Coordinates, config: AppSettings) => {
    try { setTimes(await fetchPrayerTimes(location, config, new Date())); } catch { /* offline: keep old times */ }
  }, []);

  /* ---------- startup ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Make audio play even when the phone is on silent (iOS) and keep it clear
        await setAudioModeAsync({ playsInSilentMode: true });
      } catch {}
      try {
        const [cfg, loc, p, t, b, l, j] = await Promise.all([
          loadSettings(), loadLocation(),
          AsyncStorage.getItem(STORAGE.page), AsyncStorage.getItem(STORAGE.tasbih),
          AsyncStorage.getItem(STORAGE.bookmarks), AsyncStorage.getItem(STORAGE.lights), AsyncStorage.getItem(STORAGE.journal),
        ]);
        if (!alive) return;
        setSettings(cfg);
        const useLoc = loc || DEFAULT_COORDS; setCoords(useLoc); refreshPrayerData(useLoc, cfg);
        if (p) setPage(Math.max(1, Math.min(604, Number(p) || 1)));
        if (t) setTasbih(Number(t) || 0);
        if (b) setBookmarks(JSON.parse(b));
        if (l) { const x = JSON.parse(l); if (x.date === new Date().toDateString()) setLights(x.value); }
        if (j) setJournal(j);
      } catch (e) { console.warn("AMANORA startup", e); }
      finally { if (alive) setBooting(false); }
    })();
    const bootTimeout = setTimeout(() => { if (alive) setBooting(false); }, 3500);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => { alive = false; clearTimeout(bootTimeout); clearInterval(timer); try { sound.current?.remove(); } catch {} Speech.stop(); };
  }, [refreshPrayerData]);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah").then(r => r.json()).then(x => { if (x.code === 200) setSurahList(x.data); }).catch(() => {});
  }, []);

  // Pulse glow on the gate
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  const nextPrayer = useMemo(() => {
    const p = getNextPrayer(times, now);
    if (p) return p;
    if (!times.length) return null;
    return { name: times[0].name, date: new Date(times[0].date.getTime() + 86400000) }; // tomorrow's Fajr
  }, [times, now]);

  const locate = async () => {
    setBusy(true);
    try {
      const loc = await getDeviceCoordinates();
      setCoords(loc); await saveLocation(loc); await refreshPrayerData(loc, settings);
      notify("Location updated", `Prayer times calculated for ${loc.city}.`);
    } catch (e: any) { notify("Location unavailable", e?.message || "Please allow location access."); }
    finally { setBusy(false); }
  };
  const changeSettings = async (next: AppSettings) => { setSettings(next); await saveSettings(next); if (coords) await refreshPrayerData(coords, next); };
  const toggleLight = async (p: PrayerName) => {
    const next = { ...lights, [p]: !lights[p] };
    setLights(next);
    await AsyncStorage.setItem(STORAGE.lights, JSON.stringify({ date: new Date().toDateString(), value: next }));
  };

  /* ---------- Quran ---------- */
  const stopQuranAudio = useCallback(async () => {
    queueRef.current = [];
    setAutoPlayAll(false);
    setPlayingAyah(null);
    if (sound.current) { try { sound.current.remove(); } catch {} sound.current = null; }
  }, []);

  const loadPage = useCallback(async (n: number) => {
    const safe = Math.max(1, Math.min(604, n));
    setQuranLoading(true); setQuranError("");
    try {
      const [arabic, trans] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/page/${safe}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/page/${safe}/${translation}`),
      ]);
      if (!arabic.ok || !trans.ok) throw new Error("The Quran service could not be reached. Please try again.");
      const a = await arabic.json(), t = await trans.json();
      if (a.code !== 200 || t.code !== 200) throw new Error("Quran page is temporarily unavailable.");
      const map: Record<number, string> = {};
      (t.data.ayahs as any[]).forEach(v => (map[v.number] = v.text));
      setPageData(a.data.ayahs); setTranslationData(map); setPage(safe);
      await AsyncStorage.setItem(STORAGE.page, String(safe));
    } catch (e: any) { setQuranError(e?.message || "Unable to load Quran page."); }
    finally { setQuranLoading(false); }
  }, [translation]);

  useEffect(() => { if (tab === "Quran") loadPage(page); /* eslint-disable-next-line */ }, [tab, translation]);

  const changePage = (n: number) => {
    stopQuranAudio();
    Animated.sequence([
      Animated.timing(flip, { toValue: 1, duration: 130, useNativeDriver: true }),
      Animated.timing(flip, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    loadPage(n);
  };

  const toggleBookmark = async (num: number) => {
    const next = bookmarks.includes(num) ? bookmarks.filter(x => x !== num) : [...bookmarks, num];
    setBookmarks(next);
    await AsyncStorage.setItem(STORAGE.bookmarks, JSON.stringify(next));
  };

  // Plays one ayah, then (if the queue has more) continues to the next automatically
  const playAyah = useCallback(async (ayah: Ayah, queue: Ayah[] = []) => {
    try {
      if (sound.current) { try { sound.current.remove(); } catch {} sound.current = null; }
      setPlayingAyah(ayah.number);
      queueRef.current = queue;
      const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
      const player = createAudioPlayer({ uri: url });
      sound.current = player;
      let finished = false;
      player.addListener("playbackStatusUpdate", (status: any) => {
        if (status?.didJustFinish && !finished) {
          finished = true;
          try { player.remove(); } catch {}
          if (sound.current === player) sound.current = null;
          const [next, ...rest] = queueRef.current;
          if (next) playAyah(next, rest);
          else { setPlayingAyah(null); setAutoPlayAll(false); }
        }
      });
      player.play();
    } catch {
      setPlayingAyah(null); setAutoPlayAll(false);
      notify("Recitation unavailable", "Please check your internet connection and try again.");
    }
  }, []);

  const toggleAyah = (ayah: Ayah) => {
    if (playingAyah === ayah.number) stopQuranAudio();
    else playAyah(ayah, []);
  };

  const togglePlayPage = () => {
    if (autoPlayAll || playingAyah) { stopQuranAudio(); return; }
    if (!pageData.length) return;
    setAutoPlayAll(true);
    const [first, ...rest] = pageData;
    playAyah(first, rest);
  };

  const openSurah = async (id: number) => {
    setShowSurahPicker(false); stopQuranAudio(); setQuranLoading(true); setQuranError("");
    try {
      const [ar, tr] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${id}/quran-uthmani`),
        fetch(`https://api.alquran.cloud/v1/surah/${id}/${translation}`),
      ]);
      const a = await ar.json(), t = await tr.json();
      if (a.code !== 200 || t.code !== 200) throw new Error("Could not load this Surah.");
      const map: Record<number, string> = {};
      (t.data.ayahs as any[]).forEach(v => (map[v.number] = v.text));
      const ayahs: Ayah[] = (a.data.ayahs as any[]).map(x => ({ ...x, surah: { englishName: a.data.englishName, name: a.data.name } }));
      setPageData(ayahs); setTranslationData(map);
      const pg = ayahs[0]?.page || 1;
      setPage(pg);
      await AsyncStorage.setItem(STORAGE.page, String(pg));
    } catch (e: any) { notify("Quran", e?.message || "Unable to open Surah."); }
    finally { setQuranLoading(false); }
  };

  /* ---------- Hadith / speech ---------- */
  const speakText = (text: string, onDone?: () => void, language = "en") => {
    Speech.stop();
    Speech.speak(text, { language, rate: 0.9, onDone: () => onDone?.(), onStopped: () => onDone?.(), onError: () => onDone?.() });
  };

  // Hadith: Arabic first, then English meaning, so it truly "plays"
  const playHadith = (i: number) => {
    if (hadithSpeaking === i) { Speech.stop(); setHadithSpeaking(null); return; }
    const h = HADITHS[i];
    setHadithSpeaking(i);
    Speech.stop();
    Speech.speak(h.arabic, {
      language: "ar-SA", rate: 0.8,
      onDone: () => speakText(`${h.meaning}. ${h.reference}.`, () => setHadithSpeaking(null), "en"),
      onStopped: () => {},
      onError: () => speakText(`${h.meaning}. ${h.reference}.`, () => setHadithSpeaking(null), "en"),
    });
  };

  /* ---------- Jannah gate ---------- */
  const openJannahGate = () => {
    Animated.sequence([
      Animated.timing(gateAnim, { toValue: 1, duration: 2600, easing: Easing.bezier(0.22, 0.61, 0.36, 1), useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start(() => setGateVisible(false));
  };

  /* ---------- shared pieces ---------- */
  const prayerRows = () => (
    <View>
      {(PRAYERS as any[]).map((p: any) => (
        <View key={p} style={s.prayerRow}>
          <Text style={s.prayerName}>{p}</Text>
          <TouchableOpacity onPress={() => toggleLight(p)} style={[s.prayerCheck, lights[p] && s.prayerChecked]}>
            <Text style={[s.prayerCheckText, lights[p] && { color: C.white }]}>{lights[p] ? "✓" : "○"}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const hero = (title: string, subtitle: string) => (
    <ImageBackground source={{ uri: GARDEN }} imageStyle={s.heroImage} style={s.hero}>
      <View style={s.heroShade}>
        <Text style={s.heroBrand}>AMANORA · YOUR JOURNEY OF NOOR</Text>
        <Text style={s.heroTitle}>{title}</Text>
        <Text style={s.heroSub}>{subtitle}</Text>
      </View>
    </ImageBackground>
  );

  const miniHero = (brand: string, arabic: string, sub: string, style?: any) => (
    <ImageBackground source={{ uri: GARDEN }} imageStyle={s.heroImage} style={[s.miniHero, style]}>
      <View style={s.heroShade}>
        <Text style={s.heroBrand}>{brand}</Text>
        <Text style={s.heroTitleSm}>{arabic}</Text>
        <Text style={s.heroSub}>{sub}</Text>
      </View>
    </ImageBackground>
  );

  /* ============================== SCREENS ============================== */
  const renderHome = () => (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.top}>
        <View>
          <Text style={s.hello}>Assalamu Alaikum 🌙</Text>
          <Text style={s.location}>{coords?.city || "Your spiritual sanctuary"}</Text>
        </View>
        <TouchableOpacity onPress={() => setTab("More")} style={s.profile}><Text style={{ fontSize: 22, color: C.gold2 }}>☾</Text></TouchableOpacity>
      </View>

      {/* Next prayer card */}
      <View style={s.prayerHero}>
        <Text style={s.prayerHeroOver}>NEXT PRAYER</Text>
        <View style={s.between}>
          <View>
            <Text style={s.prayerHeroName}>{nextPrayer?.name || "Prayer times"}</Text>
            <Text style={s.prayerHeroAt}>{nextPrayer ? formatTime(nextPrayer.date) : "Set your location"}</Text>
          </View>
          <View style={s.countCircle}>
            <Text style={s.countText}>{nextPrayer ? formatCountdown(nextPrayer.date, now) : "--:--"}</Text>
            <Text style={s.countLabel}>LEFT</Text>
          </View>
        </View>
        <TouchableOpacity onPress={locate} style={s.prayerHeroBtn}>
          <Text style={s.prayerHeroBtnText}>{busy ? "Finding location…" : coords ? "↻ Refresh location" : "📍 Set my location"}</Text>
        </TouchableOpacity>
      </View>

      {/* Daily good thing */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => setTab("Shorts")} style={s.dailyCard}>
        <Text style={s.dailyKicker}>✨ {dailyBaat.title.toUpperCase()}</Text>
        <Text style={s.dailyText}>{dailyBaat.text}</Text>
        <View style={s.between}>
          <Text style={s.dailyRef}>{dailyBaat.ref}</Text>
          <Text style={s.dailyLink}>Watch cartoon ▶</Text>
        </View>
      </TouchableOpacity>

      {/* Quick grid */}
      <View style={s.quickGrid}>
        {([
          { t: "Quran", i: "📖", c: C.panel2, tab: "Quran" },
          { t: "Hadith", i: "🕌", c: C.sand, tab: "Hadith" },
          { t: "Shorts", i: "🎬", c: C.pink, tab: "Shorts" },
          { t: "Dhikr", i: "📿", c: C.sky, tab: "Worship" },
          { t: "Learn", i: "🎓", c: C.panel3, tab: "Learn" },
          { t: "Journal", i: "💗", c: C.pink, tab: "More" },
        ] as { t: string; i: string; c: string; tab: Tab }[]).map(x => (
          <TouchableOpacity key={x.t} onPress={() => setTab(x.tab)} style={s.quickItem}>
            <View style={[s.quickIcon, { backgroundColor: x.c }]}><Text style={{ fontSize: 26 }}>{x.i}</Text></View>
            <Text style={s.quickLabel}>{x.t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Panel>
        <View style={s.between}>
          <Heading>Today's prayers</Heading>
          <Text style={s.chip}>{doneCount}/5</Text>
        </View>
        {prayerRows()}
        <View style={s.progress}><View style={[s.progressFill, { width: `${doneCount * 20}%` }]} /></View>
      </Panel>

      <ImageBackground source={{ uri: GARDEN }} imageStyle={s.heroImage} style={s.quoteBanner}>
        <View style={s.quoteShade}>
          <Text style={s.quoteArabic}>فَاذْكُرُونِي أَذْكُرْكُمْ</Text>
          <Text style={s.quoteText}>“Remember Me; I will remember you.”</Text>
          <Text style={s.quoteRef}>QURAN 2:152</Text>
        </View>
      </ImageBackground>
    </ScrollView>
  );

  const renderQuran = () => (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader kicker="THE NOBLE QURAN" title="Quran" sub="Read, listen and reflect." />
      {miniHero("AL-QURAN AL-KAREEM", "نورٌ على نور", "Light upon light")}

      <View style={s.between}>
        <TouchableOpacity onPress={() => setShowSurahPicker(!showSurahPicker)} style={s.selectButton}>
          <Text style={s.selectLabel}>CHOOSE SURAH</Text>
          <Text style={s.selectValue} numberOfLines={1}>{pageData[0]?.surah?.englishName || "Al-Fatihah"} ⌄</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTranslation(v => (v === "en.sahih" ? "ur.jalandhry" : v === "ur.jalandhry" ? "hi.hindi" : "en.sahih"))} style={s.selectButton}>
          <Text style={s.selectLabel}>TRANSLATION</Text>
          <Text style={s.selectValue}>{translation === "en.sahih" ? "English" : translation === "ur.jalandhry" ? "Urdu" : "Hindi"} ↻</Text>
        </TouchableOpacity>
      </View>

      {showSurahPicker ? (
        <Panel>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by Surah name or number" placeholderTextColor={C.muted} style={s.input} />
          <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
            {surahList.filter(x => `${x.englishName} ${x.name} ${x.number}`.toLowerCase().includes(search.toLowerCase())).map(x => (
              <TouchableOpacity key={x.number} onPress={() => { setSearch(""); openSurah(x.number); }} style={s.surahItem}>
                <Text style={s.surahNum}>{String(x.number).padStart(3, "0")}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.surahName}>{x.englishName}</Text>
                  <Text style={s.surahMeta}>{x.englishNameTranslation} · {x.numberOfAyahs} verses</Text>
                </View>
                <Text style={s.arabicName}>{x.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Panel>
      ) : null}

      {/* Play whole page */}
      <TouchableOpacity onPress={togglePlayPage} style={[s.playAll, (autoPlayAll || playingAyah) && { backgroundColor: C.red }]}>
        <Text style={s.playAllText}>{autoPlayAll || playingAyah ? "■  STOP RECITATION" : "▶  PLAY FULL PAGE (Mishary Alafasy)"}</Text>
      </TouchableOpacity>

      <View style={s.mushafToolbar}>
        <Text style={s.mushafPage}>Page {page} <Text style={s.mushafOf}>/ 604</Text></Text>
        <View style={s.row}>
          <TouchableOpacity onPress={() => changePage(page - 1)} disabled={page === 1} style={s.pageButton}><Text style={s.pageButtonText}>‹ PREV</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => changePage(page + 1)} disabled={page === 604} style={s.pageButton}><Text style={s.pageButtonText}>NEXT ›</Text></TouchableOpacity>
        </View>
      </View>

      <Animated.View style={[s.mushaf, { transform: [{ perspective: 900 }, { rotateY: flip.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-8deg"] }) }] }]}>
        <View style={s.mushafBorder}>
          <View style={s.mushafInner}>
            <Text style={s.mushafTop}>۞ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۞</Text>
            {quranLoading ? (
              <ActivityIndicator color={C.gold} size="large" style={{ margin: 40 }} />
            ) : quranError ? (
              <View style={{ padding: 20 }}>
                <Text style={s.error}>{quranError}</Text>
                <Action title="TRY AGAIN" onPress={() => loadPage(page)} />
              </View>
            ) : (
              pageData.map(a => {
                const playing = playingAyah === a.number;
                return (
                  <View key={a.number} style={[s.ayahBlock, playing && s.ayahPlaying]}>
                    <Text style={s.ayahArabic}>{a.text} <Text style={s.ayahNumber}>۝{a.numberInSurah}</Text></Text>
                    <Text style={s.ayahTranslation}>{translationData[a.number] || ""}</Text>
                    <View style={s.ayahActions}>
                      <TouchableOpacity onPress={() => toggleAyah(a)} style={[s.ayahBtn, playing && { backgroundColor: C.mint }]}>
                        <Text style={[s.ayahBtnText, playing && { color: C.white }]}>{playing ? "■ STOP" : "▶ PLAY"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => toggleBookmark(a.number)} style={s.ayahBtn}>
                        <Text style={s.ayahBtnText}>{bookmarks.includes(a.number) ? "★ SAVED" : "☆ SAVE"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
            <Text style={s.mushafBottom}>✧ {page} ✧</Text>
          </View>
        </View>
      </Animated.View>

      <View style={s.between}>
        <View style={{ flex: 1 }}><Action title="‹ Previous" secondary onPress={() => changePage(page - 1)} /></View>
        <View style={{ flex: 1 }}><Action title="Next ›" onPress={() => changePage(page + 1)} /></View>
      </View>
      <Text style={s.note}>Quran text and audio come from AlQuran Cloud and Islamic Network. An internet connection is required.</Text>
    </ScrollView>
  );

  const renderHadith = () => (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader kicker="WORDS OF THE PROPHET ﷺ" title="Hadith" sub="Read and listen: Arabic first, then the meaning." />
      {miniHero("THE SUNNAH", "أَخْلَاقٌ نَبَوِيَّة", "Beautiful character, beautiful living.")}
      {HADITHS.map((h, i) => (
        <View key={h.id} style={s.hadithCard}>
          <View style={s.between}>
            <Text style={s.hadithCategory}>{h.category.toUpperCase()}</Text>
            <Text style={s.mutedTiny}>{i + 1}/{HADITHS.length}</Text>
          </View>
          <Text style={s.hadithArabic}>{h.arabic}</Text>
          <Text style={s.hadithMeaning}>{h.meaning}</Text>
          <Text style={s.hadithReference}>{h.reference}</Text>
          <TouchableOpacity onPress={() => playHadith(i)} style={[s.listenButton, hadithSpeaking === i && { backgroundColor: C.red }]}>
            <Text style={s.listenText}>{hadithSpeaking === i ? "■ STOP" : "▶ PLAY HADITH"}</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={s.note}>Audio uses your device’s voice. If you hear no Arabic voice, install Arabic in your phone’s Text-to-Speech settings. Check the original collection for full context.</Text>
    </ScrollView>
  );

  const renderShorts = () => {
    const cardH = H - (Platform.OS === "ios" ? 150 : 120);
    return (
      <View style={s.shortsScreen}>
        <View style={s.shortsHeader}>
          <TouchableOpacity onPress={() => { Speech.stop(); setTab("Home"); }}><Text style={s.shortsBack}>‹</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.shortsTitle}>DEEN SHORTS</Text>
            <Text style={s.shortsSubtitle}>Daily good thing · swipe up ↑</Text>
          </View>
          <Text style={s.shortsMoon}>☾</Text>
        </View>
        <FlatList
          data={SHORTS}
          keyExtractor={x => String(x.id)}
          pagingEnabled
          snapToInterval={cardH}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={e => setShortIndex(Math.round(e.nativeEvent.contentOffset.y / cardH))}
          getItemLayout={(_, index) => ({ length: cardH, offset: cardH * index, index })}
          renderItem={({ item, index }) => <ShortCard item={item} active={tab === "Shorts" && index === shortIndex} height={cardH} />}
        />
      </View>
    );
  };

  const renderWorship = () => (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader kicker="YOUR DAILY CONNECTION" title="Worship" sub="Small acts of worship, done with sincere intention." />
      {miniHero("REMEMBER ALLAH", "أَلَا بِذِكْرِ اللَّهِ", "Hearts find tranquillity in remembrance of Allah.")}
      <Panel style={{ alignItems: "center" }}>
        <Text style={s.overline}>TASBIH COUNTER</Text>
        <Text style={s.tasbihArabic}>{dhikrList[dhikrIndex]}</Text>
        <Text style={s.tasbihMeaning}>{dhikrMeanings[dhikrIndex]}</Text>
        <TouchableOpacity
          onPress={async () => { const n = tasbih + 1; setTasbih(n); await AsyncStorage.setItem(STORAGE.tasbih, String(n)); }}
          style={s.tasbihButton}
        >
          <Text style={s.tasbihCount}>{tasbih}</Text>
          <Text style={s.tasbihTap}>TAP</Text>
        </TouchableOpacity>
        <View style={[s.between, { alignSelf: "stretch" }]}>
          <TouchableOpacity onPress={() => setDhikrIndex((dhikrIndex + 1) % dhikrList.length)}><Text style={s.link}>CHANGE DHIKR ↻</Text></TouchableOpacity>
          <TouchableOpacity onPress={async () => { setTasbih(0); await AsyncStorage.setItem(STORAGE.tasbih, "0"); }}><Text style={s.link}>RESET ↺</Text></TouchableOpacity>
        </View>
        <View style={[s.progress, { alignSelf: "stretch" }]}><View style={[s.progressFill, { width: `${Math.min(100, (tasbih / 33) * 100)}%` }]} /></View>
        <Text style={s.mutedTiny}>GOAL {Math.min(tasbih, 33)} / 33</Text>
      </Panel>
      <Panel>
        <Heading>Daily adhkar</Heading>
        {ADHKAR.map(a => (
          <View key={a.title} style={s.adhkarRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.adhkarTitle}>{a.title}</Text>
              <Text style={s.adhkarArabic}>{a.arabic}</Text>
              <Text style={s.adhkarMeaning}>{a.meaning}</Text>
              <Text style={s.mutedTiny}>{a.count}</Text>
            </View>
            <TouchableOpacity onPress={() => { Speech.stop(); Speech.speak(a.arabic, { language: "ar-SA", rate: 0.8 }); }} style={s.adhkarListen}>
              <Text style={s.adhkarListenText}>▶</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Panel>
      <Panel><Heading>Prayer rhythm</Heading>{prayerRows()}</Panel>
    </ScrollView>
  );

  const renderLearn = () => (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader kicker="GROW IN KNOWLEDGE" title="Learn" sub="Gain knowledge, step by step." />
      {miniHero("SEEK KNOWLEDGE", "اقْرَأْ", "Read. Reflect. Understand. Practice.")}
      {LEARNING_HALLS.map((hall, i) => (
        <TouchableOpacity key={hall.title} onPress={() => setLearningIndex(learningIndex === i ? null : i)} style={s.learningHall}>
          <View style={s.learningIconBox}><Text style={s.learningIcon}>{hall.icon}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.learningTitle}>{hall.title}</Text>
            <Text style={s.learningDesc}>{hall.description}</Text>
            {learningIndex === i ? <Text style={s.learningDetail}>{hall.content}</Text> : null}
          </View>
          <Text style={s.learningArrow}>{learningIndex === i ? "⌃" : "⌄"}</Text>
        </TouchableOpacity>
      ))}
      <Panel>
        <Heading>Daily reflection</Heading>
        <Text style={s.reflectionArabic}>وَقُل رَّبِّ زِدْنِي عِلْمًا</Text>
        <Text style={s.reflectionMeaning}>“My Lord, increase me in knowledge.”</Text>
        <Text style={s.hadithReference}>QURAN 20:114</Text>
      </Panel>
    </ScrollView>
  );

  const renderMore = () => (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader kicker="YOUR PERSONAL SANCTUARY" title="My Space" sub="A private place for dua, gratitude and reflection." />
      {miniHero("A MOMENT FOR YOURSELF", "سَكِينَة", "Find peace in remembering Allah.")}
      <Panel>
        <Heading>My private journal</Heading>
        <TextInput value={journal} onChangeText={setJournal} placeholder="Today, I am grateful for..." placeholderTextColor={C.muted} multiline textAlignVertical="top" style={[s.input, { height: 145 }]} />
        <Action title="SAVE MY REFLECTION" onPress={async () => {
          try { await AsyncStorage.setItem(STORAGE.journal, journal); notify("Saved", "Your journal has been saved on this device."); }
          catch { notify("Unable to save", "Please try again."); }
        }} />
      </Panel>
      <Panel>
        <Heading>Quran bookmarks</Heading>
        <Text style={s.body}>{bookmarks.length} saved ayahs</Text>
        {bookmarks.length === 0 ? <Text style={s.muted}>Saved ayahs yahan dikhengi.</Text> : bookmarks.map(n => (
          <TouchableOpacity key={n} onPress={() => setTab("Quran")}><Text style={s.bookmarkItem}>۞ Ayah reference {n} ›</Text></TouchableOpacity>
        ))}
      </Panel>
      <Panel>
        <Heading>Prayer settings</Heading>
        <Text style={s.settingLabel}>CALCULATION METHOD</Text>
        <View style={s.settingOptions}>
          {[{ label: "MWL", value: "MuslimWorldLeague" }, { label: "ISNA", value: "NorthAmerica" }, { label: "Egypt", value: "Egyptian" }, { label: "Karachi", value: "Karachi" }].map(x => (
            <TouchableOpacity key={x.value} onPress={() => changeSettings({ ...settings, method: x.value as any })} style={[s.settingChip, { backgroundColor: (settings as any).method === x.value ? C.text : C.panel2 }]}>
              <Text style={{ color: (settings as any).method === x.value ? C.white : C.text, fontSize: 11, fontWeight: "700" }}>{x.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Action title="REFRESH LOCATION" secondary onPress={locate} />
      </Panel>
      <Panel>
        <Heading>About AMANORA</Heading>
        <Text style={s.body}>AMANORA is a personal Islamic companion for the Quran, Hadith, dhikr and learning.</Text>
        <TouchableOpacity onPress={() => { Animated.timing(gateAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start(); contentAnim.setValue(0); setGateVisible(true); }}>
          <Text style={s.link}>WATCH THE JANNAH GATE AGAIN ✦</Text>
        </TouchableOpacity>
      </Panel>
    </ScrollView>
  );

  /* ---------- Jannah gate ---------- */
  const renderGate = () => (
    <View style={s.gateScreen}>
      <ImageBackground source={{ uri: GARDEN }} resizeMode="cover" style={s.gateBackground}>
        <View style={s.gateShade}>
          <Text style={s.gateTop}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          <Text style={s.gateBrand}>A M A N O R A</Text>
          <Text style={s.gateSubtitle}>YOUR JOURNEY OF NOOR</Text>

          <View style={s.gateWrap}>
            {/* Light behind the gates: Jannah glow */}
            <Animated.View style={[s.gateLight, {
              opacity: gateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [{ scale: gateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.6] }) }],
            }]} />
            <View style={s.gateArch}>
              <View style={s.gateArchInner}>
                <Text style={s.gateMoon}>☾</Text>
                <Text style={s.gateArabic}>سَلَامٌ عَلَيْكُمْ طِبْتُمْ فَادْخُلُوهَا خَالِدِينَ</Text>
                <Text style={s.gateWelcome}>The gates of Paradise are opening for you</Text>
                <Text style={s.gateDescription}>Quran · Sunnah · Worship · Knowledge</Text>
              </View>
              <View style={s.gateDoors} pointerEvents="none">
                <Animated.View style={[s.gateDoor, { borderRightWidth: 3, transform: [{ translateX: gateAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -W] }) }] }]}>
                  <Text style={s.gateDoorPattern}>۞</Text><Text style={s.gateDoorPattern}>✧</Text><Text style={s.gateDoorPattern}>۞</Text><Text style={s.gateKnob}>●</Text>
                </Animated.View>
                <Animated.View style={[s.gateDoor, { borderLeftWidth: 3, transform: [{ translateX: gateAnim.interpolate({ inputRange: [0, 1], outputRange: [0, W] }) }] }]}>
                  <Text style={s.gateDoorPattern}>۞</Text><Text style={s.gateDoorPattern}>✧</Text><Text style={s.gateDoorPattern}>۞</Text><Text style={s.gateKnob}>●</Text>
                </Animated.View>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={openJannahGate} style={s.enterButton} activeOpacity={0.85}>
            <Text style={s.enterButtonText}>ENTER AMANORA ✦</Text>
          </TouchableOpacity>
          <Text style={s.gateFoot}>TAP TO OPEN THE GATE OF JANNAH</Text>
        </View>
      </ImageBackground>
      {/* Soft white-gold flash as gates open */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#FFF6DC", opacity: contentAnim }]} />
    </View>
  );

  const currentScreen = () => {
    switch (tab) {
      case "Quran": return renderQuran();
      case "Hadith": return renderHadith();
      case "Shorts": return renderShorts();
      case "Worship": return renderWorship();
      case "Learn": return renderLearn();
      case "More": return renderMore();
      default: return renderHome();
    }
  };

  if (booting) {
    return (
      <View style={s.loadingScreen}>
        <Text style={s.brand}>AMANORA ✦</Text>
        <ActivityIndicator color={C.gold} size="large" />
        <Text style={s.body}>Preparing your sanctuary...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.app, Platform.OS === "web" && ({ height: "100vh" } as any), tab === "Shorts" && !gateVisible && { backgroundColor: C.dark }]}>
      <StatusBar barStyle={tab === "Shorts" && !gateVisible ? "light-content" : "dark-content"} backgroundColor={tab === "Shorts" ? C.dark : C.bg} />
      {!gateVisible ? (
        <>
          <View style={{ flex: 1 }}>{currentScreen()}</View>
          <View style={s.bottomNav}>
            {([
              { id: "Home", icon: "⌂", label: "Home" },
              { id: "Quran", icon: "۞", label: "Quran" },
              { id: "Hadith", icon: "▤", label: "Hadith" },
              { id: "Shorts", icon: "▶", label: "Shorts" },
              { id: "Worship", icon: "✧", label: "Dhikr" },
              { id: "More", icon: "♡", label: "Me" },
            ] as { id: Tab; icon: string; label: string }[]).map(x => (
              <TouchableOpacity key={x.id} onPress={() => { if (x.id !== "Shorts") Speech.stop(); setTab(x.id); }} style={s.navItem}>
                <Text style={[s.navIcon, { color: tab === x.id ? C.gold2 : C.muted }]}>{x.icon}</Text>
                <Text style={[s.navLabel, { color: tab === x.id ? C.text : C.muted }]}>{x.label}</Text>
                {tab === x.id ? <View style={s.navIndicator} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : renderGate()}
    </SafeAreaView>
  );
}

/* ============================== STYLES ============================== */
const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.bg },
  content: { padding: 18, paddingBottom: 35, gap: 16 },
  row: { flexDirection: "row", gap: 10 },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },

  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  hello: { color: C.text, fontSize: 21, fontWeight: "800" },
  brand: { color: C.text, fontSize: 23, fontWeight: "900", letterSpacing: 4 },
  location: { color: C.muted, fontSize: 12, marginTop: 3 },
  profile: { height: 44, width: 44, borderRadius: 22, backgroundColor: C.panel, borderWidth: 1, borderColor: C.gold, alignItems: "center", justifyContent: "center" },

  hero: { height: 205, borderRadius: 24, overflow: "hidden" },
  miniHero: { height: 150, borderRadius: 22, overflow: "hidden" },
  heroImage: { borderRadius: 22 },
  heroShade: { flex: 1, backgroundColor: "rgba(12,38,30,0.55)", padding: 20, justifyContent: "flex-end" },
  heroBrand: { color: "#E7CF9B", fontSize: 9, letterSpacing: 2.5, fontWeight: "800" },
  heroTitle: { color: C.white, fontSize: 30, fontWeight: "800", marginTop: 12 },
  heroTitleSm: { color: C.white, fontSize: 26, fontWeight: "800", marginTop: 8 },
  heroSub: { color: "#F4EDE0", fontSize: 12, marginTop: 6 },

  screenTop: { paddingTop: 4 },
  screenTitle: { color: C.text, fontSize: 28, fontWeight: "900", marginTop: 4 },
  body: { color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  note: { color: C.muted, fontSize: 11, lineHeight: 17, textAlign: "center" },
  error: { color: C.red, fontSize: 13, marginBottom: 10 },
  muted: { color: C.muted, fontSize: 12 },
  mutedTiny: { color: C.muted, fontSize: 10, letterSpacing: 1 },
  overline: { color: C.muted, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  kicker: { color: C.gold2, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  heading: { color: C.text, fontSize: 17, fontWeight: "800" },
  link: { color: C.gold2, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  chip: { backgroundColor: C.panel2, color: C.text, fontSize: 12, fontWeight: "800", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, overflow: "hidden" },

  panel: { backgroundColor: C.panel, borderRadius: 22, borderWidth: 1, borderColor: C.line, padding: 17, gap: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  action: { backgroundColor: C.text, borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  actionSecondary: { backgroundColor: C.panel2 },
  actionText: { color: C.white, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  actionSecondaryText: { color: C.text },
  input: { backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 13, color: C.text, fontSize: 14 },

  // Home
  prayerHero: { backgroundColor: C.text, borderRadius: 26, padding: 20, gap: 14 },
  prayerHeroOver: { color: "#E7CF9B", fontSize: 10, letterSpacing: 3, fontWeight: "800" },
  prayerHeroName: { color: C.white, fontSize: 32, fontWeight: "900" },
  prayerHeroAt: { color: "#D9E7DD", fontSize: 14, marginTop: 3 },
  countCircle: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: C.gold, alignItems: "center", justifyContent: "center" },
  countText: { color: C.white, fontSize: 16, fontWeight: "900" },
  countLabel: { color: "#E7CF9B", fontSize: 8, letterSpacing: 2, marginTop: 2 },
  prayerHeroBtn: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, paddingVertical: 11, alignItems: "center" },
  prayerHeroBtnText: { color: C.white, fontSize: 12, fontWeight: "700" },

  dailyCard: { backgroundColor: C.sand, borderRadius: 22, padding: 18, gap: 10, borderWidth: 1, borderColor: "#EAD9AA" },
  dailyKicker: { color: C.gold2, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  dailyText: { color: C.text, fontSize: 17, lineHeight: 25, fontWeight: "700" },
  dailyRef: { color: C.muted, fontSize: 10 },
  dailyLink: { color: C.gold2, fontSize: 12, fontWeight: "800" },

  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  quickItem: { width: "30%", alignItems: "center", gap: 7 },
  quickIcon: { width: 66, height: 66, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  quickLabel: { color: C.text, fontSize: 12, fontWeight: "700" },

  prayerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderColor: C.line },
  prayerName: { color: C.text, fontSize: 14, fontWeight: "700" },
  prayerCheck: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: C.gold, alignItems: "center", justifyContent: "center" },
  prayerChecked: { backgroundColor: C.mint, borderColor: C.mint },
  prayerCheckText: { color: C.gold2, fontWeight: "900" },
  progress: { height: 7, backgroundColor: C.panel2, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 7, backgroundColor: C.gold, borderRadius: 4 },

  quoteBanner: { height: 160, borderRadius: 22, overflow: "hidden" },
  quoteShade: { flex: 1, backgroundColor: "rgba(10,35,28,0.58)", padding: 18, justifyContent: "center", alignItems: "center" },
  quoteArabic: { color: C.white, fontSize: 24 },
  quoteText: { color: "#F4EDE0", fontSize: 13, marginTop: 8, textAlign: "center" },
  quoteRef: { color: "#E7CF9B", fontSize: 9, letterSpacing: 2, marginTop: 8 },

  // Quran
  selectButton: { flex: 1, backgroundColor: C.panel, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 12 },
  selectLabel: { color: C.muted, fontSize: 8, letterSpacing: 1.5, fontWeight: "800" },
  selectValue: { color: C.text, fontSize: 14, fontWeight: "800", marginTop: 4 },
  surahItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderColor: C.line },
  surahNum: { color: C.gold2, fontWeight: "900", fontSize: 12 },
  surahName: { color: C.text, fontWeight: "800", fontSize: 14 },
  surahMeta: { color: C.muted, fontSize: 10, marginTop: 2 },
  arabicName: { color: C.text, fontSize: 18 },
  playAll: { backgroundColor: C.mint, borderRadius: 18, paddingVertical: 15, alignItems: "center" },
  playAllText: { color: C.white, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  mushafToolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mushafPage: { color: C.text, fontSize: 18, fontWeight: "900" },
  mushafOf: { color: C.muted, fontSize: 12, fontWeight: "600" },
  pageButton: { backgroundColor: C.panel2, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  pageButtonText: { color: C.text, fontSize: 10, fontWeight: "800" },
  mushaf: { backgroundColor: "#FFFBEF", borderRadius: 20, padding: 6, borderWidth: 2, borderColor: C.gold },
  mushafBorder: { borderWidth: 1, borderColor: C.gold, borderRadius: 16, padding: 4 },
  mushafInner: { padding: 14 },
  mushafTop: { color: C.gold2, fontSize: 18, textAlign: "center", marginBottom: 12 },
  mushafBottom: { color: C.gold2, textAlign: "center", marginTop: 14 },
  ayahBlock: { paddingVertical: 14, borderBottomWidth: 1, borderColor: "#EFE5C8", borderRadius: 12 },
  ayahPlaying: { backgroundColor: "#E5F2E8", paddingHorizontal: 10 },
  ayahArabic: { color: C.text, fontSize: 26, lineHeight: 50, textAlign: "right" },
  ayahNumber: { color: C.gold2, fontSize: 20 },
  ayahTranslation: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  ayahActions: { flexDirection: "row", gap: 10, marginTop: 10 },
  ayahBtn: { backgroundColor: C.panel2, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  ayahBtnText: { color: C.text, fontSize: 10, fontWeight: "900", letterSpacing: 1 },

  // Hadith
  hadithCard: { backgroundColor: C.panel, borderRadius: 22, borderWidth: 1, borderColor: C.line, padding: 17, gap: 10 },
  hadithCategory: { color: C.gold2, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  hadithArabic: { color: C.text, fontSize: 24, lineHeight: 42, textAlign: "right" },
  hadithMeaning: { color: C.text, fontSize: 15, lineHeight: 22, fontWeight: "600" },
  hadithReference: { color: C.muted, fontSize: 10, letterSpacing: 1, textAlign: "center" },
  listenButton: { backgroundColor: C.mint, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  listenText: { color: C.white, fontSize: 11, fontWeight: "900", letterSpacing: 1 },

  // Shorts
  shortsScreen: { flex: 1, backgroundColor: C.dark },
  shortsHeader: { flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 16, paddingVertical: 10 },
  shortsBack: { color: C.white, fontSize: 32 },
  shortsTitle: { color: C.white, fontSize: 13, letterSpacing: 2, fontWeight: "900" },
  shortsSubtitle: { color: "#C7D0C4", fontSize: 10, marginTop: 3 },
  shortsMoon: { color: C.gold, fontSize: 26 },
  shortCard: { backgroundColor: C.dark, paddingHorizontal: 14, paddingBottom: 10, justifyContent: "space-between" },
  shortTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  shortTag: { backgroundColor: C.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  shortTagText: { color: C.dark, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  modeSwitch: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 3 },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 13 },
  modeBtnOn: { backgroundColor: C.white },
  modeText: { color: "#D9E7DD", fontSize: 11, fontWeight: "800" },
  modeTextOn: { color: C.dark },
  videoBox: { flex: 1, borderRadius: 24, overflow: "hidden", backgroundColor: "#000", marginVertical: 8, justifyContent: "center", padding: 16 },
  video: { ...StyleSheet.absoluteFillObject },
  board: { flex: 1, backgroundColor: "#FFFBEF", borderRadius: 24, marginVertical: 8, padding: 18, alignItems: "center", borderWidth: 3, borderColor: C.gold },
  boardEmoji: { fontSize: 86, marginTop: 4 },
  boardTitle: { color: C.text, fontSize: 21, fontWeight: "900", textAlign: "center", marginTop: 10 },
  boardLines: { alignSelf: "stretch", marginTop: 14, gap: 9 },
  boardLine: { color: "#4B5A52", fontSize: 15, lineHeight: 22 },
  boardLineNow: { color: C.text, fontWeight: "900", backgroundColor: "#FFF0B8", borderRadius: 8, overflow: "hidden", paddingHorizontal: 6 },
  shortSceneText: { color: C.white, fontSize: 13, lineHeight: 20, textAlign: "center" },
  shortBottom: { gap: 6, paddingBottom: 4 },
  shortDaily: { color: "#E9D19A", fontSize: 9, letterSpacing: 2, fontWeight: "900" },
  shortLesson: { color: C.white, fontSize: 18, lineHeight: 25, fontWeight: "800" },
  shortRef: { color: "#E5D7B6", fontSize: 10 },
  shortPlay: { backgroundColor: C.gold, borderRadius: 16, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  shortPlayText: { color: C.dark, fontSize: 12, fontWeight: "900", letterSpacing: 1 },

  // Worship
  tasbihArabic: { color: C.text, fontSize: 30, textAlign: "center", marginTop: 6 },
  tasbihMeaning: { color: C.muted, fontSize: 12, textAlign: "center" },
  tasbihButton: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, borderColor: C.gold, backgroundColor: C.text, justifyContent: "center", alignItems: "center", elevation: 5, marginVertical: 8 },
  tasbihCount: { color: C.white, fontSize: 52, fontWeight: "900" },
  tasbihTap: { color: "#E7D5A8", fontSize: 10, letterSpacing: 2 },
  adhkarRow: { flexDirection: "row", gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderColor: C.line },
  adhkarTitle: { color: C.text, fontWeight: "800", fontSize: 14 },
  adhkarArabic: { color: C.gold2, fontSize: 22, textAlign: "right", marginTop: 8 },
  adhkarMeaning: { color: C.muted, fontSize: 12, marginTop: 6 },
  adhkarListen: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.mint, alignItems: "center", justifyContent: "center" },
  adhkarListenText: { color: C.white, fontWeight: "900" },

  // Learn
  learningHall: { flexDirection: "row", alignItems: "flex-start", gap: 13, backgroundColor: C.panel, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 14 },
  learningIconBox: { width: 46, height: 46, borderRadius: 16, backgroundColor: C.panel2, alignItems: "center", justifyContent: "center" },
  learningIcon: { color: C.gold2, fontSize: 22 },
  learningTitle: { color: C.text, fontSize: 15, fontWeight: "800" },
  learningDesc: { color: C.muted, fontSize: 11, marginTop: 3 },
  learningDetail: { color: C.text, fontSize: 13, lineHeight: 21, marginTop: 10 },
  learningArrow: { color: C.gold2, fontSize: 18, marginTop: 6 },
  reflectionArabic: { color: C.gold2, fontSize: 25, textAlign: "center", marginTop: 8 },
  reflectionMeaning: { color: C.text, fontSize: 14, textAlign: "center" },

  // More
  bookmarkItem: { color: C.gold2, fontSize: 13, fontWeight: "700", paddingVertical: 10, borderBottomWidth: 1, borderColor: C.line },
  settingLabel: { color: C.muted, fontSize: 9, letterSpacing: 1, fontWeight: "800" },
  settingOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  settingChip: { borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15 },

  // Gate
  gateScreen: { flex: 1, backgroundColor: C.dark },
  gateBackground: { flex: 1 },
  gateShade: { flex: 1, backgroundColor: "rgba(8,30,24,0.7)", justifyContent: "center", alignItems: "center", padding: 20 },
  gateTop: { color: "#F1DDB2", fontSize: 20, marginBottom: 20 },
  gateBrand: { color: C.white, fontSize: 26, fontWeight: "900", letterSpacing: 9 },
  gateSubtitle: { color: "#E2C98E", fontSize: 9, letterSpacing: 4, marginTop: 9 },
  gateWrap: { width: "86%", maxWidth: 360, height: 340, marginTop: 24, alignItems: "center", justifyContent: "center" },
  gateLight: { position: "absolute", width: 300, height: 300, borderRadius: 150, backgroundColor: "#FFE9A8" },
  gateArch: { height: 330, width: "100%", borderTopLeftRadius: 180, borderTopRightRadius: 180, borderWidth: 3, borderColor: C.gold, overflow: "hidden", backgroundColor: "#FFF4D0" },
  gateArchInner: { flex: 1, justifyContent: "center", alignItems: "center", padding: 18 },
  gateMoon: { color: C.gold2, fontSize: 46 },
  gateArabic: { color: C.text, fontSize: 18, marginTop: 12, textAlign: "center", lineHeight: 30 },
  gateWelcome: { color: C.text, fontSize: 14, fontWeight: "800", marginTop: 12, textAlign: "center" },
  gateDescription: { color: C.gold2, fontSize: 10, marginTop: 8 },
  gateDoors: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  gateDoor: { width: "50%", height: "100%", backgroundColor: "#24503F", borderWidth: 2, borderColor: C.gold, justifyContent: "space-evenly", alignItems: "center" },
  gateDoorPattern: { color: "#D8B66F", fontSize: 38 },
  gateKnob: { color: C.gold, fontSize: 16 },
  enterButton: { marginTop: 24, backgroundColor: C.gold, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, elevation: 6 },
  enterButtonText: { color: C.dark, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  gateFoot: { color: "#E1D4B4", fontSize: 8, letterSpacing: 3, marginTop: 18 },

  loadingScreen: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", gap: 18 },
  bottomNav: { flexDirection: "row", backgroundColor: C.panel, borderTopWidth: 1, borderColor: C.line, paddingTop: 8, paddingBottom: Platform.OS === "ios" ? 15 : 8, justifyContent: "space-around" },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 9, fontWeight: "700" },
  navIndicator: { height: 3, width: 18, backgroundColor: C.gold, borderRadius: 3, marginTop: 2 },
});
