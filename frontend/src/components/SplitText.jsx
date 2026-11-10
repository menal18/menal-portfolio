// Letter-by-letter reveal. Screen readers get the whole string via aria-label.
export default function SplitText({ text = '', className = '', delay = 0, step = 55 }) {
  return (
    <span className={`split ${className}`} aria-label={text} role="text">
      {[...text].map((c, i) => (
        <span key={i} className="ch" aria-hidden="true" style={{ animationDelay: `${delay + i * step}ms` }}>
          {c === ' ' ? '\u00A0' : c}
        </span>
      ))}
    </span>
  );
}
