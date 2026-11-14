import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Github,
  Globe,
} from "lucide-react";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";
import { imgOf, optimize } from "../services/images.js";
import { useSite } from "../context/SiteContext.jsx";

const ProjectShowcase = memo(function ProjectShowcase({ project, season }) {
  const images = useMemo(() => {
    const sources = [
      project.coverImage?.url
        ? { url: project.coverImage.url, description: "cover image" }
        : null,
      ...(Array.isArray(project.gallery)
        ? project.gallery.map((image, index) =>
            image?.url
              ? { url: image.url, description: `gallery image ${index + 1}` }
              : null,
          )
        : []),
    ].filter(Boolean);

    if (sources.length === 0) {
      sources.push({
        url: imgOf(project, undefined, season),
        description: "preview image",
      });
    }

    return sources.map((image) => ({
      src: optimize(image.url, 900),
      description: image.description,
    }));
  }, [project.coverImage?.url, project.gallery, project.title, season]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const touchStart = useRef(null);
  const imageCount = images.length;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [project._id]);

  useEffect(() => {
    if (imageCount < 2 || paused || reducedMotion) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % imageCount);
    }, 3600);
    return () => window.clearInterval(intervalId);
  }, [imageCount, paused, reducedMotion]);

  const showImage = (index) => {
    setActiveIndex((index + imageCount) % imageCount);
  };

  const onTouchStart = (event) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
    setPaused(true);
  };

  const onTouchEnd = (event) => {
    const start = touchStart.current;
    const end = event.changedTouches[0]?.clientX;
    touchStart.current = null;
    setPaused(false);
    if (start === null || end === undefined || imageCount < 2) return;
    const distance = end - start;
    if (Math.abs(distance) < 40) return;
    showImage(activeIndex + (distance < 0 ? 1 : -1));
  };

  return (
    <div
      className={`project-showcase${imageCount > 1 ? " has-slideshow" : ""}`}
      role="group"
      aria-label={`${project.title} image showcase`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {images.map((image, index) => (
        <img
          key={`${image.src}-${index}`}
          className={`project-showcase-image${index === activeIndex ? " is-active" : ""}`}
          src={image.src}
          alt={`${project.title || "Project"} ${image.description}`}
          loading="lazy"
          decoding="async"
          aria-hidden={index !== activeIndex}
        />
      ))}
      {imageCount > 1 && (
        <>
          <button
            type="button"
            className="project-showcase-arrow previous"
            aria-label={`Show previous image for ${project.title}`}
            onClick={() => showImage(activeIndex - 1)}
          >
            <ArrowLeft size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="project-showcase-arrow next"
            aria-label={`Show next image for ${project.title}`}
            onClick={() => showImage(activeIndex + 1)}
          >
            <ArrowRight size={17} aria-hidden="true" />
          </button>
          <div
            className="project-showcase-pagination"
            role="group"
            aria-label="Choose a project image"
          >
            {images.map((image, index) => (
              <button
                key={`${image.src}-indicator-${index}`}
                type="button"
                className={`project-showcase-indicator${index === activeIndex ? " is-active" : ""}`}
                aria-label={`Show image ${index + 1} of ${imageCount}`}
                aria-pressed={index === activeIndex}
                onClick={() => showImage(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

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
          <ul className="index-list">
            {featured.map((project, index) => {
              const title = project.title || "Untitled project";
              const description = project.summary || project.description;
              return (
                <Reveal as="li" key={project._id} delay={(index % 3) * 60}>
                  <article className="index-row">
                    <ProjectShowcase project={project} season={season} />
                    <div className="project-card-main">
                      <div className="project-card-heading">
                        {project.slug ? (
                          <Link
                            to={`/projects/${project.slug}`}
                            className="project-title-link"
                          >
                            <h3 className="index-title">{title}</h3>
                          </Link>
                        ) : (
                          <h3 className="index-title">{title}</h3>
                        )}
                        {project.slug && (
                          <Link
                            to={`/projects/${project.slug}`}
                            className="project-title-arrow"
                            aria-label={`View ${title}`}
                          >
                            <ArrowUpRight
                              className="index-arrow"
                              size={20}
                              aria-hidden="true"
                            />
                          </Link>
                        )}
                      </div>
                      {project.category?.name && (
                        <span className="index-meta">
                          {project.category.name}
                        </span>
                      )}
                      {description && (
                        <p className="project-summary">{description}</p>
                      )}
                    </div>
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
                    <div className="project-links">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${title} live demo`}
                        >
                          <Globe size={16} aria-hidden="true" />
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${title} on GitHub`}
                        >
                          <Github size={16} aria-hidden="true" />
                          GitHub
                        </a>
                      )}
                      {project.slug && (
                        <Link
                          to={`/projects/${project.slug}`}
                          className="project-view-link"
                        >
                          View Project
                          <ArrowUpRight size={15} aria-hidden="true" />
                        </Link>
                      )}
                    </div>
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
    </section>
  );
}
