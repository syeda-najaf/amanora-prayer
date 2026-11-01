/**
 * MONEY SETTINGS: fill these in, then run `npm run build` again.
 * Anything left empty is simply hidden from the app, so nothing looks broken.
 */
export const CONFIG = {
  // 1) AFFILIATE STORE: earn a commission when people buy through your links.
  //    Join Amazon Associates (affiliate-program.amazon.in), get your tracking ID, e.g. "amanora-21".
  amazonTag: "",
  amazonDomain: "www.amazon.in", // www.amazon.com, www.amazon.co.uk, www.amazon.ae ...

  // 2) SADAQAH / SUPPORT: let users support the app (money goes straight to you).
  upiId: "",            // e.g. "yourname@okhdfcbank"
  upiName: "Amanora",   // name shown in the UPI app
  paymentLink: "",      // a Razorpay Payment Page / Stripe Payment Link / PayPal.me link

  // 3) YOUR OWN PRODUCTS (e-books, courses, planners): see OWN_PRODUCTS in src/data/store.ts
  //    People tap Buy, pay on your payment link, and you deliver the file by email or WhatsApp.
  whatsapp: "",         // country code + number, no plus sign. e.g. "919876543210"
  supportEmail: "",
};

export const amazonUrl = (query: string) =>
  `https://${CONFIG.amazonDomain}/s?k=${encodeURIComponent(query)}${CONFIG.amazonTag ? `&tag=${CONFIG.amazonTag}` : ""}`;
