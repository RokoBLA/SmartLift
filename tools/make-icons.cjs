// Pravi PNG ikone (192, 512, 180, maskable) iz istog crteža kao icons/icon.svg. Pokretanje: node tools/make-icons.cjs
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
function chunk(type, data) {
  const t = Buffer.from(type), len = Buffer.alloc(4), c = Buffer.alloc(4);
  len.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, c]);
}
function png(size, pix) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; pix.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// Crtež u koordinatama 512 × 512 (isto kao u SVG-u).
const BG = [217, 98, 43], FG = [245, 241, 234];
const bars = [[96, 196, 40, 120, 12], [144, 162, 48, 188, 14], [192, 238, 128, 36, 8], [320, 162, 48, 188, 14], [376, 196, 40, 120, 12]];
const inRR = (x, y, [bx, by, bw, bh, r]) => {
  if (x < bx || x > bx + bw || y < by || y > by + bh) return false;
  const cx = Math.min(Math.max(x, bx + r), bx + bw - r), cy = Math.min(Math.max(y, by + r), by + bh - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};

function render(size, { maskable }) {
  const pix = Buffer.alloc(size * size * 4), S = 3;
  const scale = maskable ? 0.72 : 1;       // maskable: crtež u sigurnom središnjem dijelu
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    let bg = 0, fg = 0;
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const u = ((px + (sx + .5) / S) / size) * 512, v = ((py + (sy + .5) / S) / size) * 512;
      if (maskable || inRR(u, v, [0, 0, 512, 512, 112])) bg++;
      const gu = (u - 256) / scale + 256, gv = (v - 256) / scale + 256;
      if (bars.some((b) => inRR(gu, gv, b))) fg++;
    }
    const i = (py * size + px) * 4, n = S * S, a = bg / n, f = fg / n;
    for (let k = 0; k < 3; k++) pix[i + k] = Math.round(BG[k] * (1 - f) + FG[k] * f);
    pix[i + 3] = Math.round(255 * a);
  }
  return png(size, pix);
}

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon-192.png'), render(192, {}));
fs.writeFileSync(path.join(out, 'icon-512.png'), render(512, {}));
fs.writeFileSync(path.join(out, 'icon-180.png'), render(180, { maskable: true }));
fs.writeFileSync(path.join(out, 'icon-maskable-512.png'), render(512, { maskable: true }));
console.log('Ikone napravljene.');
