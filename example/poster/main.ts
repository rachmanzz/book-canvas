import { BookCanvas } from '../../src/index';
import { CanvasAdapter, CanvasContext } from '../../src/adapter/types';

const posterAdapter: CanvasAdapter = {
  id: 'poster-graphic-adapter',
  name: 'Poster Graphic Artboard Adapter',
  mount(context: CanvasContext) {
    const poster = document.createElement('div');
    poster.style.width = '100%';
    poster.style.height = '100%';
    poster.style.display = 'flex';
    poster.style.flexDirection = 'column';
    poster.style.justifyContent = 'space-between';
    poster.style.padding = '40px';
    poster.style.boxSizing = 'border-box';
    poster.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    poster.style.background = 'linear-gradient(145deg, #18181b 0%, #27272a 100%)';
    poster.style.color = '#ffffff';
    poster.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';

    poster.innerHTML = `
      <div>
        <div style="display: inline-block; background: #8b5cf6; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px;">
          Poster Artboard ${context.pageIndex + 1}
        </div>
        <h1 contenteditable="true" style="font-size: 38px; font-weight: 800; line-height: 1.1; letter-spacing: -1px; outline: none; margin-bottom: 16px;">
          DESIGN SUMMIT 2026
        </h1>
        <p contenteditable="true" style="font-size: 14px; color: #a1a1aa; line-height: 1.6; outline: none; max-width: 450px;">
          Konferensi arsitektur sistem desain grafis dan kolaborasi kanvas digital. Klik teks ini untuk mengedit langsung di atas lembaran artboard.
        </p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #c4b5fd;">
          <span>29 OKTOBER 2026</span>
          <span>JAKARTA / HYBRID</span>
        </div>
        <div style="font-size: 11px; color: #71717a; margin-top: 6px;">
          Navigasi Kanvas: Klik tengah atau tahan drag pada background hitam untuk menggeser artboard secara bebas ke segala arah (360° pan).
        </div>
      </div>
    `;

    context.container.appendChild(poster);
  },
  unmount(pageIndex: number) {
    console.log(`[PosterAdapter] Artboard ${pageIndex} unmounted`);
  },
};

const host = document.getElementById('canvas-host') as HTMLElement;
const canvas = new BookCanvas({
  initialPages: 2,
  pageLayout: 'auto',
  lockHorizontalPan: false,   // Free 360° pan
  clampVerticalScroll: false, // Free 360° pan
  defaultPageDimensions: {
    width: 550,
    height: 750,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
  },
});

// Remove document-only headers and margins
canvas.setHeadersFootersVisible(false);
canvas.setMarginGuidesVisible(false);

canvas.registerAdapter(posterAdapter);
canvas.mount(host);

const zoomLabel = document.getElementById('zoom-label') as HTMLElement;

document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
  const next = Math.min(canvas.getViewportState().zoom + 0.15, 3.0);
  canvas.setZoom(next);
  zoomLabel.textContent = `${Math.round(next * 100)}%`;
});

document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
  const next = Math.max(canvas.getViewportState().zoom - 0.15, 0.25);
  canvas.setZoom(next);
  zoomLabel.textContent = `${Math.round(next * 100)}%`;
});

document.getElementById('btn-reset')?.addEventListener('click', () => {
  canvas.setZoom(1);
  canvas.centerContent();
  zoomLabel.textContent = '100%';
});

document.getElementById('btn-add-page')?.addEventListener('click', () => {
  canvas.addPage();
});
