import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Read the SVG file
const svgPath = path.join(iconsDir, 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Icon sizes needed
const sizes = [
  { name: 'icon-16.png', size: 16 },
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-48.png', size: 48 },
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-128.png', size: 128 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-384.png', size: 384 },
  { name: 'icon-512.png', size: 512 },
];

async function generateIcons() {
  console.log('Generating icons from SVG...');

  for (const { name, size } of sizes) {
    const outputPath = path.join(iconsDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${name} (${size}x${size})`);
  }

  // Generate favicon.ico (16x16 and 32x32 combined)
  const favicon16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const favicon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();

  // Copy 32x32 as favicon (browsers will use this)
  const faviconPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(faviconPath, favicon32);
  console.log('Generated: favicon.ico');

  // Also copy to src/app for Next.js
  const srcFaviconPath = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');
  fs.writeFileSync(srcFaviconPath, favicon32);
  console.log('Generated: src/app/favicon.ico');

  // Generate apple-touch-icon
  const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  console.log('Generated: apple-touch-icon.png');

  // Generate favicon-16x16 and favicon-32x32
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), favicon16);
  console.log('Generated: favicon-16x16.png');
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), favicon32);
  console.log('Generated: favicon-32x32.png');

  // Generate OG image (1200x630) - simplified version
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#4F46E5;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bgGradient)" />
    <g transform="translate(600, 250)">
      <path d="M0,-100 L87.5,-12.5 L0,100 L-87.5,-12.5 Z" fill="white" opacity="0.9" />
      <path d="M-37.5,-25 L-12.5,0 L-37.5,25" fill="none" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
      <path d="M37.5,-25 L12.5,0 L37.5,25" fill="none" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
    </g>
    <text x="600" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="700" fill="white" text-anchor="middle">SqueezePix</text>
    <text x="600" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="white" opacity="0.8" text-anchor="middle">Browser-Based Image Optimization</text>
  </svg>`;

  const ogPath = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(ogPath);
  console.log('Generated: og-image.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
