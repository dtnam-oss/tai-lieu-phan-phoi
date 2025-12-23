// Test script - Paste vào Console để test matching
// Copy toàn bộ và paste vào Console (F12)

console.clear();
console.log('🧪 TESTING TEXT MATCHING...');
console.log('='.repeat(80));

// Get all terms
const terms = document.querySelectorAll('.interactive-term');
console.log(`Found ${terms.length} interactive terms`);

// Get cache
const cacheData = localStorage.getItem('masterData');
if (!cacheData) {
    console.log('❌ No cache! Please wait for page to load or click Debug button.');
} else {
    const cache = JSON.parse(cacheData);
    const dataRows = cache.data.slice(1); // Skip header
    
    console.log(`Database has ${dataRows.length} rows`);
    console.log('\n📊 Testing first 10 terms:');
    
    let matched = 0;
    let withUrl = 0;
    
    Array.from(terms).slice(0, 10).forEach((term, i) => {
        const termText = term.textContent.trim();
        
        // Try to find match by text
        const matchedRow = dataRows.find(row => row && row.C && row.C.trim() === termText);
        
        if (matchedRow) {
            matched++;
            const hasUrl = matchedRow.D && matchedRow.D.trim();
            if (hasUrl) withUrl++;
            
            console.log(`${i+1}. ✅ "${termText}"`);
            console.log(`   → ID: ${matchedRow.B}`);
            console.log(`   → URL: ${hasUrl ? matchedRow.D : '(empty)'}`);
        } else {
            console.log(`${i+1}. ❌ "${termText}" - NOT FOUND in database`);
            
            // Try fuzzy search to find similar
            const similar = dataRows.filter(row => 
                row && row.C && row.C.toLowerCase().includes(termText.toLowerCase())
            ).slice(0, 3);
            
            if (similar.length > 0) {
                console.log(`   💡 Similar entries in database:`);
                similar.forEach(s => console.log(`      - "${s.C}"`));
            }
        }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 RESULTS (first 10):`);
    console.log(`   Matched: ${matched}/10`);
    console.log(`   With URLs: ${withUrl}/10`);
}
