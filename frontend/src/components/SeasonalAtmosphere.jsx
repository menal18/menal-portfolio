import { useEffect, useRef, useState } from "react";
import { APPEARANCE_THEMES } from "../data/appearanceThemes.js";
import SeasonalIllustration from "./SeasonalIllustration.jsx";

const PARTICLE_COUNTS = {
  spring: [32, 22, 14],
  summer: [18, 12, 8],
  autumn: [34, 23, 16],
  winter: [52, 38, 22],
};

function createParticles(season, width, height, compact) {
  const count = PARTICLE_COUNTS[season][compact];
  const { colors, outline, shadow } = APPEARANCE_THEMES[season].decorations;
  return Array.from({ length: count }, () => {
    const depth = Math.random() * 0.85 + 0.55;
    const size =
      season === "winter"
        ? (Math.random() * 4.6 + 3.1) * depth
        : season === "autumn"
          ? (Math.random() * 7 + 7) * depth
          : season === "spring"
          ? (Math.random() * 5 + 8) * depth
            : (Math.random() * 2.5 + 2) * depth;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size,
      depth,
      fall:
        season === "winter"
          ? (18 + Math.random() * 30) * depth
          : season === "autumn"
            ? (18 + Math.random() * 34) * depth
            : season === "spring"
              ? (22 + Math.random() * 38) * depth
              : season === "summer"
                ? (14 + Math.random() * 12) * depth
              : 0,
      wind: (Math.random() - 0.5) * (season === "winter" ? 8 : 17),
      sway:
        season === "winter"
          ? Math.random() * 7 + 3
          : Math.random() * 12 + 5,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * (season === "winter" ? 0.55 : 1.8),
      alpha:
        season === "winter"
          ? size > 8.5
            ? Math.random() * 0.2 + 0.48
            : size > 4.5
              ? Math.random() * 0.12 + 0.82
              : Math.random() * 0.14 + 0.68
          : Math.random() * 0.32 + 0.58,
      color:
        season === "winter"
          ? ["#ffffff", "#d8efff", "#a9cce5"][Math.floor(Math.random() * 3)]
          : colors[Math.floor(Math.random() * colors.length)],
      outline: season === "winter" ? "rgba(76, 116, 145, 0.96)" : outline,
      shadow: season === "winter" ? "rgba(78, 135, 174, 0.98)" : shadow,
      soft: season === "winter" && size > 8.5 && Math.random() < 0.4,
    };
  });
}

function drawPetal(ctx, particle) {
  const { size, color } = particle;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.bezierCurveTo(
    size * 0.72,
    size * 0.65,
    size * 0.7,
    -size * 0.35,
    size * 0.12,
    -size,
  );
  ctx.quadraticCurveTo(0, -size * 0.72, -size * 0.12, -size);
  ctx.bezierCurveTo(
    -size * 0.7,
    -size * 0.35,
    -size * 0.72,
    size * 0.65,
    0,
    size,
  );
  ctx.fill();
  ctx.strokeStyle = particle.outline;
  ctx.lineWidth = Math.max(0.45, size * 0.055);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.7);
  ctx.quadraticCurveTo(size * 0.08, 0, 0, -size * 0.74);
  ctx.stroke();
}

function drawLeaf(ctx, particle) {
  const { size, color } = particle;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.34, -size * 0.76, size * 0.86, -size * 0.46, size * 0.68, 0);
  ctx.quadraticCurveTo(size * 0.5, size * 0.64, 0, size);
  ctx.quadraticCurveTo(-size * 0.5, size * 0.64, -size * 0.68, 0);
  ctx.bezierCurveTo(-size * 0.86, -size * 0.46, -size * 0.34, -size * 0.76, 0, -size);
  ctx.fill();
  ctx.strokeStyle = particle.outline;
  ctx.lineWidth = Math.max(0.55, size * 0.045);
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.78);
  ctx.lineTo(0, size * 0.78);
  ctx.moveTo(0, -size * 0.08);
  ctx.lineTo(size * 0.38, -size * 0.42);
  ctx.moveTo(0, size * 0.2);
  ctx.lineTo(-size * 0.38, -size * 0.19);
  ctx.stroke();
}

function drawSnowflake(ctx, particle) {
  const radius = particle.size * 0.72;
  if (particle.soft) {
    const glow = particle.size * 1.7;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glow);
    gradient.addColorStop(0, "rgba(245, 251, 255, 0.92)");
    gradient.addColorStop(0.35, "rgba(190, 220, 240, 0.56)");
    gradient.addColorStop(1, "rgba(150, 191, 220, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, glow, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.lineCap = "round";
  ctx.fillStyle = particle.color;
  ctx.shadowColor = particle.shadow;
  ctx.shadowBlur = particle.depth > 1 ? 6 : 4;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0.8, radius * 0.34), 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(0.8, particle.size * 0.1);
  for (let axis = 0; axis < 3; axis += 1) {
    const angle = (Math.PI / 3) * axis;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    ctx.strokeStyle = particle.outline;
    ctx.beginPath();
    ctx.moveTo(-x, -y);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (particle.size > 4.2) {
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = Math.max(0.7, particle.size * 0.075);
      ctx.beginPath();
      for (const direction of [-1, 1]) {
        const branchBaseX = x * 0.62 * direction;
        const branchBaseY = y * 0.62 * direction;
        const branchAngle = angle + (direction < 0 ? Math.PI : 0);
        const branchLength = radius * 0.28;
        for (const side of [-1, 1]) {
          ctx.moveTo(branchBaseX, branchBaseY);
          ctx.lineTo(
            branchBaseX + Math.cos(branchAngle + side * 0.82) * branchLength,
            branchBaseY + Math.sin(branchAngle + side * 0.82) * branchLength,
          );
        }
      }
      ctx.stroke();
    }
  }
  ctx.lineCap = "butt";
}

