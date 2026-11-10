import { useEffect, useRef } from "react";
import { APPEARANCE_THEMES } from "../data/appearanceThemes.js";

const rgb = (hex) => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
].join(",");

// A drifting thread-mesh that bends toward the pointer. Pauses off-screen / hidden tab.
export default function HeroCanvas({ season }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const palette = APPEARANCE_THEMES[season].palette;
    const primary = rgb(palette[0]);
    const secondary = rgb(palette[1]);
    const text = rgb(APPEARANCE_THEMES[season].properties["--theme-text"]);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let pts = [];
    let raf = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999 };

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(36, Math.min(110, Math.round((w * h) / 15000)));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
        warm: Math.random() > 0.78,
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const reach = 120;
      const pr = 170;
      for (const p of pts) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < pr && d > 0.1) {
            p.x += (dx / d) * (pr - d) * 0.012;
            p.y += (dy / d) * (pr - d) * 0.012;
          }
        }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < reach) {
            ctx.strokeStyle = `rgba(${primary},${(1 - d / reach) * 0.4})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dp = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (dp < pr) {
          ctx.strokeStyle = `rgba(${secondary},${(1 - dp / pr) * 0.55})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
        ctx.fillStyle = a.warm
          ? `rgba(${secondary},.85)`
          : `rgba(${text},.75)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const loop = () => {
      if (visible && !document.hidden) frame();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      const r = canvas.getBoundingClientRect();
      pointer.x = t.clientX - r.left;
      pointer.y = t.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();
    if (reduce) frame();
    else raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => {
      build();
      if (reduce) frame();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onLeave);
    };
  }, [season]);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
