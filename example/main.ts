import {
  A4_DIMENSIONS,
  BookCanvas,
  LEGAL_DIMENSIONS,
  LETTER_DIMENSIONS,
  NARROW_MARGINS,
  NORMAL_MARGINS,
  WIDE_MARGINS,
} from '../src/index';
import { CanvasAdapter, CanvasContext } from '../src/adapter/types';

// 1. Definisikan Sample Word Adapter
const sampleWordAdapter: CanvasAdapter = {
  id: 'sample-word-adapter',
  name: 'Sample Word Editor',
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
      <h2 style="font-size: 20px; color: #0f172a; margin-bottom: 12px; font-family: system-ui;">Halaman ${context.pageIndex + 1}</h2>
      <p style="margin-bottom: 12px;">
        Ini adalah demonstrasi <strong>Book Canvas Host</strong>. Konten teks ini di-mount melalui <code>CanvasAdapter</code> independen.
      </p>
      <p style="margin-bottom: 12px;">
        Cobalah ketik teks langsung di area ini, lakukan scroll untuk pan, atau tahan <strong>Ctrl + Scroll</strong> untuk melakukan zoom in/out.
      </p>
    `;

    context.container.appendChild(editor);
  },
  unmount(pageIndex: number) {
    console.log(`[Adapter] Page ${pageIndex} unmounted`);
  },
};

// 2. Inisialisasi Canvas
const host = document.getElementById('canvas-host') as HTMLElement;
const canvas = new BookCanvas({ initialPages: 4, pageLayout: 'auto' });
canvas.registerAdapter(sampleWordAdapter);
canvas.mount(host);

// 3. UI Controls
const zoomLabel = document.getElementById('zoom-label') as HTMLElement;
const pointerInfo = document.getElementById('pointer-info') as HTMLElement;

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
  const select = document.getElementById('select-paper-size') as HTMLSelectElement;
  let dims = A4_DIMENSIONS;
  if (select.value === 'LETTER') dims = LETTER_DIMENSIONS;
  else if (select.value === 'LEGAL') dims = LEGAL_DIMENSIONS;
  canvas.addPage(dims);
});

// Paper size switcher for all pages
document.getElementById('select-paper-size')?.addEventListener('change', (e) => {
  const val = (e.target as HTMLSelectElement).value;
  let targetDimensions = A4_DIMENSIONS;
  if (val === 'LETTER') targetDimensions = LETTER_DIMENSIONS;
  else if (val === 'LEGAL') targetDimensions = LEGAL_DIMENSIONS;

  canvas.setPageDimensions(targetDimensions);
});

// Toggle bound scroll vs infinite scroll
document.getElementById('check-clamp-scroll')?.addEventListener('change', (e) => {
  const isChecked = (e.target as HTMLInputElement).checked;
  canvas.setClampVerticalScroll(isChecked);
});

// Toggle layout mode
document.getElementById('select-layout')?.addEventListener('change', (e) => {
  const val = (e.target as HTMLSelectElement).value as 'single' | 'auto';
  canvas.setPageLayout(val);
});

// Margins switcher
document.getElementById('select-margins')?.addEventListener('change', (e) => {
  const val = (e.target as HTMLSelectElement).value;
  let targetMargins = NORMAL_MARGINS;
  if (val === 'NARROW') targetMargins = NARROW_MARGINS;
  else if (val === 'WIDE') targetMargins = WIDE_MARGINS;

  canvas.setMargins(targetMargins);
});

// Toggle margin guides
document.getElementById('check-guides')?.addEventListener('change', (e) => {
  const isChecked = (e.target as HTMLInputElement).checked;
  canvas.setMarginGuidesVisible(isChecked);
});

// Toggle headers & footers
document.getElementById('check-headers-footers')?.addEventListener('change', (e) => {
  const isChecked = (e.target as HTMLInputElement).checked;
  canvas.setHeadersFootersVisible(isChecked);
});

// 4. Pointer tracking
canvas.onPointerMove(({ pageIndex, x, y }) => {
  pointerInfo.textContent = `Page ${pageIndex + 1} (${x}px, ${y}px)`;
});

// 5. Simulasi Kursor Remote Kolaborator (Real-Time Presence Test)
let angle = 0;
setInterval(() => {
  angle += 0.05;
  const radius = 90;
  const simulatedX = 220 + Math.cos(angle) * radius;
  const simulatedY = 180 + Math.sin(angle) * (radius * 0.5);

  canvas.renderRemoteCursors([
    {
      userId: 'user-rahman',
      userName: 'Rahman (Collaborator)',
      color: '#e11d48',
      pageIndex: 0,
      x: simulatedX,
      y: simulatedY,
    },
  ]);
}, 40);
