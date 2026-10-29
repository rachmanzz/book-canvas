import { RemoteCursor } from './types';
import { PageRecord } from '../core/page-manager';

export class CursorLayer {
  private cursorElements: Map<string, HTMLElement> = new Map();
  private overlayElement: HTMLElement;

  constructor(parentElement: HTMLElement) {
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'book-canvas-cursor-layer';
    this.overlayElement.style.position = 'absolute';
    this.overlayElement.style.top = '0';
    this.overlayElement.style.left = '0';
    this.overlayElement.style.width = '100%';
    this.overlayElement.style.height = '100%';
    this.overlayElement.style.pointerEvents = 'none';
    this.overlayElement.style.zIndex = '9999';

    parentElement.appendChild(this.overlayElement);
  }

  public render(cursors: RemoteCursor[], pages: PageRecord[]): void {
    const currentIds = new Set<string>();

    for (const cursor of cursors) {
      currentIds.add(cursor.userId);
      const targetPage = pages[cursor.pageIndex];
      if (!targetPage) continue;

      let el = this.cursorElements.get(cursor.userId);
      if (!el) {
        el = this.createCursorDOM(cursor);
        this.cursorElements.set(cursor.userId, el);
        this.overlayElement.appendChild(el);
      }

      // Calculate absolute position within content wrapper
      const pageTop = targetPage.element.offsetTop;
      const pageLeft = targetPage.element.offsetLeft;

      el.style.transform = `translate(${pageLeft + cursor.x}px, ${pageTop + cursor.y}px)`;
    }

    // Cleanup stale cursors
    for (const [id, el] of this.cursorElements.entries()) {
      if (!currentIds.has(id)) {
        el.remove();
        this.cursorElements.delete(id);
      }
    }
  }

  private createCursorDOM(cursor: RemoteCursor): HTMLElement {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.transition = 'transform 0.08s ease-out';
    container.style.pointerEvents = 'none';

    // SVG Cursor Arrow
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.innerHTML = `
      <path d="M0,0 L14,6 L7,8 L5,15 Z" fill="${cursor.color}" stroke="#ffffff" stroke-width="1.5" />
    `;

    // Name Badge
    const badge = document.createElement('div');
    badge.textContent = cursor.userName;
    badge.style.position = 'absolute';
    badge.style.left = '14px';
    badge.style.top = '10px';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '4px';
    badge.style.fontSize = '11px';
    badge.style.fontWeight = '500';
    badge.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    badge.style.color = '#ffffff';
    badge.style.backgroundColor = cursor.color;
    badge.style.whiteSpace = 'nowrap';
    badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    container.appendChild(svg);
    container.appendChild(badge);
    return container;
  }

  public clear(): void {
    this.cursorElements.forEach((el) => el.remove());
    this.cursorElements.clear();
  }

  public destroy(): void {
    this.clear();
    this.overlayElement.remove();
  }
}
