import { CanvasAdapter, CanvasContext } from './types';
import { PageRecord } from '../core/page-manager';

export class SlotManager {
  private adapter: CanvasAdapter | null = null;
  private activeContexts: Map<number, CanvasContext> = new Map();

  constructor(
    private onRequestPageBreak: () => void,
    private onCursorReport: (pageIndex: number, localX: number, localY: number) => void
  ) {}

  public registerAdapter(adapter: CanvasAdapter, pages: PageRecord[]): void {
    if (this.adapter) {
      this.unmountAll();
    }
    this.adapter = adapter;
    pages.forEach((page) => this.mountPage(page));
  }

  public getAdapter(): CanvasAdapter | null {
    return this.adapter;
  }

  public mountPage(page: PageRecord): void {
    if (!this.adapter) return;

    const context: CanvasContext = {
      pageIndex: page.index,
      container: page.slotContainer,
      dimensions: page.dimensions,
      requestPageBreak: () => this.onRequestPageBreak(),
      reportCursorPosition: (localX, localY) => {
        this.onCursorReport(page.index, localX, localY);
      },
    };

    this.activeContexts.set(page.index, context);
    this.adapter.mount(context);
  }

  public unmountPage(pageIndex: number): void {
    if (this.adapter && this.activeContexts.has(pageIndex)) {
      this.adapter.unmount(pageIndex);
      this.activeContexts.delete(pageIndex);
    }
  }

  public resizePage(pageIndex: number, dimensions: PageRecord['dimensions']): void {
    if (this.adapter?.resize) {
      this.adapter.resize(dimensions);
    }
  }

  public unmountAll(): void {
    if (!this.adapter) return;
    for (const pageIndex of this.activeContexts.keys()) {
      this.adapter.unmount(pageIndex);
    }
    this.activeContexts.clear();
  }
}
