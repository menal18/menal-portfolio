import { useEffect, useId, useRef, useState } from "react";
import {
  Code2,
  Cloud,
  Database,
  Globe,
  Layers,
  Megaphone,
  Palette,
  Server,
  Shapes,
  Smartphone,
  Sparkles,
  Wrench,
} from "lucide-react";
import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

const ORDER = ["Development", "Marketing", "Creative", "Tools"];
const GROUP_ICONS = {
  Frontend: Code2,
  Backend: Server,
  Database,
  Tools: Wrench,
  Development: Code2,
  Marketing: Megaphone,
  Creative: Shapes,
};
const SKILL_ICONS = {
  Code2,
  Database,
  Server,
  Megaphone,
  Palette,
  Smartphone,
  Cloud,
  Wrench,
  Globe,
  Sparkles,
  Shapes,
  Layers,
};
const PETALS = [
  ["expertise-petal-one", 18, 30, -16],
  ["expertise-petal-two", 39, 68, 31],
  ["expertise-petal-three", 71, 34, 12],
  ["expertise-petal-four", 86, 62, -37],
];

function Sunflower({ id, className }) {
  const outerPetals = Array.from({ length: 22 }, (_, index) => index * (360 / 22));
  const innerPetals = Array.from({ length: 16 }, (_, index) => index * 22.5 + 11);

  return (
    <svg
      className={`expertise-sunflower ${className}`}
      viewBox="0 0 240 340"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-petal`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff7a8" />
          <stop offset=".45" stopColor="#f8c934" />
          <stop offset="1" stopColor="#df8b18" />
        </linearGradient>
        <linearGradient id={`${id}-petal-back`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e9a323" />
          <stop offset=".62" stopColor="#ffd94b" />
          <stop offset="1" stopColor="#fff2a1" />
        </linearGradient>
        <linearGradient id={`${id}-stem`} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#355b32" />
          <stop offset=".5" stopColor="#789342" />
          <stop offset="1" stopColor="#426b34" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#9caf57" />
          <stop offset=".48" stopColor="#567d3c" />
          <stop offset="1" stopColor="#31572f" />
        </linearGradient>
        <radialGradient id={`${id}-center`} cx=".38" cy=".3" r=".78">
          <stop stopColor="#805124" />
          <stop offset=".55" stopColor="#563719" />
          <stop offset="1" stopColor="#30271b" />
        </radialGradient>
        <pattern id={`${id}-seeds`} width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.15" fill="#d49a3b" opacity=".8" />
          <circle cx="7" cy="6" r=".9" fill="#241f17" opacity=".9" />
        </pattern>
      </defs>
      <g className="expertise-stem">
        <path
          d="M120 111C121 166 119 231 124 330"
          fill="none"
          stroke={`url(#${id}-stem)`}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <g className="expertise-leaf expertise-leaf-a">
          <path d="M121 205C81 169 53 176 38 209C65 231 94 231 121 205Z" fill={`url(#${id}-leaf)`} />
          <path d="M43 207C72 208 95 207 119 205M72 207 61 192M87 206 78 219M101 205 96 194" fill="none" stroke="#cfda8b" strokeOpacity=".7" strokeWidth="1.5" />
        </g>
        <g className="expertise-leaf expertise-leaf-b">
          <path d="M121 248C153 210 184 213 202 242C181 269 150 273 121 248Z" fill={`url(#${id}-leaf)`} />
          <path d="M198 242C173 245 150 247 123 248M171 245 184 230M154 247 164 260M139 248 145 236" fill="none" stroke="#cfda8b" strokeOpacity=".7" strokeWidth="1.5" />
        </g>
        <g className="expertise-leaf expertise-leaf-c">
          <path d="M123 286C96 258 72 262 59 284C79 307 101 308 123 286Z" fill={`url(#${id}-leaf)`} />
          <path d="M64 284 121 286M88 285 77 273M102 285 94 296" fill="none" stroke="#cfda8b" strokeOpacity=".7" strokeWidth="1.4" />
        </g>
      </g>
      <g className="expertise-bloom">
        <g transform="translate(120 112)">
          {outerPetals.map((angle) => (
            <path
              key={`outer-${angle}`}
              transform={`rotate(${angle})`}
              d="M0 8C-13-5-18-33-10-66C-6-82-2-94 0-101C5-88 12-73 15-57C21-30 13-7 0 8Z"
              fill={`url(#${id}-petal-back)`}
              stroke="#fff0a0"
              strokeOpacity=".58"
              strokeWidth="1.2"
            />
          ))}
          {innerPetals.map((angle) => (
            <path
              key={`inner-${angle}`}
              transform={`rotate(${angle}) scale(.78)`}
              d="M0 7C-12-5-15-30-8-56C-4-72-1-82 0-88C5-75 11-61 14-45C19-24 12-5 0 7Z"
              fill={`url(#${id}-petal)`}
              stroke="#ffed89"
              strokeOpacity=".7"
              strokeWidth="1"
            />
          ))}
        </g>
        <circle cx="120" cy="112" r="46" fill="#d79c32" />
        <circle cx="120" cy="112" r="39" fill={`url(#${id}-center)`} />
        <circle cx="120" cy="112" r="36" fill={`url(#${id}-seeds)`} opacity=".9" />
        <circle cx="120" cy="112" r="4" fill="#d69a3c" opacity=".75" />
      </g>
    </svg>
  );
}

function FloatingPetal({ className, left, top, angle }) {
  return (
    <svg
      className={`expertise-floating-petal ${className}`}
      style={{ left: `${left}%`, top: `${top}%`, "--petal-angle": `${angle}deg` }}
      viewBox="0 0 34 52"
      aria-hidden="true"
    >
      <path d="M17 49C3 38 2 17 17 3C32 17 31 38 17 49Z" fill="url(#expertise-petal-gradient)" />
      <path d="M17 46C17 31 17 17 17 7" fill="none" stroke="#fff3ba" strokeOpacity=".7" strokeWidth="1.2" />
    </svg>
  );
}

function ExpertiseGarden() {
  const [visible, setVisible] = useState(false);
  const id = useId().replace(/:/g, "");
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`expertise-garden${visible ? " is-visible" : ""}`}
      aria-hidden="true"
    >
      <svg className="expertise-garden-defs" viewBox="0 0 1 1">
        <defs>
          <linearGradient id="expertise-petal-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff0a0" />
            <stop offset=".55" stopColor="#f5bb2c" />
            <stop offset="1" stopColor="#df861c" />
          </linearGradient>
        </defs>
      </svg>
      <svg className="expertise-garden-foliage foliage-top-left" viewBox="0 0 420 230">
        <path d="M-20 35C95 61 160 85 270 146S370 191 445 216" fill="none" stroke="#4f7138" strokeWidth="5" />
        {[0, 1, 2, 3, 4, 5, 6].map((leaf) => (
          <g key={leaf} transform={`translate(${leaf * 57 - 10} ${35 + leaf * 25}) rotate(${leaf % 2 ? 38 : -34})`}>
            <path d="M0 0C-8-25 5-53 34-65C43-39 30-10 0 0Z" fill={leaf % 2 ? "#739148" : "#557a3b"} />
            <path d="M1-2 30-59M14-29 5-42M21-42 14-53" fill="none" stroke="#c0cb86" strokeOpacity=".65" strokeWidth="1.5" />
          </g>
        ))}
      </svg>
      <Sunflower id={`${id}-top-right`} className="sunflower-top-right" />
      <Sunflower id={`${id}-bottom-left`} className="sunflower-bottom-left" />
      <Sunflower id={`${id}-bottom-right`} className="sunflower-bottom-right" />
      {PETALS.map(([className, left, top, angle]) => (
        <FloatingPetal
          key={className}
          className={className}
          left={left}
          top={top}
          angle={angle}
        />
      ))}
    </div>
  );
}

