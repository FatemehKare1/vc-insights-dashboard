const fs = require('fs');
const path = 'src/data/industries/Financial Services/Banks_Tracxn_Feed_Report.json';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
  /"Note: First-time investors and Existing Investors are calculated from the available Equity Funding Rounds on Tracxn Platform. 1.The numbers in bracket correspond to the change from previous period."/g,
  '"Note: First-time investors and Existing Investors are calculated from the available Equity Funding Rounds on Tracxn Platform. The numbers in the last column correspond to the change from previous period."'
);

fs.writeFileSync(path, data);
