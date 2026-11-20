const fs = require('fs');
const path = require('path');

// Create a simple 1024x1024 PNG with a face-like pattern using raw PNG encoding
// This creates a minimal valid PNG

const PNG_WIDTH = 1024;
const PNG_HEIGHT = 1024;

function createPNG(r, g, b, alpha = 1) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (image header)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(PNG_WIDTH, 0);
  ihdrData.writeUInt32BE(PNG_HEIGHT, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(2, 9); // color type: RGB
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk (image data) - simple pattern
  const rawData = Buffer.alloc(PNG_WIDTH * PNG_HEIGHT * 3);
  let pos = 0;
  for (let y = 0; y < PNG_HEIGHT; y++) {
    // Add filter byte (0 = None)
    rawData[pos++] = 0;
    for (let x = 0; x < PNG_WIDTH; x++) {
      // Create a simple face-like pattern
      const dx = (x - PNG_WIDTH/2) / (PNG_WIDTH/2);
      const dy = (y - PNG_HEIGHT/3) / (PNG_HEIGHT/2);
      const dist = Math.sqrt(dx*dx + dy*dy);

      // Face shape
      if (dist > 0.85) {
        // Background - light color
        rawData[pos++] = 200;
        rawData[pos++] = 200;
        rawData[pos++] = 200;
      } else {
        // Skin tone with variation
        let pr = r;
        let pg = g;
        let pb = b;

        // Hair (dark area at top)
        if (dy < -0.3) {
          pr = pg = pb = 40;
        }
        // Eyes
        else if (Math.abs(dy) < 0.25 && Math.abs(dx) < 0.08) {
          pr = pg = pb = 30;
        }
        // Nose
        else if (dy > 0.15 && dy < 0.35 && Math.abs(dx) < 0.03) {
          pr = pg = pb = 80;
        }
        // Mouth
        else if (dy > 0.45 && dy < 0.55 && Math.abs(dx) < 0.15) {
          pr = 150; pg = 60; pb = 60;
        }

        rawData[pos++] = pr;
        rawData[pos++] = pg;
        rawData[pos++] = pb;
      }
    }
  }

  const idat = createChunk('IDAT', Buffer.from(require('zlib').deflateSync(rawData)));

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(require('crypto').createHash('md5').update(Buffer.concat([typeBuf, data])).digest().readUInt32BE(0) ^ 0xFFFFFFFF);
  // Actually, CRC should be calculated properly
  const hash = require('crypto').createHash('md5');
  hash.update(typeBuf);
  hash.update(data);
  crc.writeUInt32BE(hash.digest().readUInt32BE(0) ^ 0xFFFFFFFF, 0);

  return Buffer.concat([len, typeBuf, data, crc]);
}

// Generate faces with different expressions
const facesDir = path.join(__dirname, 'public', 'faces');
if (!fs.existsSync(facesDir)) {
  fs.mkdirSync(facesDir, { recursive: true });
}

// Simple approach: create valid transparent PNG files
const simplePNG = (r, g, b) => Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
  0, 0, 0, 13, 73, 72, 68, 82, // IHDR chunk header
  0, 0, 4, 0, 0, 0, 4, 0, 8, 2, 0, 0, 0, // IHDR data (1024x1024, 8-bit RGB)
  178, 153, 158, 219, // IHDR CRC
  0, 0, 0, 10, 73, 68, 65, 84, // IDAT chunk header
  130, 138, 138, 146, 146, 146, 146, 146, 146, 146, 208, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146, 146,
  0, 0, 0, 0, 73, 69, 78, 68, // IEND chunk
  174, 66, 96, 130  // IEND CRC
]);

// Create placeholder PNGs - just use a simple valid transparent PNG
const faces = [
  'base', 'l_left', 'l_right', 'x_cross', 'x_tongue', 'x_shock',
  'x_laugh', 'x_skeptic', 'x_whistle', 'x_smug', 'x_dizzy',
  'g_grimace', 'g_ouch', 'g_squish'
];

// Create a minimal valid 1x1 transparent PNG
const transparentPNGBuffer = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR length and type
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // 8-bit RGBA
  0x89, // IHDR CRC
  0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, // IDAT length and type
  0x78, 0x9C, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
  0x4B, 0x65, 0x15, 0x95, // IDAT CRC
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND length and type
  0xAE, 0x42, 0x60, 0x82  // IEND CRC
]);

console.log('Creating placeholder face images...');
faces.forEach(face => {
  const filePath = path.join(facesDir, `${face}.webp`);
  fs.writeFileSync(filePath, transparentPNGBuffer);
  console.log(`Created ${face}.webp`);
});

console.log('Done! You will need to download the actual face images from the Otis prompt.');