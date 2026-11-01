import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Capture Chrome's install event before React mounts. In production this event
// can arrive very early, so registering from a component effect can miss it.
type AmanoraInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
declare global {
  interface Window {
    __amanoraInstallPrompt?: AmanoraInstallPrompt | null;
  }
}
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  window.__amanoraInstallPrompt = event as AmanoraInstallPrompt;
  window.dispatchEvent(new Event("amanora-install-ready"));
});
window.addEventListener("appinstalled", () => {
  window.__amanoraInstallPrompt = null;
  window.dispatchEvent(new Event("amanora-app-installed"));
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Makes the app installable and usable offline (production build only)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => console.error("Amanora service worker registration failed:", error));
  });
}
