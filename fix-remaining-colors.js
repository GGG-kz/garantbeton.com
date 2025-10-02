const fs = require('fs');
const path = require('path');

// Дополнительные замены цветов
const additionalColorReplacements = {
  // Все оттенки серого
  'text-gray-50': 'text-mono-50',
  'text-gray-100': 'text-mono-100',
  'text-gray-200': 'text-mono-200',
  'text-gray-300': 'text-mono-300',
  'text-gray-400': 'text-mono-400',
  'text-gray-500': 'text-mono-500',
  'text-gray-600': 'text-mono-600',
  'text-gray-700': 'text-mono-700',
  'text-gray-800': 'text-mono-800',
  'text-gray-900': 'text-mono-900',
  
  'bg-gray-50': 'bg-mono-50',
  'bg-gray-100': 'bg-mono-100',
  'bg-gray-200': 'bg-mono-200',
  'bg-gray-300': 'bg-mono-300',
  'bg-gray-400': 'bg-mono-400',
  'bg-gray-500': 'bg-mono-500',
  'bg-gray-600': 'bg-mono-600',
  'bg-gray-700': 'bg-mono-700',
  'bg-gray-800': 'bg-mono-800',
  'bg-gray-900': 'bg-mono-900',
  
  'border-gray-50': 'border-mono-50',
  'border-gray-100': 'border-mono-100',
  'border-gray-200': 'border-mono-200',
  'border-gray-300': 'border-mono-300',
  'border-gray-400': 'border-mono-400',
  'border-gray-500': 'border-mono-500',
  'border-gray-600': 'border-mono-600',
  'border-gray-700': 'border-mono-700',
  'border-gray-800': 'border-mono-800',
  'border-gray-900': 'border-mono-900',
  
  // Hover состояния для gray
  'hover:text-gray-700': 'hover:text-mono-700',
  'hover:text-gray-900': 'hover:text-mono-900',
  'hover:bg-gray-50': 'hover:bg-mono-50',
  'hover:bg-gray-100': 'hover:bg-mono-100',
  'hover:bg-gray-200': 'hover:bg-mono-200',
  
  // Disabled состояния
  'disabled:text-gray-300': 'disabled:text-mono-300',
  'disabled:bg-gray-400': 'disabled:bg-mono-400',
  
  // Все цветные классы на черно-белые
  'text-blue-600': 'text-black',
  'text-blue-700': 'text-black',
  'text-blue-800': 'text-black',
  'text-blue-900': 'text-black',
  'bg-blue-50': 'bg-mono-50',
  'bg-blue-100': 'bg-mono-100',
  'bg-blue-600': 'bg-black',
  'bg-blue-700': 'bg-black',
  'border-blue-200': 'border-mono-200',
  'border-blue-500': 'border-mono-500',
  'focus:ring-blue-500': 'focus:ring-mono-500',
  'focus:border-blue-500': 'focus:border-mono-500',
  'hover:bg-blue-700': 'hover:bg-mono-800',
  
  'text-green-600': 'text-mono-600',
  'text-green-700': 'text-mono-700',
  'bg-green-100': 'bg-mono-100',
  'bg-green-500': 'bg-mono-500',
  
  'text-red-600': 'text-mono-600',
  'text-red-500': 'text-mono-500',
  'bg-red-500': 'bg-mono-500',
  
  'text-yellow-600': 'text-mono-600',
  'bg-yellow-500': 'bg-mono-500',
  
  // Neutral colors
  'text-neutral-400': 'text-mono-400',
  'text-neutral-500': 'text-mono-500',
  'text-neutral-600': 'text-mono-600',
  'text-neutral-700': 'text-mono-700',
  'text-neutral-900': 'text-mono-900',
  'bg-neutral-50': 'bg-mono-50',
  'bg-neutral-100': 'bg-mono-100',
  'border-neutral-200': 'border-mono-200',
  'hover:text-neutral-700': 'hover:text-mono-700',
  'hover:bg-neutral-100': 'hover:bg-mono-100',
  
  // Stone colors
  'text-stone-800': 'text-mono-800',
  'bg-stone-100': 'bg-mono-100',
};

function replaceColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const [oldColor, newColor] of Object.entries(additionalColorReplacements)) {
      if (content.includes(oldColor)) {
        content = content.replace(new RegExp(oldColor, 'g'), newColor);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      replaceColorsInFile(filePath);
    }
  }
}

console.log('🎨 Starting additional color replacement...');
walkDirectory('./src');
console.log('✨ Additional color replacement completed!');