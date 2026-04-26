import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The block to remove:
const blockToRemove = `    }

    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);

    return (`;

const replacement = `    }

    return (`;

content = content.split(blockToRemove).join(replacement);

// Also need to fix the type definitions that haven't been fixed yet.
// AfricaTab (around line 1025)
// AsiaTab (around line 1330)
// InsuranceTab (around line 1568)
// RetailTab (around line 2792)

const typeDefToReplace = `    const type = (suggested_chart_type || '').toLowerCase();`;
const typeDefReplacement = `    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);`;

// But wait, RetailTab has `const dataKeys = ...` before `const type = ...`
// Let's just do a regex replace for all `const type = (suggested_chart_type || '').toLowerCase();`
content = content.replace(/    const type = \(suggested_chart_type \|\| ''\)\.toLowerCase\(\);/g, typeDefReplacement);

fs.writeFileSync('src/App.tsx', content);
