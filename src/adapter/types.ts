import { PageDimensions } from '../core/types';

export interface CanvasContext {
  pageIndex: number;
  container: HTMLElement;
  dimensions: PageDimensions;
  requestPageBreak: () => void;
  reportCursorPosition: (localX: number, localY: number) => void;
}

export interface CanvasAdapter {
  readonly id: string;
  readonly name: string;

  /**
   * Called when a page slot is mounted and ready to render guest content.
   */
  mount(context: CanvasContext): void;

  /**
   * Called when page dimensions or margins are resized.
   */
  resize?(dimensions: PageDimensions): void;

  /**
   * Called when a page is removed to clean up listeners and DOM.
   */
  unmount(pageIndex: number): void;
}
