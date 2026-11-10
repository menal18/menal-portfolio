import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Lightbox({ images, index, onClose, onIndex }) {
  const img = images[index];
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [index, images.length, onClose, onIndex]);
  if (!img) return null;
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
      <button type="button" className="lb-btn lb-close" aria-label="Close" onClick={onClose}><X /></button>
      {images.length > 1 && (
        <>
          <button type="button" className="lb-btn lb-prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + images.length) % images.length); }}><ChevronLeft /></button>
          <button type="button" className="lb-btn lb-next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % images.length); }}><ChevronRight /></button>
        </>
      )}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={img.url} alt={img.caption || ''} />
        {img.caption && <figcaption>{img.caption}</figcaption>}
      </figure>
    </div>
  );
}
