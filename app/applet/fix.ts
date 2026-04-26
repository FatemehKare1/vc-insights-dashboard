import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The block to remove:
const blockToRemove = `    }

    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);

    return (`;

const replacement = `    }

    return (`;

content = content.split(blockToRemove).join(replacement);

const typeDefReplacement = `    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);`;

content = content.replace(/    const type = \(suggested_chart_type \|\| ''\)\.toLowerCase\(\);/g, typeDefReplacement);

fs.writeFileSync('src/App.tsx', content);
