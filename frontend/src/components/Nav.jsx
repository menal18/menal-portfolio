import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const LINKS = [
  ["about", "About"],
  ["expertise", "Expertise"],
  ["projects", "Projects"],
  ["development", "Development"],
  ["marketing", "Marketing"],
  ["experience", "Experience"],
  ["resume", "Resume"],
  ["contact", "Contact"],
];

export default function Nav({ name = "Menal", ready, hasMarketing = true }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Scroll-spy
  useEffect(() => {
    if (pathname !== "/" || !ready) {
      setActive("");
      return undefined;
    }
    const els = LINKS.filter(([id]) => id !== "marketing" || hasMarketing)
      .map(([id]) => document.getElementById(id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname, ready, hasMarketing]);

  return (
    <header
      className={`nav ${scrolled ? "scrolled" : ""}${open ? " menu-open" : ""}`}
    >
      <Link to="/#home" className="nav-brand">
        {name}
        <span>.</span>
      </Link>
      <nav
        id="primary-navigation"
        className={`nav-links ${open ? "open" : ""}`}
        aria-label="Primary"
      >
        {LINKS.filter(([id]) => id !== "marketing" || hasMarketing).map(
          ([id, label], idx) => (
            <Link
              key={id}
              to={`/#${id}`}
              className={active === id ? "active" : ""}
              style={{ "--i": idx }}
              onClick={() => {
                setOpen(false);
                if (pathname === "/")
                  setTimeout(
                    () =>
                      document
                        .getElementById(id)
                        ?.scrollIntoView({
                          behavior: matchMedia(
                            "(prefers-reduced-motion: reduce)",
                          ).matches
                            ? "auto"
                            : "smooth",
                        }),
                    60,
                  );
              }}
            >
              {label}
            </Link>
          ),
        )}
      </nav>
      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
    </header>
  );
}
