import { A4_DIMENSIONS, Margins, PageDimensions } from './types';

export interface PageRecord {
  id: string;
  index: number;
  dimensions: PageDimensions;
  element: HTMLElement;
  slotContainer: HTMLElement;
  headerElement: HTMLElement;
  footerElement: HTMLElement;
  pageNumberElement: HTMLElement;
}

export class PageManager {
  private pages: PageRecord[] = [];
  private showMarginGuides: boolean = true;
  private showHeadersFooters: boolean = true;

  constructor(
    private parentElement: HTMLElement,
    private defaultDimensions: PageDimensions = A4_DIMENSIONS
  ) {}

  public getPages(): PageRecord[] {
    return [...this.pages];
  }

  public getPage(index: number): PageRecord | undefined {
    return this.pages[index];
  }

  public setMarginGuidesVisible(visible: boolean): void {
    this.showMarginGuides = visible;
    this.pages.forEach((p) => {
      p.slotContainer.style.outline = visible ? '1px dashed rgba(148, 163, 184, 0.4)' : 'none';
    });
  }

  public areMarginGuidesVisible(): boolean {
    return this.showMarginGuides;
  }

  public setHeadersFootersVisible(visible: boolean): void {
    this.showHeadersFooters = visible;
    this.pages.forEach((p) => {
      p.headerElement.style.display = visible ? 'flex' : 'none';
      p.footerElement.style.display = visible ? 'flex' : 'none';
    });
  }

  public areHeadersFootersVisible(): boolean {
    return this.showHeadersFooters;
  }

  public updatePageNumbers(): void {
    const total = this.pages.length;
    this.pages.forEach((page, idx) => {
      page.pageNumberElement.textContent = `Page ${idx + 1} of ${total}`;
    });
  }

  public addPage(customDimensions?: PageDimensions): PageRecord {
    const index = this.pages.length;
    const id = `page-${Date.now()}-${index}`;
    const dimensions = customDimensions ?? { ...this.defaultDimensions };

    const pageElement = document.createElement('div');
    pageElement.className = 'book-canvas-page';
    pageElement.id = id;
    pageElement.style.width = `${dimensions.width}px`;
    pageElement.style.height = `${dimensions.height}px`;
    pageElement.style.backgroundColor = '#ffffff';
    pageElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)';
    pageElement.style.position = 'relative';
    pageElement.style.flexShrink = '0';
    pageElement.style.boxSizing = 'border-box';
    pageElement.style.userSelect = 'none';

    // Header Zone (inside top margin)
    const headerElement = document.createElement('div');
    headerElement.className = 'book-canvas-header';
    headerElement.style.position = 'absolute';
    headerElement.style.top = '18px';
    headerElement.style.left = `${dimensions.margins.left}px`;
    headerElement.style.width = `${dimensions.width - dimensions.margins.left - dimensions.margins.right}px`;
    headerElement.style.height = '28px';
    headerElement.style.display = this.showHeadersFooters ? 'flex' : 'none';
    headerElement.style.alignItems = 'center';
    headerElement.style.justifyContent = 'space-between';
    headerElement.style.fontSize = '11px';
    headerElement.style.color = '#94a3b8';
    headerElement.style.borderBottom = '1px solid #f1f5f9';
    headerElement.style.boxSizing = 'border-box';
    headerElement.style.pointerEvents = 'none';
    headerElement.innerHTML = `<span>Document Header</span><span style="font-style: italic;">Draft</span>`;

    // Printable content slot strictly constrained by margins
    const slotContainer = document.createElement('div');
    slotContainer.className = 'book-canvas-slot';
    slotContainer.style.position = 'absolute';
    slotContainer.style.top = `${dimensions.margins.top}px`;
    slotContainer.style.left = `${dimensions.margins.left}px`;
    slotContainer.style.width = `${dimensions.width - dimensions.margins.left - dimensions.margins.right}px`;
    slotContainer.style.height = `${dimensions.height - dimensions.margins.top - dimensions.margins.bottom}px`;
    slotContainer.style.boxSizing = 'border-box';
    slotContainer.style.overflow = 'hidden';
    slotContainer.style.contain = 'paint layout';
    slotContainer.style.outline = this.showMarginGuides ? '1px dashed rgba(148, 163, 184, 0.4)' : 'none';

