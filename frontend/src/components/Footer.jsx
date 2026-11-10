import Socials from "./Socials.jsx";
import Reveal from "./Reveal.jsx";

export default function Footer({ profile, season = "spring" }) {
  return (
    <footer className="footer" data-season-zone={season}>
      <Reveal className="container footer-in">
        <p>
          &copy; {new Date().getFullYear()} {profile?.name || "Menal"}. All
          rights reserved.
        </p>
        <Socials social={profile?.social} />
      </Reveal>
    </footer>
  );
}
