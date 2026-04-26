const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Helper to replace logic in renderChart functions
function fixRenderChart(content) {
  // 1. Fix hasCount, hasValue, isComposed logic
  // This targets the block where these are calculated
  const isComposedRegex = /const hasCount = dataKeys\.some\([\s\S]*?\);\s*const hasValue = dataKeys\.some\([\s\S]*?\);\s*const isComposed = [\s\S]*?;/g;
  
  content = content.replace(isComposedRegex, (match) => {
    return `const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);`;
  });

  // 2. Fix children generation for isComposed
  // This is trickier because the existing code varies
  // We'll look for "} else if (isComposed) {" and replace the block until the next "} else if" or "} else"
  
  const childrenRegex = /\} else if \(isComposed\) \{[\s\S]*?ChartComponent = ComposedChart;[\s\S]*?children = dataKeys\.map\(\(key, index\) => \{[\s\S]*?\}\);/g;
  
  content = content.replace(childrenRegex, (match) => {
    return `} else if (isComposed) {
      ChartComponent = ComposedChart;
      const hasLeftAndRight = hasCount && hasValue;
      children = dataKeys.map((key, index) => {
        const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key.toLowerCase().includes('rounds') || key === 'number_of_deals';
        const yAxisId = hasLeftAndRight ? (isCount ? "right" : "left") : "left";
        if (isCount) {
          return <Line key={key} name={formatKey(key)} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        } else {
          return <Bar key={key} name={formatKey(key)} yAxisId={yAxisId} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />;
        }
      });`;
  });

  // 3. Fix YAxis rendering
  const yAxisRegex = /\{isComposed && [\s\S]*? \? \([\s\S]*?\) : \([\s\S]*?\)\}/g;
  // This might be too broad, let's be more specific
  const specificYAxisRegex = /\{isComposed && (?:hasCount && hasValue|dataKeys\.some\([\s\S]*?\)) \? \([\s\S]*?\) : \([\s\S]*?\)\}/g;

  content = content.replace(specificYAxisRegex, (match) => {
    return `{isComposed && hasCount && hasValue ? (
                <>
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                </>
              ) : (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
              )}`;
  });

  return content;
}

// Special handling for FinancialServicesPage which has a different structure
function fixFinancialServicesPage(content) {
  // Find the block for FinancialServicesPage's renderChart
  const startMarker = 'const FinancialServicesPage = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {';
  const endMarker = 'const FintechReport = ({ onBack }: { onBack: () => void }) => {';
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  
  if (startIndex === -1 || endIndex === -1) return content;
  
  let section = content.substring(startIndex, endIndex);
  
  // Fix the isComposed children logic in this section
  const fsChildrenRegex = /\{isComposed \? \([\s\S]*?<ComposedChart[\s\S]*?\{dataKeys\.map\(\(key, i\) => \{[\s\S]*?\}\)\}[\s\S]*?<\/ComposedChart>[\s\S]*?\) :/g;
  
  section = section.replace(fsChildrenRegex, (match) => {
    return `{isComposed ? (
              <ComposedChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b' }} tickMargin={10} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => formatKey(value)} />
                {dataKeys.map((key, i) => {
                  const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key.toLowerCase().includes('rounds') || key === 'number_of_deals';
                  if (isCount) {
                    return <Line yAxisId="right" key={key} type="monotone" dataKey={key} name={formatKey(key)} stroke={getColor(key, i)} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />;
                  }
                  return <Bar yAxisId="left" key={key} dataKey={key} name={formatKey(key)} fill={getColor(key, i)} radius={[4, 4, 0, 0]} maxBarSize={60} />;
                })}
              </ComposedChart>
            ) :`;
  });
  
  return content.substring(0, startIndex) + section + content.substring(endIndex);
}

content = fixRenderChart(content);
content = fixFinancialServicesPage(content);

fs.writeFileSync(filePath, content);
console.log('Successfully updated App.tsx with robust dual Y-axis logic.');
