/**
 * main.js — Color Picker Pro DOM & events
 */

import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb,
  rgbToLab, labToRgb, rgbToLch, lchToRgb, rgbToOklab, rgbToOklch, oklchToRgb,
  formatColor, contrastRatio, clamp, wrapHue,
} from './color-space.js';

import {
  complementary, triadic, analogous, splitComplementary, tetradic, monochromatic,
} from './harmony.js';

import { translations, getLang, t } from './i18n.js';

// ── State ─────────────────────────────────────────────────────────────────────

let state = {
  rgb: { r: 255, g: 100, b: 50 },
  space: 'hsl',
  harmony: 'complementary',
  lang: 'en',
  theme: 'dark',
  recentColors: [],
};

const MAX_RECENT = 16;
const RECENT_KEY = 'cppRecent';
const THEME_KEY = 'cppTheme';
const LANG_KEY = 'cppLang';

// ── Helpers ───────────────────────────────────────────────────────────────────

function tr(key) {
  return t(state.lang, key);
}

function loadState() {
  state.lang = getLang();
  state.theme = localStorage.getItem(THEME_KEY) || 'dark';
  try {
    state.recentColors = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    state.recentColors = [];
  }
}

function saveRecent() {
  localStorage.setItem(RECENT_KEY, JSON.stringify(state.recentColors));
}

function addRecent(hex) {
  state.recentColors = [hex, ...state.recentColors.filter((c) => c !== hex)].slice(0, MAX_RECENT);
  saveRecent();
  renderRecent();
}

// ── Color blindness simulation ────────────────────────────────────────────────

// Simplified Brettel matrices (sRGB space approximation)
const CB_MATRICES = {
  protanopia: [
    0.567, 0.433, 0,
    0.558, 0.442, 0,
    0,     0.242, 0.758,
  ],
  deuteranopia: [
    0.625, 0.375, 0,
    0.700, 0.300, 0,
    0,     0.300, 0.700,
  ],
  tritanopia: [
    0.950, 0.050, 0,
    0,     0.433, 0.567,
    0,     0.475, 0.525,
  ],
  achromatopsia: [
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
  ],
};

function simulateColorBlindness(r, g, b, type) {
  if (type === 'normal') return { r, g, b };
  const m = CB_MATRICES[type];
  return {
    r: clamp(Math.round(m[0] * r + m[1] * g + m[2] * b), 0, 255),
    g: clamp(Math.round(m[3] * r + m[4] * g + m[5] * b), 0, 255),
    b: clamp(Math.round(m[6] * r + m[7] * g + m[8] * b), 0, 255),
  };
}

// ── DOM shortcuts ─────────────────────────────────────────────────────────────

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const { r, g, b } = state.rgb;

  // Preview
  const hex = rgbToHex(r, g, b);
  $('#preview-swatch').style.background = hex;
  $('#preview-hex').textContent = hex.toUpperCase();

  // Sliders for current space
  renderSpaceSliders();

  // Formats
  renderFormats();

  // Harmony
  renderHarmony();

  // Contrast
  renderContrast();

  // Color blindness
  renderColorBlindness();
}

