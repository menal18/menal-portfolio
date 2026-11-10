import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import api, { errMsg } from '../services/api.js';
import { APPEARANCE_THEMES, applyAppearanceTheme, clearAppearanceTheme } from '../data/appearanceThemes.js';

const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);
const APPEARANCE_STORAGE_KEY = 'menal_published_appearance';

export function SiteProvider({ children }) {
  const [data, setData] = useState(null);
  const [appearance, setAppearance] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const previousSeason = useRef(null);
  const themeTransitionTimer = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [home, currentAppearance] = await Promise.all([
        api.get('/public/home'),
        api.get('/public/appearance'),
      ]);
      const previewSeason = new URLSearchParams(window.location.search).get('appearancePreview');
      const published = currentAppearance.data.published;
      const isPreview = Boolean(APPEARANCE_THEMES[previewSeason]);
      const season = isPreview ? previewSeason : published.season;
      setData(home.data);
      setAppearance({ ...published, season, preview: isPreview });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useLayoutEffect(() => {
    if (!appearance) return undefined;
    const root = document.documentElement;
    const shouldTransition =
      previousSeason.current !== null &&
      previousSeason.current !== appearance.season;
    if (shouldTransition) root.dataset.themeTransition = 'true';
    applyAppearanceTheme(appearance.season, appearance.template);
    previousSeason.current = appearance.season;
    if (shouldTransition) {
      window.clearTimeout(themeTransitionTimer.current);
      themeTransitionTimer.current = window.setTimeout(() => {
        delete root.dataset.themeTransition;
      }, 1300);
    }
  }, [appearance]);
  useEffect(() => () => {
    window.clearTimeout(themeTransitionTimer.current);
    clearAppearanceTheme();
  }, []);
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== APPEARANCE_STORAGE_KEY || new URLSearchParams(window.location.search).has('appearancePreview')) return;
      try {
        const published = JSON.parse(event.newValue || 'null');
        if (published && APPEARANCE_THEMES[published.season]) {
          setAppearance({ ...published, preview: false });
        }
      } catch {
        setError('Could not apply the published appearance update.');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const value = useMemo(() => ({ data, appearance, error, loading, reload: load }), [data, appearance, error, loading, load]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
