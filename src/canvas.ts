import { A4_DIMENSIONS, Margins, PageDimensions, ViewportState } from './core/types';
import { PageManager, PageRecord } from './core/page-manager';
import { Viewport } from './core/viewport';
import { SlotManager } from './adapter/slot-manager';
import { CanvasAdapter } from './adapter/types';
import { CursorLayer } from './presence/cursor-layer';
import { RemoteCursor } from './presence/types';

export type PageLayoutMode = 'single' | 'auto';

export interface BookCanvasOptions {
  defaultPageDimensions?: PageDimensions;
  backgroundColor?: string;
  initialPages?: number;
  lockHorizontalPan?: boolean;
  clampVerticalScroll?: boolean;
  pageLayout?: PageLayoutMode;
}

export class BookCanvas {
  private rootContainer: HTMLElement | null = null;
  private contentWrapper: HTMLElement;
  private pagesContainer: HTMLElement;

  private viewport: Viewport;
  private pageManager: PageManager;
  private slotManager: SlotManager;
  private cursorLayer: CursorLayer;
  private resizeObserver: ResizeObserver | null = null;
  private pageLayout: PageLayoutMode;

  private pointerListeners: Set<(coords: { pageIndex: number; x: number; y: number }) => void> = new Set();

  constructor(options: BookCanvasOptions = {}) {
    this.pageLayout = options.pageLayout ?? 'auto';

    // Content wrapper holds pages and cursor overlay inside the viewport
    this.contentWrapper = document.createElement('div');
    this.contentWrapper.className = 'book-canvas-content-wrapper';
    this.contentWrapper.style.position = 'absolute';
    this.contentWrapper.style.top = '0';
    this.contentWrapper.style.left = '0';
    this.contentWrapper.style.paddingTop = '40px';
    this.contentWrapper.style.paddingBottom = '40px';
    this.contentWrapper.style.paddingLeft = '0';
    this.contentWrapper.style.paddingRight = '0';
    this.contentWrapper.style.boxSizing = 'border-box';

    this.pagesContainer = document.createElement('div');
    this.pagesContainer.className = 'book-canvas-pages';
    this.applyPagesLayout();
    this.contentWrapper.appendChild(this.pagesContainer);

    this.viewport = new Viewport({
      lockHorizontalPan: options.lockHorizontalPan ?? true,
      clampVerticalScroll: options.clampVerticalScroll ?? true,
    });
    this.pageManager = new PageManager(this.pagesContainer, options.defaultPageDimensions ?? A4_DIMENSIONS);
    this.cursorLayer = new CursorLayer(this.contentWrapper);

    this.slotManager = new SlotManager(
      () => this.addPage(),
      (pageIndex, x, y) => this.emitPointerMove(pageIndex, x, y)
    );

    // Initialize initial pages
    const count = options.initialPages ?? 1;
    for (let i = 0; i < count; i++) {
      this.pageManager.addPage();
    }
  }

  private applyPagesLayout(): void {
    if (this.pageLayout === 'single') {
      this.pagesContainer.style.display = 'flex';
      this.pagesContainer.style.flexDirection = 'column';
      this.pagesContainer.style.flexWrap = 'nowrap';
      this.pagesContainer.style.alignItems = 'center';
      this.pagesContainer.style.gap = '24px';
      this.pagesContainer.style.width = 'fit-content';
    } else {
      // Auto: pages flow into side-by-side columns when zoomed out or wide container
      this.pagesContainer.style.display = 'flex';
      this.pagesContainer.style.flexDirection = 'row';
      this.pagesContainer.style.flexWrap = 'wrap';
      this.pagesContainer.style.justifyContent = 'center';
      this.pagesContainer.style.alignItems = 'flex-start';
      this.pagesContainer.style.gap = '24px';
      this.pagesContainer.style.width = 'fit-content';
    }
  }

