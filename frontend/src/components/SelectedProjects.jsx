import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Globe } from "lucide-react";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";
import { imgOf, optimize, placeholder } from "../services/images.js";
import { useSite } from "../context/SiteContext.jsx";

function ProjectImage({ project, season, width = 500, className = "" }) {
  const image = optimize(imgOf(project, undefined, season), width);
  return (
    <img
      className={className}
      src={image}
      alt={`${project.title || "Project"} preview`}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = placeholder(
          project.title || "project",
          project.title || "Project",
          1200,
          800,
          season,
        );
      }}
    />
  );
}

function ProjectSkeleton() {
  return (
    <li className="project-skeleton" aria-hidden="true">
      <span className="project-skeleton-image" />
      <span className="project-skeleton-title" />
      <span className="project-skeleton-copy" />
      <span className="project-skeleton-copy short" />
    </li>
  );
}

export default function SelectedProjects({
  projects = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const { appearance } = useSite();
  const season = appearance.season;
  const featured = (Array.isArray(projects) ? projects : []).filter(
    (project) => project?.featured && project.status === "published",
  );
  const [hover, setHover] = useState(null);
  const preview = useRef(null);

  const onMove = (event) => {
    const card = event.target.closest(".index-row");
    if (
      card &&
      matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 3).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 4).toFixed(2)}deg`);
    }
    if (preview.current) {
      preview.current.style.transform = `translate3d(${event.clientX + 24}px, ${event.clientY - 120}px, 0)`;
    }
  };

  const onLeave = (event) => {
    event.currentTarget.querySelectorAll(".index-row").forEach((card) => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
    setHover(null);
  };

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHead title="Selected projects" />
        {error && (
          <div className="project-load-error" role="alert">
            <p>Portfolio data could not be refreshed. {error}</p>
            {onRetry && (
              <button type="button" className="btn" onClick={onRetry}>
                Try again
              </button>
            )}
          </div>
        )}
        {loading ? (
          <ul className="index-list" aria-label="Loading selected projects">
            {Array.from({ length: 6 }, (_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </ul>
        ) : featured.length === 0 ? (
          <div className="project-empty">
            <h3>No selected projects yet</h3>
            <p className="muted">
              Featured, published projects will appear here.
            </p>
          </div>
        ) : (
          <ul className="index-list" onMouseMove={onMove} onMouseLeave={onLeave}>
            {featured.map((project, index) => {
              const title = project.title || "Untitled project";
              const description = project.summary || project.description;
              return (
                <Reveal as="li" key={project._id} delay={(index % 3) * 60}>
                  <article
                    className="index-row"
                    onMouseEnter={() => setHover(project)}
                  >
                    {project.slug ? (
                      <Link
                        to={`/projects/${project.slug}`}
                        className="project-card-main"
                        onFocus={() => setHover(project)}
                        onBlur={() => setHover(null)}
                      >
                        <ProjectImage
                          project={project}
                          season={season}
                          className="index-thumb"
                        />
                        <span className="project-card-heading">
                          <span className="index-title">{title}</span>
                          <ArrowUpRight className="index-arrow" size={22} />
                        </span>
                        {project.category?.name && (
                          <span className="index-meta">
                            {project.category.name}
                          </span>
                        )}
                        {description && (
                          <span className="project-summary">
                            {description}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className="project-card-main">
                        <ProjectImage
                          project={project}
                          season={season}
                          className="index-thumb"
                        />
                        <span className="project-card-heading">
                          <span className="index-title">{title}</span>
                        </span>
                        {project.category?.name && (
                          <span className="index-meta">
                            {project.category.name}
                          </span>
                        )}
                        {description && (
                          <span className="project-summary">
                            {description}
                          </span>
                        )}
                      </div>
                    )}
                    {Array.isArray(project.technologies) &&
                      project.technologies.length > 0 && (
                        <ul
                          className="project-technologies"
                          aria-label="Technologies"
                        >
                          {project.technologies.slice(0, 5).map((technology) => (
                            <li className="tag" key={technology}>
                              {technology}
                            </li>
                          ))}
                        </ul>
                      )}
                    {(project.liveUrl || project.githubUrl) && (
                      <div className="project-links">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Visit ${title} live site`}
                          >
                            <Globe size={16} />
                            Live site
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${title} source code`}
                          >
                            <Github size={16} />
                            Source
                          </a>
                        )}
                      </div>
                    )}
                    {!project.slug && (
                      <Link className="project-inquiry" to="/#contact">
                        Ask about this project <ArrowUpRight size={14} />
                      </Link>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
      <div
        ref={preview}
        className={`index-preview ${hover ? "show" : ""}`}
        aria-hidden="true"
      >
        {hover && <ProjectImage project={hover} season={season} width={700} />}
      </div>
    </section>
  );
}
