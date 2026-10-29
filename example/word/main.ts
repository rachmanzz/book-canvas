import {
  A4_DIMENSIONS,
  BookCanvas,
  LEGAL_DIMENSIONS,
  LETTER_DIMENSIONS,
  NARROW_MARGINS,
  NORMAL_MARGINS,
  WIDE_MARGINS,
} from '../../src/index';
import { CanvasAdapter, CanvasContext } from '../../src/adapter/types';

const wordAdapter: CanvasAdapter = {
  id: 'word-adapter',
  name: 'Word Editor Adapter',
  mount(context: CanvasContext) {
    const editor = document.createElement('div');
    editor.contentEditable = 'true';
    editor.style.width = '100%';
    editor.style.height = '100%';
    editor.style.outline = 'none';
    editor.style.fontSize = '14px';
    editor.style.lineHeight = '1.6';
    editor.style.color = '#334155';
    editor.style.fontFamily = 'Georgia, serif';

    editor.innerHTML = `
      <h2 style="font-size: 18px; color: #0f172a; margin-bottom: 12px; font-family: system-ui;">Document Page ${context.pageIndex + 1}</h2>
      <p style="margin-bottom: 12px;">
        This demonstrates the <strong>Word Adapter</strong>. Text content is confined within physical A4 margins.
      </p>
      <p>
        Type or edit text directly in this container, change zoom levels, or append new pages.
      </p>
    `;

    context.container.appendChild(editor);
  },
  unmount(pageIndex: number) {
    console.log(`[WordAdapter] Page ${pageIndex} unmounted`);
  },
};

const host = document.getElementById('canvas-host') as HTMLElement;
const canvas = new BookCanvas({ initialPages: 2, pageLayout: 'auto' });
canvas.registerAdapter(wordAdapter);
canvas.mount(host);

const zoomLabel = document.getElementById('zoom-label') as HTMLElement;

document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
  const current = canvas.getViewportState().zoom;
  const next = Math.min(current + 0.15, 3.0);
  canvas.setZoom(next);
  zoomLabel.textContent = `${Math.round(next * 100)}%`;
});

document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
  const current = canvas.getViewportState().zoom;
  const next = Math.max(current - 0.15, 0.25);
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

document.getElementById('select-paper-size')?.addEventListener('change', (e) => {
  const val = (e.target as HTMLSelectElement).value;
  let dims = A4_DIMENSIONS;
  if (val === 'LETTER') dims = LETTER_DIMENSIONS;
  else if (val === 'LEGAL') dims = LEGAL_DIMENSIONS;
  canvas.setPageDimensions(dims);
});

document.getElementById('select-margins')?.addEventListener('change', (e) => {
  const val = (e.target as HTMLSelectElement).value;
  let margins = NORMAL_MARGINS;
  if (val === 'NARROW') margins = NARROW_MARGINS;
  else if (val === 'WIDE') margins = WIDE_MARGINS;
  canvas.setMargins(margins);
});
