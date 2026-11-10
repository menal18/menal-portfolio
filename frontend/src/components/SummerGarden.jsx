import { useEffect, useId, useState } from "react";

const LEAVES = [
  [42, 285, -36, 1.08],
  [93, 258, 24, 0.88],
  [137, 237, -22, 1],
  [183, 199, 31, 0.84],
  [226, 173, -25, 1.08],
  [273, 139, 28, 0.9],
  [317, 103, -25, 1],
  [355, 63, 24, 0.78],
  [98, 222, 52, 0.68],
  [202, 183, -58, 0.7],
  [292, 125, 55, 0.72],
];

function Branch({ className, id }) {
  return (
    <svg
      className={`garden-branch ${className}`}
      viewBox="0 0 420 330"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#829c48" />
          <stop offset=".46" stopColor="#547b32" />
          <stop offset="1" stopColor="#315927" />
        </linearGradient>
        <linearGradient id={`${id}-leaf-light`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#9aad55" />
          <stop offset=".55" stopColor="#65863b" />
          <stop offset="1" stopColor="#41662d" />
        </linearGradient>
        <linearGradient id={`${id}-stem`} x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#49682f" />
          <stop offset="1" stopColor="#8d9650" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${id}-stem)`} strokeLinecap="round">
        <path d="M-25 320C62 272 100 230 157 183S269 91 432-18" strokeWidth="5" />
        <path d="M64 273C72 217 49 170 8 126M123 214C174 190 205 152 219 106M181 164C155 119 153 77 165 38M249 115C303 109 343 78 369 37M100 238C45 238 8 212-18 174" strokeWidth="2.1" />
      </g>
      {LEAVES.map(([x, y, angle, scale], index) => {
        const leafId = index % 3 === 0 ? `${id}-leaf-light` : `${id}-leaf`;
        return (
          <g
            key={`${x}-${y}`}
            transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}
          >
            <path
              d="M0 0C-8-24-6-58 10-85C38-73 52-45 44-21C37-4 18 2 0 0Z"
              fill={`url(#${leafId})`}
              stroke="#45652f"
              strokeOpacity=".36"
              strokeWidth="1.2"
            />
            <path
              d="M1-2C15-27 28-48 43-67M15-28 1-41M24-43 14-57M28-31 43-38"
              fill="none"
              stroke="#c1c887"
              strokeOpacity=".62"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        );
      })}
      <g fill="none" stroke={`url(#${id}-stem)`} strokeLinecap="round">
        <path d="M-8 128C14 105 27 82 32 54M158 184C207 197 243 190 274 171M219 106C249 70 263 34 258 3" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

function FloatingLeaf({ className, id }) {
  return (
    <svg className={`garden-floating-leaf ${className}`} viewBox="0 0 42 58" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8da64b" />
          <stop offset=".52" stopColor="#557b34" />
          <stop offset="1" stopColor="#345b2d" />
        </linearGradient>
      </defs>
      <path
        d="M4 52C1 28 12 7 37 3C40 29 29 48 4 52Z"
        fill={`url(#${id})`}
        stroke="rgba(57, 91, 39, .48)"
        strokeWidth="1.2"
      />
      <path
        d="M5 51 34 8M15 36 10 24M22 26 20 16M19 31 31 28"
        fill="none"
        stroke="rgba(221, 225, 163, .78)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SummerGarden() {
  const [visible, setVisible] = useState(false);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const section = document.getElementById("about");
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`summer-garden${visible ? " is-visible" : ""}`}
      aria-hidden="true"
    >
      <Branch className="garden-top-left" id={`${id}-tl`} />
      <Branch className="garden-top-right" id={`${id}-tr`} />
      <Branch className="garden-bottom-left" id={`${id}-bl`} />
      <Branch className="garden-bottom-right" id={`${id}-br`} />
      <FloatingLeaf className="garden-leaf-one" id={`${id}-float-1`} />
      <FloatingLeaf className="garden-leaf-two" id={`${id}-float-2`} />
      <FloatingLeaf className="garden-leaf-three" id={`${id}-float-3`} />
      <FloatingLeaf className="garden-leaf-four" id={`${id}-float-4`} />
      <FloatingLeaf className="garden-leaf-five" id={`${id}-float-5`} />
    </div>
  );
}
