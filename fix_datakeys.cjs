const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Change const dataKeys to let dataKeys
code = code.replace(/const dataKeys =/g, 'let dataKeys =');

// Replace filteredDataKeys with dataKeys
code = code.replace(/filteredDataKeys/g, 'dataKeys');

fs.writeFileSync('src/App.tsx', code);
