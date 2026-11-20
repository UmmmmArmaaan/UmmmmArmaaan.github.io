// Generate placeholder face images using pure PNG encoding
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PNG_WIDTH = 512;
const PNG_HEIGHT = 512;

// CRC32 lookup table
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0);
  }
  CRC32_TABLE[i] = c;
}

function crc32(data) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    c = CRC32_TABLE[(c ^ data[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const content = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(content), 0);
  return Buffer.concat([len, content, crc]);
}

function createRGBAImage(faceColor) {
  // Create a simple face-like pattern
  const rawData = Buffer.alloc(PNG_WIDTH * PNG_HEIGHT * 4);

  for (let y = 0; y < PNG_HEIGHT; y++) {
    for (let x = 0; x < PNG_WIDTH; x++) {
      const idx = (y * PNG_WIDTH + x) * 4;

      // Face shape (circle)
      const dx = (x - PNG_WIDTH/2) / (PNG_WIDTH/2);
      const dy = (y - PNG_HEIGHT/3) / (PNG_HEIGHT/2);
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist > 0.85) {
        // Background - light gray
        rawData[idx] = 220;     // R
        rawData[idx + 1] = 220; // G
        rawData[idx + 2] = 220; // B
        rawData[idx + 3] = 255; // A
      } else {
        // Skin tone with variations
        const [r, g, b] = faceColor;

        // Hair (dark area at top)
        if (dy < -0.2) {
          rawData[idx] = 50;
          rawData[idx + 1] = 50;
          rawData[idx + 2] = 50;
          rawData[idx + 3] = 255;
        }
        // Eyes - white
        else if (Math.abs(dy + 0.15) < 0.05 && Math.abs(dx) < 0.08) {
          rawData[idx] = 250;
          rawData[idx + 1] = 250;
          rawData[idx + 2] = 250;
          rawData[idx + 3] = 255;
        }
        // Nose
        else if (dy > 0.1 && dy < 0.25 && Math.abs(dx) < 0.03) {
          rawData[idx] = Math.min(255, r + 30);
          rawData[idx + 1] = Math.min(255, g + 20);
          rawData[idx + 2] = Math.min(255, b + 15);
          rawData[idx + 3] = 255;
        }
        // Mouth
        else if (dy > 0.35 && dy < 0.5 && Math.abs(dx) < 0.12) {
          rawData[idx] = Math.min(255, r + 50);
          rawData[idx + 1] = Math.min(255, g + 20);
          rawData[idx + 2] = Math.min(255, b + 15);
          rawData[idx + 3] = 255;
        }
        // Skin
        else {
          rawData[idx] = r;
          rawData[idx + 1] = g;
          rawData[idx + 2] = b;
          rawData[idx + 3] = 255;
        }
      }
    }
  }

  return rawData;
}

function createPNG(faceColor) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(PNG_WIDTH, 0);
  ihdrData.writeUInt32BE(PNG_HEIGHT, 4);
  ihdrData.writeUInt8(8, 8);   // bit depth
  ihdrData.writeUInt8(6, 9);   // color type: RGBA
  ihdrData.writeUInt8(0, 10);  // compression
  ihdrData.writeUInt8(0, 11);  // filter
  ihdrData.writeUInt8(0, 12);  // interlace

  const rawData = createRGBAImage(faceColor);
  const compressed = zlib.deflateSync(rawData);

  const ihdr = createChunk('IHDR', ihdrData);
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate all face images
const faces = [
  {name: 'base', color: [255, 210, 180]},       // Light skin
  {name: 'l_left', color: [255, 210, 180]},
  {name: 'l_right', color: [255, 210, 180]},
  {name: 'x_cross', color: [255, 210, 180]},
  {name: 'x_tongue', color: [255, 190, 150]},    // Slight pink
  {name: 'x_shock', color: [255, 210, 180]},
  {name: 'x_laugh', color: [255, 190, 150]},     // Happy skin
  {name: 'x_skeptic', color: [255, 210, 180]},
  {name: 'x_whistle', color: [255, 210, 180]},
  {name: 'x_smug', color: [255, 195, 165]},
  {name: 'x_dizzy', color: [255, 210, 180]},
  {name: 'g_grimace', color: [255, 180, 140]},  // Pale
  {name: 'g_ouch', color: [255, 190, 150]},
  {name: 'g_squish', color: [255, 180, 140]},
];

async function main() {
  const outputDir = path.join(__dirname, 'public', 'faces');

  // Create directory if it doesn't exist
  await fs.promises.mkdir(outputDir, { recursive: true });

  for (const face of faces) {
    const png = createPNG(face.color);
    await fs.promises.writeFile(path.join(outputDir, `${face.name}.png`), png);
    console.log(`Generated ${face.name}.png`);
  }

  console.log('All face images generated!');
}

main().catch(console.error);