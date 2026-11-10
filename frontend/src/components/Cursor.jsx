import { useEffect, useRef } from 'react';

// Dot follows instantly, ring eases behind. Only mounts on mouse devices.
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;

    const move = (e) => {
      x = e.clientX; y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const over = (e) => ring.current?.classList.toggle('is-hover', Boolean(e.target.closest('a, button, [data-cursor], input, textarea, select, label')));
    const down = () => ring.current?.classList.add('is-down');
    const up = () => ring.current?.classList.remove('is-down');

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
    const sync = () => {
      stop();
      if (!pointer.matches || motion.matches) return;
      document.documentElement.classList.add("has-cursor");
      window.addEventListener("mousemove", move, { passive: true });
      window.addEventListener("mouseover", over, { passive: true });
      window.addEventListener("mousedown", down);
      window.addEventListener("mouseup", up);
      raf = requestAnimationFrame(loop);
    };

    sync();
    pointer.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      stop();
      pointer.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
