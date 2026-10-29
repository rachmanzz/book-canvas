import { describe, expect, it } from 'vitest';
import { Viewport } from '../src/core/viewport';

describe('Viewport transforms & constraints', () => {
  it('correctly transforms world to screen coordinates at zoom 1', () => {
    const viewport = new Viewport({ lockHorizontalPan: false, clampVerticalScroll: false });
    viewport.setPan(100, 50);

    const screen = viewport.worldToScreen({ x: 200, y: 300 });
    expect(screen.x).toBe(300);
    expect(screen.y).toBe(350);
  });

  it('correctly transforms screen to world coordinates with zoom 2', () => {
    const viewport = new Viewport({ lockHorizontalPan: false, clampVerticalScroll: false });
    viewport.setPan(100, 50);
    viewport.setZoom(2);

    const world = viewport.screenToWorld({ x: 300, y: 250 });
    expect(world.x).toBe((300 - 100) / 2);
    expect(world.y).toBe((250 - 50) / 2);
  });

  it('clamps zoom between minZoom and maxZoom', () => {
    const viewport = new Viewport();
    viewport.setZoom(10);
    expect(viewport.getState().zoom).toBe(3.0);

    viewport.setZoom(0.01);
    expect(viewport.getState().zoom).toBe(0.25);
  });

  it('locks horizontal pan when lockHorizontalPan is true', () => {
    const viewport = new Viewport({ lockHorizontalPan: true, clampVerticalScroll: false });
    viewport.setPan(200, 100);

    expect(viewport.getState().panX).toBe(0);
    expect(viewport.getState().panY).toBe(100);
  });

  it('allows toggling vertical scroll clamping', () => {
    const viewport = new Viewport({ clampVerticalScroll: true });
    expect(viewport.isVerticalScrollClamped()).toBe(true);

    viewport.setClampVerticalScroll(false);
    expect(viewport.isVerticalScrollClamped()).toBe(false);
  });
});