export default function ExpertiseSection({ skills = [], season }) {
  const groupNames = [
    ...ORDER.filter((group) => skills.some((skill) => skill.group === group)),
    ...new Set(
      skills
        .map((skill) => skill.group)
        .filter((group) => !ORDER.includes(group)),
    ),
  ];
  const groups = groupNames.map((group) => [
    group,
    skills.filter((skill) => skill.group === group),
  ]);
  return (
    <section id="expertise" className="section alt expertise-section">
      {season === "summer" && <ExpertiseGarden />}
      <div className="container">
        <SectionHead
          title="Expertise"
          lead="Tools and disciplines I work with."
        />
        {groups.length ? (
          <div className="skill-groups">
            {groups.map(([group, list], groupIndex) => {
              const Icon = GROUP_ICONS[group] || Sparkles;
              return (
                <Reveal
                  key={group}
                  className="skill-group"
                  delay={groupIndex * 100}
                >
                  <h3>
                    <span className="skill-group-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    {group}
                  </h3>
                  <ul className="skill-list">
                    {list.map((skill, index) => {
                      const SkillIcon = SKILL_ICONS[skill.icon] || Sparkles;
                      return (
                        <li
                          key={skill._id}
                          className="skill"
                          data-cursor
                          style={{ "--skill-index": index }}
                        >
                          <div className="skill-item-head">
                            <span className="skill-item-icon" aria-hidden="true">
                              <SkillIcon size={18} />
                            </span>
                            <span className="skill-name">{skill.name}</span>
                          </div>
                          {skill.description && (
                            <p className="skill-description">{skill.description}</p>
                          )}
                          {skill.technologies?.length > 0 && (
                            <ul className="skill-technologies">
                              {skill.technologies.map((technology) => (
                                <li key={technology}>{technology}</li>
                              ))}
                            </ul>
                          )}
                          {skill.level > 0 && (
                            <i
                              className="bar"
                              style={{ "--lv": `${skill.level}%` }}
                              role="img"
                              aria-label={`${skill.level} percent`}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <p className="expertise-empty">Expertise details will be added soon.</p>
        )}
      </div>
    </section>
  );
}
