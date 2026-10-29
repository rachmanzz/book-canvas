export { BookCanvas } from './canvas';
export type { BookCanvasOptions, PageLayoutMode } from './canvas';

// Core exports
export {
  A4_DIMENSIONS,
  LETTER_DIMENSIONS,
  LEGAL_DIMENSIONS,
  NORMAL_MARGINS,
  NARROW_MARGINS,
  WIDE_MARGINS,
} from './core/types';
export type {
  Margins,
  PageDimensions,
  ViewportState,
  Point,
} from './core/types';
export type { PageRecord } from './core/page-manager';

// Adapter exports
export type { CanvasAdapter, CanvasContext } from './adapter/types';

// Presence exports
export type { RemoteCursor } from './presence/types';
