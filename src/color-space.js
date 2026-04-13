/**
 * color-space.js — Color space conversion utilities
 * Supports: RGB, HSL, HSV, LAB, LCh, OKLab, OKLCh
 */

// ── sRGB ↔ Linear ────────────────────────────────────────────────────────────

/** Convert sRGB component [0,1] to linear light */
export function sRGBToLinear(v) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** Convert linear light component [0,1] to sRGB */
export function linearToSRGB(v) {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

// ── HEX ↔ RGB ────────────────────────────────────────────────────────────────

/** Parse hex string "#rrggbb" or "#rgb" → {r,g,b} [0,255] or null */
export function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  const h = hex.replace(/^#/, '');
  if (h.length === 3 && /^[0-9a-fA-F]{3}$/.test(h)) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6 && /^[0-9a-fA-F]{6}$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

/** Convert r,g,b [0,255] → "#rrggbb" */
export function rgbToHex(r, g, b) {
  const toHex = (v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ── RGB ↔ HSL ────────────────────────────────────────────────────────────────

/** r,g,b [0,255] → {h [0,360), s [0,100], l [0,100]} */
export function rgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
    case gn: h = (bn - rn) / d + 2; break;
    default: h = (rn - gn) / d + 4; break;
  }
  return { h: (h / 6) * 360, s: s * 100, l: l * 100 };
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/** h [0,360), s [0,100], l [0,100] → {r,g,b} [0,255] */
export function hslToRgb(h, s, l) {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  };
}

// ── RGB ↔ HSV ────────────────────────────────────────────────────────────────

/** r,g,b [0,255] → {h [0,360), s [0,100], v [0,100]} */
export function rgbToHsv(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      default: h = (rn - gn) / d + 4; break;
    }
    h = (h / 6) * 360;
  }
  return { h, s: s * 100, v: v * 100 };
}

