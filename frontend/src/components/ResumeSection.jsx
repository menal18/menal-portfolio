import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import Magnetic from "./Magnetic.jsx";
import SectionHead from "./SectionHead.jsx";
import { resumeUrl } from "../services/api.js";

export default function ResumeSection({ resume }) {
  return (
    <section id="resume" className="section">
      <div className="container">
        <SectionHead title="Resume" />
        <Reveal className="resume-block">
          {resume.available ? (
            <>
              <p className="lead">The latest version, as a PDF.</p>
              <Magnetic>
                <a
                  className="btn primary"
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={18} /> Download resume
                </a>
              </Magnetic>
              <p className="muted small">
                Updated{" "}
                {new Date(resume.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </>
          ) : (
            <>
              <p className="lead">Request a copy of my resume.</p>
              <Magnetic>
                <Link className="btn primary" to="/#contact">
                  Get in touch
                </Link>
              </Magnetic>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
