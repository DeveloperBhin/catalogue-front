# Assets Management Guide

## Asset Structure

The project has the following asset directories set up:

```
src/assets/
├── images/          # Images from Figma
├── icons/           # Icon assets (SVG, PNG)
└── fonts/           # Custom fonts from Figma
```

## Adding Assets from Figma

### Images

1. Export images from Figma at appropriate resolutions:
   - @1x for standard displays
   - @2x for retina displays
   - @3x for high-DPI displays

2. Optimize images:
   - Use tools like ImageOptim, TinyPNG, or Squoosh
   - Convert to WebP format where possible for better compression
   - Maintain original formats (PNG/JPG) as fallbacks

3. Place optimized images in `src/assets/images/`

### Icons

1. Export icons as SVG from Figma (preferred) or PNG
2. For SVG icons, place in `src/assets/icons/`
3. Consider creating an icon component or sprite sheet for better performance

### Fonts

1. Export custom fonts from Figma
2. Place font files in `src/assets/fonts/`
3. Update `src/styles/styles.scss` to include font-face declarations:

```scss
@font-face {
  font-family: 'YourFontName';
  src: url('../assets/fonts/YourFontName.woff2') format('woff2'),
       url('../assets/fonts/YourFontName.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}
```

4. Update `tailwind.config.js` to use the custom font:

```js
fontFamily: {
  sans: ['YourFontName', 'system-ui', 'sans-serif'],
}
```

## Using Assets in Components

### Images

```html
<img src="assets/images/hero-image.jpg" alt="Hero image">
```

### Icons

For SVG icons, you can:
- Use inline SVG
- Create an icon component
- Use an icon library like Heroicons

### Fonts

Fonts are automatically available once added to the styles and Tailwind config.

## Figma Export Tips

1. **Select the right format:**
   - Use PNG for photos or complex graphics
   - Use SVG for icons and simple graphics
   - Use JPG for photos (smaller file size)

2. **Export settings:**
   - For images: Export at 2x or 3x for retina displays
   - For icons: Export as SVG when possible
   - Use "Export for Web" option in Figma

3. **Naming convention:**
   - Use kebab-case: `hero-image.jpg`
   - Be descriptive: `button-primary-hover.svg`
   - Include size if multiple: `logo-32px.png`, `logo-64px.png`
