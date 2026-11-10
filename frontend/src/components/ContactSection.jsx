import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import api, { errMsg } from "../services/api.js";
import Reveal from "./Reveal.jsx";
import Magnetic from "./Magnetic.jsx";
import SectionHead from "./SectionHead.jsx";
import Socials from "./Socials.jsx";
import SplitText from "./SplitText.jsx";

const EMPTY = { name: "", email: "", subject: "", message: "", website: "" };

export default function ContactSection({ profile }) {
  const [f, setF] = useState(EMPTY);
  const [state, setState] = useState({ status: "idle", msg: "" });
  const c = profile.contact || {};
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: "sending", msg: "" });
    try {
      await api.post("/contact", f);
      setF(EMPTY);
      setState({
        status: "sent",
        msg: "Message sent. Thank you, I will reply soon.",
      });
    } catch (err) {
      setState({ status: "error", msg: errMsg(err) });
    }
  };

  return (
    <section id="contact" className="section alt">
      <div className="container">
        <SectionHead
          title={
            <SplitText
              text="Let's build something extraordinary together."
              className="contact-title"
              step={22}
            />
          }
          lead="Have a project or a campaign in mind? Write to me."
        />
        <div className="contact-grid">
          <Reveal className="contact-info">
            <div className="contact-art" aria-hidden="true">
              <div className="contact-envelope">
                <Mail size={52} strokeWidth={1.2} />
              </div>
            </div>
            <ul>
              {c.email && (
                <li>
                  <Mail size={18} />
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                </li>
              )}
              {c.phone && (
                <li>
                  <Phone size={18} />
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a>
                </li>
              )}
              {c.location && (
                <li>
                  <MapPin size={18} />
                  <span>{c.location}</span>
                </li>
              )}
            </ul>
            <Socials social={profile.social} />
          </Reveal>
          <Reveal
            as="form"
            className="form"
            onSubmit={submit}
            noValidate={false}
            delay={100}
          >
            <div className="field">
              <label htmlFor="c-name">Name</label>
              <input
                id="c-name"
                required
                maxLength={100}
                value={f.name}
                onChange={set("name")}
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="c-email">Email</label>
              <input
                id="c-email"
                type="email"
                required
                maxLength={160}
                value={f.email}
                onChange={set("email")}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="c-subject">Subject (optional)</label>
              <input
                id="c-subject"
                maxLength={160}
                value={f.subject}
                onChange={set("subject")}
              />
            </div>
            <div className="field">
              <label htmlFor="c-msg">Message</label>
              <textarea
                id="c-msg"
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                value={f.message}
                onChange={set("message")}
              />
            </div>
            <div className="hp" aria-hidden="true">
              <label>
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={f.website}
                  onChange={set("website")}
                />
              </label>
            </div>
            <Magnetic>
              <button
                className="btn primary"
                type="submit"
                disabled={state.status === "sending"}
              >
                <Send size={16} />{" "}
                {state.status === "sending" ? "Sending" : "Send message"}
              </button>
            </Magnetic>
            {state.msg && (
              <p className={`form-msg ${state.status}`} role="status">
                {state.msg}
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
