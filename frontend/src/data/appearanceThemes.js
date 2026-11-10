export const APPEARANCE_THEMES = {
  spring: {
    name: "Spring",
    palette: ["#d77faf", "#ebaacb", "#a95c91", "#fff5fa"],
    properties: {
      "--theme-primary": "#d77faf",
      "--theme-secondary": "#ebaacb",
      "--theme-accent": "#a95c91",
      "--theme-background": "#fff5fa",
      "--theme-surface": "#fffafd",
      "--theme-text": "#5f4b60",
      "--theme-heading": "#58335f",
      "--theme-border": "#f0d5e5",
      "--theme-glow": "rgba(235, 170, 203, 0.24)",
      "--theme-gradient": "linear-gradient(120deg, #fff5fa 0%, #fffafd 100%)",
    },
    decorations: { colors: ["#d87991", "#e89aab", "#fff7f2", "#efb8c2"], outline: "rgba(255,255,255,.55)", shadow: "rgba(216,121,145,.7)" },
    placeholder: { from: "#fff1f5", to: "#ffe2e8", shape: "#e89aab", text: "#a95c91" },
  },
  summer: {
    name: "Summer",
    palette: ["#668c45", "#d9a62e", "#315c38", "#f6f9ef"],
    properties: {
      "--theme-primary": "#668c45",
      "--theme-secondary": "#d9a62e",
      "--theme-accent": "#315c38",
      "--theme-background": "#f6f9ef",
      "--theme-surface": "#fffef9",
      "--theme-text": "#4f5848",
      "--theme-heading": "#315c38",
      "--theme-border": "#d9e3ce",
      "--theme-glow": "rgba(217, 166, 46, 0.2)",
      "--theme-gradient": "linear-gradient(120deg, #f6f9ef 0%, #fffef9 56%, #f5eccf 100%)",
    },
    decorations: { colors: ["#e1a636", "#f3cc77", "#f9d78f"], outline: "rgba(255,244,208,.72)", shadow: "rgba(225,166,54,.75)" },
    placeholder: { from: "#f1f7e9", to: "#ffefc7", shape: "#d9a62e", text: "#315c38" },
  },
  autumn: {
    name: "Autumn",
    palette: ["#c77c36", "#e9b66d", "#a64f32", "#fff5e9"],
    properties: {
      "--theme-primary": "#c77c36",
      "--theme-secondary": "#e9b66d",
      "--theme-accent": "#a64f32",
      "--theme-background": "#fff5e9",
      "--theme-surface": "#fffcf7",
      "--theme-text": "#5e4a3f",
      "--theme-heading": "#663b2b",
      "--theme-border": "#ead3b9",
      "--theme-glow": "rgba(233, 182, 109, 0.24)",
      "--theme-gradient": "linear-gradient(120deg, #fff5e9 0%, #fffcf7 100%)",
    },
    decorations: { colors: ["#c9653b", "#d8943e", "#a94f3b", "#d5aa4f", "#825744"], outline: "rgba(255,239,206,.72)", shadow: "rgba(166,79,50,.72)" },
    placeholder: { from: "#fff1df", to: "#f8dfc7", shape: "#d8943e", text: "#825744" },
  },
  winter: {
    name: "Winter",
    palette: ["#6e9fca", "#a9cee8", "#345c83", "#f4faff"],
    properties: {
      "--theme-primary": "#6e9fca",
      "--theme-secondary": "#a9cee8",
      "--theme-accent": "#345c83",
      "--theme-background": "#f4faff",
      "--theme-surface": "#fbfdff",
      "--theme-text": "#435a6d",
      "--theme-heading": "#345c83",
      "--theme-border": "#d5e6f3",
      "--theme-glow": "rgba(169, 206, 232, 0.3)",
      "--theme-gradient": "linear-gradient(120deg, #f4faff 0%, #fbfdff 100%)",
    },
    decorations: { colors: ["#ffffff", "#eaf5fb", "#d7eaf5"], outline: "rgba(133,171,190,.58)", shadow: "rgba(94,143,169,.82)" },
    placeholder: { from: "#f0f8ff", to: "#e7eafa", shape: "#a9cee8", text: "#345c83" },
  },
};

const LEGACY_PROPERTIES = {
  "--plum": "--theme-background",
  "--aubergine": "--theme-surface",
  "--card": "--theme-surface",
  "--ivory": "--theme-heading",
  "--cream": "--theme-primary",
  "--taupe": "--theme-primary",
  "--mauve": "--theme-text",
  "--lavender": "--theme-accent",
  "--border": "--theme-border",
  "--active-season-primary": "--theme-primary",
  "--active-season-accent": "--theme-accent",
  "--active-season-heading": "--theme-heading",
  "--active-season-border": "--theme-border",
  "--cursor-season-color": "--theme-primary",
};

export function applyAppearanceTheme(season, template = "creative") {
  const theme = APPEARANCE_THEMES[season];
  if (!theme) return;

  const root = document.documentElement;
  root.dataset.season = season;
  root.dataset.template = template;
  Object.entries(theme.properties).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
  Object.entries(LEGACY_PROPERTIES).forEach(([name, source]) => {
    root.style.setProperty(name, `var(${source})`);
  });
  root.style.setProperty("--season-primary", "var(--theme-primary)");
  root.style.setProperty("--season-secondary", "var(--theme-secondary)");
  root.style.setProperty("--season-accent", "var(--theme-accent)");
  root.style.setProperty("--season-background", "var(--theme-background)");
  root.style.setProperty("--season-card", "var(--theme-surface)");
  root.style.setProperty("--season-copy", "var(--theme-text)");
  root.style.setProperty("--season-heading", "var(--theme-heading)");
  root.style.setProperty("--season-border", "var(--theme-border)");
  root.style.setProperty("--season-glow", "var(--theme-glow)");
}

export function clearAppearanceTheme() {
  const root = document.documentElement;
  delete root.dataset.season;
  delete root.dataset.template;
  delete root.dataset.themeTransition;
  const properties = [
    ...Object.keys(APPEARANCE_THEMES.spring.properties),
    ...Object.keys(LEGACY_PROPERTIES),
    "--season-primary",
    "--season-secondary",
    "--season-accent",
    "--season-background",
    "--season-card",
    "--season-copy",
    "--season-heading",
    "--season-border",
    "--season-glow",
  ];
  properties.forEach((name) => root.style.removeProperty(name));
}
