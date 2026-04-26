const fs = require('fs');
const path = require('path');

const dataDir = 'src/data';
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

const summary = {};

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  const tabName = f.replace('.json', '');
  
  if (data.pages) {
    summary[tabName] = data.pages.map(p => {
      let title = p.page_headline || p.page_title || 'Unnamed Page';
      let charts = [];
      if (Array.isArray(p.charts)) {
        charts = p.charts.map(c => c.chart_title || c.panel_label || 'Unnamed Chart');
      } else if (p.charts) {
        charts = ['Has charts'];
      }
      return { title, charts };
    });
  }
});

// Also include industries
const indDir = 'src/data/industries';
if (fs.existsSync(indDir)) {
  const indSummary = {};
  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const name = item.replace('.json', '');
        if (data.pages) {
          indSummary[name] = data.pages.map(p => {
            let title = p.page_headline || p.page_title || 'Unnamed Page';
            let charts = [];
            if (Array.isArray(p.charts)) {
              charts = p.charts.map(c => c.chart_title || c.panel_label || 'Unnamed Chart');
            }
            return { title, charts };
          });
        }
      }
    });
  }
  walkDir(indDir);
  summary['industries'] = indSummary;
}

fs.writeFileSync('dashboard_structure.json', JSON.stringify(summary, null, 2));
