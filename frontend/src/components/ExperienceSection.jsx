import Reveal from "./Reveal.jsx";
import SectionHead from "./SectionHead.jsx";

export default function ExperienceSection({ items }) {
  if (!items.length) return null;
  return (
    <section id="experience" className="section alt">
      <div className="container">
        <SectionHead title="Experience" />
        <Reveal as="ol" className="timeline">
          {items.map((x, i) => (
            <Reveal as="li" key={x._id} delay={i * 60} className="tl-item">
              <p className="tl-date">
                {x.startDate}
                {(x.current || x.endDate) &&
                  ` to ${x.current ? "Present" : x.endDate}`}
              </p>
              <div>
                <h3>{x.role}</h3>
                <p className="tl-org">
                  {[x.organization, x.location].filter(Boolean).join(", ")}
                  {x.kind === "education" ? " (Education)" : ""}
                </p>
                {x.description && <p>{x.description}</p>}
              </div>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
