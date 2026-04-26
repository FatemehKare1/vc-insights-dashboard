const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Color mappings for UI elements (not charts!)
const colorMap = {
  // Background colors
  'bg-blue-50': 'bg-[#C7B299]/10',
  'bg-blue-100': 'bg-[#C7B299]/20',
  'bg-blue-600': 'bg-[#183661]',
  'bg-blue-700': 'bg-[#183661]',
  'bg-blue-800': 'bg-[#183661]',
  
  // Text colors
  'text-blue-400': 'text-[#C7B299]',
  'text-blue-500': 'text-[#183661]',
  'text-blue-600': 'text-[#183661]',
  'text-blue-700': 'text-[#183661]',
  'text-blue-800': 'text-[#183661]',
  'text-blue-900': 'text-[#183661]',
  
  // Border colors
  'border-blue-100': 'border-[#C7B299]/20',
  'border-blue-300': 'border-[#C7B299]/40',
  'border-blue-500': 'border-[#183661]',
  'border-blue-600': 'border-[#183661]',
  'border-blue-700': 'border-[#183661]',
  
  // Hover colors
  'hover:bg-blue-700': 'hover:bg-[#2a5080]',
  'hover:bg-blue-800': 'hover:bg-[#2a5080]',
  'hover:text-blue-600': 'hover:text-[#183661]',
  'hover:text-blue-800': 'hover:text-[#183661]',
  'hover:border-blue-300': 'hover:border-[#C7B299]/40',
  'group-hover:bg-blue-600': 'group-hover:bg-[#183661]',
  
  // Ring colors
  'ring-blue-500': 'ring-[#183661]',
  'ring-blue-700': 'ring-[#183661]',
  
  // Gradients (only for UI backgrounds, not charts)
  'from-blue-600 to-blue-400': 'from-[#183661] to-[#2a5080]',
  'from-blue-50 to-white': 'from-[#C7B299]/10 to-white',
};

// Replace colors
Object.keys(colorMap).forEach(oldColor => {
  const regex = new RegExp(oldColor, 'g');
  content = content.replace(regex, colorMap[oldColor]);
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Color palette updated successfully!');
console.log('Applied branding colors: #C7B299 (khaki) and #183661 (navy)');
