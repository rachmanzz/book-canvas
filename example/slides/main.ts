import { BookCanvas } from '../../src/index';
import { CanvasAdapter, CanvasContext } from '../../src/adapter/types';

const slideAdapter: CanvasAdapter = {
  id: 'slide-presentation-adapter',
  name: 'Slide Presentation Adapter',
  mount(context: CanvasContext) {
    const slide = document.createElement('div');
    slide.style.width = '100%';
    slide.style.height = '100%';
    slide.style.display = 'flex';
    slide.style.flexDirection = 'column';
    slide.style.justifyContent = 'space-between';
    slide.style.padding = '48px';
    slide.style.boxSizing = 'border-box';
    slide.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    if (context.pageIndex === 0) {
      // Title Slide
      slide.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
      slide.style.color = '#ffffff';
      slide.innerHTML = `
        <div>
          <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #fb923c;">
            Pitch Deck
          </span>
          <h1 style="font-size: 36px; font-weight: 700; margin-top: 16px; letter-spacing: -0.5px;">
            Book Canvas Architecture
          </h1>
          <p style="font-size: 16px; color: #94a3b8; margin-top: 12px; max-width: 600px;">
            Headless paged canvas runtime for discrete, responsive document layouts.
          </p>
        </div>
        <div style="font-size: 12px; color: #64748b;">
          Slide 1 • Architecture Overview
        </div>
      `;
    } else {
      // Content Slide
      slide.style.background = '#ffffff';
      slide.style.color = '#0f172a';
      slide.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 24px;">
            <h2 style="font-size: 24px; font-weight: 600;">Slide ${context.pageIndex + 1}: Paged Canvas Runtime</h2>
            <span style="font-size: 12px; color: #64748b;">16:9 Aspect Ratio</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
              <h3 style="font-size: 15px; margin-bottom: 8px; color: #ea580c;">Zero Content Coupling</h3>
              <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                The host canvas does not process text or shapes internally, allowing guest adapters to mount arbitrary content.
              </p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
              <h3 style="font-size: 15px; margin-bottom: 8px; color: #ea580c;">Dynamic Layout Flow</h3>
              <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                Supports coordinate zooming, auto-wrapping columns when zoomed out, and strict boundary containment.
              </p>
            </div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8;">
          <span>book-canvas • Slide Engine</span>
          <span>Slide ${context.pageIndex + 1}</span>
        </div>
      `;
    }

    context.container.appendChild(slide);
  },
  unmount(pageIndex: number) {
    console.log(`[SlideAdapter] Slide ${pageIndex} unmounted`);
  },
};

const host = document.getElementById('canvas-host') as HTMLElement;
const canvas = new BookCanvas({
  initialPages: 2,
  pageLayout: 'auto',
  defaultPageDimensions: {
    width: 960,  // 16:9
    height: 540,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
  },
});

// Turn off document header/footer artifacts
canvas.setHeadersFootersVisible(false);
canvas.setMarginGuidesVisible(false);

canvas.registerAdapter(slideAdapter);
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

document.getElementById('btn-add-slide')?.addEventListener('click', () => {
  canvas.addPage();
});
