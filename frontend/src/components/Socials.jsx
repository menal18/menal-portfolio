import { Github, Linkedin, Instagram, Twitter, Facebook, Youtube, Globe } from 'lucide-react';

const ICONS = { github: Github, linkedin: Linkedin, instagram: Instagram, twitter: Twitter, facebook: Facebook, youtube: Youtube, website: Globe };

export default function Socials({ social = {} }) {
  const items = Object.entries(ICONS).filter(([k]) => social[k]);
  if (!items.length) return null;
  return (
    <ul className="socials">
      {items.map(([k, Icon]) => (
        <li key={k}>
          <a href={social[k]} target="_blank" rel="noopener noreferrer" aria-label={k}><Icon size={18} /><span>{k}</span></a>
        </li>
      ))}
    </ul>
  );
}
