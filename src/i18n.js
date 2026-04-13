/**
 * i18n.js — Japanese/English UI strings
 */

export const translations = {
  en: {
    title: 'Color Picker Pro',
    subtitle: 'Advanced color picker with multiple color spaces',
    colorSpace: 'Color Space',
    formats: 'Color Formats',
    harmony: 'Color Harmony',
    recentColors: 'Recent Colors',
    eyedropper: 'Pick from screen',
    eyedropperUnsupported: 'EyeDropper not supported in this browser',
    copy: 'Copy',
    copied: 'Copied!',
    contrastChecker: 'Contrast',
    contrastVsWhite: 'vs White',
    contrastVsBlack: 'vs Black',
    wcagAA: 'AA',
    wcagAAA: 'AAA',
    pass: 'Pass',
    fail: 'Fail',
    colorBlindness: 'Color Blindness',
    normal: 'Normal',
    protanopia: 'Protanopia',
    deuteranopia: 'Deuteranopia',
    tritanopia: 'Tritanopia',
    achromatopsia: 'Achromatopsia',
    harmonyTypes: {
      complementary: 'Complementary',
      triadic: 'Triadic',
      analogous: 'Analogous',
      splitComplementary: 'Split-Complementary',
      tetradic: 'Tetradic',
      monochromatic: 'Monochromatic',
    },
    sliders: {
      hue: 'Hue',
      saturation: 'Saturation',
      lightness: 'Lightness',
      value: 'Value',
      red: 'Red',
      green: 'Green',
      blue: 'Blue',
      alpha: 'Alpha',
      lStar: 'Lightness (L*)',
      aStar: 'a* (green–red)',
      bStar: 'b* (blue–yellow)',
      chroma: 'Chroma',
      oklchL: 'Lightness',
      oklchC: 'Chroma',
      oklchH: 'Hue',
    },
    theme: { light: 'Light', dark: 'Dark' },
    lang: { en: 'EN', ja: 'JA' },
    clearRecent: 'Clear',
  },
  ja: {
    title: 'カラーピッカー Pro',
    subtitle: '複数カラースペース対応の高度カラーピッカー',
    colorSpace: 'カラースペース',
    formats: 'カラーフォーマット',
    harmony: 'カラーハーモニー',
    recentColors: '最近使った色',
    eyedropper: '画面から色を取得',
    eyedropperUnsupported: 'このブラウザではスポイト非対応',
    copy: 'コピー',
    copied: 'コピー済み!',
    contrastChecker: 'コントラスト',
    contrastVsWhite: '白との比較',
    contrastVsBlack: '黒との比較',
    wcagAA: 'AA',
    wcagAAA: 'AAA',
    pass: '合格',
    fail: '不合格',
    colorBlindness: '色覚シミュレーション',
    normal: '通常',
    protanopia: '第1色盲',
    deuteranopia: '第2色盲',
    tritanopia: '第3色盲',
    achromatopsia: '全色盲',
    harmonyTypes: {
      complementary: '補色',
      triadic: 'トライアド',
      analogous: '類似色',
      splitComplementary: 'スプリット補色',
      tetradic: 'テトラッド',
      monochromatic: 'モノクロマティック',
    },
    sliders: {
      hue: '色相',
      saturation: '彩度',
      lightness: '明度',
      value: '明度 (V)',
      red: '赤',
      green: '緑',
      blue: '青',
      alpha: '透明度',
      lStar: '明度 (L*)',
      aStar: 'a* (緑–赤)',
      bStar: 'b* (青–黄)',
      chroma: 'クロマ',
      oklchL: '明度',
      oklchC: 'クロマ',
      oklchH: '色相',
    },
    theme: { light: 'ライト', dark: 'ダーク' },
    lang: { en: 'EN', ja: 'JA' },
    clearRecent: 'クリア',
  },
};

export function getLang() {
  const stored = localStorage.getItem('cppLang');
  if (stored === 'en' || stored === 'ja') return stored;
  return navigator.language.startsWith('ja') ? 'ja' : 'en';
}

export function t(lang, key) {
  const keys = key.split('.');
  let obj = translations[lang];
  for (const k of keys) {
    if (obj == null) return key;
    obj = obj[k];
  }
  return obj ?? key;
}
