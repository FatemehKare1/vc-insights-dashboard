const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all Tooltips that have a formatter or contentStyle
// We can just match <Tooltip and then any characters until />
// But we have to be careful not to match across multiple components.
// Since Tooltip is always self-closing in this file (/>), we can match:
// /<Tooltip[^>]*?\/>/g

// Let's see if there are any <Tooltip>...</Tooltip>
// No, they are all self-closing.

const newTooltip = `<Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />`;

code = code.replace(/<Tooltip[\s\S]*?\/>/g, newTooltip);

fs.writeFileSync('src/App.tsx', code);
