import { useId } from "react";

const CORNERS = [
  {
    className: "floral-top-left",
    transform: undefined,
    viewBox: "-25 -20 160 180",
  },
  {
    className: "floral-top-right",
    transform: "translate(280 0) scale(-1 1)",
    viewBox: "145 -20 160 180",
  },
  {
    className: "floral-bottom-left",
    transform: "translate(0 180) scale(1 -1)",
    viewBox: "-25 20 160 180",
  },
  {
    className: "floral-bottom-right",
    transform: "translate(280 180) scale(-1 -1)",
    viewBox: "145 20 160 180",
  },
];

function FlowerBranch({ corner, id }) {
  const stemId = `${id}-stem`;
  const petalId = `${id}-petal`;
  const floretId = `${id}-floret`;

  return (
    <div className={`floral-corner ${corner.className}`}>
      <svg
        className="floral-branch-svg"
        viewBox={corner.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={stemId}
            x1="20"
            y1="10"
            x2="130"
            y2="150"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#806A88" />
            <stop offset="1" stopColor="#B78BD8" />
          </linearGradient>
          <linearGradient id={petalId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#E6D5F4" />
            <stop offset="1" stopColor="#A77BC8" />
          </linearGradient>
          <g
            id={floretId}
            fill={`url(#${petalId})`}
            stroke="#A77BC8"
            strokeWidth="0.7"
          >
            <ellipse cx="0" cy="-5" rx="2.6" ry="5" />
            <ellipse
              cx="4.7"
              cy="-1.6"
              rx="2.5"
              ry="4.6"
              transform="rotate(55 4.7 -1.6)"
            />
            <ellipse
              cx="3"
              cy="4"
              rx="2.4"
              ry="4.2"
              transform="rotate(125 3 4)"
            />
            <ellipse
              cx="-3"
              cy="4"
              rx="2.4"
              ry="4.2"
              transform="rotate(-125 -3 4)"
            />
            <ellipse
              cx="-4.7"
              cy="-1.6"
              rx="2.5"
              ry="4.6"
              transform="rotate(-55 -4.7 -1.6)"
            />
            <circle r="1.25" fill="#F2A995" stroke="none" />
          </g>
        </defs>
        <g transform={corner.transform}>
          <g
            className="lavender-branch lavender-branch-one"
            stroke={`url(#${stemId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M-15 -18C20 7 28 33 45 63C58 87 70 111 91 142"
              strokeWidth="1.8"
            />
            <path
              d="M24 28C43 24 52 15 61 4M38 52C59 48 69 37 78 24M53 79C75 74 87 63 96 48M66 103C89 99 104 86 113 69M77 122C99 121 116 110 128 96"
              strokeWidth="1.1"
            />
            <path
              d="M28 34C17 25 12 16 13 8C23 13 29 21 28 34ZM43 59C31 51 25 42 25 34C37 39 43 48 43 59ZM58 86C46 78 40 69 40 61C52 66 58 75 58 86ZM71 110C59 104 53 95 52 87C64 91 70 100 71 110Z"
              fill="#A9B098"
              strokeWidth="0.8"
            />
            <use
              href={`#${floretId}`}
              transform="translate(59 8) rotate(34) scale(.8)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(70 28) rotate(28) scale(.88)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(88 51) rotate(31) scale(.94)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(105 72) rotate(26)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(120 98) rotate(31) scale(.92)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(51 23) rotate(-35) scale(.72)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(67 45) rotate(-30) scale(.82)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(84 68) rotate(-35) scale(.88)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(100 91) rotate(-32) scale(.92)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(114 115) rotate(-30) scale(.82)"
            />
          </g>
          <g
            className="lavender-branch lavender-branch-two"
            stroke={`url(#${stemId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M-20 10C11 34 18 62 25 91C31 116 43 137 61 160"
              strokeWidth="1.5"
            />
            <path
              d="M18 64C1 61 -9 52 -15 41M25 92C7 91 -5 82 -13 71M34 119C17 119 5 111 -4 101"
              strokeWidth="1"
            />
            <path
              d="M16 70C5 63 1 54 2 47C13 51 18 59 16 70ZM23 98C11 92 6 84 7 76C19 80 24 89 23 98ZM32 124C20 119 15 111 16 103C28 107 33 115 32 124Z"
              fill="#A9B098"
              strokeWidth="0.75"
            />
            <use
              href={`#${floretId}`}
              transform="translate(-13 42) rotate(-54) scale(.72)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(-10 55) rotate(-58) scale(.78)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(-11 72) rotate(-55) scale(.82)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(-7 88) rotate(-54) scale(.8)"
            />
            <use
              href={`#${floretId}`}
              transform="translate(-2 104) rotate(-50) scale(.72)"
            />
          </g>
        </g>
      </svg>
      <div className="floral-petals">
        <i className="floating-petal petal-one" />
        <i className="floating-petal petal-two" />
      </div>
    </div>
  );
}

export default function LavenderFlowers() {
  const id = useId().replace(/:/g, "");
  return (
    <div className="lavender-flowers" aria-hidden="true">
      {CORNERS.map((corner, index) => (
        <FlowerBranch
          key={corner.className}
          corner={corner}
          id={`${id}-${index}`}
        />
      ))}
    </div>
  );
}
