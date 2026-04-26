const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/{source}/g, '{formatSourceText(source)}');
content = content.replace(/{chartData\.source}/g, '{formatSourceText(chartData.source)}');
fs.writeFileSync('src/App.tsx', content);
console.log('Done!');