/** h [0,360), s [0,100], v [0,100] → {r,g,b} [0,255] */
export function hsvToRgb(h, s, v) {
  const sn = s / 100, vn = v / 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = vn * (1 - sn);
  const q = vn * (1 - f * sn);
  const t = vn * (1 - (1 - f) * sn);
  let r, g, b;
  switch (i) {
    case 0: [r, g, b] = [vn, t, p]; break;
    case 1: [r, g, b] = [q, vn, p]; break;
    case 2: [r, g, b] = [p, vn, t]; break;
    case 3: [r, g, b] = [p, q, vn]; break;
    case 4: [r, g, b] = [t, p, vn]; break;
    default: [r, g, b] = [vn, p, q]; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// ── RGB ↔ CIE LAB (D65) ──────────────────────────────────────────────────────

const D65 = { x: 0.95047, y: 1.00000, z: 1.08883 };

function linearRgbToXyz(r, g, b) {
  // sRGB D65 matrix
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  return { x, y, z };
}

function xyzToLinearRgb(x, y, z) {
  const r =  x * 3.2404542 - y * 1.5371385 - z * 0.4985314;
  const g = -x * 0.9692660 + y * 1.8760108 + z * 0.0415560;
  const b =  x * 0.0556434 - y * 0.2040259 + z * 1.0572252;
  return { r, g, b };
}

function labF(t) {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

function labFInv(t) {
  return t > 0.206897 ? t * t * t : (t - 16 / 116) / 7.787;
}

/** r,g,b [0,255] → {l [0,100], a [-128,128], b [-128,128]} */
export function rgbToLab(r, g, b) {
  const rLin = sRGBToLinear(r / 255);
  const gLin = sRGBToLinear(g / 255);
  const bLin = sRGBToLinear(b / 255);
  const { x, y, z } = linearRgbToXyz(rLin, gLin, bLin);
  const fx = labF(x / D65.x);
  const fy = labF(y / D65.y);
  const fz = labF(z / D65.z);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/** l [0,100], a [-128,128], b [-128,128] → {r,g,b} [0,255] */
export function labToRgb(l, a, b) {
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const x = labFInv(fx) * D65.x;
  const y = labFInv(fy) * D65.y;
  const z = labFInv(fz) * D65.z;
  const { r: rLin, g: gLin, b: bLin } = xyzToLinearRgb(x, y, z);
  return {
    r: Math.round(clamp(linearToSRGB(rLin), 0, 1) * 255),
    g: Math.round(clamp(linearToSRGB(gLin), 0, 1) * 255),
    b: Math.round(clamp(linearToSRGB(bLin), 0, 1) * 255),
  };
}

// ── LAB ↔ LCh ────────────────────────────────────────────────────────────────

/** l,a,b → {l, c [0,…], h [0,360)} */
export function labToLch(l, a, b) {
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  if (h < 0) h += 360;
  return { l, c, h };
}

/** l,c,h → {l, a, b} */
export function lchToLab(l, c, h) {
  const hr = h * (Math.PI / 180);
  return { l, a: c * Math.cos(hr), b: c * Math.sin(hr) };
}

/** r,g,b [0,255] → {l,c,h} (CIE LCh) */
export function rgbToLch(r, g, b) {
  const lab = rgbToLab(r, g, b);
  return labToLch(lab.l, lab.a, lab.b);
}

/** l,c,h (CIE LCh) → {r,g,b} [0,255] */
export function lchToRgb(l, c, h) {
  const { l: L, a, b } = lchToLab(l, c, h);
  return labToRgb(L, a, b);
}

// ── OKLab (Björn Ottosson) ───────────────────────────────────────────────────

// Linear sRGB → LMS
const M1 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

// LMS^(1/3) → OKLab
const M2 = [
  [0.2104542553,  0.7936177850, -0.0040720468],
  [1.9779984951, -2.4285922050,  0.4505937099],
  [0.0259040371,  0.7827717662, -0.8086757660],
];

// OKLab → LMS^(1/3) (inverse of M2)
const M2inv = [
  [1.0000000000,  0.3963377774,  0.2158037573],
  [1.0000000000, -0.1055613458, -0.0638541728],
  [1.0000000000, -0.0894841775, -1.2914855480],
];

// LMS^3 → Linear sRGB (inverse of M1)
const M1inv = [
  [ 4.0767416621, -3.3077115913,  0.2309699292],
  [-1.2684380046,  2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147,  1.7076147010],
];

function mat3x3(m, [a, b, c]) {
  return [
    m[0][0] * a + m[0][1] * b + m[0][2] * c,
    m[1][0] * a + m[1][1] * b + m[1][2] * c,
    m[2][0] * a + m[2][1] * b + m[2][2] * c,
  ];
}

/** r,g,b [0,255] → {l [0,1], a, b} (OKLab) */
export function rgbToOklab(r, g, b) {
  const rLin = sRGBToLinear(r / 255);
  const gLin = sRGBToLinear(g / 255);
  const bLin = sRGBToLinear(b / 255);
  const [l1, m1, s1] = mat3x3(M1, [rLin, gLin, bLin]);
  const lms = [Math.cbrt(l1), Math.cbrt(m1), Math.cbrt(s1)];
  const [L, A, B] = mat3x3(M2, lms);
  return { l: L, a: A, b: B };
}

/** l [0,1], a, b (OKLab) → {r,g,b} [0,255] */
export function oklabToRgb(l, a, b) {
  const [lc, mc, sc] = mat3x3(M2inv, [l, a, b]);
  const lms3 = [lc ** 3, mc ** 3, sc ** 3];
  const [rLin, gLin, bLin] = mat3x3(M1inv, lms3);
  return {
    r: Math.round(clamp(linearToSRGB(rLin), 0, 1) * 255),
    g: Math.round(clamp(linearToSRGB(gLin), 0, 1) * 255),
    b: Math.round(clamp(linearToSRGB(bLin), 0, 1) * 255),
  };
}

// ── OKLCh ────────────────────────────────────────────────────────────────────

/** r,g,b [0,255] → {l [0,1], c [0,…], h [0,360)} */
export function rgbToOklch(r, g, b) {
  const { l, a, b: bv } = rgbToOklab(r, g, b);
  const c = Math.sqrt(a * a + bv * bv);
  let h = Math.atan2(bv, a) * (180 / Math.PI);
  if (h < 0) h += 360;
  return { l, c, h };
}

/** l [0,1], c [0,…], h [0,360) → {r,g,b} [0,255] */
export function oklchToRgb(l, c, h) {
  const hr = h * (Math.PI / 180);
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  return oklabToRgb(l, a, b);
}

// ── Format output ────────────────────────────────────────────────────────────

function round(v, dp) {
  const f = Math.pow(10, dp);
  return Math.round(v * f) / f;
}

/**
 * Format a color object as CSS string
 * @param {{r,g,b}} rgb - base RGB [0,255]
 * @param {'hex'|'rgb'|'hsl'|'hsv'|'lab'|'lch'|'oklab'|'oklch'} format
 */
export function formatColor(rgb, format) {
  const { r, g, b } = rgb;
  switch (format) {
    case 'hex': return rgbToHex(r, g, b);
    case 'rgb': return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    case 'hsl': {
      const { h, s, l } = rgbToHsl(r, g, b);
      return `hsl(${round(h, 1)}, ${round(s, 1)}%, ${round(l, 1)}%)`;
    }
    case 'hsv': {
      const { h, s, v } = rgbToHsv(r, g, b);
      return `hsv(${round(h, 1)}, ${round(s, 1)}%, ${round(v, 1)}%)`;
    }
    case 'lab': {
      const { l, a, b: bv } = rgbToLab(r, g, b);
      return `lab(${round(l, 2)} ${round(a, 2)} ${round(bv, 2)})`;
    }
    case 'lch': {
      const { l, c, h } = rgbToLch(r, g, b);
      return `lch(${round(l, 2)} ${round(c, 2)} ${round(h, 2)})`;
    }
    case 'oklab': {
      const { l, a, b: bv } = rgbToOklab(r, g, b);
      return `oklab(${round(l, 4)} ${round(a, 4)} ${round(bv, 4)})`;
    }
    case 'oklch': {
      const { l, c, h } = rgbToOklch(r, g, b);
      return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`;
    }
    default: return rgbToHex(r, g, b);
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/** Wrap hue to [0, 360) */
export function wrapHue(h) {
  return ((h % 360) + 360) % 360;
}

/** Relative luminance (WCAG) from r,g,b [0,255] */
export function relativeLuminance(r, g, b) {
  return 0.2126 * sRGBToLinear(r / 255)
       + 0.7152 * sRGBToLinear(g / 255)
       + 0.0722 * sRGBToLinear(b / 255);
}

/** WCAG contrast ratio */
export function contrastRatio(rgb1, rgb2) {
  const L1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const L2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
