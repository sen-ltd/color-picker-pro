/**
 * Tests for color-space.js
 * Run with: node --test tests/color-space.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sRGBToLinear, linearToSRGB,
  hexToRgb, rgbToHex,
  rgbToHsl, hslToRgb,
  rgbToHsv, hsvToRgb,
  rgbToLab, labToRgb,
  labToLch, lchToLab,
  rgbToLch, lchToRgb,
  rgbToOklab, oklabToRgb,
  rgbToOklch, oklchToRgb,
  formatColor,
  relativeLuminance, contrastRatio,
  clamp, wrapHue,
} from '../src/color-space.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function near(a, b, tol = 1) {
  assert.ok(
    Math.abs(a - b) <= tol,
    `Expected ${a} ≈ ${b} (tolerance ${tol})`
  );
}

function nearRgb(actual, expected, tol = 2) {
  near(actual.r, expected.r, tol);
  near(actual.g, expected.g, tol);
  near(actual.b, expected.b, tol);
}

// ── sRGB ↔ Linear ─────────────────────────────────────────────────────────────

describe('sRGBToLinear / linearToSRGB', () => {
  test('black stays 0', () => {
    assert.equal(sRGBToLinear(0), 0);
    assert.equal(linearToSRGB(0), 0);
  });

  test('white stays 1', () => {
    near(sRGBToLinear(1), 1, 0.001);
    near(linearToSRGB(1), 1, 0.001);
  });

  test('round trip 0.5', () => {
    near(linearToSRGB(sRGBToLinear(0.5)), 0.5, 0.001);
  });

  test('round trip 0.8', () => {
    near(linearToSRGB(sRGBToLinear(0.8)), 0.8, 0.001);
  });
});

// ── HEX ↔ RGB ─────────────────────────────────────────────────────────────────

describe('hexToRgb / rgbToHex', () => {
  test('parse #ff0000', () => {
    assert.deepEqual(hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 });
  });

  test('parse shorthand #f00', () => {
    assert.deepEqual(hexToRgb('#f00'), { r: 255, g: 0, b: 0 });
  });

  test('parse #123456', () => {
    const { r, g, b } = hexToRgb('#123456');
    assert.equal(r, 0x12);
    assert.equal(g, 0x34);
    assert.equal(b, 0x56);
  });

  test('invalid hex returns null', () => {
    assert.equal(hexToRgb('#gggggg'), null);
  });

  test('rgbToHex red', () => {
    assert.equal(rgbToHex(255, 0, 0), '#ff0000');
  });

  test('rgbToHex white', () => {
    assert.equal(rgbToHex(255, 255, 255), '#ffffff');
  });

  test('rgbToHex black', () => {
    assert.equal(rgbToHex(0, 0, 0), '#000000');
  });

  test('round trip red', () => {
    const hex = rgbToHex(255, 0, 0);
    const { r, g, b } = hexToRgb(hex);
    assert.deepEqual({ r, g, b }, { r: 255, g: 0, b: 0 });
  });
});

// ── RGB ↔ HSL ─────────────────────────────────────────────────────────────────

describe('rgbToHsl / hslToRgb', () => {
  test('red → HSL', () => {
    const { h, s, l } = rgbToHsl(255, 0, 0);
    near(h, 0, 1);
    near(s, 100, 1);
    near(l, 50, 1);
  });

  test('green → HSL', () => {
    const { h, s, l } = rgbToHsl(0, 255, 0);
    near(h, 120, 1);
    near(s, 100, 1);
    near(l, 50, 1);
  });

  test('blue → HSL', () => {
    const { h, s, l } = rgbToHsl(0, 0, 255);
    near(h, 240, 1);
    near(s, 100, 1);
    near(l, 50, 1);
  });

  test('white → HSL', () => {
    const { s, l } = rgbToHsl(255, 255, 255);
    near(s, 0, 1);
    near(l, 100, 1);
  });

  test('black → HSL', () => {
    const { s, l } = rgbToHsl(0, 0, 0);
    near(s, 0, 1);
    near(l, 0, 1);
  });

  test('gray → HSL (s=0)', () => {
    const { s } = rgbToHsl(128, 128, 128);
    near(s, 0, 1);
  });

  test('hslToRgb red', () => {
    nearRgb(hslToRgb(0, 100, 50), { r: 255, g: 0, b: 0 });
  });

  test('hslToRgb white', () => {
    nearRgb(hslToRgb(0, 0, 100), { r: 255, g: 255, b: 255 });
  });

  test('hslToRgb black', () => {
    nearRgb(hslToRgb(0, 0, 0), { r: 0, g: 0, b: 0 });
  });

  test('round trip red', () => {
    const { h, s, l } = rgbToHsl(255, 0, 0);
    nearRgb(hslToRgb(h, s, l), { r: 255, g: 0, b: 0 });
  });

  test('round trip arbitrary color', () => {
    const { h, s, l } = rgbToHsl(123, 200, 45);
    nearRgb(hslToRgb(h, s, l), { r: 123, g: 200, b: 45 });
  });

  test('round trip blue', () => {
    const { h, s, l } = rgbToHsl(0, 0, 255);
    nearRgb(hslToRgb(h, s, l), { r: 0, g: 0, b: 255 });
  });
});

// ── RGB ↔ HSV ─────────────────────────────────────────────────────────────────

describe('rgbToHsv / hsvToRgb', () => {
  test('red → HSV', () => {
    const { h, s, v } = rgbToHsv(255, 0, 0);
    near(h, 0, 1);
    near(s, 100, 1);
    near(v, 100, 1);
  });

  test('black → HSV', () => {
    const { s, v } = rgbToHsv(0, 0, 0);
    near(v, 0, 1);
  });

  test('white → HSV', () => {
    const { s, v } = rgbToHsv(255, 255, 255);
    near(s, 0, 1);
    near(v, 100, 1);
  });

  test('round trip red', () => {
    const { h, s, v } = rgbToHsv(255, 0, 0);
    nearRgb(hsvToRgb(h, s, v), { r: 255, g: 0, b: 0 });
  });

  test('round trip arbitrary', () => {
    const { h, s, v } = rgbToHsv(80, 150, 220);
    nearRgb(hsvToRgb(h, s, v), { r: 80, g: 150, b: 220 });
  });
});

// ── RGB ↔ LAB ─────────────────────────────────────────────────────────────────

describe('rgbToLab / labToRgb', () => {
  test('black L=0', () => {
    const { l } = rgbToLab(0, 0, 0);
    near(l, 0, 1);
  });

  test('white L~100', () => {
    const { l } = rgbToLab(255, 255, 255);
    near(l, 100, 1);
  });

  test('round trip red', () => {
    const { l, a, b } = rgbToLab(255, 0, 0);
    nearRgb(labToRgb(l, a, b), { r: 255, g: 0, b: 0 }, 3);
  });

  test('round trip arbitrary', () => {
    const { l, a, b } = rgbToLab(100, 150, 200);
    nearRgb(labToRgb(l, a, b), { r: 100, g: 150, b: 200 }, 3);
  });
});

// ── LAB ↔ LCh ────────────────────────────────────────────────────────────────

describe('labToLch / lchToLab', () => {
  test('neutral (a=0, b=0) → h=0', () => {
    const { c, h } = labToLch(50, 0, 0);
    near(c, 0, 0.001);
  });

  test('round trip', () => {
    const lab = { l: 60, a: 30, b: -20 };
    const { l, c, h } = labToLch(lab.l, lab.a, lab.b);
    const back = lchToLab(l, c, h);
    near(back.l, lab.l, 0.01);
    near(back.a, lab.a, 0.01);
    near(back.b, lab.b, 0.01);
  });
});

// ── RGB ↔ LCh ────────────────────────────────────────────────────────────────

describe('rgbToLch / lchToRgb', () => {
  test('round trip red', () => {
    const { l, c, h } = rgbToLch(255, 0, 0);
    nearRgb(lchToRgb(l, c, h), { r: 255, g: 0, b: 0 }, 3);
  });

  test('round trip blue', () => {
    const { l, c, h } = rgbToLch(0, 0, 255);
    nearRgb(lchToRgb(l, c, h), { r: 0, g: 0, b: 255 }, 3);
  });
});

// ── OKLab ────────────────────────────────────────────────────────────────────

describe('rgbToOklab / oklabToRgb', () => {
  test('black → L≈0', () => {
    const { l } = rgbToOklab(0, 0, 0);
    near(l, 0, 0.01);
  });

  test('white → L≈1', () => {
    const { l } = rgbToOklab(255, 255, 255);
    near(l, 1, 0.01);
  });

  test('round trip white', () => {
    const { l, a, b } = rgbToOklab(255, 255, 255);
    nearRgb(oklabToRgb(l, a, b), { r: 255, g: 255, b: 255 }, 2);
  });

  test('round trip red', () => {
    const { l, a, b } = rgbToOklab(255, 0, 0);
    nearRgb(oklabToRgb(l, a, b), { r: 255, g: 0, b: 0 }, 2);
  });

  test('round trip arbitrary', () => {
    const { l, a, b } = rgbToOklab(72, 200, 130);
    nearRgb(oklabToRgb(l, a, b), { r: 72, g: 200, b: 130 }, 2);
  });
});

// ── OKLCh ────────────────────────────────────────────────────────────────────

describe('rgbToOklch / oklchToRgb', () => {
  test('black → c≈0', () => {
    const { c } = rgbToOklch(0, 0, 0);
    near(c, 0, 0.001);
  });

  test('white → c≈0', () => {
    const { c } = rgbToOklch(255, 255, 255);
    near(c, 0, 0.001);
  });

  test('round trip red', () => {
    const { l, c, h } = rgbToOklch(255, 0, 0);
    nearRgb(oklchToRgb(l, c, h), { r: 255, g: 0, b: 0 }, 2);
  });

  test('round trip green', () => {
    const { l, c, h } = rgbToOklch(0, 255, 0);
    nearRgb(oklchToRgb(l, c, h), { r: 0, g: 255, b: 0 }, 2);
  });

  test('round trip blue', () => {
    const { l, c, h } = rgbToOklch(0, 0, 255);
    nearRgb(oklchToRgb(l, c, h), { r: 0, g: 0, b: 255 }, 2);
  });

  test('h in [0,360)', () => {
    const { h } = rgbToOklch(200, 50, 100);
    assert.ok(h >= 0 && h < 360, `h=${h} should be in [0,360)`);
  });
});

// ── formatColor ───────────────────────────────────────────────────────────────

describe('formatColor', () => {
  const red = { r: 255, g: 0, b: 0 };

  test('hex format', () => {
    assert.equal(formatColor(red, 'hex'), '#ff0000');
  });

  test('rgb format', () => {
    assert.equal(formatColor(red, 'rgb'), 'rgb(255, 0, 0)');
  });

  test('hsl format contains "hsl("', () => {
    assert.ok(formatColor(red, 'hsl').startsWith('hsl('));
  });

  test('oklab format contains "oklab("', () => {
    assert.ok(formatColor(red, 'oklab').startsWith('oklab('));
  });

  test('oklch format contains "oklch("', () => {
    assert.ok(formatColor(red, 'oklch').startsWith('oklch('));
  });

  test('unknown format falls back to hex', () => {
    assert.equal(formatColor(red, 'unknown'), '#ff0000');
  });
});

// ── Utilities ─────────────────────────────────────────────────────────────────

describe('clamp', () => {
  test('below min', () => assert.equal(clamp(-5, 0, 255), 0));
  test('above max', () => assert.equal(clamp(300, 0, 255), 255));
  test('within range', () => assert.equal(clamp(100, 0, 255), 100));
});

describe('wrapHue', () => {
  test('0 stays 0', () => assert.equal(wrapHue(0), 0));
  test('360 → 0', () => assert.equal(wrapHue(360), 0));
  test('370 → 10', () => near(wrapHue(370), 10, 0.001));
  test('-30 → 330', () => near(wrapHue(-30), 330, 0.001));
});

describe('relativeLuminance', () => {
  test('black = 0', () => near(relativeLuminance(0, 0, 0), 0, 0.001));
  test('white ≈ 1', () => near(relativeLuminance(255, 255, 255), 1, 0.001));
});

describe('contrastRatio', () => {
  test('black vs white ≈ 21', () => {
    near(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21, 0.2);
  });

  test('same color = 1', () => {
    near(contrastRatio({ r: 128, g: 64, b: 200 }, { r: 128, g: 64, b: 200 }), 1, 0.001);
  });
});