function renderSpaceSliders() {
  const { r, g, b } = state.rgb;
  const container = $('#slider-container');
  if (!container) return;

  container.innerHTML = '';

  const addSlider = (label, id, min, max, value, step = 1, gradient = '') => {
    const wrapper = document.createElement('div');
    wrapper.className = 'slider-row';
    wrapper.innerHTML = `
      <label for="sl-${id}">${label}</label>
      <div class="slider-track-wrap">
        <input type="range" id="sl-${id}" min="${min}" max="${max}"
               step="${step}" value="${value}" data-axis="${id}">
        <span class="slider-val">${typeof value === 'number' ? Math.round(value * 100) / 100 : value}</span>
      </div>`;
    if (gradient) {
      wrapper.querySelector('input').style.setProperty('--track-bg', gradient);
    }
    wrapper.querySelector('input').addEventListener('input', onSliderInput);
    container.appendChild(wrapper);
  };

  switch (state.space) {
    case 'rgb': {
      addSlider(tr('sliders.red'),   'r', 0, 255, r, 1, `linear-gradient(to right,#000,#f00)`);
      addSlider(tr('sliders.green'), 'g', 0, 255, g, 1, `linear-gradient(to right,#000,#0f0)`);
      addSlider(tr('sliders.blue'),  'b', 0, 255, b, 1, `linear-gradient(to right,#000,#00f)`);
      break;
    }
    case 'hsl': {
      const hsl = rgbToHsl(r, g, b);
      addSlider(tr('sliders.hue'),        'hsl-h', 0, 359, hsl.h, 1,
        'linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))');
      addSlider(tr('sliders.saturation'), 'hsl-s', 0, 100, hsl.s, 0.1);
      addSlider(tr('sliders.lightness'),  'hsl-l', 0, 100, hsl.l, 0.1);
      break;
    }
    case 'hsv': {
      const hsv = rgbToHsv(r, g, b);
      addSlider(tr('sliders.hue'),        'hsv-h', 0, 359, hsv.h, 1,
        'linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))');
      addSlider(tr('sliders.saturation'), 'hsv-s', 0, 100, hsv.s, 0.1);
      addSlider(tr('sliders.value'),      'hsv-v', 0, 100, hsv.v, 0.1);
      break;
    }
    case 'lab': {
      const lab = rgbToLab(r, g, b);
      addSlider(tr('sliders.lStar'), 'lab-l', 0,    100, lab.l, 0.1);
      addSlider(tr('sliders.aStar'), 'lab-a', -128, 128, lab.a, 0.1);
      addSlider(tr('sliders.bStar'), 'lab-b', -128, 128, lab.b, 0.1);
      break;
    }
    case 'lch': {
      const lch = rgbToLch(r, g, b);
      addSlider(tr('sliders.lStar'),   'lch-l', 0,   100, lch.l, 0.1);
      addSlider(tr('sliders.chroma'),  'lch-c', 0,   150, lch.c, 0.1);
      addSlider(tr('sliders.hue'),     'lch-h', 0,   359, lch.h, 0.1);
      break;
    }
    case 'oklch': {
      const oklch = rgbToOklch(r, g, b);
      addSlider(tr('sliders.oklchL'), 'oklch-l', 0,   1,   oklch.l, 0.001);
      addSlider(tr('sliders.oklchC'), 'oklch-c', 0,   0.4, oklch.c, 0.001);
      addSlider(tr('sliders.hue'),    'oklch-h', 0,   359, oklch.h, 0.1);
      break;
    }
  }
}

function onSliderInput(e) {
  const axis = e.target.dataset.axis;
  const val = parseFloat(e.target.value);
  // Update value display
  e.target.nextElementSibling.textContent = Math.round(val * 1000) / 1000;

  const { r, g, b } = state.rgb;

  switch (state.space) {
    case 'rgb': {
      const cur = { r, g, b };
      cur[axis] = val;
      state.rgb = cur;
      break;
    }
    case 'hsl': {
      const cur = rgbToHsl(r, g, b);
      if (axis === 'hsl-h') cur.h = val;
      if (axis === 'hsl-s') cur.s = val;
      if (axis === 'hsl-l') cur.l = val;
      state.rgb = hslToRgb(cur.h, cur.s, cur.l);
      break;
    }
    case 'hsv': {
      const cur = rgbToHsv(r, g, b);
      if (axis === 'hsv-h') cur.h = val;
      if (axis === 'hsv-s') cur.s = val;
      if (axis === 'hsv-v') cur.v = val;
      state.rgb = hsvToRgb(cur.h, cur.s, cur.v);
      break;
    }
    case 'lab': {
      const cur = rgbToLab(r, g, b);
      if (axis === 'lab-l') cur.l = val;
      if (axis === 'lab-a') cur.a = val;
      if (axis === 'lab-b') cur.b = val;
      state.rgb = labToRgb(cur.l, cur.a, cur.b);
      break;
    }
    case 'lch': {
      const cur = rgbToLch(r, g, b);
      if (axis === 'lch-l') cur.l = val;
      if (axis === 'lch-c') cur.c = val;
      if (axis === 'lch-h') cur.h = val;
      state.rgb = lchToRgb(cur.l, cur.c, cur.h);
      break;
    }
    case 'oklch': {
      const cur = rgbToOklch(r, g, b);
      if (axis === 'oklch-l') cur.l = val;
      if (axis === 'oklch-c') cur.c = val;
      if (axis === 'oklch-h') cur.h = val;
      state.rgb = oklchToRgb(cur.l, cur.c, cur.h);
      break;
    }
  }

  // Update hex input without full re-render (to avoid slider refocus)
  const hex = rgbToHex(state.rgb.r, state.rgb.g, state.rgb.b);
  $('#preview-swatch').style.background = hex;
  $('#preview-hex').textContent = hex.toUpperCase();
  const hexInput = $('#hex-input');
  if (hexInput && document.activeElement !== hexInput) hexInput.value = hex;

  renderFormats();
  renderHarmony();
  renderContrast();
  renderColorBlindness();
}

