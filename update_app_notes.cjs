const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
        {chartData.notes && chartData.notes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.notes.map((note: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(note)}</p>
            ))}
          </div>
        )}
        {chartData.footnotes && chartData.footnotes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.footnotes.map((footnote: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(footnote)}</p>
            ))}
          </div>
        )}
        {chartData.source && <p className="text-xs text-slate-400 mt-6 italic">{formatSourceText(chartData.source)}</p>}
`;

code = code.replace(/\{chartData\.source && <p className="text-xs text-slate-400 mt-6 italic">\{formatSourceText\(chartData\.source\)\}<\/p>\}/g, replacement);

fs.writeFileSync('src/App.tsx', code);
