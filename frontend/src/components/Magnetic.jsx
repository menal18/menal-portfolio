import useMagnetic from '../hooks/useMagnetic.js';

export default function Magnetic({ strength = 0.3, children }) {
  const ref = useMagnetic(strength);
  return <span ref={ref} className="magnetic">{children}</span>;
}
