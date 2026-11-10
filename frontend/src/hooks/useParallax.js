import { useEffect } from 'react';

// Elements with data-speed="0.1" drift against scroll. One rAF-throttled listener, transform-only.
export default function useParallax(deps = []) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      document.querySelectorAll('[data-speed]').forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