function renderFormats() {
  const formats = ['hex', 'rgb', 'hsl', 'hsv', 'lab', 'lch', 'oklab', 'oklch'];
  const list = $('#formats-list');
  if (!list) return;
  list.innerHTML = '';
  for (const fmt of formats) {
    const str = formatColor(state.rgb, fmt);
    const li = document.createElement('li');
    li.className = 'format-item';
    li.innerHTML = `
      <span class="format-label">${fmt}</span>
      <code class="format-value">${str}</code>
      <button class="btn-copy" data-value="${str}">${tr('copy')}</button>`;
    li.querySelector('.btn-copy').addEventListener('click', onCopy);
    list.appendChild(li);
  }
}

function onCopy(e) {
  const val = e.currentTarget.dataset.value;
  navigator.clipboard.writeText(val).then(() => {
    const btn = e.currentTarget;
    const orig = btn.textContent;
    btn.textContent = tr('copied');
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 1500);
  });
}

function renderHarmony() {
  const { r, g, b } = state.rgb;
  const hsl = rgbToHsl(r, g, b);
  let colors;
  switch (state.harmony) {
    case 'complementary':     colors = complementary(hsl); break;
    case 'triadic':           colors = triadic(hsl); break;
    case 'analogous':         colors = analogous(hsl); break;
    case 'splitComplementary':colors = splitComplementary(hsl); break;
    case 'tetradic':          colors = tetradic(hsl); break;
    case 'monochromatic':     colors = monochromatic(hsl); break;
    default:                  colors = complementary(hsl);
  }
  const swatches = $('#harmony-swatches');
  if (!swatches) return;
  swatches.innerHTML = '';
  for (const c of colors) {
    const { r: cr, g: cg, b: cb } = hslToRgb(c.h, c.s, c.l);
    const hex = rgbToHex(cr, cg, cb);
    const sw = document.createElement('div');
    sw.className = 'harmony-swatch';
    sw.style.background = hex;
    sw.title = hex;
    sw.addEventListener('click', () => {
      state.rgb = { r: cr, g: cg, b: cb };
      addRecent(hex);
      render();
    });
    swatches.appendChild(sw);
  }
}

function renderContrast() {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const ratioW = contrastRatio(state.rgb, white);
  const ratioB = contrastRatio(state.rgb, black);

  const fmt = (v) => v.toFixed(2) + ':1';
  const pass = (v, level) => v >= (level === 'AA' ? 4.5 : 7);

  const container = $('#contrast-results');
  if (!container) return;
  container.innerHTML = `
    <div class="contrast-row">
      <span class="contrast-label">${tr('contrastVsWhite')}</span>
      <span class="contrast-value">${fmt(ratioW)}</span>
      <span class="wcag-badge ${pass(ratioW,'AA') ? 'pass' : 'fail'}">${tr('wcagAA')} ${pass(ratioW,'AA') ? tr('pass') : tr('fail')}</span>
      <span class="wcag-badge ${pass(ratioW,'AAA') ? 'pass' : 'fail'}">${tr('wcagAAA')} ${pass(ratioW,'AAA') ? tr('pass') : tr('fail')}</span>
    </div>
    <div class="contrast-row">
      <span class="contrast-label">${tr('contrastVsBlack')}</span>
      <span class="contrast-value">${fmt(ratioB)}</span>
      <span class="wcag-badge ${pass(ratioB,'AA') ? 'pass' : 'fail'}">${tr('wcagAA')} ${pass(ratioB,'AA') ? tr('pass') : tr('fail')}</span>
      <span class="wcag-badge ${pass(ratioB,'AAA') ? 'pass' : 'fail'}">${tr('wcagAAA')} ${pass(ratioB,'AAA') ? tr('pass') : tr('fail')}</span>
    </div>`;
}

