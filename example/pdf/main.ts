import { A4_DIMENSIONS, BookCanvas } from '../../src/index';
import { CanvasAdapter, CanvasContext } from '../../src/adapter/types';

const pdfAdapter: CanvasAdapter = {
  id: 'pdf-document-adapter',
  name: 'PDF Document Preview Adapter',
  mount(context: CanvasContext) {
    const page = document.createElement('div');
    page.style.width = '100%';
    page.style.height = '100%';
    page.style.display = 'flex';
    page.style.flexDirection = 'column';
    page.style.justifyContent = 'space-between';
    page.style.fontFamily = 'serif';

    page.innerHTML = `
      <div>
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
          Official Report • Section ${context.pageIndex + 1}
        </div>
        <h2 style="font-size: 24px; font-family: sans-serif; color: #0f172a; margin-bottom: 16px;">
          Print Layout Preview
        </h2>
        <p style="font-size: 14px; line-height: 1.8; color: #334155; margin-bottom: 16px;">
          This sample demonstrates standard browser <code>@media print</code> styling. When triggering <strong>Print / Save PDF</strong>, the canvas host hides viewport controls and gray background gutters, producing clean paginated A4 sheets ready for PDF export.
        </p>
      </div>
      <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-family: sans-serif;">
        <span>Book Canvas PDF Module</span>
        <span>Verified Document</span>
      </div>
    `;

    context.container.appendChild(page);
  },
  unmount(pageIndex: number) {
    console.log(`[PdfAdapter] Page ${pageIndex} unmounted`);
  },
};

const host = document.getElementById('canvas-host') as HTMLElement;
const canvas = new BookCanvas({
  initialPages: 2,
  pageLayout: 'single',
  defaultPageDimensions: A4_DIMENSIONS,
});
canvas.registerAdapter(pdfAdapter);
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

document.getElementById('btn-print')?.addEventListener('click', () => {
  window.print();
});
