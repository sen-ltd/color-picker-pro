/**
 * harmony.js — Color harmony generation
 * All functions accept/return {h, s, l} with h∈[0,360), s∈[0,100], l∈[0,100]
 */

import { wrapHue } from './color-space.js';

/** Shift hue by `deg`, preserving s and l */
function shift(hsl, deg) {
  return { h: wrapHue(hsl.h + deg), s: hsl.s, l: hsl.l };
}

/** Complementary: original + opposite */
export function complementary(hsl) {
  return [hsl, shift(hsl, 180)];
}

/** Triadic: 3 colors 120° apart */
export function triadic(hsl) {
  return [hsl, shift(hsl, 120), shift(hsl, 240)];
}

/**
 * Analogous: N colors clustered ±30° around original
 * @param {object} hsl
 * @param {number} count - total colors (default 5)
 * @param {number} spread - total arc in degrees (default 60)
 */
export function analogous(hsl, count = 5, spread = 60) {
  const step = spread / (count - 1);
  const start = -spread / 2;
  return Array.from({ length: count }, (_, i) => shift(hsl, start + i * step));
}

/** Split-complementary: original + two colors flanking the complement */
export function splitComplementary(hsl) {
  return [hsl, shift(hsl, 150), shift(hsl, 210)];
}

/** Tetradic (square): 4 colors 90° apart */
export function tetradic(hsl) {
  return [hsl, shift(hsl, 90), shift(hsl, 180), shift(hsl, 270)];
}

/**
 * Monochromatic: same hue, varying lightness
 * @param {object} hsl
 * @param {number} count - number of swatches (default 5)
 */
export function monochromatic(hsl, count = 5) {
  // Distribute lightness evenly between 15 and 85
  const step = 70 / (count - 1);
  return Array.from({ length: count }, (_, i) => ({
    h: hsl.h,
    s: hsl.s,
    l: 15 + i * step,
  }));
}
