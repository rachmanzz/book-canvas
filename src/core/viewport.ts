import { Point, ViewportState } from './types';

export interface ViewportOptions {
  lockHorizontalPan?: boolean;
  clampVerticalScroll?: boolean;
  topPadding?: number;
  bottomPadding?: number;
}

export class Viewport {
  private state: ViewportState = {
    zoom: 1,
    panX: 0,
    panY: 40,
  };

  private minZoom = 0.25;
  private maxZoom = 3.0;
  private isPanning = false;
  private startPan: Point = { x: 0, y: 0 };
  private container: HTMLElement | null = null;
  private contentWrapper: HTMLElement | null = null;
  private lockHorizontalPan: boolean;
  private clampVerticalScroll: boolean;
  private contentWidth: number = 794;
  private contentHeight: number = 0;
  private topPadding: number;
  private bottomPadding: number;

  constructor(
    options: ViewportOptions = {},
    private onChange?: (state: ViewportState) => void
  ) {
    this.lockHorizontalPan = options.lockHorizontalPan ?? true;
    this.clampVerticalScroll = options.clampVerticalScroll ?? true;
    this.topPadding = options.topPadding ?? 40;
    this.bottomPadding = options.bottomPadding ?? 60;
  }

  public attach(container: HTMLElement, contentWrapper: HTMLElement): void {
    this.container = container;
    this.contentWrapper = contentWrapper;
    if (this.lockHorizontalPan) {
      this.recenterHorizontal();
    } else {
      this.applyTransform();
    }
    this.bindEvents();
  }

  public getState(): ViewportState {
    return { ...this.state };
  }

  public setLockHorizontalPan(lock: boolean): void {
    this.lockHorizontalPan = lock;
    if (lock) {
      this.recenterHorizontal();
    }
  }

  public isHorizontalPanLocked(): boolean {
    return this.lockHorizontalPan;
  }

  public setClampVerticalScroll(clamp: boolean): void {
    this.clampVerticalScroll = clamp;
    if (clamp) {
      this.clampPanY();
    }
  }

  public isVerticalScrollClamped(): boolean {
    return this.clampVerticalScroll;
  }

  public setContentDimensions(width: number, height: number): void {
    this.contentWidth = width;
    this.contentHeight = height;
    if (this.lockHorizontalPan) {
      this.recenterHorizontal();
    }
    if (this.clampVerticalScroll) {
      this.clampPanY();
    }
  }

  public setContentHeight(height: number): void {
    this.contentHeight = height;
    if (this.clampVerticalScroll) {
      this.clampPanY();
    }
  }

  public clampPanY(): void {
    if (!this.clampVerticalScroll || !this.container || this.contentHeight <= 0) return;

    const containerHeight = this.container.clientHeight;
    const scaledHeight = this.contentHeight * this.state.zoom;
    const maxPanY = this.topPadding;
    const minPanY = Math.min(
      this.topPadding,
      containerHeight - scaledHeight - this.bottomPadding
    );

    this.state.panY = Math.min(Math.max(this.state.panY, minPanY), maxPanY);
    this.applyTransform();
  }

  public setZoom(zoom: number, origin?: Point): void {
    const clampedZoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom);
    if (!this.lockHorizontalPan && origin && this.container) {
      const rect = this.container.getBoundingClientRect();
      const originX = origin.x - rect.left;
      const originY = origin.y - rect.top;

      const scaleChange = clampedZoom / this.state.zoom;
      this.state.panX = originX - (originX - this.state.panX) * scaleChange;
      this.state.panY = originY - (originY - this.state.panY) * scaleChange;
    }
    this.state.zoom = clampedZoom;

    if (this.lockHorizontalPan) {
      this.recenterHorizontal();
    }

    if (this.clampVerticalScroll) {
      this.clampPanY();
    } else {
      this.applyTransform();
    }
  }

  public recenterHorizontal(contentWidth?: number): void {
    if (typeof contentWidth === 'number') {
      this.contentWidth = contentWidth;
    }
    if (!this.container || this.contentWidth <= 0) return;
    const rect = this.container.getBoundingClientRect();
    const scaledWidth = this.contentWidth * this.state.zoom;
    // Pure symmetric centering: panX = (containerWidth - scaledWidth) / 2
    this.state.panX = (rect.width - scaledWidth) / 2;
    this.applyTransform();
  }

  public setPan(x: number, y: number): void {
    if (!this.lockHorizontalPan) {
      this.state.panX = x;
    }
    this.state.panY = y;
    if (this.clampVerticalScroll) {
      this.clampPanY();
    } else {
      this.applyTransform();
    }
  }

  public screenToWorld(screenPoint: Point): Point {
    return {
      x: (screenPoint.x - this.state.panX) / this.state.zoom,
      y: (screenPoint.y - this.state.panY) / this.state.zoom,
    };
  }

  public worldToScreen(worldPoint: Point): Point {
    return {
      x: worldPoint.x * this.state.zoom + this.state.panX,
      y: worldPoint.y * this.state.zoom + this.state.panY,
    };
  }

  private applyTransform(): void {
    if (!this.contentWrapper) return;
    this.contentWrapper.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.zoom})`;
    this.contentWrapper.style.transformOrigin = '0 0';
    this.onChange?.(this.state);
  }

  private bindEvents(): void {
    if (!this.container) return;

    this.container.addEventListener('wheel', this.handleWheel, { passive: false });
    this.container.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  public detach(): void {
    if (!this.container) return;
    this.container.removeEventListener('wheel', this.handleWheel);
    this.container.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.container = null;
    this.contentWrapper = null;
  }

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = -e.deltaY * 0.0015;
      const targetZoom = this.state.zoom * (1 + zoomFactor);
      this.setZoom(targetZoom, { x: e.clientX, y: e.clientY });
    } else {
      // Pan: scroll murni top-down jika horizontal terkunci
      if (!this.lockHorizontalPan) {
        this.state.panX -= e.deltaX;
      }
      this.state.panY -= e.deltaY;
      if (this.clampVerticalScroll) {
        this.clampPanY();
      } else {
        this.applyTransform();
      }
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    // Middle click or Space+Click or Click on background
    if (e.button === 1 || e.target === this.container) {
      this.isPanning = true;
      this.startPan = { x: e.clientX - this.state.panX, y: e.clientY - this.state.panY };
      if (this.container) this.container.style.cursor = 'grabbing';
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isPanning) return;
    if (!this.lockHorizontalPan) {
      this.state.panX = e.clientX - this.startPan.x;
    }
    this.state.panY = e.clientY - this.startPan.y;
    if (this.clampVerticalScroll) {
      this.clampPanY();
    } else {
      this.applyTransform();
    }
  };

  private handleMouseUp = (): void => {
    if (this.isPanning) {
      this.isPanning = false;
      if (this.container) this.container.style.cursor = 'default';
    }
  };
}
