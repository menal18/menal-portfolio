// Turn a pasted video URL into something embeddable
export function parseVideo(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');
    if (host === 'youtu.be') return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}` };
    if (host.endsWith('youtube.com')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
      if (id) return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (host === 'vimeo.com') return { type: 'iframe', src: `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean).pop()}` };
    if (/\.(mp4|webm|ogg)$/i.test(u.pathname)) return { type: 'video', src: url };
    return { type: 'link', src: url };
  } catch {
    return null;
  }
}
