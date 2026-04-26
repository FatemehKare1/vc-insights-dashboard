const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const customTooltipCode = `
const CustomTooltip = ({ active, payload, label, hiddenKeys, is100Percent, dataKeys }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md" style={{ zIndex: 1000 }}>
        <p className="font-bold text-slate-800 mb-2">{typeof label === 'string' ? formatKey(label) : label}</p>
        {payload.map((entry: any, index: number) => {
          let value = entry.value;
          if (is100Percent && dataKeys) {
            const total = dataKeys.reduce((sum: number, key: string) => sum + (Number(data[key]) || 0), 0);
            const percent = total > 0 ? (Number(value) / total) * 100 : 0;
            value = \`\${percent.toFixed(1)}%\`;
          }
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {formatKey(entry.name)}: {value}
            </p>
          );
        })}
        {hiddenKeys && hiddenKeys.map((key: string) => {
          if (data[key] !== undefined) {
            return (
              <p key={key} className="text-sm font-semibold text-slate-700 mt-1 pt-1 border-t border-slate-100">
                {formatKey(key)}: {data[key]}
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  }
  return null;
};
`;

if (!code.includes('const CustomTooltip')) {
  code = code.replace('const formatKey = (key: string) => key.replace(/_/g, \' \').replace(/\\b\\w/g, l => l.toUpperCase());', 'const formatKey = (key: string) => key.replace(/_/g, \' \').replace(/\\b\\w/g, l => l.toUpperCase());\n' + customTooltipCode);
}

fs.writeFileSync('src/App.tsx', code);
