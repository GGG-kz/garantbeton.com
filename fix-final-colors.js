const fs = require('fs');
const path = require('path');

// Финальные замены всех оставшихся цветов
const finalColorReplacements = {
  // Все цветные фоны на черно-белые
  'bg-yellow-100': 'bg-mono-100',
  'bg-purple-100': 'bg-mono-100',
  'bg-red-50': 'bg-mono-50',
  'bg-red-100': 'bg-mono-100',
  'bg-green-50': 'bg-mono-50',
  'bg-green-100': 'bg-mono-100',
  'bg-blue-50': 'bg-mono-50',
  'bg-blue-100': 'bg-mono-100',
  'bg-orange-50': 'bg-mono-50',
  'bg-orange-100': 'bg-mono-100',
  'bg-indigo-50': 'bg-mono-50',
  'bg-indigo-100': 'bg-mono-100',
  
  // Все цветные границы на черно-белые
  'border-red-200': 'border-mono-200',
  'border-green-200': 'border-mono-200',
  'border-blue-200': 'border-mono-200',
  'border-orange-200': 'border-mono-200',
  'border-indigo-200': 'border-mono-200',
  
  // Все цветные тексты на черно-белые
  'text-red-800': 'text-mono-800',
  'text-red-900': 'text-mono-900',
  'text-green-800': 'text-mono-800',
  'text-green-900': 'text-mono-900',
  'text-blue-800': 'text-mono-800',
  'text-blue-900': 'text-mono-900',
  'text-orange-600': 'text-mono-600',
  'text-orange-800': 'text-mono-800',
  'text-orange-900': 'text-mono-900',
  'text-indigo-600': 'text-mono-600',
  'text-indigo-800': 'text-mono-800',
  'text-indigo-900': 'text-mono-900',
  'text-purple-600': 'text-mono-600',
  'text-purple-800': 'text-mono-800',
  'text-purple-900': 'text-mono-900',
  'text-yellow-600': 'text-mono-600',
  'text-yellow-800': 'text-mono-800',
  'text-yellow-900': 'text-mono-900',
  
  // Hover состояния
  'hover:text-red-900': 'hover:text-mono-900',
  'hover:text-green-900': 'hover:text-mono-900',
  'hover:text-orange-900': 'hover:text-mono-900',
  'hover:text-indigo-900': 'hover:text-mono-900',
  'hover:bg-red-50': 'hover:bg-mono-50',
  'hover:bg-green-50': 'hover:bg-mono-50',
  'hover:bg-orange-50': 'hover:bg-mono-50',
  'hover:bg-indigo-50': 'hover:bg-mono-50',
  
  // Специальные цвета для иконок и элементов
  'text-emerald-600': 'text-mono-600',
  'text-emerald-700': 'text-mono-700',
  'text-emerald-800': 'text-mono-800',
  'text-emerald-900': 'text-mono-900',
  'bg-emerald-50': 'bg-mono-50',
  'bg-emerald-100': 'bg-mono-100',
  'border-emerald-200': 'border-mono-200',
  
  'text-sky-600': 'text-mono-600',
  'text-sky-700': 'text-mono-700',
  'text-sky-800': 'text-mono-800',
  'text-sky-900': 'text-mono-900',
  'bg-sky-50': 'bg-mono-50',
  'bg-sky-100': 'bg-mono-100',
  'border-sky-200': 'border-mono-200',
  
  'text-violet-600': 'text-mono-600',
  'text-violet-700': 'text-mono-700',
  'text-violet-800': 'text-mono-800',
  'text-violet-900': 'text-mono-900',
  'bg-violet-50': 'bg-mono-50',
  'bg-violet-100': 'bg-mono-100',
  'border-violet-200': 'border-mono-200',
  
  'text-teal-600': 'text-mono-600',
  'text-teal-700': 'text-mono-700',
  'text-teal-800': 'text-mono-800',
  'text-teal-900': 'text-mono-900',
  'bg-teal-50': 'bg-mono-50',
  'bg-teal-100': 'bg-mono-100',
  'border-teal-200': 'border-mono-200',
  
  'text-cyan-600': 'text-mono-600',
  'text-cyan-700': 'text-mono-700',
  'text-cyan-800': 'text-mono-800',
  'text-cyan-900': 'text-mono-900',
  'bg-cyan-50': 'bg-mono-50',
  'bg-cyan-100': 'bg-mono-100',
  'border-cyan-200': 'border-mono-200',
  
  'text-lime-600': 'text-mono-600',
  'text-lime-700': 'text-mono-700',
  'text-lime-800': 'text-mono-800',
  'text-lime-900': 'text-mono-900',
  'bg-lime-50': 'bg-mono-50',
  'bg-lime-100': 'bg-mono-100',
  'border-lime-200': 'border-mono-200',
  
  'text-pink-600': 'text-mono-600',
  'text-pink-700': 'text-mono-700',
  'text-pink-800': 'text-mono-800',
  'text-pink-900': 'text-mono-900',
  'bg-pink-50': 'bg-mono-50',
  'bg-pink-100': 'bg-mono-100',
  'border-pink-200': 'border-mono-200',
  
  'text-rose-600': 'text-mono-600',
  'text-rose-700': 'text-mono-700',
  'text-rose-800': 'text-mono-800',
  'text-rose-900': 'text-mono-900',
  'bg-rose-50': 'bg-mono-50',
  'bg-rose-100': 'bg-mono-100',
  'border-rose-200': 'border-mono-200',
  
  'text-amber-600': 'text-mono-600',
  'text-amber-700': 'text-mono-700',
  'text-amber-800': 'text-mono-800',
  'text-amber-900': 'text-mono-900',
  'bg-amber-50': 'bg-mono-50',
  'bg-amber-100': 'bg-mono-100',
  'border-amber-200': 'border-mono-200',
  
  'text-fuchsia-600': 'text-mono-600',
  'text-fuchsia-700': 'text-mono-700',
  'text-fuchsia-800': 'text-mono-800',
  'text-fuchsia-900': 'text-mono-900',
  'bg-fuchsia-50': 'bg-mono-50',
  'bg-fuchsia-100': 'bg-mono-100',
  'border-fuchsia-200': 'border-mono-200',
};

function replaceColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const [oldColor, newColor] of Object.entries(finalColorReplacements)) {
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

console.log('🎨 Starting final color replacement...');
walkDirectory('./src');
console.log('✨ Final color replacement completed!');