import { A4_DIMENSIONS, BookCanvas } from '../../src/index';
import { CanvasAdapter, CanvasContext } from '../../src/adapter/types';

const spreadsheetAdapter: CanvasAdapter = {
  id: 'spreadsheet-adapter',
  name: 'Spreadsheet Grid Adapter',
  mount(context: CanvasContext) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '12px';
    table.style.fontFamily = 'monospace';

    // Table Header (Cols A to E)
    let thead = '<thead><tr style="background: #f8fafc;"><th style="border: 1px solid #cbd5e1; width: 35px; padding: 6px;">#</th>';
    ['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      thead += `<th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #475569;">${col}</th>`;
    });
    thead += '</tr></thead>';

    // Table Body (12 Rows)
    let tbody = '<tbody>';
    for (let r = 1; r <= 12; r++) {
      tbody += `<tr><td style="border: 1px solid #cbd5e1; background: #f8fafc; text-align: center; color: #64748b; font-weight: 600;">${r}</td>`;
      for (let c = 0; c < 5; c++) {
        const val = r === 1 && c === 0 ? `Sheet ${context.pageIndex + 1}` : r === 2 && c === 1 ? '1500' : '';
        tbody += `<td contenteditable="true" style="border: 1px solid #e2e8f0; padding: 6px; outline: none; background: #ffffff;">${val}</td>`;
      }
      tbody += '</tr>';
    }
    tbody += '</tbody>';

    table.innerHTML = thead + tbody;
    context.container.appendChild(table);
  },
  unmount(pageIndex: number) {
    console.log(`[SpreadsheetAdapter] Sheet ${pageIndex} unmounted`);
  },
};

const host = document.getElementById('canvas-host') as HTMLElement;
const canvas = new BookCanvas({
  initialPages: 2,
  pageLayout: 'auto',
  defaultPageDimensions: {
    width: 842, // A4 Landscape (297mm)
    height: 595, // 210mm
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
  },
});
canvas.registerAdapter(spreadsheetAdapter);
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
