import React, { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./UpiPayment.css";

type Plan = "monthly" | "yearly" | "support";

const UPI_ID = "syedaameenanajaf@naviaxis";
const PAYEE_NAME = "Amanora Prayer";

const PLANS: Record<Plan, { name: string; amount: number; period: string }> = {
  monthly: { name: "Amanora Plus Monthly", amount: 99, period: "per month" },
  yearly: { name: "Amanora Plus Yearly", amount: 799, period: "per year" },
  support: { name: "Support Amanora", amount: 100, period: "one-time" },
};

const QUICK_AMOUNTS = [51, 101, 251, 501];

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function UpiPayment({ initialPlan = "monthly", accountEmail = "" }: { initialPlan?: "monthly" | "yearly"; accountEmail?: string }) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  useEffect(() => { setPlan(initialPlan); }, [initialPlan]);
  const [customAmount, setCustomAmount] = useState("101");
  const [showQR, setShowQR] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  const amount = plan === "support" ? Number(customAmount) : PLANS[plan].amount;
  const validAmount =
    Number.isFinite(amount) &&
    Number.isInteger(amount) &&
    amount >= 1 &&
    amount <= 100000;

  const configured =
    UPI_ID.trim().length > 3 &&
    UPI_ID.includes("@") &&
    !UPI_ID.startsWith("YOUR_");

  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID.trim(),
      pn: PAYEE_NAME,
      am: validAmount ? amount.toFixed(2) : "0.00",
      cu: "INR",
      tn: `Amanora ${plan === "support" ? "support" : plan} ${accountEmail}`.trim().slice(0, 50),
    });
    return `upi://pay?${params.toString()}`;
  }, [amount, plan, validAmount, accountEmail]);

  const selectPlan = (nextPlan: Plan) => {
    setPlan(nextPlan);
    setNotice("");
  };

  const copyText = async (value: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const field = document.createElement("textarea");
        field.value = value;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copiedSuccessfully = document.execCommand("copy");
        document.body.removeChild(field);
        if (!copiedSuccessfully) throw new Error("Copy failed");
      }
      return true;
    } catch {
      return false;
    }
  };

  const copyUPI = async () => {
    const ok = await copyText(UPI_ID);
    setCopied(ok);
    setNotice(ok ? "UPI ID copied. Open your UPI app and pay the amount shown." : "Copy was blocked by this browser. You can select the UPI ID and copy it manually.");
    if (ok) window.setTimeout(() => setCopied(false), 2200);
  };

  const payNow = () => {
    if (!configured) {
      setNotice("Add your real UPI ID in UpiPayment.tsx before accepting payments.");
      return;
    }
    if (!validAmount) {
      setNotice("Enter a whole amount between ₹1 and ₹1,00,000.");
      return;
    }
    setNotice("Your UPI app is opening. Check the payee name and amount before entering your UPI PIN. Payment is not confirmed by Amanora automatically.");
    window.location.href = upiLink;
  };

  const sharePayment = async () => {
    if (!configured || !validAmount) {
      setNotice("Check the UPI ID and payment amount first.");
      return;
    }
    const text = `Amanora Prayer payment\nPlan: ${PLANS[plan].name}\nAmount: ${formatINR(amount)}\nUPI ID: ${UPI_ID}${accountEmail ? `\nMy Amanora account: ${accountEmail}` : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Amanora payment details", text });
      } else {
        const ok = await copyText(text);
        setNotice(ok ? "Payment details copied for sharing." : "Could not share payment details.");
      }
    } catch {
      setNotice("Sharing was cancelled.");
    }
  };

  return (
    <section className="amanora-upi" aria-labelledby="amanora-payment-title">
      <div className="au-container">
        <header className="au-hero">
          <div className="au-brand-mark" aria-hidden="true">
            <span>☾</span><i>✦</i>
          </div>
          <span className="au-overline">AMANORA COMMUNITY</span>
          <h1 id="amanora-payment-title">Amanora <span>Plus</span></h1>
          <p>A calmer space for worship, reflection and learning. Choose a membership or support the journey.</p>
          <div className="au-hero-ornament" aria-hidden="true"><span />✦<span /></div>
        </header>

        <section className="au-welcome">
          <div className="au-welcome-art" aria-hidden="true">
            <span className="au-welcome-moon">☾</span>
            <i className="au-star au-star-one">✦</i>
            <i className="au-star au-star-two">✧</i>
          </div>
          <div className="au-welcome-copy">
            <span className="au-small-label">A LITTLE SUPPORT, A BIGGER JOURNEY</span>
            <h2>Grow with intention.</h2>
            <p>Your contribution helps support the development and maintenance of Amanora.</p>
          </div>
        </section>

        <section className="au-section">
          <div className="au-section-heading">
            <div><span className="au-small-label">MEMBERSHIP OPTIONS</span><h2>Choose your plan</h2></div>
            <span className="au-heading-symbol" aria-hidden="true">✧</span>
          </div>

          <div className="au-plans">
            <button type="button" className={`au-plan ${plan === "monthly" ? "au-plan-selected" : ""}`} onClick={() => selectPlan("monthly")} aria-pressed={plan === "monthly"}>
              <span className="au-plan-symbol">☾</span>
              <span className="au-plan-details"><strong>Amanora Plus</strong><small>Monthly membership</small></span>
              <span className="au-plan-cost"><strong>₹99</strong><small>per month</small></span>
              <span className="au-select-circle">{plan === "monthly" ? "✓" : ""}</span>
            </button>

            <button type="button" className={`au-plan ${plan === "yearly" ? "au-plan-selected" : ""}`} onClick={() => selectPlan("yearly")} aria-pressed={plan === "yearly"}>
              <span className="au-plan-symbol au-gold-symbol">✧</span>
              <span className="au-plan-details"><strong>Amanora Plus</strong><small>Yearly membership</small><em>Save compared with monthly</em></span>
              <span className="au-plan-cost"><strong>₹799</strong><small>per year</small></span>
              <span className="au-select-circle">{plan === "yearly" ? "✓" : ""}</span>
            </button>

            <button type="button" className={`au-plan ${plan === "support" ? "au-plan-selected" : ""}`} onClick={() => selectPlan("support")} aria-pressed={plan === "support"}>
              <span className="au-plan-symbol">♡</span>
              <span className="au-plan-details"><strong>Support Amanora</strong><small>One-time contribution</small></span>
              <span className="au-plan-cost"><strong>Flexible</strong><small>your choice</small></span>
              <span className="au-select-circle">{plan === "support" ? "✓" : ""}</span>
            </button>
          </div>
        </section>

        {plan === "support" && (
          <section className="au-custom-amount">
            <label htmlFor="au-custom-amount">Choose your contribution</label>
            <div className="au-input-wrap"><span>₹</span><input id="au-custom-amount" type="number" inputMode="numeric" min="1" max="100000" step="1" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} placeholder="Enter amount" /></div>
            <div className="au-quick-amounts">
              {QUICK_AMOUNTS.map((value) => <button type="button" key={value} className={Number(customAmount) === value ? "au-quick-active" : ""} onClick={() => setCustomAmount(String(value))}>₹{value}</button>)}
            </div>
          </section>
        )}

        <section className="au-checkout">
          <div className="au-checkout-heading">
            <div><span className="au-checkout-label">PAYMENT SUMMARY</span><h2>Ready when you are</h2></div>
            <span className="au-checkout-icon" aria-hidden="true">₹</span>
          </div>
          <div className="au-order-line"><span>{PLANS[plan].name}</span><strong>{validAmount ? formatINR(amount) : "Invalid amount"}</strong></div>
          <div className="au-order-divider" />
          <div className="au-total-line"><span>Total payable</span><strong>{validAmount ? formatINR(amount) : "₹0"}</strong></div>
          <p className="au-payment-note">{plan === "support" ? "A one-time contribution. Thank you for supporting Amanora." : "This is a one-time UPI payment. It does not automatically renew."}</p>
          <button type="button" className="au-pay-button" onClick={payNow} disabled={!configured || !validAmount}>
            <span className="au-rupee-icon">₹</span> Pay securely using UPI <span className="au-pay-arrow">→</span>
          </button>
          <div className="au-payment-apps"><span>Google Pay</span><span>PhonePe</span><span>Paytm</span><span>BHIM</span></div>
          <div className="au-secure-caption"><span>♧</span> You approve every payment in your UPI app</div>
        </section>

        <section className="au-qr-card">
          <div className="au-qr-top">
            <div><span className="au-small-label">SCAN & PAY</span><h2>Pay with QR code</h2><p>Scan with any compatible UPI app.</p></div>
            <span className="au-qr-icon" aria-hidden="true">▦</span>
          </div>
          <button type="button" className="au-qr-toggle" onClick={() => setShowQR((value) => !value)} aria-expanded={showQR}>
            {showQR ? "Hide QR code" : "Show QR code"}<span>{showQR ? "−" : "+"}</span>
          </button>
          {showQR && <div className="au-qr-body">
            {configured && validAmount ? <div className="au-qr-frame"><QRCodeSVG value={upiLink} size={220} level="H" includeMargin /></div> :
              <div className="au-qr-invalid"><strong>QR code unavailable</strong><br />Check your UPI ID and amount.</div>}
            <p>Before confirming, verify the payee is <strong>{PAYEE_NAME}</strong> and the amount is {validAmount ? formatINR(amount) : "valid"}.</p>
          </div>}
        </section>

        <section className="au-upi-id-card">
          <span className="au-small-label">DIRECT UPI PAYMENT</span>
          <h2>Your UPI destination</h2>
          <div className="au-upi-id-row"><span>{configured ? UPI_ID : "UPI ID not configured"}</span><button type="button" className="au-copy-button" onClick={copyUPI} disabled={!configured}>{copied ? "Copied ✓" : "Copy ID"}</button></div>
          <button type="button" className="au-share-button" onClick={sharePayment} disabled={!configured || !validAmount}>↗ <span>Share payment details</span></button>
        </section>

        {notice && <div className="au-notice" role="status" aria-live="polite"><span>✦</span><div>{notice}</div></div>}

        <div className="au-payment-note" role="note">
          UPI checkout opens your payment app, but this version cannot verify a completed transaction or activate Premium automatically. Membership access must only be granted after secure server-side payment verification.
        </div>

        <section className="au-safety">
          <span className="au-safety-icon" aria-hidden="true">♡</span>
          <div><strong>Your payment safety matters</strong><p>Never share your UPI PIN, OTP or banking password. Enter your PIN only inside your trusted UPI app. Amanora will not ask you for these details.</p></div>
        </section>

        <footer className="au-footer"><div>☾ ✦ ☽</div><span>MADE WITH CARE FOR THE UMMAH</span></footer>
      </div>
    </section>
  );
}
