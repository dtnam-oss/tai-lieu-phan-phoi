const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Section mapping
const sectionMap = {
  'faeda640-dac4-4844-9dad-9606804fd78c': 'ONBOARD',
  '2ceec18e-70ae-8058-841a-e0265fc85386': 'CẤU HÌNH',
  '2ceec18e-70ae-8021-ba52-d0ba83f7adf6': 'ĐĂNG ĐƠN',
  '2ceec18e-70ae-804c-99de-f363da316462': 'VẬN HÀNH',
  '2ceec18e-70ae-8095-9925-c2ca73ab3c91': 'HUB',
  '2ceec18e-70ae-80f6-8e4e-cc86f4a0e914': 'KHO ĐÍCH'
};

// Find all section headers
const sectionPositions = [];
Object.keys(sectionMap).forEach(id => {
  const regex = new RegExp(`<h3[^>]*id="${id}"`, 'g');
  const match = regex.exec(html);
  if (match) {
    sectionPositions.push({
      id: id,
      name: sectionMap[id],
      position: match.index
    });
  }
});

// Sort by position
sectionPositions.sort((a, b) => a.position - b.position);

// Function to find section for a given position
function findSectionForPosition(pos) {
  for (let i = sectionPositions.length - 1; i >= 0; i--) {
    if (pos >= sectionPositions[i].position) {
      return sectionPositions[i].name;
    }
  }
  return 'UNKNOWN';
}

const terms = [];
const seen = new Set(); // To avoid duplicates
let termCounter = 1;

// Extract from table cells only
const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
let tdMatch;

while ((tdMatch = tdRegex.exec(html)) !== null) {
  const cellContent = tdMatch[1];
  const cellPos = tdMatch.index;
  const section = findSectionForPosition(cellPos);
  
  // Extract <code> tags
  const codeRegex = /<code>([^<]+)<\/code>/g;
  let codeMatch;
  while ((codeMatch = codeRegex.exec(cellContent)) !== null) {
    const text = codeMatch[1].trim().replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    
    if (text && text.length > 0 && text.length < 100 && !text.match(/^\d+(\.\d+)?px$/)) {
      const key = `${section}|${text}`;
      if (!seen.has(key)) {
        seen.add(key);
        terms.push({
          hang_muc: section,
          id_the: `term-code-${String(termCounter).padStart(3, '0')}`,
          ten_the: text,
          url: ''
        });
        termCounter++;
      }
    }
  }
  
  // Extract <mark> tags with links
  const markLinkRegex = /<mark[^>]*class="highlight-([^"]+)"[^>]*><a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a><\/mark>/g;
  let markLinkMatch;
  while ((markLinkMatch = markLinkRegex.exec(cellContent)) !== null) {
    const color = markLinkMatch[1];
    const url = markLinkMatch[2];
    const text = markLinkMatch[3].trim();
    
    const key = `${section}|${text}|${url}`;
    if (!seen.has(key)) {
      seen.add(key);
      terms.push({
        hang_muc: section,
        id_the: `term-${color}-${String(termCounter).padStart(3, '0')}`,
        ten_the: text,
        url: url
      });
      termCounter++;
    }
  }
  
  // Extract <mark> tags without links (with span)
  const markSpanRegex = /<mark[^>]*class="highlight-([^"]+)"[^>]*><span[^>]*>([^<]+)<\/span><\/mark>/g;
  let markSpanMatch;
  while ((markSpanMatch = markSpanRegex.exec(cellContent)) !== null) {
    const color = markSpanMatch[1];
    const text = markSpanMatch[2].trim();
    
    if (text && text.length > 0 && text.length < 100) {
      const key = `${section}|${text}`;
      if (!seen.has(key)) {
        seen.add(key);
        terms.push({
          hang_muc: section,
          id_the: `term-${color}-${String(termCounter).padStart(3, '0')}`,
          ten_the: text,
          url: ''
        });
        termCounter++;
      }
    }
  }
}

// Output as TSV
console.log('hang_muc\tid_the\tten_the\turl');
terms.forEach(term => {
  console.log(`${term.hang_muc}\t${term.id_the}\t${term.ten_the}\t${term.url}`);
});

console.error(`\nTotal unique terms: ${terms.length}`);
