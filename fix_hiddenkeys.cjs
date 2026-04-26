const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const totalComponentPairsLogic = `
    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });
`;

// First, remove any existing definitions of hiddenKeys and totalComponentPairs to avoid duplicates
code = code.replace(/    let hiddenKeys: string\[\] = \[\];\n    const totalComponentPairs = \[\s*\{ total: 'deal_count'[\s\S]*?    \}\);\n/g, '');

// Also remove the one in FinancialServicesPage that might be left over
code = code.replace(/    \/\/ Prevent double counting in charts where total and components are both present\n    const totalComponentPairs = \[\s*\{ total: 'deal_count'[\s\S]*?    \}\);\n/g, '');

// Insert the logic before `const isComposed = `
code = code.replace(/    const isComposed = /g, totalComponentPairsLogic + '\n    const isComposed = ');

fs.writeFileSync('src/App.tsx', code);
