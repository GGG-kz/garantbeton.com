const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIcons() {
  try {
    // Создаем простую иконку 512x512
    const icon512 = await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 31, g: 41, b: 55, alpha: 1 } // #1f2937
      }
    })
    .composite([
      {
        input: Buffer.from(`
          <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <circle cx="256" cy="256" r="180" fill="#ffffff"/>
            <circle cx="256" cy="256" r="130" fill="#6b7280"/>
            <text x="256" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="#1f2937">Б</text>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(path.join(__dirname, '../public/pwa-512x512.png'));

    // Создаем иконку 192x192
    const icon192 = await sharp({
      create: {
        width: 192,
        height: 192,
        channels: 4,
        background: { r: 31, g: 41, b: 55, alpha: 1 } // #1f2937
      }
    })
    .composite([
      {
        input: Buffer.from(`
          <svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
            <circle cx="96" cy="96" r="68" fill="#ffffff"/>
            <circle cx="96" cy="96" r="49" fill="#6b7280"/>
            <text x="96" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="75" font-weight="bold" fill="#1f2937">Б</text>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(path.join(__dirname, '../public/pwa-192x192.png'));

    console.log('✅ PWA иконки созданы успешно!');
  } catch (error) {
    console.error('❌ Ошибка при создании иконок:', error);
  }
}

createIcons();
