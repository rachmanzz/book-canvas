import { A4_DIMENSIONS, BookCanvas } from '../../src/index';
import { CanvasAdapter, CanvasContext } from '../../src/adapter/types';

const markdownAdapter: CanvasAdapter = {
  id: 'markdown-adapter',
  name: 'Markdown Viewer Adapter',
  mount(context: CanvasContext) {
    const article = document.createElement('article');
    article.style.width = '100%';
    article.style.height = '100%';
    article.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    article.style.color = '#1e293b';
    article.style.lineHeight = '1.7';
    article.style.fontSize = '14px';

    article.innerHTML = `
      <h1 style="font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px;">
        Bab ${context.pageIndex + 1}: Spesifikasi Desain
      </h1>
      <p style="margin-bottom: 14px;">
        Dokumen ini me-render struktur <strong>Markdown</strong> yang terformat bersih di dalam kontainer halaman fisik.
      </p>
      <blockquote style="border-left: 3px solid #0f766e; padding-left: 12px; color: #475569; margin: 12px 0; font-style: italic;">
        "Setiap halaman mengisolasi konten melalui kontrak CanvasAdapter tanpa mengubah inti canvas."
      </blockquote>
      <h3 style="font-size: 16px; margin: 16px 0 8px;">Daftar Modul</h3>
      <ul style="padding-left: 20px; margin-bottom: 14px;">
        <li>Core Viewport Transform</li>
        <li>Page Manager & Margins</li>
        <li>Multiplayer Presence Overlay</li>
      </ul>
      <pre style="background: #f1f5f9; padding: 10px; border-radius: 6px; font-size: 12px; font-family: monospace; overflow-x: auto;"><code>const canvas = new BookCanvas({ initialPages: 2 });</code></pre>
    `;

    context.container.appendChild(article);
  },
  unmount(pageIndex: number) {
    console.log(`[MarkdownAdapter] Page ${pageIndex} unmounted`);
  },
};

const host = document.getElementById('canvas-host') as HTMLElement;
const canvas = new BookCanvas({ initialPages: 2, defaultPageDimensions: A4_DIMENSIONS });
canvas.registerAdapter(markdownAdapter);
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