  public mount(target: HTMLElement): void {
    this.rootContainer = target;
    this.rootContainer.innerHTML = '';
    this.rootContainer.style.position = 'relative';
    this.rootContainer.style.overflow = 'hidden';
    this.rootContainer.style.backgroundColor = '#eef1f5';
    this.rootContainer.style.width = '100%';
    this.rootContainer.style.height = '100%';

    this.rootContainer.appendChild(this.contentWrapper);
    this.viewport.attach(this.rootContainer, this.contentWrapper);

    this.syncMetrics();
    this.bindPointerTracking();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.syncMetrics();
      });
      this.resizeObserver.observe(this.rootContainer);
    }
  }

  public setPageLayout(layout: PageLayoutMode): void {
    this.pageLayout = layout;
    this.applyPagesLayout();
    this.syncMetrics();
  }

  public getPageLayout(): PageLayoutMode {
    return this.pageLayout;
  }

  public getLayoutMetrics(): { width: number; height: number; cols: number } {
    const pages = this.pageManager.getPages();
    if (pages.length === 0) return { width: A4_DIMENSIONS.width, height: 0, cols: 1 };

    const firstPage = pages[0];
    const pageWidth = firstPage.dimensions.width;
    const pageHeight = firstPage.dimensions.height;
    const pageGap = 24;
    const pageCount = pages.length;

    if (this.pageLayout === 'single' || !this.rootContainer) {
      const totalHeight = pages.reduce((acc, p) => acc + p.dimensions.height, 0) + (pageCount - 1) * pageGap;
      return { width: pageWidth, height: totalHeight, cols: 1 };
    }

    const containerWidth = this.rootContainer.clientWidth;
    const zoom = this.viewport.getState().zoom;
    const availableWidth = containerWidth / zoom;
    const cols = Math.max(1, Math.min(pageCount, Math.floor((availableWidth + pageGap) / (pageWidth + pageGap))));
    const rows = Math.ceil(pageCount / cols);

    const width = cols * pageWidth + (cols - 1) * pageGap;
    const height = rows * pageHeight + (rows - 1) * pageGap;
    return { width, height, cols };
  }

  private syncMetrics(): void {
    const metrics = this.getLayoutMetrics();
    if (this.pageLayout === 'auto') {
      this.pagesContainer.style.width = `${metrics.width}px`;
    } else {
      this.pagesContainer.style.width = 'fit-content';
    }
    this.viewport.setContentDimensions(metrics.width, metrics.height);
  }

  public centerContent(): void {
    this.syncMetrics();
  }

  public addPage(dimensions?: PageDimensions): PageRecord {
    const page = this.pageManager.addPage(dimensions);
    this.slotManager.mountPage(page);
    this.syncMetrics();
    return page;
  }

  public removePage(index: number): boolean {
    this.slotManager.unmountPage(index);
    const result = this.pageManager.removePage(index);
    if (result) {
      this.syncMetrics();
    }
    return result;
  }

  public getPages(): PageRecord[] {
    return this.pageManager.getPages();
  }

  public setPageDimensions(dimensions: PageDimensions, pageIndex?: number): void {
    if (typeof pageIndex === 'number') {
      const page = this.pageManager.setPageDimensions(pageIndex, dimensions);
      if (page) {
        this.slotManager.resizePage(pageIndex, dimensions);
      }
    } else {
      this.pageManager.getPages().forEach((p) => {
        this.pageManager.setPageDimensions(p.index, dimensions);
        this.slotManager.resizePage(p.index, dimensions);
      });
    }

    this.syncMetrics();
  }

  public setMargins(margins: Margins, pageIndex?: number): void {
    if (typeof pageIndex === 'number') {
      const page = this.pageManager.setMargins(pageIndex, margins);
      if (page) {
        this.slotManager.resizePage(pageIndex, page.dimensions);
      }
    } else {
      this.pageManager.getPages().forEach((p) => {
        const updated = this.pageManager.setMargins(p.index, margins);
        if (updated) {
          this.slotManager.resizePage(p.index, updated.dimensions);
        }
      });
    }

    this.syncMetrics();
  }

  public setMarginGuidesVisible(visible: boolean): void {
    this.pageManager.setMarginGuidesVisible(visible);
  }

  public areMarginGuidesVisible(): boolean {
    return this.pageManager.areMarginGuidesVisible();
  }

  public setHeadersFootersVisible(visible: boolean): void {
    this.pageManager.setHeadersFootersVisible(visible);
  }

  public areHeadersFootersVisible(): boolean {
    return this.pageManager.areHeadersFootersVisible();
  }

  public setHeaderContent(pageIndex: number, htmlContent: string): void {
    const page = this.pageManager.getPage(pageIndex);
    if (page) {
      page.headerElement.innerHTML = htmlContent;
    }
  }

  public setFooterContent(pageIndex: number, htmlContent: string): void {
    const page = this.pageManager.getPage(pageIndex);
    if (page) {
      page.footerElement.innerHTML = htmlContent;
    }
  }

  public setLockHorizontalPan(lock: boolean): void {
    this.viewport.setLockHorizontalPan(lock);
  }

  public isHorizontalPanLocked(): boolean {
    return this.viewport.isHorizontalPanLocked();
  }

  public setClampVerticalScroll(clamp: boolean): void {
    this.viewport.setClampVerticalScroll(clamp);
  }

  public isVerticalScrollClamped(): boolean {
    return this.viewport.isVerticalScrollClamped();
  }

  public registerAdapter(adapter: CanvasAdapter): void {
    this.slotManager.registerAdapter(adapter, this.pageManager.getPages());
  }

  public setZoom(zoom: number): void {
    this.viewport.setZoom(zoom);
    this.syncMetrics();
  }

  public getViewportState(): ViewportState {
    return this.viewport.getState();
  }

  public renderRemoteCursors(cursors: RemoteCursor[]): void {
    this.cursorLayer.render(cursors, this.pageManager.getPages());
  }

  public onPointerMove(callback: (coords: { pageIndex: number; x: number; y: number }) => void): () => void {
    this.pointerListeners.add(callback);
    return () => this.pointerListeners.delete(callback);
  }

  private emitPointerMove(pageIndex: number, x: number, y: number): void {
    this.pointerListeners.forEach((fn) => fn({ pageIndex, x, y }));
  }

  private bindPointerTracking(): void {
    if (!this.rootContainer) return;

    this.rootContainer.addEventListener('mousemove', (e: MouseEvent) => {
      const pages = this.pageManager.getPages();
      const worldPoint = this.viewport.screenToWorld({ x: e.clientX, y: e.clientY });

      // Identify which page the mouse is currently hovering
      for (const page of pages) {
        const top = page.element.offsetTop;
        const left = page.element.offsetLeft;
        const width = page.dimensions.width;
        const height = page.dimensions.height;

        if (
          worldPoint.x >= left &&
          worldPoint.x <= left + width &&
          worldPoint.y >= top &&
          worldPoint.y <= top + height
        ) {
          const localX = worldPoint.x - left;
          const localY = worldPoint.y - top;
          this.emitPointerMove(page.index, Math.round(localX), Math.round(localY));
          break;
        }
      }
    });
  }

  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.viewport.detach();
    this.slotManager.unmountAll();
    this.cursorLayer.destroy();
    this.pageManager.clear();
    if (this.rootContainer) {
      this.rootContainer.innerHTML = '';
      this.rootContainer = null;
    }
  }
}
