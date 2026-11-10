import Reveal from './Reveal.jsx';

export default function SectionHead({ title, lead }) {
  return (
    <Reveal className="section-head">
      <h2 className="display">{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </Reveal>
  );
}
