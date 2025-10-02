// Простой скрипт для создания базовых иконок PWA
// Запустить: node create-icons.js

const fs = require('fs');

// Простая SVG иконка
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1f2937"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="#3b82f6"/>
  <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size*0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">Б</text>
</svg>
`;

// Создаем SVG файлы
fs.writeFileSync('pwa-192x192.svg', createSVGIcon(192));
fs.writeFileSync('pwa-512x512.svg', createSVGIcon(512));

console.log('✅ SVG иконки созданы:');
console.log('   - pwa-192x192.svg');
console.log('   - pwa-512x512.svg');
console.log('');
console.log('Для конвертации в PNG используйте:');
console.log('   - https://convertio.co/svg-png/');
console.log('   - или любой другой SVG to PNG конвертер');
