import { useEffect, useState } from "react";
import { Flower2, Leaf, Palette, RotateCcw, Snowflake, Sun } from "lucide-react";
import api, { errMsg } from "../services/api.js";
import { APPEARANCE_THEMES } from "../data/appearanceThemes.js";
import { PageHeader, Spinner, fmtDate, useToast } from "./ui.jsx";

const STORAGE_KEY = "menal_published_appearance";
const SEASONS = [
  { id: "spring", Icon: Flower2, description: "Blush, rose and soft botanical accents" },
  { id: "summer", Icon: Sun, description: "Sage greens with warm golden light" },
  { id: "autumn", Icon: Leaf, description: "Amber, terracotta and rich earthy tones" },
  { id: "winter", Icon: Snowflake, description: "Ice blue, silver and crisp white" },
];

export default function Appearance() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    api.get("/admin/appearance")
      .then(({ data }) => setSettings(data))
      .catch((cause) => setError(errMsg(cause)));
  }, []);

  const saveDraftSeason = async (season) => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.put("/admin/appearance", { season });
      setSettings(data);
      toast(`${APPEARANCE_THEMES[season].name} saved as a draft.`);
    } catch (cause) {
      setError(errMsg(cause));
      toast(errMsg(cause), "error");
    } finally {
      setBusy(false);
    }
  };

  const resetDraft = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/admin/appearance/reset");
      setSettings(data);
      toast("Draft reset to the published appearance.");
    } catch (cause) {
      setError(errMsg(cause));
      toast(errMsg(cause), "error");
    } finally {
      setBusy(false);
    }
  };

  const publishDraft = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/admin/appearance/publish");
      setSettings(data);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.published));
      } catch {
        toast("Published successfully. Refresh other open tabs to see the new design.", "error");
        return;
      }
      toast(`${APPEARANCE_THEMES[data.published.season].name} is now live.`);
    } catch (cause) {
      setError(errMsg(cause));
      toast(errMsg(cause), "error");
    } finally {
      setBusy(false);
    }
  };

  if (error && !settings) return <p className="a-error" role="alert">{error}</p>;
  if (!settings) return <Spinner label="Loading appearance" />;

  const hasDraftChanges = settings.draft.season !== settings.published.season ||
    settings.draft.template !== settings.published.template;
  const previewUrl = new URL("/", window.location.href);
  previewUrl.searchParams.set("appearancePreview", settings.draft.season);

  return (
    <>
      <PageHeader
        title="Appearance & Design"
        sub="Choose a season for the entire portfolio. Changes remain private until published."
      />
      {error && <p className="a-error appearance-error" role="alert">{error}</p>}

      <section className="appearance-status" aria-label="Appearance status">
        <div className="a-panel">
          <span className="appearance-label">Published season</span>
          <strong>{APPEARANCE_THEMES[settings.published.season].name}</strong>
        </div>
        <div className="a-panel">
          <span className="appearance-label">Published template</span>
          <strong>{settings.published.template}</strong>
        </div>
        <div className="a-panel">
          <span className="appearance-label">Last published</span>
          <strong>{settings.updatedAt ? fmtDate(settings.updatedAt) : "Not published yet"}</strong>
        </div>
        <div className="a-panel">
          <span className="appearance-label">Draft status</span>
          <strong className={hasDraftChanges ? "appearance-pending" : "appearance-current"}>
            {hasDraftChanges ? "Unpublished changes" : "Up to date"}
          </strong>
        </div>
      </section>

      <section aria-labelledby="appearance-draft-title">
        <div className="appearance-section-heading">
          <div>
            <h2 id="appearance-draft-title">Draft Appearance</h2>
            <p className="muted">Select a season to save it as a draft. The public website will not change yet.</p>
          </div>
        </div>
        <div className="appearance-grid">
          {SEASONS.map(({ id, Icon, description }) => {
            const theme = APPEARANCE_THEMES[id];
            const selected = settings.draft.season === id;
            return (
              <article
                className={`appearance-card${selected ? " selected" : ""}`}
                key={id}
                style={{ "--appearance-primary": theme.palette[0], "--appearance-secondary": theme.palette[1] }}
              >
                <div className={`appearance-card-art appearance-${id}`}>
                  <Icon aria-hidden="true" size={42} strokeWidth={1.4} />
                  <div className="appearance-palette" aria-label={`${id} color palette`}>
                    {theme.palette.map((color) => (
                      <span key={color} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <div className="appearance-card-content">
                  <div className="appearance-card-title">
                    <h3>{theme.name}</h3>
                    {selected && <span className="appearance-selected">Draft selected</span>}
                  </div>
                  <p>{description}</p>
                  <button
                    type="button"
                    className={`a-btn${selected ? " primary" : ""}`}
                    onClick={() => saveDraftSeason(id)}
                    disabled={busy || selected}
                    aria-pressed={selected}
                  >
                    {selected ? "Selected" : "Select season"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="appearance-publish a-panel" aria-labelledby="appearance-publish-title">
        <div>
          <h2 id="appearance-publish-title">Draft and publish</h2>
          <p className="muted">
            Draft: <strong>{APPEARANCE_THEMES[settings.draft.season].name}</strong>
            {" · "}Published: <strong>{APPEARANCE_THEMES[settings.published.season].name}</strong>
          </p>
        </div>
        <div className="a-actions">
          <button type="button" className="a-btn" onClick={() => setPreviewOpen(true)} disabled={busy}>
            <Palette size={17} /> Preview changes
          </button>
          <button type="button" className="a-btn" onClick={resetDraft} disabled={busy || !hasDraftChanges}>
            <RotateCcw size={17} /> Reset draft
          </button>
          <button type="button" className="a-btn primary" onClick={publishDraft} disabled={busy || !hasDraftChanges}>
            {busy ? "Saving..." : "Publish changes"}
          </button>
        </div>
      </section>

      {previewOpen && (
        <div className="appearance-preview-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPreviewOpen(false);
        }}>
          <section className="appearance-preview" role="dialog" aria-modal="true" aria-labelledby="appearance-preview-title">
            <header>
              <div>
                <h2 id="appearance-preview-title">Preview: {APPEARANCE_THEMES[settings.draft.season].name}</h2>
                <p className="muted">This isolated preview does not publish or alter the public website.</p>
              </div>
              <button type="button" className="a-btn" onClick={() => setPreviewOpen(false)}>Close preview</button>
            </header>
            <iframe title="Full portfolio appearance preview" src={previewUrl.toString()} />
          </section>
        </div>
      )}
    </>
  );
}
