// Renders the X-Code logo (hexagonal knot on a dark tile) to build/icon.png
// using an offscreen Electron window — no extra image dependencies needed.
// The tile's corners are made transparent via a magenta chroma-key on the raw bitmap.
const { app, BrowserWindow, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const SIZE = 512;

const html = `<!doctype html>
<html><head><style>
  html, body { margin: 0; padding: 0; width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; background: #ff00ff; }
</style></head>
<body>
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="116" fill="#0d0d0d"/>
  <g transform="translate(256 256) scale(17.2) translate(-12 -12)"
     fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linejoin="round">
    ${[0, 60, 120, 180, 240, 300]
      .map((a) => `<rect x="9.15" y="1.7" width="5.7" height="13.1" rx="2.85" transform="rotate(${a} 12 12)"/>`)
      .join('\n    ')}
  </g>
</svg>
</body></html>`;

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    show: false,
    frame: false,
    backgroundColor: '#ff00ff',
    webPreferences: { offscreen: true },
  });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await new Promise((r) => setTimeout(r, 400));

  const captured = await win.webContents.capturePage();
  const { width, height } = captured.getSize();
  const bmp = captured.toBitmap(); // BGRA
  // chroma-key: pure magenta background -> fully transparent, halo -> partial
  for (let i = 0; i < bmp.length; i += 4) {
    const r = bmp[i + 2], g = bmp[i + 1], b = bmp[i];
    if (r > 200 && b > 200 && g < 90) {
      bmp[i + 3] = 0;
    } else if (r > 130 && b > 130 && g < 130 && r > g + 40 && b > g + 40) {
      bmp[i + 3] = Math.max(0, 255 - Math.round((r - g) * 2.4));
    }
  }
  const keyed = nativeImage.createFromBitmap(bmp, { width, height });
  const png = keyed.toPNG();

  const out = path.join(__dirname, '..', 'build', 'icon.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, png);
  console.log('icon written:', out, png.length, 'bytes', `${width}x${height}`);
  app.exit(0);
});
