# book-canvas

A headless, client-side TypeScript library for paged document layouts.

`book-canvas` manages paper sheets (A4, Letter, Legal), coordinate transforms (zoom and pan), margin boundaries, and collaborator cursor overlays. It does not parse or edit documents; content engines (such as text editors, spreadsheets, or canvas tools) attach to each page through an adapter interface.

## What It Does

- Renders physical document pages with customizable dimensions and margins.
- Handles viewport zoom (25% to 300%) and vertical scrolling constrained to document boundaries.
- Automatically centers documents horizontally and supports responsive multi-column layouts when zoomed out.
- Enforces margin containment via CSS layout clipping (`overflow: hidden` and `contain: paint layout`).
- Provides header and footer zones with dynamic page numbering (`Page X of Y`).
- Renders remote collaborator pointers through a transport-agnostic presence API.

## What It Does Not Do

- It does not process or edit rich text.
- It does not parse file formats (such as DOCX, XLSX, or PDF).
- It does not run a WebSocket server or synchronization protocol. Connecting to networks or CRDT backends is handled by the consuming application or adapter.

## Installation

Install directly from the GitHub repository:

```bash
yarn add git+https://github.com/rachmanzz/book-canvas.git
```

Or using npm / pnpm:

```bash
npm install git+https://github.com/rachmanzz/book-canvas.git
pnpm add git+https://github.com/rachmanzz/book-canvas.git
```

## Quick Start

```typescript
import { BookCanvas, A4_DIMENSIONS } from 'book-canvas';
import type { CanvasAdapter, CanvasContext } from 'book-canvas';

// 1. Define a minimal adapter
const textAdapter: CanvasAdapter = {
  id: 'my-text-adapter',
  name: 'Text Adapter',
  mount(context: CanvasContext) {
    const editor = document.createElement('div');
    editor.contentEditable = 'true';
    editor.style.width = '100%';
    editor.style.height = '100%';
    editor.style.outline = 'none';
    editor.innerText = `Content on page ${context.pageIndex + 1}`;
    context.container.appendChild(editor);
  },
  unmount(pageIndex: number) {
    // Clean up event listeners or instances
  },
};

// 2. Initialize and mount the canvas
const container = document.getElementById('canvas-container') as HTMLElement;
const canvas = new BookCanvas({
  initialPages: 2,
  defaultPageDimensions: A4_DIMENSIONS,
  pageLayout: 'auto',
});

canvas.registerAdapter(textAdapter);
canvas.mount(container);
```

## Architecture and Boundaries

The library separates viewport and page layout management from content rendering:

```text
Host App / Browser Viewport
    │
    ▼
BookCanvas (Viewport, Pan/Zoom, Centering, Margins, Header/Footer)
    │
    ▼
slotContainer (CSS containment: overflow: hidden, contain: paint layout)
    │
    ▼
CanvasAdapter (Guest Editor: Word, Spreadsheet, Vector Canvas, etc.)
```

### Margin Containment

Each page provides a `slotContainer` positioned strictly within the defined margins:

- `top = margins.top`
- `left = margins.left`
- `width = pageWidth - margins.left - margins.right`
- `height = pageHeight - margins.top - margins.bottom`

Any content rendered by the adapter is contained inside this slot. Elements that overflow the available area are clipped by the browser.

### Remote Cursors

The canvas includes an overlay for rendering other users' pointers without depending on a specific network library:

```typescript
// Report local mouse movement
canvas.onPointerMove(({ pageIndex, x, y }) => {
  // Send coordinates through your WebSocket or signaling connection
});

// Render incoming collaborator pointers
canvas.renderRemoteCursors([
  {
    userId: 'user-1',
    userName: 'Jane',
    color: '#2563eb',
    pageIndex: 0,
    x: 150,
    y: 200,
  },
]);
```

## Local Development and Interactive Demo

Run the local Vite dev server on port 1520 to preview the demo app:

```bash
yarn install
yarn dev
```

Build showcase pages for static hosting:

```bash
yarn build:pages
```

## Demonstration Samples and Adapter Scope

The examples provided in the `example/` folder and published on the [live showcase](https://rachmanzz.github.io/book-canvas/) are lightweight mockups created to demonstrate how `book-canvas` handles page lifecycle, viewport transforms, margin clipping, and header/footer numbering.

- They do **not** parse or render real binary Office formats (`.docx`, `.xlsx`), full Markdown ASTs, or native PDF documents.
- The UI shown inside each slot is illustrative placeholder content.
- To build a functional document editor, spreadsheet, or vector studio, you must provide your own `CanvasAdapter` that mounts your chosen rendering engine or editor into the provided `CanvasContext.container`.

## Testing and Building

```bash
yarn test
```

Build library outputs (`dist/index.js`, `dist/index.cjs`, and `dist/index.d.ts`):

```bash
yarn build
```

## License

Apache-2.0
