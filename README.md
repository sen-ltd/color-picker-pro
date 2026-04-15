# Color Picker Pro

Advanced color picker with RGB, HSL, HSV, LAB, LCh, and OKLCh color spaces. Zero dependencies, no build step, vanilla JS.

**Live Demo**: https://sen.ltd/portfolio/color-picker-pro/

## Features

- **6 color spaces**: RGB, HSL, HSV, LAB, LCh, OKLCh — all synced in real time
- **8 format outputs**: hex, rgb(), hsl(), hsv(), lab(), lch(), oklab(), oklch() with one-click copy
- **Color harmony generator**: complementary, triadic, analogous, split-complementary, tetradic, monochromatic
- **Eyedropper** (EyeDropper API — Chrome/Edge)
- **WCAG contrast checker** against white and black (AA / AAA)
- **Color blindness preview**: protanopia, deuteranopia, tritanopia, achromatopsia
- **Recent colors** (localStorage, up to 16)
- **Japanese / English UI**
- **Dark / light theme**

## Color Spaces

| Space | Description |
|-------|-------------|
| RGB | Red / Green / Blue, 0–255 |
| HSL | Hue / Saturation / Lightness |
| HSV | Hue / Saturation / Value |
| LAB | CIE L\*a\*b\* (D65) — perceptually uniform |
| LCh | CIE L\*C\*h° — polar form of LAB |
| OKLCh | Björn Ottosson's perceptual polar space (2020) |

## Getting Started

```bash
# Serve locally (no build needed)
npm run serve
# → http://localhost:8080
```

## Running Tests

```bash
npm test
```

97 tests across color conversion round-trips, harmony generation, edge cases (black, white, gray, hue wrapping).

## Project Structure

```
color-picker-pro/
├── index.html          # Single-page app
├── style.css           # CSS custom properties, dark/light themes
├── src/
│   ├── main.js         # DOM, events, rendering
│   ├── color-space.js  # All color space conversions
│   ├── harmony.js      # Harmony color generation
│   └── i18n.js         # ja/en translations
└── tests/
    ├── color-space.test.js
    └── harmony.test.js
```

## License

MIT © 2026 SEN LLC (SEN 合同会社)

<!-- sen-publish:links -->
## Links

- 🌐 Demo: https://sen.ltd/portfolio/color-picker-pro/
- 📝 dev.to: https://dev.to/sendotltd/an-advanced-color-picker-with-oklch-lch-lab-and-color-harmony-4h1j
<!-- /sen-publish:links -->
