const fs = require('fs');
const path = require('path');

const dataDir = 'src/data/industries';
let totalSize = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (f.endsWith('.json')) {
      const stats = fs.statSync(fullPath);
      console.log(`${f}: ${stats.size / 1024} KB`);
      totalSize += stats.size;
    }
  });
}

walkDir(dataDir);
console.log(`Total size: ${totalSize / 1024} KB`);
