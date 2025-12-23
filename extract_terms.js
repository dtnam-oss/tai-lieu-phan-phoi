const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Extract all <code> and <mark> tags within table cells
const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/g;
const tables = html.match(tableRegex) || [];

const terms = [];
let termCounter = 1;

// Section mapping
const sectionMap = {
  'faeda640-dac4-4844-9dad-9606804fd78c': 'ONBOARD',
  '2ceec18e-70ae-8058-841a-e0265fc85386': 'CẤU HÌNH',
  '2ceec18e-70ae-8021-ba52-d0ba83f7adf6': 'ĐĂNG ĐƠN',
  '2ceec18e-70ae-804c-99de-f363da316462': 'VẬN HÀNH',
  '2ceec18e-70ae-8095-9925-c2ca73ab3c91': 'HUB',
  '2ceec18e-70ae-80f6-8e4e-cc86f4a0e914': 'KHO ĐÍCH'
};

// Find current section
function findSection(html, tableIndex) {
  const beforeTable = html.substring(0, tableIndex);
  const h3Matches = beforeTable.match(/<h3 id="([^"]+)"[^>]*>[\s\S]*?<\/h3>/g);
  
  if (h3Matches && h3Matches.length > 0) {
    const lastH3 = h3Matches[h3Matches.length - 1];
    const idMatch = lastH3.match(/id="([^"]+)"/);
    if (idMatch) {
      return sectionMap[idMatch[1]] || 'UNKNOWN';
    }
  }
  return 'UNKNOWN';
}

tables.forEach((table, tableIdx) => {
  const tablePos = html.indexOf(table);
  const section = findSection(html, tablePos);
  
  // Extract <code> tags
  const codeRegex = /<code>([^<]+)<\/code>/g;
  let match;
  while ((match = codeRegex.exec(table)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 0 && text.length < 100) {
      terms.push({
        hang_muc: section,
        id_the: `term-code-${String(termCounter).padStart(3, '0')}`,
        ten_the: text,
        url: ''
      });
      termCounter++;
    }
  }
  
  // Extract <mark> tags with links
  const markRegex = /<mark class="highlight-([^"]+)"[^>]*><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/mark>/g;
  while ((match = markRegex.exec(table)) !== null) {
    const color = match[1];
    const url = match[2];
    const text = match[3].trim();
    
    terms.push({
      hang_muc: section,
      id_the: `term-${color}-${String(termCounter).padStart(3, '0')}`,
      ten_the: text,
      url: url
    });
    termCounter++;
  }
  
  // Extract <mark> tags without links
  const markTextRegex = /<mark class="highlight-([^"]+)"[^>]*><span[^>]*>([^<]+)<\/span><\/mark>/g;
  while ((match = markTextRegex.exec(table)) !== null) {
    const color = match[1];
    const text = match[2].trim();
    
    if (text && text.length > 0 && text.length < 100) {
      terms.push({
        hang_muc: section,
        id_the: `term-${color}-${String(termCounter).padStart(3, '0')}`,
        ten_the: text,
        url: ''
      });
      termCounter++;
    }
  }
});

// Output as TSV (tab-separated values) for easy paste to Google Sheets
console.log('hang_muc\tid_the\tten_the\turl');
terms.forEach(term => {
  console.log(`${term.hang_muc}\t${term.id_the}\t${term.ten_the}\t${term.url}`);
});

console.error(`\nTotal terms extracted: ${terms.length}`);
