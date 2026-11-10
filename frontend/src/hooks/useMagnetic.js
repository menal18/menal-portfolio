import { useEffect, useRef } from 'react';

// Pulls an element slightly toward the pointer. Skipped on touch devices and reduced motion.
export default function useMagnetic(strength = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const leave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, [strength]);
  return ref;
}
