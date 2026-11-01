import { useMemo, useState } from "react";
import { OWN_PRODUCTS, STORE_CATEGORIES, STORE_ITEMS } from "../data/store";
import { CONFIG, amazonUrl } from "../config";

export function Store() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const items = useMemo(
    () => STORE_ITEMS.filter((i) => (cat === "All" || i.cat === cat) && `${i.name} ${i.tag} ${i.cat}`.toLowerCase().includes(q.toLowerCase())),
    [cat, q]
  );

  const buyOwn = (title: string, url: string) => {
    if (url) window.open(url, "_blank", "noopener");
  };

  return (
    <div className="screen">
      <header className="head">
        <span className="kicker">EVERYTHING FOR YOUR DEEN</span>
        <h2>Amanora Store</h2>
        <p className="muted">Books, prayer essentials, modest wear, gifts and more, all in one place.</p>
      </header>

      <input className="input" placeholder="Search the store" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {["All", ...STORE_CATEGORIES].map((c) => (
          <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {OWN_PRODUCTS.length > 0 && cat === "All" && !q && (
        <div className="card own">
          <small className="gold">FROM AMANORA</small>
          {OWN_PRODUCTS.map((p) => (
            <div key={p.id} className="list-row">
              <span className="tile-ic">{p.emoji}</span>
              <span className="grow"><b>{p.title}</b><small>{p.desc}</small></span>
              <button className="btn gold-btn" onClick={() => buyOwn(p.title, p.payUrl)}>{p.price} · Buy</button>
            </div>
          ))}
          {CONFIG.whatsapp && <small className="muted">After payment, we send your file on WhatsApp or email.</small>}
        </div>
      )}

      <div className="store-grid">
        {items.map((i) => (
          <a key={i.id} className="product" href={amazonUrl(i.q)} target="_blank" rel="sponsored noopener noreferrer">
            <span className="product-ic">{i.emoji}</span>
            <b>{i.name}</b>
            <small>{i.tag}</small>
            <span className="shop">Shop now ›</span>
          </a>
        ))}
      </div>
      {items.length === 0 && <p className="muted center">Nothing found. Try another search.</p>}

      <p className="note">
        {CONFIG.amazonTag
          ? "Links open our partner store. As an Amazon Associate we earn from qualifying purchases, at no extra cost to you."
          : "Links open our partner store in a new tab."}
      </p>
    </div>
  );
}
