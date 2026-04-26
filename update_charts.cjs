const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to update the isComposed logic and the children generation for ComposedChart.
// Let's use a regex to replace the blocks.

const isComposedRegex = /const isComposed = type\.includes\('composed'\) \|\| type\.includes\('dual y-axes'\) \|\| type\.includes\('dual_axis'\);/g;

const newIsComposed = `const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);`;

code = code.replace(isComposedRegex, newIsComposed);

// Now for the children generation in ComposedChart
// We need to find the block:
/*
    } else if (isComposed) {
      ChartComponent = ComposedChart;
      
      const hasLeftAndRight = dataKeys.some(k => k.endsWith('count')) && dataKeys.some(k => !k.endsWith('count'));
      
      children = dataKeys.map((key, index) => {
        const isCount = key.endsWith('count');
        const yAxisId = hasLeftAndRight ? (isCount ? "right" : "left") : "left";
        
        if (isCount) {
          return <Line key={key} name={formatKey(key)} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        } else {
          return <Bar key={key} name={formatKey(key)} yAxisId={yAxisId} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />;
        }
      });
*/

const childrenRegex = /\} else if \(isComposed\) \{[\s\S]*?ChartComponent = ComposedChart;[\s\S]*?const hasLeftAndRight = dataKeys\.some\(k => k\.endsWith\('count'\)\) && dataKeys\.some\(k => !k\.endsWith\('count'\)\);[\s\S]*?children = dataKeys\.map\(\(key, index\) => \{[\s\S]*?const isCount = key\.endsWith\('count'\);[\s\S]*?const yAxisId = hasLeftAndRight \? \(isCount \? "right" : "left"\) : "left";[\s\S]*?if \(isCount\) \{[\s\S]*?return <Line key=\{key\} name=\{formatKey\(key\)\} yAxisId=\{yAxisId\} type="monotone" dataKey=\{key\} stroke=\{COLORS\[index % COLORS\.length\]\} strokeWidth=\{3\} dot=\{\{ r: 4 \}\} activeDot=\{\{ r: 6 \}\} \/>;[\s\S]*?\} else \{[\s\S]*?return <Bar key=\{key\} name=\{formatKey\(key\)\} yAxisId=\{yAxisId\} dataKey=\{key\} fill=\{COLORS\[index % COLORS\.length\]\} radius=\{\[4, 4, 0, 0\]\} \/>;[\s\S]*?\}[\s\S]*?\}\);/g;

const newChildren = `} else if (isComposed) {
      ChartComponent = ComposedChart;
      
      const hasLeftAndRight = hasCount && hasValue;
      
      children = dataKeys.map((key, index) => {
        const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key === 'number_of_deals';
        const yAxisId = hasLeftAndRight ? (isCount ? "right" : "left") : "left";
        
        if (isCount) {
          return <Line key={key} name={formatKey(key)} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        } else {
          return <Bar key={key} name={formatKey(key)} yAxisId={yAxisId} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />;
        }
      });`;

code = code.replace(childrenRegex, newChildren);

// Also update the YAxis rendering
// ) : isComposed && dataKeys.some(k => k.endsWith('count')) && dataKeys.some(k => !k.endsWith('count')) ? (
const yAxisRegex = /\) : isComposed && dataKeys\.some\(k => k\.endsWith\('count'\)\) && dataKeys\.some\(k => !k\.endsWith\('count'\)\) \? \(/g;
const newYAxis = `) : isComposed && hasCount && hasValue ? (`

code = code.replace(yAxisRegex, newYAxis);

fs.writeFileSync('src/App.tsx', code);
console.log('Done');

