import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSite } from "../context/SiteContext.jsx";
import useParallax from "../hooks/useParallax.js";
import useTitle from "../hooks/useTitle.js";
import Hero from "../components/Hero.jsx";
import AboutSection from "../components/AboutSection.jsx";
import ExpertiseSection from "../components/ExpertiseSection.jsx";
import SelectedProjects from "../components/SelectedProjects.jsx";
import DevProjects from "../components/DevProjects.jsx";
import MarketingSection from "../components/MarketingSection.jsx";
import ExperienceSection from "../components/ExperienceSection.jsx";
import ResumeSection from "../components/ResumeSection.jsx";
import ContactSection from "../components/ContactSection.jsx";
import SeasonalAtmosphere from "../components/SeasonalAtmosphere.jsx";
import {
  ABOUT_INTRO,
  FALLBACK_EXPERIENCE,
} from "../data/portfolioContent.js";

export default function Home() {
  const { data, appearance, loading, error, reload } = useSite();
  const { hash } = useLocation();
  useTitle(
    data
      ? `${data.profile.name}. ${data.profile.titles.join(", ").toLowerCase()}`
      : undefined,
  );
  useParallax([data]);

  // Smooth scroll to #section, including when arriving from another page
  useEffect(() => {
    if (!data) return;
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const el = document.getElementById(hash.slice(1));
    if (el)
      requestAnimationFrame(() =>
        el.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        }),
      );
  }, [hash, data]);

  const season = appearance.season;
  const {
    profile,
    skills,
    experience,
    categories,
    projects,
    campaigns,
    resume,
  } = data;
  const aboutProfile = profile.aboutBody
    ? profile
    : { ...profile, aboutBody: ABOUT_INTRO };
  const skillStats = [
    { label: "Technologies", value: skills.length },
    {
      label: "Skill areas",
      value: new Set(skills.map((skill) => skill.group)).size,
    },
  ];
  return (
    <main>
      <SeasonalAtmosphere season={season} />
      <div className="lavender-flow" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="season-zone" data-season-zone={season}>
        <Hero profile={profile} season={season} />
      </div>
      <div className="season-zone" data-season-zone={season}>
        <AboutSection profile={aboutProfile} stats={skillStats} season={season} />
        <ExpertiseSection skills={skills} season={season} />
      </div>
      <div className="season-zone" data-season-zone={season}>
        <SelectedProjects
          projects={projects}
          loading={loading}
          error={error}
          onRetry={reload}
        />
        <DevProjects projects={projects} categories={categories} />
        <MarketingSection campaigns={campaigns} />
        <ExperienceSection
          items={experience.length ? experience : FALLBACK_EXPERIENCE}
        />
      </div>
      <div className="season-zone" data-season-zone={season}>
        <ResumeSection resume={resume} />
        <ContactSection profile={profile} />
      </div>
    </main>
  );
}
