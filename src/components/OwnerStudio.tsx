import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
type ContentType =
  | "hadith"
  | "dua"
  | "story"
  | "quiz"
  | "bayan"
  | "reel"
  | "reflection";
type ContentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected"
  | "archived";
type ContentItem = {
  id: string;
  content_type: ContentType;
  title: string;
  body: string | null;
  body_ur: string | null;
  body_ar: string | null;
  reference: string | null;
  source_name: string | null;
  source_url: string | null;
  media_url: string | null;
  media_kind: "audio" | "video" | "image" | null;
  language: string;
  presenter_type: "human" | "ai" | null;
  status: ContentStatus;
  publish_at: string | null;
  published_at: string | null;
  created_at: string;
};
const emptyForm = {
  content_type: "story" as ContentType,
  title: "",
  body: "",
  body_ur: "",
  body_ar: "",
  reference: "",
  source_name: "",
  source_url: "",
  media_url: "",
  media_kind: "" as "" | "audio" | "video" | "image",
  language: "multi",
  presenter_type: "" as "" | "human" | "ai",
  publish_at: "",
};
const statusOptions: ContentStatus[] = [
  "draft",
  "pending_review",
  "approved",
  "scheduled",
  "published",
  "rejected",
  "archived",
];
export function OwnerStudio() {
  const client = supabase;
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ContentStatus>("all");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const verifyAdmin = useCallback(async (currentSession: Session | null) => {
    if (!client || !currentSession) {
      setIsAdmin(false);
      setItems([]);
      setChecking(false);
      return;
    }
    setChecking(true);
    setError("");
    const { data, error: adminError } = await client
      .from("amanora_admins")
      .select("user_id")
      .eq("user_id", currentSession.user.id)
      .maybeSingle();
    if (adminError) {
      setError("Could not verify administrator access: " + adminError.message);
      setIsAdmin(false);
    } else {
      setIsAdmin(Boolean(data));
    }
    setChecking(false);
  }, [client]);
  const loadItems = useCallback(async () => {
    if (!client || !isAdmin) return;
    setBusy(true);
    setError("");
    const { data, error: loadError } = await client
      .from("amanora_content")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (loadError) {
      setError("Could not load content: " + loadError.message);
    } else {
      setItems((data ?? []) as ContentItem[]);
    }
    setBusy(false);
  }, [client, isAdmin]);
  useEffect(() => {
    if (!client) {
      setChecking(false);
      setError("Supabase is not configured. Check your local environment settings.");
      return;
    }
    let active = true;
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
      }
      setSession(data.session);
      void verifyAdmin(data.session);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      void verifyAdmin(nextSession);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [client, verifyAdmin]);
  useEffect(() => {
    if (isAdmin) void loadItems();
  }, [isAdmin, loadItems]);
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setLoginBusy(true);
    setError("");
    setNotice("");
    const { data, error: loginError } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoginBusy(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    setSession(data.session);
    await verifyAdmin(data.session);
  }
  async function handleLogout() {
    if (!client) return;
    const { error: logoutError } = await client.auth.signOut();
    if (logoutError) {
      setError(logoutError.message);
      return;
    }
    setSession(null);
    setIsAdmin(false);
    setItems([]);
    setNotice("You have signed out.");
  }
  function updateField<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  function startEdit(item: ContentItem) {
    setEditingId(item.id);
    setForm({
      content_type: item.content_type,
      title: item.title,
      body: item.body ?? "",
      body_ur: item.body_ur ?? "",
      body_ar: item.body_ar ?? "",
      reference: item.reference ?? "",
      source_name: item.source_name ?? "",
      source_url: item.source_url ?? "",
      media_url: item.media_url ?? "",
      media_kind: item.media_kind ?? "",
      language: item.language ?? "en",
      presenter_type: item.presenter_type ?? "",
      publish_at: item.publish_at
        ? new Date(item.publish_at).toISOString().slice(0, 16)
        : "",
    });
    setNotice("Editing: " + item.title);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !session || !isAdmin) return;
    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (
      ["hadith", "dua", "story"].includes(form.content_type) &&
      !form.source_name.trim() &&
      !form.reference.trim()
    ) {
      setError("Please provide a source name or reference for this religious content.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    const payload = {
      content_type: form.content_type,
      title: form.title.trim(),
      body: form.body.trim() || null,
      body_ur: form.body_ur.trim() || null,
      body_ar: form.body_ar.trim() || null,
      reference: form.reference.trim() || null,
      source_name: form.source_name.trim() || null,
      source_url: form.source_url.trim() || null,
      media_url: form.media_url.trim() || null,
      media_kind: form.media_kind || null,
      language: form.language,
      presenter_type: form.presenter_type || null,
      status: "draft" as ContentStatus,
      publish_at: null,
      updated_at: new Date().toISOString(),
    };
    const result = editingId
      ? await client
          .from("amanora_content")
          .update(payload)
          .eq("id", editingId)
          .select("id")
          .maybeSingle()
      : await client
          .from("amanora_content")
          .insert(payload)
          .select("id")
          .single();
    setBusy(false);
    if (result.error) {
      setError("Could not save content: " + result.error.message);
      return;
    }
    setNotice(editingId ? "Content updated and saved as a draft." : "New draft created successfully.");
    resetForm();
    await loadItems();
  }
  async function changeStatus(item: ContentItem, nextStatus: ContentStatus) {
    if (!client || !session || !isAdmin) return;
    const confirmed = window.confirm(
      `Change "${item.title}" to "${nextStatus}"?`
    );
    if (!confirmed) return;
    setBusy(true);
    setError("");
    setNotice("");
    const now = new Date().toISOString();
    const update: Record<string, unknown> = {
      status: nextStatus,
      updated_at: now,
    };
    if (nextStatus === "approved") {
      update.approved_by = session.user.id;
      update.approved_at = now;
    }
    if (nextStatus === "published") {
      update.published_at = now;
      update.publish_at = null;
    }
    if (nextStatus === "scheduled") {
      if (!item.publish_at || new Date(item.publish_at).getTime() <= Date.now()) {
        setBusy(false);
        setError("Set a future publication date in the editor before scheduling.");
        return;
      }
    }
    const { error: updateError } = await client
      .from("amanora_content")
      .update(update)
      .eq("id", item.id);
    setBusy(false);
    if (updateError) {
      setError("Status update failed: " + updateError.message);
      return;
    }
    setNotice(`"${item.title}" is now ${nextStatus}.`);
    await loadItems();
  }
  async function scheduleItem(item: ContentItem) {
    if (!client || !isAdmin) return;
    const date = window.prompt(
      "Enter the publication date and time in your local time (YYYY-MM-DDTHH:mm):",
      item.publish_at
        ? new Date(item.publish_at).toISOString().slice(0, 16)
        : ""
    );
    if (!date) return;
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      setError("Please enter a valid future date and time.");
      return;
    }
    setBusy(true);
    setError("");
    const { error: scheduleError } = await client
      .from("amanora_content")
      .update({
        status: "scheduled",
        publish_at: parsed.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    setBusy(false);
    if (scheduleError) {
      setError("Scheduling failed: " + scheduleError.message);
      return;
    }
    setNotice("Publication scheduled. The publishing function must also be deployed and scheduled.");
    await loadItems();
  }
  const visibleItems = filter === "all"
    ? items
    : items.filter((item) => item.status === filter);
  const count = (status: ContentStatus) =>
    items.filter((item) => item.status === status).length;
  if (checking) {
    return (
      <main className="owner-page">
        <section className="owner-card owner-login">
          <div className="owner-symbol">۞</div>
          <h1>Amanora Owner Studio</h1>
          <p className="owner-muted">Verifying secure administrator access…</p>
        </section>
      </main>
    );
  }
  if (!client) {
    return (
      <main className="owner-page">
        <section className="owner-card owner-login">
          <h1>Supabase connection missing</h1>
          <p className="owner-error">
            Add the Supabase URL and publishable key to your local .env file, then restart Vite.
          </p>
        </section>
      </main>
    );
  }
  if (!session) {
    return (
      <main className="owner-page">
        <form className="owner-card owner-login" onSubmit={handleLogin}>
          <div className="owner-symbol">۞</div>
          <p className="owner-eyebrow">PRIVATE ADMINISTRATION</p>
          <h1>Amanora Owner Studio</h1>
          <p className="owner-muted">
            Sign in with the Supabase Auth account that was added to the Amanora administrator list.
          </p>
          {error && <p className="owner-error">{error}</p>}
          <label htmlFor="owner-email">Administrator email</label>
          <input
            id="owner-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="owner-password">Password</label>
          <input
            id="owner-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="owner-primary" type="submit" disabled={loginBusy}>
            {loginBusy ? "Signing in…" : "Secure administrator sign in"}
          </button>
          <a className="owner-back" href="/">Return to Amanora</a>
        </form>
      </main>
    );
  }
  if (!isAdmin) {
    return (
      <main className="owner-page">
        <section className="owner-card owner-login">
          <div className="owner-symbol">🔒</div>
          <h1>Administrator access required</h1>
          <p className="owner-error">
            This account is authenticated, but it is not listed as an Amanora administrator.
          </p>
          <button className="owner-secondary" onClick={handleLogout}>
            Sign out
          </button>
          <a className="owner-back" href="/">Return to Amanora</a>
        </section>
      </main>
    );
  }
  return (
    <main className="owner-page">
      <header className="owner-header">
        <div>
          <p className="owner-eyebrow">AMANORA · PRIVATE CONTROL ROOM</p>
          <h1>Owner Studio</h1>
          <p className="owner-muted">Content, review and publishing management</p>
        </div>
        <button className="owner-secondary" onClick={handleLogout}>
          Sign out
        </button>
      </header>
      <section className="owner-stats">
        <div><strong>{items.length}</strong><span>Total content</span></div>
        <div><strong>{count("draft")}</strong><span>Drafts</span></div>
        <div><strong>{count("pending_review")}</strong><span>Awaiting review</span></div>
        <div><strong>{count("published")}</strong><span>Published</span></div>
      </section>
      {error && <p className="owner-error owner-notice">{error}</p>}
      {notice && <p className="owner-muted owner-notice">{notice}</p>}
      <section className="owner-card">
        <p className="owner-eyebrow">{editingId ? "EDIT CONTENT" : "CONTENT CREATION"}</p>
        <h2>{editingId ? "Update a content item" : "Create new content"}</h2>
        <p className="owner-hint">
          Religious text should include a traceable source or reference. New entries are saved as drafts.
        </p>
        <form className="owner-form" onSubmit={handleSave}>
          <div className="owner-two">
            <div>
              <label htmlFor="content-type">Content type</label>
              <select
                id="content-type"
                value={form.content_type}
                onChange={(e) => updateField("content_type", e.target.value as ContentType)}
              >
                <option value="story">Prophet / Islamic story</option>
                <option value="hadith">Hadith</option>
                <option value="dua">Dua</option>
                <option value="quiz">Quiz</option>
                <option value="bayan">Bayan / lecture</option>
                <option value="reel">Reel</option>
                <option value="reflection">Reflection</option>
              </select>
            </div>
            <div>
              <label htmlFor="content-language">Language</label>
              <select
                id="content-language"
                value={form.language}
                onChange={(e) => updateField("language", e.target.value)}
              >
                <option value="multi">Multiple languages</option>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>
          <label htmlFor="content-title">Title</label>
          <input
            id="content-title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Enter a clear content title"
            required
          />
          <label htmlFor="content-en">English content</label>
          <textarea
            id="content-en"
            rows={4}
            value={form.body}
            onChange={(e) => updateField("body", e.target.value)}
            placeholder="Write or paste verified English content"
          />
          <label htmlFor="content-ur">Urdu content</label>
          <textarea
            id="content-ur"
            rows={3}
            dir="rtl"
            value={form.body_ur}
            onChange={(e) => updateField("body_ur", e.target.value)}
            placeholder="اردو مواد یہاں درج کریں"
          />
          <label htmlFor="content-ar">Arabic content</label>
          <textarea
            id="content-ar"
            rows={3}
            dir="rtl"
            value={form.body_ar}
            onChange={(e) => updateField("body_ar", e.target.value)}
            placeholder="أدخل النص العربي هنا"
          />
          <div className="owner-two">
            <div>
              <label htmlFor="source-name">Source name</label>
              <input
                id="source-name"
                value={form.source_name}
                onChange={(e) => updateField("source_name", e.target.value)}
                placeholder="e.g. Sahih al-Bukhari"
              />
            </div>
            <div>
              <label htmlFor="source-reference">Reference</label>
              <input
                id="source-reference"
                value={form.reference}
                onChange={(e) => updateField("reference", e.target.value)}
                placeholder="Hadith number, Surah and verse, etc."
              />
            </div>
          </div>
          <label htmlFor="source-url">Source URL (optional)</label>
          <input
            id="source-url"
            type="url"
            value={form.source_url}
            onChange={(e) => updateField("source_url", e.target.value)}
            placeholder="https://..."
          />
          <div className="owner-two">
            <div>
              <label htmlFor="media-kind">Media type</label>
              <select
                id="media-kind"
                value={form.media_kind}
                onChange={(e) => updateField("media_kind", e.target.value as typeof form.media_kind)}
              >
                <option value="">No media</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div>
              <label htmlFor="presenter-type">Presenter type</label>
              <select
                id="presenter-type"
                value={form.presenter_type}
                onChange={(e) => updateField("presenter_type", e.target.value as typeof form.presenter_type)}
              >
                <option value="">Not applicable</option>
                <option value="human">Human presenter</option>
                <option value="ai">AI presenter</option>
              </select>
            </div>
          </div>
          <label htmlFor="media-url">Media URL (optional)</label>
          <input
            id="media-url"
            type="url"
            value={form.media_url}
            onChange={(e) => updateField("media_url", e.target.value)}
            placeholder="https://..."
          />
          <p className="owner-hint">
            This field stores a media URL only. Private Supabase uploads and secure playback will be connected separately.
          </p>
          <div className="owner-two">
            <button className="owner-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Save changes as draft" : "Create draft"}
            </button>
            <button
              className="owner-secondary"
              type="button"
              onClick={resetForm}
            >
              Clear form
            </button>
          </div>
        </form>
      </section>
      <section className="owner-card">
        <div className="owner-list-heading">
          <div>
            <p className="owner-eyebrow">CONTENT LIBRARY</p>
            <h2>Manage publications</h2>
          </div>
          <button className="owner-secondary" onClick={() => void loadItems()} disabled={busy}>
            Refresh
          </button>
        </div>
        <div className="owner-filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All ({items.length})
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              className={filter === status ? "active" : ""}
              onClick={() => setFilter(status)}
            >
              {status.replace("_", " ")} ({count(status)})
            </button>
          ))}
        </div>
        {busy && <p className="owner-muted">Working…</p>}
        {!visibleItems.length && (
          <p className="owner-muted">
            No content in this view yet. Create your first draft above.
          </p>
        )}
        <div className="owner-items">
          {visibleItems.map((item) => (
            <article className="owner-item" key={item.id}>
              <div className="owner-item-top">
                <span className="owner-type">{item.content_type}</span>
                <span className={`owner-status status-${item.status}`}>
                  {item.status.replace("_", " ")}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body || item.body_ur || item.body_ar || "No text preview."}</p>
              {item.source_name && <small>Source: {item.source_name}</small>}
              {item.reference && <small> · {item.reference}</small>}
              {item.publish_at && (
                <p>Scheduled: {new Date(item.publish_at).toLocaleString()}</p>
              )}
              <div className="owner-item-actions">
                <button onClick={() => startEdit(item)}>Edit</button>
                {item.status === "draft" && (
                  <button onClick={() => void changeStatus(item, "pending_review")}>
                    Submit for review
                  </button>
                )}
                {item.status === "pending_review" && (
                  <>
                    <button onClick={() => void changeStatus(item, "approved")}>
                      Approve
                    </button>
                    <button onClick={() => void changeStatus(item, "rejected")}>
                      Reject
                    </button>
                  </>
                )}
                {item.status === "approved" && (
                  <>
                    <button onClick={() => void changeStatus(item, "published")}>
                      Publish now
                    </button>
                    <button onClick={() => void scheduleItem(item)}>
                      Schedule
                    </button>
                  </>
                )}
                {item.status === "scheduled" && (
                  <button onClick={() => void changeStatus(item, "approved")}>
                    Cancel schedule
                  </button>
                )}
                {item.status !== "archived" && (
                  <button onClick={() => void changeStatus(item, "archived")}>
                    Archive
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="owner-bottom-back">
        <a className="owner-back" href="/">← Return to Amanora</a>
      </div>
      <footer className="owner-footer">AMANORA · PRIVATE OWNER STUDIO</footer>
    </main>
  );
}
