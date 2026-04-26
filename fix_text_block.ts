import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const textBlockLogic = `
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
`;

// We need to insert this right after `if (!data || data.length === 0) return null;` in all renderChart functions.
// Let's find all occurrences of `if (!data || data.length === 0) return null;` and replace them.

content = content.replace(/    if \(!data \|\| data\.length === 0\) return null;/g, `    if (!data || data.length === 0) return null;${textBlockLogic}`);

fs.writeFileSync('src/App.tsx', content);
