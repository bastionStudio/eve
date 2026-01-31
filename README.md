# Eve
A Web-Based Operating System That Actually Respects Your Privacy.

## Development / Optimization ✅
- Build CSS: `npm run build:css` (requires `postcss-cli` + `cssnano`).
- Lint CSS: `npm run lint:css` (requires `stylelint`).
- Format: `npm run format` (requires `prettier`).

Notes:
- The stylesheet is now loaded with `rel="preload"` in `bootloader.html` to avoid render-blocking and improve load responsiveness.
- A utility class `.allow-selection` is available in `global/globalStyles.css` to opt-in to text selection per-element when needed.
