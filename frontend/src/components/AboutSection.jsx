import { useEffect, useState } from "react";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";
import { optimize } from "../services/images.js";
import useReveal from "../hooks/useReveal.js";
import SummerGarden from "./SummerGarden.jsx";

function CountUp({ value }) {
  const [ref, shown] = useReveal({ threshold: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shown) return undefined;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(value);
      return undefined;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / 900, 1);
      setCount(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shown, value]);

  return <span ref={ref}>{count}</span>;
}

export default function AboutSection({ profile, stats = [], season }) {
  const paras = (profile.aboutBody || "").split(/\n+/).filter(Boolean);
  const onPortraitMove = (event) => {
    if (
      event.pointerType !== "mouse" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty(
      "--tilt-x",
      `${(-y * 5).toFixed(2)}deg`,
    );
    event.currentTarget.style.setProperty(
      "--tilt-y",
      `${(x * 7).toFixed(2)}deg`,
    );
  };
  const resetPortrait = (event) => {
    event.currentTarget.style.removeProperty("--tilt-x");
    event.currentTarget.style.removeProperty("--tilt-y");
  };
  return (
    <section id="about" className="section">
      {season === "summer" && <SummerGarden />}
      <div className="container">
        <div className="about-grid">
          <Reveal className="about-portrait">
            <div
              className="portrait-frame"
              onPointerMove={onPortraitMove}
              onPointerLeave={resetPortrait}
            >
              {profile.portrait?.url ? (
                <img
                  data-speed="0.04"
                  src={optimize(profile.portrait.url, 900)}
                  alt={`Portrait of ${profile.name}`}
                  loading="lazy"
                />
              ) : (
                <span className="monogram" aria-hidden="true" data-speed="0.05">
                  {(profile.name || "M").charAt(0)}
                </span>
              )}
            </div>
          </Reveal>
          <div className="about-body">
            <SectionHead title={profile.aboutHeading || "About me"} />
            {paras.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 80}>
                {p}
              </Reveal>
            ))}
            {stats.length > 0 && (
              <Reveal as="dl" className="about-stats">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dd>
                      <CountUp value={stat.value} />
                      <span>+</span>
                    </dd>
                    <dt>{stat.label}</dt>
                  </div>
                ))}
              </Reveal>
            )}
            {(profile.contact?.location || profile.contact?.availability) && (
              <Reveal as="dl" className="facts">
                {profile.contact.location && (
                  <div>
                    <dt>Based in</dt>
                    <dd>{profile.contact.location}</dd>
                  </div>
                )}
                {profile.contact.availability && (
                  <div>
                    <dt>Availability</dt>
                    <dd>{profile.contact.availability}</dd>
                  </div>
                )}
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
