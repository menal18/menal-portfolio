import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCanvas from './HeroCanvas.jsx';
import SplitText from './SplitText.jsx';
import Magnetic from './Magnetic.jsx';

export default function Hero({ profile, season }) {
  const name = (profile?.name || 'Menal').toUpperCase();
  const titles = profile?.titles?.length ? profile.titles : ['DEVELOPER', 'DIGITAL MARKETER', 'CREATIVE THINKER'];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (titles.length < 2) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % titles.length), 2900);
    return () => clearInterval(t);
  }, [titles.length]);

  return (
    <section id="home" className="hero">
      <HeroCanvas season={season} />
      <div className="hero-inner">
        {profile?.tagline && <p className="hero-sub">{profile.tagline}</p>}
        <h1 className="hero-name" data-speed="-0.06"><SplitText text={name} delay={250} step={90} /></h1>
        <p className="hero-roles" aria-live="polite">
          <span className={`role-word ${titles.length > 1 ? 'cycle' : ''}`} key={i}><SplitText text={titles[i]} step={28} /></span>
        </p>
        <div className="hero-cta">
          <Magnetic><Link className="btn primary" to="/#projects">See selected work</Link></Magnetic>
          <Magnetic><Link className="btn ghost" to="/#contact">Get in touch</Link></Magnetic>
        </div>
      </div>
      <Link to="/#about" className="scroll-indicator" aria-label="Scroll to About"><span className="scroll-line" /><span>Scroll</span></Link>
    </section>
  );
}
