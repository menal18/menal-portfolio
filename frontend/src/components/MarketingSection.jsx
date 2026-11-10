import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";
import Lightbox from "./Lightbox.jsx";
import { imgOf, optimize } from "../services/images.js";

function CampaignModal({ c, onClose }) {
  const [lb, setLb] = useState(-1);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape" && lb < 0) onClose();
    };
    window.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = "";
    };
  }, [onClose, lb]);
  const images = c.creatives || [];
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      onClick={onClose}
    >
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <X />
        </button>
        <p className="muted">
          {[c.type, c.client, c.platform].filter(Boolean).join(", ")}
        </p>
        <h3>{c.title}</h3>
        {c.description &&
          c.description.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
        {c.seoWork && (
          <>
            <h4>SEO work</h4>
            {c.seoWork.split(/\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </>
        )}
        {c.socialContent && (
          <>
            <h4>Social media content</h4>
            {c.socialContent.split(/\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </>
        )}
        {c.performance?.length > 0 && (
          <>
            <h4>Performance</h4>
            <dl className="perf">
              {c.performance.map((r, i) => (
                <div key={i}>
                  <dt>{r.label}</dt>
                  <dd>
                    {r.value}
                    {r.note && <small>{r.note}</small>}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {images.length > 0 && (
          <>
            <h4>Creatives</h4>
            <div className="creative-grid">
              {images.map((im, i) => (
                <button
                  key={im._id || i}
                  type="button"
                  onClick={() => setLb(i)}
                  aria-label={`Open creative ${i + 1}`}
                >
                  <img
                    src={optimize(im.url, 600)}
                    alt={im.caption || `${c.title} creative ${i + 1}`}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </>
        )}
        {c.linkUrl && (
          <a
            className="btn ghost"
            href={c.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View live <ExternalLink size={16} />
          </a>
        )}
      </div>
      {lb >= 0 && (
        <Lightbox
          images={images}
          index={lb}
          onIndex={setLb}
          onClose={() => setLb(-1)}
        />
      )}
    </div>
  );
}

export default function MarketingSection({ campaigns }) {
  const [open, setOpen] = useState(null);
  const strip = campaigns.flatMap((c) =>
    c.creatives?.length
      ? c.creatives.slice(0, 4).map((im) => ({ ...im, c }))
      : [{ url: imgOf(c), c }],
  );
  if (!campaigns.length) return null;

  return (
    <section id="marketing" className="section">
      <div className="container">
        <SectionHead
          title="Digital marketing showcase"
          lead="Campaigns, creatives, SEO and social content."
        />
      </div>
      {campaigns.length === 0 ? (
        <div className="container">
          <p className="muted empty">
            Marketing work will appear here once campaigns are published.
          </p>
        </div>
      ) : (
        <>
          <div
            className="strip"
            tabIndex={0}
            aria-label="Marketing creatives, scrollable"
          >
            {strip.map((s, i) => (
              <Reveal
                as="button"
                type="button"
                key={`${s.c._id}-${i}`}
                className="strip-item"
                delay={(i % 4) * 70}
                onClick={() => setOpen(s.c)}
                aria-label={`Open ${s.c.title}`}
              >
                <img src={optimize(s.url, 700)} alt="" loading="lazy" />
              </Reveal>
            ))}
          </div>
          <div className="container">
            <ul className="campaign-list">
              {campaigns.map((c, i) => (
                <Reveal as="li" key={c._id} delay={i * 50}>
                  <button
                    type="button"
                    className="campaign-row"
                    onClick={() => setOpen(c)}
                  >
                    <span className="campaign-type">{c.type}</span>
                    <span className="campaign-title">{c.title}</span>
                    <span className="campaign-sum">{c.summary}</span>
                    {c.performance?.length > 0 && (
                      <span className="stat-line">
                        {c.performance.slice(0, 3).map((r, k) => (
                          <span key={k}>
                            <b>{r.value}</b> {r.label}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </Reveal>
              ))}
            </ul>
          </div>
        </>
      )}
      {open && <CampaignModal c={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
