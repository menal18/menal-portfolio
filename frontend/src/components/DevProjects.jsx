import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";
import { imgOf, optimize } from "../services/images.js";
import { DEVELOPMENT_FOCUS } from "../data/portfolioContent.js";
import { useSite } from "../context/SiteContext.jsx";

export default function DevProjects({ projects, categories }) {
  const { appearance } = useSite();
  const season = appearance.season;
  const [cat, setCat] = useState("all");
  const used = useMemo(
    () =>
      categories.filter((c) =>
        projects.some((p) => p.category?.slug === c.slug),
      ),
    [categories, projects],
  );
  if (!projects.length) {
    return (
      <section id="development" className="section alt">
        <div className="container">
          <SectionHead
            title="Development practice"
            lead="A closer look at the areas behind the work."
          />
          <ol className="focus-grid">
            {DEVELOPMENT_FOCUS.map((item, index) => (
              <Reveal as="li" key={item} delay={index * 75}>
                <span>0{index + 1}</span>
                <strong>{item}</strong>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    );
  }
  const shown =
    cat === "all" ? projects : projects.filter((p) => p.category?.slug === cat);

  return (
    <section id="development" className="section alt">
      <div className="container">
        <SectionHead
          title="Development projects"
          lead="Everything I have built and published, filterable by category."
        />
        {projects.length === 0 ? (
          <p className="muted empty">Nothing published yet.</p>
        ) : (
          <>
            <div
              className="filters"
              role="group"
              aria-label="Filter projects by category"
            >
              <button
                type="button"
                className={`chip ${cat === "all" ? "active" : ""}`}
                aria-pressed={cat === "all"}
                onClick={() => setCat("all")}
              >
                All
              </button>
              {used.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  className={`chip ${cat === c.slug ? "active" : ""}`}
                  aria-pressed={cat === c.slug}
                  onClick={() => setCat(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="dev-grid">
              {shown.map((p, i) => (
                <Reveal
                  key={p._id}
                  delay={(i % 3) * 80}
                  className={`dev-item v${i % 5}`}
                >
                  <Link to={`/projects/${p.slug}`} className="dev-link">
                    <div className="dev-media">
                      <img
                        src={optimize(imgOf(p, undefined, season), 900)}
                        alt={`${p.title} cover`}
                        loading="lazy"
                      />
                    </div>
                    <div className="dev-body">
                      <h3>{p.title}</h3>
                      {p.summary && <p>{p.summary}</p>}
                      {p.technologies?.length > 0 && (
                        <ul className="tags">
                          {p.technologies.slice(0, 5).map((t) => (
                            <li key={t} className="tag">
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
