const fs = require('fs');
const path = require('path');

const dataDir = 'src/data';
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

let totalSize = 0;
files.forEach(f => {
  const stats = fs.statSync(path.join(dataDir, f));
  console.log(`${f}: ${stats.size / 1024} KB`);
  totalSize += stats.size;
});

console.log(`Total size: ${totalSize / 1024} KB`);
