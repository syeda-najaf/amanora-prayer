export interface StoreItem { id: string; cat: string; name: string; emoji: string; tag: string; q: string }

export const STORE_CATEGORIES = ["Books", "Prayer", "Women", "Men", "Home & Gifts", "Kids", "Ramadan & Eid", "Umrah & Hajj"];

// Each item opens a search on your affiliate store. Add or edit items freely.
export const STORE_ITEMS: StoreItem[] = [
  // Books
  { id: "b1", cat: "Books", name: "Quran with translation", emoji: "📖", tag: "Arabic with a clear translation", q: "Quran with English translation" },
  { id: "b2", cat: "Books", name: "Tafsir Ibn Kathir", emoji: "📚", tag: "Classic explanation of the Quran", q: "Tafsir Ibn Kathir" },
  { id: "b3", cat: "Books", name: "Seerah: The Sealed Nectar", emoji: "🕌", tag: "Life of the Prophet ﷺ", q: "The Sealed Nectar Ar-Raheeq Al-Makhtum" },
  { id: "b4", cat: "Books", name: "Riyad as-Salihin", emoji: "📜", tag: "Gardens of the Righteous", q: "Riyad as-Salihin" },
  { id: "b5", cat: "Books", name: "Hisnul Muslim (duas)", emoji: "🤲", tag: "Fortress of the Muslim", q: "Hisnul Muslim Fortress of the Muslim dua book" },
  { id: "b6", cat: "Books", name: "Learn Quranic Arabic", emoji: "✍️", tag: "Start reading the Quran with meaning", q: "Learn Quranic Arabic book" },
  { id: "b7", cat: "Books", name: "Islamic story books", emoji: "🧒", tag: "Stories of the Prophets for children", q: "Islamic story books for kids Prophets" },
  // Prayer
  { id: "p1", cat: "Prayer", name: "Prayer mat", emoji: "🕌", tag: "Soft and padded", q: "prayer mat janamaz" },
  { id: "p2", cat: "Prayer", name: "Travel prayer mat", emoji: "🧳", tag: "Foldable with pouch", q: "foldable travel prayer mat" },
  { id: "p3", cat: "Prayer", name: "Tasbih / prayer beads", emoji: "📿", tag: "33 or 99 beads", q: "tasbih prayer beads 99" },
  { id: "p4", cat: "Prayer", name: "Digital tasbih counter", emoji: "🔢", tag: "Ring or finger counter", q: "digital tasbih counter ring" },
  { id: "p5", cat: "Prayer", name: "Quran stand (rehal)", emoji: "📖", tag: "Wooden folding stand", q: "Quran stand rehal wooden" },
  { id: "p6", cat: "Prayer", name: "Qibla compass", emoji: "🧭", tag: "Pocket Qibla finder", q: "Qibla compass" },
  // Women
  { id: "w1", cat: "Women", name: "Hijab", emoji: "🧕", tag: "Chiffon, jersey and cotton", q: "hijab women scarf" },
  { id: "w2", cat: "Women", name: "Abaya", emoji: "👗", tag: "Everyday and occasion wear", q: "abaya for women" },
  { id: "w3", cat: "Women", name: "Prayer dress (salah set)", emoji: "🧕", tag: "One-piece, easy to wear", q: "women prayer dress salah set" },
  { id: "w4", cat: "Women", name: "Modest maxi dress", emoji: "👗", tag: "Long and flowy", q: "modest long maxi dress women" },
  // Men
  { id: "m1", cat: "Men", name: "Kurta / Jubba", emoji: "👘", tag: "Comfortable for Jummah", q: "men kurta jubba thobe" },
  { id: "m2", cat: "Men", name: "Prayer cap (topi)", emoji: "🧢", tag: "Cotton and knitted", q: "namaz topi prayer cap men" },
  // Home & gifts
  { id: "h1", cat: "Home & Gifts", name: "Attar (ittar) perfume oil", emoji: "🌹", tag: "Alcohol-free fragrance", q: "attar ittar perfume oil alcohol free" },
  { id: "h2", cat: "Home & Gifts", name: "Bakhoor & incense burner", emoji: "🪔", tag: "Fill your home with scent", q: "bakhoor incense burner" },
  { id: "h3", cat: "Home & Gifts", name: "Islamic wall art", emoji: "🖼️", tag: "Ayat and calligraphy", q: "Islamic wall art calligraphy" },
  { id: "h4", cat: "Home & Gifts", name: "Dates (Ajwa, Medjool)", emoji: "🌴", tag: "Sunnah food", q: "Ajwa dates Medjool dates" },
  { id: "h5", cat: "Home & Gifts", name: "Islamic gift sets", emoji: "🎁", tag: "For weddings and birthdays", q: "Islamic gift set" },
  // Kids
  { id: "k1", cat: "Kids", name: "Learn-the-Quran toys", emoji: "🧸", tag: "Talking Quran learning toys", q: "kids Quran learning toy" },
  { id: "k2", cat: "Kids", name: "Islamic board games", emoji: "🎲", tag: "Fun family learning", q: "Islamic board game for kids" },
  { id: "k3", cat: "Kids", name: "Kids prayer mat", emoji: "🕌", tag: "Interactive salah mat", q: "kids prayer mat" },
  { id: "k4", cat: "Kids", name: "Dua flash cards", emoji: "🃏", tag: "Daily duas for children", q: "dua flash cards kids" },
  // Ramadan & Eid
  { id: "r1", cat: "Ramadan & Eid", name: "Ramadan planner", emoji: "🗓️", tag: "Track fasting, Quran and dua", q: "Ramadan planner journal" },
  { id: "r2", cat: "Ramadan & Eid", name: "Ramadan decorations", emoji: "🌙", tag: "Lanterns and lights", q: "Ramadan decorations lantern" },
  { id: "r3", cat: "Ramadan & Eid", name: "Eid gifts", emoji: "🎉", tag: "For family and friends", q: "Eid gifts" },
  // Umrah & Hajj
  { id: "u1", cat: "Umrah & Hajj", name: "Ihram set", emoji: "🕋", tag: "Two-piece ihram for men", q: "ihram set men" },
  { id: "u2", cat: "Umrah & Hajj", name: "Umrah / Hajj travel kit", emoji: "🧳", tag: "Everything for the trip", q: "Umrah Hajj travel kit" },
  { id: "u3", cat: "Umrah & Hajj", name: "Hajj & Umrah guide", emoji: "📕", tag: "Step-by-step guide book", q: "Hajj and Umrah guide book" },
];

/**
 * YOUR OWN PRODUCTS (digital: e-book, course, planner). Leave empty to hide this section.
 * Example:
 *   { id: "ebook1", title: "30-Day Quran Habit Planner", desc: "Printable PDF", price: "₹199",
 *     emoji: "📘", payUrl: "https://rzp.io/l/your-link" },
 */
export interface OwnProduct { id: string; title: string; desc: string; price: string; emoji: string; payUrl: string }
export const OWN_PRODUCTS: OwnProduct[] = [];