function renderColorBlindness() {
  const types = ['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  const container = $('#cb-swatches');
  if (!container) return;
  container.innerHTML = '';
  const { r, g, b } = state.rgb;
  for (const type of types) {
    const sim = simulateColorBlindness(r, g, b, type);
    const hex = rgbToHex(sim.r, sim.g, sim.b);
    const item = document.createElement('div');
    item.className = 'cb-item';
    item.innerHTML = `
      <div class="cb-swatch" style="background:${hex}"></div>
      <span class="cb-label">${tr(type === 'normal' ? 'normal' : type)}</span>`;
    container.appendChild(item);
  }
}

function renderRecent() {
  const container = $('#recent-colors');
  if (!container) return;
  container.innerHTML = '';
  for (const hex of state.recentColors) {
    const swatch = document.createElement('button');
    swatch.className = 'recent-swatch';
    swatch.style.background = hex;
    swatch.title = hex;
    swatch.addEventListener('click', () => {
      const parsed = hexToRgb(hex);
      if (parsed) {
        state.rgb = parsed;
        render();
      }
    });
    container.appendChild(swatch);
  }
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const btn = $('#btn-theme');
  if (btn) btn.textContent = state.theme === 'dark' ? tr('theme.light') : tr('theme.dark');
}

function applyLang() {
  document.documentElement.lang = state.lang;
  const btn = $('#btn-lang');
  if (btn) btn.textContent = state.lang === 'en' ? tr('lang.ja') : tr('lang.en');
  // Update all [data-i18n] elements
  $$('[data-i18n]').forEach((el) => {
    el.textContent = tr(el.dataset.i18n);
  });
}

// ── Event listeners ───────────────────────────────────────────────────────────

function setupEvents() {
  // Hex input
  const hexInput = $('#hex-input');
  if (hexInput) {
    hexInput.value = rgbToHex(state.rgb.r, state.rgb.g, state.rgb.b);
    hexInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const parsed = hexToRgb(val.startsWith('#') ? val : '#' + val);
      if (parsed) {
        state.rgb = parsed;
        addRecent(rgbToHex(parsed.r, parsed.g, parsed.b));
        render();
      }
    });
    hexInput.addEventListener('blur', () => {
      hexInput.value = rgbToHex(state.rgb.r, state.rgb.g, state.rgb.b);
    });
  }

  // Native color picker input
  const nativePicker = $('#native-picker');
  if (nativePicker) {
    nativePicker.value = rgbToHex(state.rgb.r, state.rgb.g, state.rgb.b);
    nativePicker.addEventListener('input', (e) => {
      const parsed = hexToRgb(e.target.value);
      if (parsed) {
        state.rgb = parsed;
        const hex = rgbToHex(parsed.r, parsed.g, parsed.b);
        addRecent(hex);
        if (hexInput) hexInput.value = hex;
        render();
      }
    });
  }

  // Color space tabs
  $$('[data-space]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.space = btn.dataset.space;
      $$('[data-space]').forEach((b) => b.classList.toggle('active', b === btn));
      renderSpaceSliders();
    });
  });

  // Harmony type
  const harmonySelect = $('#harmony-select');
  if (harmonySelect) {
    harmonySelect.addEventListener('change', (e) => {
      state.harmony = e.target.value;
      renderHarmony();
    });
  }

  // EyeDropper
  const eyeBtn = $('#btn-eyedropper');
  if (eyeBtn) {
    if (!window.EyeDropper) {
      eyeBtn.disabled = true;
      eyeBtn.title = tr('eyedropperUnsupported');
    } else {
      eyeBtn.addEventListener('click', async () => {
        try {
          const dropper = new EyeDropper();
          const result = await dropper.open();
          const parsed = hexToRgb(result.sRGBHex);
          if (parsed) {
            state.rgb = parsed;
            addRecent(result.sRGBHex);
            if (hexInput) hexInput.value = result.sRGBHex;
            if (nativePicker) nativePicker.value = result.sRGBHex;
            render();
          }
        } catch {
          // user cancelled
        }
      });
    }
  }

  // Theme toggle
  const themeBtn = $('#btn-theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, state.theme);
      applyTheme();
    });
  }

  // Lang toggle
  const langBtn = $('#btn-lang');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      state.lang = state.lang === 'en' ? 'ja' : 'en';
      localStorage.setItem(LANG_KEY, state.lang);
      applyLang();
      render();
    });
  }

  // Clear recent
  const clearBtn = $('#btn-clear-recent');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.recentColors = [];
      saveRecent();
      renderRecent();
    });
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  loadState();
  applyTheme();
  applyLang();
  setupEvents();
  // Set first space tab active
  const firstTab = $(`[data-space="${state.space}"]`);
  if (firstTab) firstTab.classList.add('active');
  renderRecent();
  render();
}

document.addEventListener('DOMContentLoaded', init);
