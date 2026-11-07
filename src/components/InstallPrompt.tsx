import { useEffect, useState } from "react";

const KEY = "amanora:install-dismissed";
const standalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true ||
  Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const inAppBrowser = () => /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Snapchat|TikTok/i.test(navigator.userAgent);

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    if (standalone()) return;
    let last = 0;
    try { last = Number(localStorage.getItem(KEY) || 0); } catch { /* ignore */ }
    if (Date.now() - last < 7 * 86400000) return;
    const sync = () => setCanPrompt(Boolean((window as any).__amanoraInstallPrompt));
    sync();
    const t = window.setTimeout(() => setShow(true), 4000);
    const done = () => setShow(false);
    window.addEventListener("amanora-install-ready", sync);
    window.addEventListener("amanora-app-installed", done);
    return () => { window.clearTimeout(t); window.removeEventListener("amanora-install-ready", sync); window.removeEventListener("amanora-app-installed", done); };
  }, []);

  if (!show || standalone()) return null;
  if (!ios && !canPrompt) return null;

  const dismiss = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ } setShow(false); };
  const install = async () => {
    const evt = (window as any).__amanoraInstallPrompt;
    if (!evt) return;
    await evt.prompt();
    try { await evt.userChoice; } catch { /* ignore */ }
    (window as any).__amanoraInstallPrompt = null;
    setShow(false);
  };

  return <div className="install-banner" role="dialog" aria-label="Install Amanora">
    <b>Install Amanora</b>
    {ios
      ? <p>{inAppBrowser() ? "Open this page in Safari first, then " : ""}tap the <b>Share</b> button (square with an arrow), then choose <b>Add to Home Screen</b>. Amanora then opens full screen like a real app.</p>
      : <p>Get Amanora on your home screen. It opens full screen like a real app, loads faster and works offline.</p>}
    <div className="row">
      {!ios && <button className="go" onClick={() => void install()}>Install app</button>}
      <button className="no" onClick={dismiss}>{ios ? "Got it" : "Not now"}</button>
    </div>
  </div>;
}
