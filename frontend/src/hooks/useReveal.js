import { useEffect, useRef, useState } from 'react';

// Adds `in` once the element scrolls into view (Intersection Observer). One-shot.
export default function useReveal(options = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options.threshold, options.rootMargin]);
  return [ref, shown];
}
