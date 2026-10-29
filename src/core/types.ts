export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NORMAL_MARGINS: Margins = {
  top: 72,
  right: 72,
  bottom: 72,
  left: 72,
};

export const NARROW_MARGINS: Margins = {
  top: 36,
  right: 36,
  bottom: 36,
  left: 36,
};

export const WIDE_MARGINS: Margins = {
  top: 72,
  right: 120,
  bottom: 72,
  left: 120,
};

export interface PageDimensions {
  width: number;
  height: number;
  margins: Margins;
}

export const A4_DIMENSIONS: PageDimensions = {
  width: 794,   // 210mm @ 96 DPI
  height: 1123, // 297mm @ 96 DPI
  margins: {
    top: 72,    // 0.75 in (~19mm)
    right: 72,
    bottom: 72,
    left: 72,
  },
};

export const LETTER_DIMENSIONS: PageDimensions = {
  width: 816,   // 8.5 in @ 96 DPI
  height: 1056, // 11 in @ 96 DPI
  margins: {
    top: 72,
    right: 72,
    bottom: 72,
    left: 72,
  },
};

export const LEGAL_DIMENSIONS: PageDimensions = {
  width: 816,   // 8.5 in @ 96 DPI
  height: 1344, // 14 in @ 96 DPI
  margins: {
    top: 72,
    right: 72,
    bottom: 72,
    left: 72,
  },
};

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface Point {
  x: number;
  y: number;
}
