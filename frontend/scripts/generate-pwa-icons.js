const fs = require('fs');
const path = require('path');

// Простая функция для создания базового PNG (в реальности нужна библиотека типа sharp)
function createSimplePNG(size) {
  // Создаем простой PNG заголовок + минимальные данные
  const width = size;
  const height = size;
  
  // PNG заголовок (упрощенный)
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A  // PNG signature
  ]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // length
    Buffer.from('IHDR'),        // type
    ihdrData,                   // data
    Buffer.from([0, 0, 0, 0])   // CRC (simplified)
  ]);
  
  // IEND chunk
  const iendChunk = Buffer.from([
    0, 0, 0, 0,           // length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return Buffer.concat([pngHeader, ihdrChunk, iendChunk]);
}

// Создаем иконки
const sizes = [192, 512];

sizes.forEach(size => {
  const filename = `pwa-${size}x${size}.png`;
  const filepath = path.join(__dirname, '..', 'public', filename);
  
  try {
    const pngData = createSimplePNG(size);
    fs.writeFileSync(filepath, pngData);
    console.log(`✅ Создана иконка: ${filename} (${pngData.length} байт)`);
  } catch (error) {
    console.error(`❌ Ошибка создания ${filename}:`, error.message);
  }
});

console.log('\n🎉 PWA иконки созданы!');
