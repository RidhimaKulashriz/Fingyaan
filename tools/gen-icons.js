const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  try {
    const src = path.resolve(__dirname, '..', 'assets', 'images', 'logo.png');
    const outDir = path.resolve(__dirname, '..', 'assets', 'images');
    if (!fs.existsSync(src)) {
      console.error('Source logo not found at', src);
      process.exit(1);
    }
    const targets = [32, 192, 512];
    await Promise.all(targets.map(async (size) => {
      const buf = await sharp(src).resize(size, size, { fit: 'cover' }).png().toBuffer();
      const out = path.join(outDir, `logo-${size}.png`);
      fs.writeFileSync(out, buf);
      console.log('Wrote', out);
    }));
    console.log('Icon generation complete.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