    // Footer Zone (inside bottom margin)
    const footerElement = document.createElement('div');
    footerElement.className = 'book-canvas-footer';
    footerElement.style.position = 'absolute';
    footerElement.style.bottom = '18px';
    footerElement.style.left = `${dimensions.margins.left}px`;
    footerElement.style.width = `${dimensions.width - dimensions.margins.left - dimensions.margins.right}px`;
    footerElement.style.height = '28px';
    footerElement.style.display = this.showHeadersFooters ? 'flex' : 'none';
    footerElement.style.alignItems = 'center';
    footerElement.style.fontSize = '11px';
    footerElement.style.color = '#94a3b8';
    footerElement.style.borderTop = '1px solid #f1f5f9';
    footerElement.style.boxSizing = 'border-box';
    footerElement.style.pointerEvents = 'none';

    const pageNumberElement = document.createElement('span');
    pageNumberElement.className = 'book-canvas-page-number';
    pageNumberElement.style.marginLeft = 'auto';
    footerElement.appendChild(pageNumberElement);

    pageElement.appendChild(headerElement);
    pageElement.appendChild(slotContainer);
    pageElement.appendChild(footerElement);
    this.parentElement.appendChild(pageElement);

    const record: PageRecord = {
      id,
      index,
      dimensions,
      element: pageElement,
      slotContainer,
      headerElement,
      footerElement,
      pageNumberElement,
    };

    this.pages.push(record);
    this.updatePageNumbers();
    return record;
  }

  public setMargins(index: number, margins: Margins): PageRecord | undefined {
    const page = this.pages[index];
    if (!page) return undefined;

    page.dimensions.margins = { ...margins };
    const contentWidth = `${page.dimensions.width - margins.left - margins.right}px`;

    // Update body slot
    page.slotContainer.style.top = `${margins.top}px`;
    page.slotContainer.style.left = `${margins.left}px`;
    page.slotContainer.style.width = contentWidth;
    page.slotContainer.style.height = `${page.dimensions.height - margins.top - margins.bottom}px`;

    // Update header & footer widths to align with margins
    page.headerElement.style.left = `${margins.left}px`;
    page.headerElement.style.width = contentWidth;

    page.footerElement.style.left = `${margins.left}px`;
    page.footerElement.style.width = contentWidth;

    return page;
  }

  public setPageDimensions(index: number, dimensions: PageDimensions): PageRecord | undefined {
    const page = this.pages[index];
    if (!page) return undefined;

    page.dimensions = { ...dimensions };
    page.element.style.width = `${dimensions.width}px`;
    page.element.style.height = `${dimensions.height}px`;

    const contentWidth = `${dimensions.width - dimensions.margins.left - dimensions.margins.right}px`;

    page.slotContainer.style.top = `${dimensions.margins.top}px`;
    page.slotContainer.style.left = `${dimensions.margins.left}px`;
    page.slotContainer.style.width = contentWidth;
    page.slotContainer.style.height = `${dimensions.height - dimensions.margins.top - dimensions.margins.bottom}px`;

    page.headerElement.style.left = `${dimensions.margins.left}px`;
    page.headerElement.style.width = contentWidth;

    page.footerElement.style.left = `${dimensions.margins.left}px`;
    page.footerElement.style.width = contentWidth;

    return page;
  }

  public removePage(index: number): boolean {
    if (index < 0 || index >= this.pages.length) return false;
    const [removed] = this.pages.splice(index, 1);
    removed.element.remove();

    this.pages.forEach((p, idx) => {
      p.index = idx;
    });

    this.updatePageNumbers();
    return true;
  }

  public clear(): void {
    this.pages.forEach((p) => p.element.remove());
    this.pages = [];
  }
}
