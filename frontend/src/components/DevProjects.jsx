import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";
import { imgOf, optimize } from "../services/images.js";
import { DEVELOPMENT_FOCUS } from "../data/portfolioContent.js";
import { useSite } from "../context/SiteContext.jsx";

function getCarouselPosition(index, selectedIndex, length) {
  const forward = (index - selectedIndex + length) % length;
  return forward > length / 2 ? forward - length : forward;
}

export default function DevProjects({ projects, categories }) {
  const { appearance } = useSite();
  const season = appearance.season;
  const [cat, setCat] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const used = useMemo(
    () =>
      categories.filter((c) =>
        projects.some((p) => p.category?.slug === c.slug),
      ),
    [categories, projects],
  );
  const shown = useMemo(
    () =>
      cat === "all"
        ? projects
        : projects.filter((p) => p.category?.slug === cat),
    [cat, projects],
  );
  const activeIndex = shown.length ? selectedIndex % shown.length : 0;
  const selectedProject = shown[activeIndex];

  useEffect(() => {
    setSelectedIndex(0);
  }, [cat]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (shown.length < 2 || isPaused || prefersReducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % shown.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion, shown.length]);

  const moveSelection = (step) => {
    if (!shown.length) return;
    setSelectedIndex((current) => (current + step + shown.length) % shown.length);
  };

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
            <div
              className="dev-carousel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsPaused(false);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveSelection(-1);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveSelection(1);
                }
              }}
            >
              <div
                className="dev-carousel-viewport"
                role="group"
                aria-label="Development project carousel"
              >
                <div className="dev-carousel-stage">
                  {shown.map((project, index) => {
                    const position = getCarouselPosition(
                      index,
                      activeIndex,
                      shown.length,
                    );
                    const isSelected = index === activeIndex;
                    const isOffstage = Math.abs(position) > 1;
                    const mediaClass = project.title
                      ?.toLowerCase()
                      .includes("cake n take")
                      ? " dev-media-contain"
                      : "";

                    return (
                      <Link
                        key={project._id}
                        to={`/projects/${project.slug}`}
                        className={`dev-carousel-card dev-link${isSelected ? " is-selected" : ""}`}
                        data-position={position}
                        aria-label={`View ${project.title} project`}
                        aria-current={isSelected ? "true" : undefined}
                        aria-hidden={isOffstage}
                        tabIndex={isOffstage ? -1 : 0}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <div className={`dev-media${mediaClass}`}>
                          <img
                            src={optimize(imgOf(project, undefined, season), 900)}
                            alt={`${project.title} cover`}
                            loading={isSelected ? "eager" : "lazy"}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {selectedProject && (
                <div className="dev-selection" aria-live="off">
                  <div className="dev-body">
                    {selectedProject.category?.name && (
                      <p className="dev-selection-category">
                        {selectedProject.category.name}
                      </p>
                    )}
                    <h3>{selectedProject.title}</h3>
                    {selectedProject.summary && <p>{selectedProject.summary}</p>}
                    {selectedProject.technologies?.length > 0 && (
                      <ul className="tags">
                        {selectedProject.technologies.slice(0, 5).map((technology) => (
                          <li key={technology} className="tag">
                            {technology}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Link
                    to={`/projects/${selectedProject.slug}`}
                    className="dev-selection-link"
                  >
                    View project <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              )}

              {shown.length > 1 && (
                <div className="dev-carousel-controls">
                  <button
                    type="button"
                    className="dev-carousel-arrow"
                    aria-label="Previous development project"
                    onClick={() => moveSelection(-1)}
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <div className="dev-carousel-dots" role="group" aria-label="Choose a development project">
                    {shown.map((project, index) => (
                      <button
                        key={project._id}
                        type="button"
                        className={`dev-carousel-dot${index === activeIndex ? " is-active" : ""}`}
                        aria-label={`Show ${project.title}`}
                        aria-pressed={index === activeIndex}
                        onClick={() => setSelectedIndex(index)}
                      />
                    ))}
                  </div>
                  <span className="dev-carousel-count">
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(shown.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    className="dev-carousel-arrow"
                    aria-label="Next development project"
                    onClick={() => moveSelection(1)}
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
