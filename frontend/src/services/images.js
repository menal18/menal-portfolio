import { APPEARANCE_THEMES } from "../data/appearanceThemes.js";

// Placeholder artwork generated locally (no files, no network). Replace via the admin dashboard.
const PALETTE = [
  ["#F0E5FA", "#B78BD8"],
  ["#FFF9F7", "#F2A995"],
  ["#F8F0FA", "#B78BD8"],
  ["#FFFFFF", "#806A88"],
  ["#F0E5FA", "#F2A995"],
];

function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function placeholder(seed = "menal", label = "", w = 1200, h = 800, season) {
  const theme = APPEARANCE_THEMES[season];
  const [a, b] = theme
    ? [theme.placeholder.from, theme.placeholder.shape]
    : PALETTE[hash(seed) % PALETTE.length];
  const end = theme?.placeholder.to || "#F8F0FA";
  const text = theme?.placeholder.text || "#351447";
  const rot = hash(seed + "r") % 360;
  const initial = (label || seed).trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" gradientTransform="rotate(${rot} .5 .5)"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${w * 0.72}" cy="${h * 0.34}" r="${h * 0.3}" fill="${b}" opacity=".28"/><circle cx="${w * 0.2}" cy="${h * 0.85}" r="${h * 0.22}" fill="${b}" opacity=".16"/><text x="${w * 0.07}" y="${h * 0.9}" font-family="Arial,sans-serif" font-weight="700" font-size="${h * 0.55}" fill="${text}" opacity=".18">${initial}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const imgOf = (item, seed, season) =>
  item?.coverImage?.url ||
  placeholder(seed || item?.title || "menal", item?.title, 1200, 800, season);

// Cloudinary delivery transforms: smaller, auto-format images. Leaves other URLs untouched.
export function optimize(url, width = 1200) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/"))
    return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