function drawParticles(ctx, particles, season) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const particle of particles) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.globalAlpha = particle.alpha;

    if (season === "spring") {
      drawPetal(ctx, particle);
    } else if (season === "autumn") {
      drawLeaf(ctx, particle);
    } else if (season === "winter") {
      drawSnowflake(ctx, particle);
    } else {
      const glow = particle.size * (particle.depth > 1 ? 4 : 2.5);
      const color = particle.color.match(/[a-f\d]{2}/gi).map((part) => parseInt(part, 16)).join(",");
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glow);
      gradient.addColorStop(0, `rgba(${color}, 0.9)`);
      gradient.addColorStop(0.25, `rgba(${color}, 0.42)`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, glow, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function WeatherLayer({ season, active, leaving }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let reducedMotion = motionPreference.matches;
    let compact = 0;
    let width = 0;
    let height = 0;
    const activeSeason = season;
    let particles = [];
    let frameId = 0;
    let lastFrame = 0;

    const cancelAnimation = () => {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
    };

    const draw = () => drawParticles(context, particles, activeSeason);

    const animate = (now) => {
      frameId = 0;
      if (document.hidden || reducedMotion || !activeSeason)
        return;

      const delta = Math.min(now - (lastFrame || now), 40) / 1000;
      lastFrame = now;
      for (const particle of particles) {
        particle.phase += delta * (0.8 + particle.depth * 0.45);
        particle.x +=
          (particle.wind +
            Math.sin(particle.phase + particle.y * 0.003) * particle.sway) *
          delta;
        particle.y += particle.fall * delta;
        particle.rotation += particle.spin * delta;

        if (particle.y > height + particle.size * 2) {
          particle.y = -particle.size * 2;
          particle.x = Math.random() * width;
        }
        if (particle.x < -particle.size * 2) particle.x = width + particle.size;
        if (particle.x > width + particle.size * 2) particle.x = -particle.size;
      }

      draw();
      frameId = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!reducedMotion && !document.hidden && activeSeason && !frameId) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      compact = width <= 600 ? 2 : width <= 900 ? 1 : 0;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = activeSeason
        ? createParticles(activeSeason, width, height, compact)
        : [];
      draw();
    };

    const onVisibilityChange = () => {
      if (document.hidden) cancelAnimation();
      else startAnimation();
    };
    const onMotionChange = (event) => {
      reducedMotion = event.matches;
      cancelAnimation();
      draw();
      startAnimation();
    };

    canvas.dataset.season = activeSeason || "";
    canvas.dataset.particles = activeSeason ? "on" : "off";
    resize();
    startAnimation();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimation();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionChange);
      delete canvas.dataset.season;
      delete canvas.dataset.particles;
    };
  }, [season]);

  return (
    <div
      className={`seasonal-atmosphere seasonal-layer${active ? " active" : ""}${leaving ? " leaving" : ""}`}
      data-season={season}
    >
      <SeasonalIllustration season={season} />
      <canvas ref={canvasRef} className="seasonal-particles" aria-hidden="true" />
    </div>
  );
}

export default function SeasonalAtmosphere({ season }) {
  const [layers, setLayers] = useState(() => [
    { season, active: true, leaving: false },
  ]);
  const previousSeason = useRef(season);
  const frameRef = useRef(0);
  const timerRef = useRef(0);

  useEffect(() => {
    if (previousSeason.current === season) return undefined;
    const oldSeason = previousSeason.current;
    previousSeason.current = season;
    window.cancelAnimationFrame(frameRef.current);
    window.clearTimeout(timerRef.current);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLayers([{ season, active: true, leaving: false }]);
      return undefined;
    }

    setLayers([
      { season: oldSeason, active: false, leaving: true },
      { season, active: false, leaving: false },
    ]);
    frameRef.current = window.requestAnimationFrame(() => {
      setLayers((current) =>
        current.map((layer) =>
          layer.season === season ? { ...layer, active: true } : layer,
        ),
      );
    });
    timerRef.current = window.setTimeout(() => {
      setLayers([{ season, active: true, leaving: false }]);
    }, 1300);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(timerRef.current);
    };
  }, [season]);

  return (
    <div className="seasonal-atmosphere-host" aria-hidden="true">
      {layers.map((layer) => (
        <WeatherLayer
          key={layer.season}
          season={layer.season}
          active={layer.active}
          leaving={layer.leaving}
        />
      ))}
    </div>
  );
}
