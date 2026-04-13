/**
 * Tests for harmony.js
 * Run with: node --test tests/harmony.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  complementary, triadic, analogous,
  splitComplementary, tetradic, monochromatic,
} from '../src/harmony.js';

function near(a, b, tol = 1) {
  assert.ok(
    Math.abs(a - b) <= tol,
    `Expected ${a} ≈ ${b} (tolerance ${tol})`
  );
}

function hueNear(a, b, tol = 1) {
  // Wrap-aware comparison
  const diff = Math.abs(((a - b + 540) % 360) - 180);
  assert.ok(diff <= tol, `Hue ${a} ≈ ${b} (tolerance ${tol})`);
}

const RED = { h: 0, s: 100, l: 50 };
const BLUE = { h: 240, s: 100, l: 50 };
const GREEN = { h: 120, s: 100, l: 50 };

// ── complementary ────────────────────────────────────────────────────────────

describe('complementary', () => {
  test('returns 2 colors', () => {
    assert.equal(complementary(RED).length, 2);
  });

  test('first color is original', () => {
    const [first] = complementary(RED);
    assert.equal(first.h, RED.h);
  });

  test('complement of red is ~180', () => {
    const [, comp] = complementary(RED);
    near(comp.h, 180, 1);
  });

  test('complement of blue (240) is ~60', () => {
    const [, comp] = complementary(BLUE);
    near(comp.h, 60, 1);
  });

  test('preserves s and l', () => {
    const [, comp] = complementary(RED);
    assert.equal(comp.s, RED.s);
    assert.equal(comp.l, RED.l);
  });
});

// ── triadic ──────────────────────────────────────────────────────────────────

describe('triadic', () => {
  test('returns 3 colors', () => {
    assert.equal(triadic(RED).length, 3);
  });

  test('120° apart from red: 0, 120, 240', () => {
    const [c1, c2, c3] = triadic(RED);
    near(c1.h, 0, 1);
    near(c2.h, 120, 1);
    near(c3.h, 240, 1);
  });

  test('from 90°: 90, 210, 330', () => {
    const base = { h: 90, s: 80, l: 50 };
    const [c1, c2, c3] = triadic(base);
    near(c1.h, 90, 1);
    near(c2.h, 210, 1);
    near(c3.h, 330, 1);
  });

  test('preserves s and l', () => {
    const colors = triadic(RED);
    for (const c of colors) {
      assert.equal(c.s, RED.s);
      assert.equal(c.l, RED.l);
    }
  });
});

// ── analogous ────────────────────────────────────────────────────────────────

describe('analogous', () => {
  test('returns 5 colors by default', () => {
    assert.equal(analogous(RED).length, 5);
  });

  test('returns N colors when specified', () => {
    assert.equal(analogous(RED, 3).length, 3);
    assert.equal(analogous(RED, 7).length, 7);
  });

  test('middle color is close to original', () => {
    const colors = analogous(RED, 5);
    const mid = colors[2];
    near(mid.h, RED.h, 1);
  });

  test('all hues within spread of original', () => {
    const colors = analogous(RED, 5, 60);
    for (const c of colors) {
      const diff = Math.abs(((c.h - RED.h + 540) % 360) - 180);
      assert.ok(diff <= 31, `hue ${c.h} outside spread`);
    }
  });
});

// ── splitComplementary ───────────────────────────────────────────────────────

describe('splitComplementary', () => {
  test('returns 3 colors', () => {
    assert.equal(splitComplementary(RED).length, 3);
  });

  test('first is original', () => {
    const [first] = splitComplementary(RED);
    assert.equal(first.h, RED.h);
  });

  test('from red: 0, 150, 210', () => {
    const [c1, c2, c3] = splitComplementary(RED);
    near(c1.h, 0, 1);
    near(c2.h, 150, 1);
    near(c3.h, 210, 1);
  });

  test('preserves s and l', () => {
    const colors = splitComplementary(RED);
    for (const c of colors) {
      assert.equal(c.s, RED.s);
      assert.equal(c.l, RED.l);
    }
  });
});

// ── tetradic ─────────────────────────────────────────────────────────────────

describe('tetradic', () => {
  test('returns 4 colors', () => {
    assert.equal(tetradic(RED).length, 4);
  });

  test('90° apart from red: 0, 90, 180, 270', () => {
    const [c1, c2, c3, c4] = tetradic(RED);
    near(c1.h, 0, 1);
    near(c2.h, 90, 1);
    near(c3.h, 180, 1);
    near(c4.h, 270, 1);
  });

  test('preserves s and l', () => {
    const colors = tetradic(RED);
    for (const c of colors) {
      assert.equal(c.s, RED.s);
      assert.equal(c.l, RED.l);
    }
  });
});

// ── monochromatic ────────────────────────────────────────────────────────────

describe('monochromatic', () => {
  test('returns 5 swatches by default', () => {
    assert.equal(monochromatic(RED).length, 5);
  });

  test('returns N swatches when specified', () => {
    assert.equal(monochromatic(RED, 3).length, 3);
  });

  test('all share same hue', () => {
    const colors = monochromatic(RED);
    for (const c of colors) {
      assert.equal(c.h, RED.h);
    }
  });

  test('all share same saturation', () => {
    const colors = monochromatic(RED);
    for (const c of colors) {
      assert.equal(c.s, RED.s);
    }
  });

  test('lightness values are distinct and ordered', () => {
    const colors = monochromatic(RED, 5);
    for (let i = 1; i < colors.length; i++) {
      assert.ok(colors[i].l > colors[i - 1].l, 'lightness should increase');
    }
  });

  test('lightness stays in valid range', () => {
    const colors = monochromatic(RED, 5);
    for (const c of colors) {
      assert.ok(c.l >= 0 && c.l <= 100, `l=${c.l} out of [0,100]`);
    }
  });
});

// ── Edge cases: black, white, gray ───────────────────────────────────────────

describe('edge cases', () => {
  const WHITE = { h: 0, s: 0, l: 100 };
  const BLACK = { h: 0, s: 0, l: 0 };
  const GRAY = { h: 0, s: 0, l: 50 };

  test('complementary of white returns 2', () => {
    assert.equal(complementary(WHITE).length, 2);
  });

  test('complementary of black returns 2', () => {
    assert.equal(complementary(BLACK).length, 2);
  });

  test('triadic of gray returns 3', () => {
    assert.equal(triadic(GRAY).length, 3);
  });

  test('hue wraps correctly at 350: complement is 170', () => {
    const base = { h: 350, s: 80, l: 50 };
    const [, comp] = complementary(base);
    near(comp.h, 170, 1);
  });

  test('hue wraps correctly: split-comp from 320', () => {
    const base = { h: 320, s: 70, l: 50 };
    const [, c2, c3] = splitComplementary(base);
    // 320+150=470→110, 320+210=530→170
    near(c2.h, 110, 1);
    near(c3.h, 170, 1);
  });

  test('tetradic hues all in [0,360)', () => {
    const base = { h: 300, s: 80, l: 50 };
    const colors = tetradic(base);
    for (const c of colors) {
      assert.ok(c.h >= 0 && c.h < 360, `h=${c.h} not in [0,360)`);
    }
  });
});
