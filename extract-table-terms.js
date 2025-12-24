/**
 * ========================================
 * TABLE TERMS EXTRACTION SCRIPT
 * ========================================
 * 
 * HƯỚNG DẪN SỬ DỤNG:
 * 1. Mở website: https://dtnam-oss.github.io/tai-lieu-phan-phoi/
 * 2. Mở Console (F12 → Console tab)
 * 3. Copy toàn bộ code này và paste vào Console
 * 4. Nhấn Enter để chạy
 * 5. Script sẽ tự động:
 *    - Quét tất cả bảng (simple-table)
 *    - Tìm các thẻ <code>, <mark>, <a>
 *    - Gán ID tự động (nếu chưa có)
 *    - Export ra CSV format
 * 6. Copy kết quả → Paste vào Google Sheets
 * 
 * OUTPUT FORMAT:
 * hang_muc | id_the | ten_the | url | tag_type
 */

(function() {
    'use strict';

    console.log('🚀 Starting Table Terms Extraction...');
    console.log('='.repeat(80));

    // Counters for ID generation
    let termCounters = {
        'onboard': 0,
        'dang-don': 0,
        'van-hanh': 0,
        'hub': 0,
        'kho-dich': 0,
        'khac': 0
    };

    // Get section name from heading
    function getSectionName() {
        const allHeadings = document.querySelectorAll('h3');
        let sectionMap = {};
        
        allHeadings.forEach(h3 => {
            const text = h3.textContent.trim();
            const match = text.match(/^(\d+)\.\s*(.+)$/);
            if (match) {
                const sectionNum = match[1];
                const sectionName = match[2];
                sectionMap[sectionNum] = sectionName;
            }
        });

        return sectionMap;
    }

    // Determine section key from section name
    function getSectionKey(sectionName) {
        if (sectionName.includes('ONBOARD')) return 'onboard';
        if (sectionName.includes('ĐĂNG ĐƠN')) return 'dang-don';
        if (sectionName.includes('VẬN HÀNH')) return 'van-hanh';
        if (sectionName.includes('HUB')) return 'hub';
        if (sectionName.includes('KHO ĐÍCH')) return 'kho-dich';
        return 'khac';
    }

    // Find closest h3 heading for a table
    function findClosestHeading(element) {
        let current = element;
        while (current && current !== document.body) {
            current = current.previousElementSibling;
            if (current && current.tagName === 'H3') {
                return current;
            }
        }
        // If not found before, search in parent
        const parent = element.parentElement;
        if (parent) {
            return findClosestHeading(parent);
        }
        return null;
    }

    // Generate unique ID
    function generateTermId(sectionKey) {
        termCounters[sectionKey]++;
        const num = String(termCounters[sectionKey]).padStart(3, '0');
        return `term-${sectionKey}-${num}`;
    }

    // Extract data from all tables
    function extractTableTerms() {
        const tables = document.querySelectorAll('.simple-table');
        const results = [];
        let totalTerms = 0;

        console.log(`\n📊 Found ${tables.length} tables to process\n`);

        tables.forEach((table, tableIndex) => {
            // Find section heading
            const heading = findClosestHeading(table);
            const sectionText = heading ? heading.textContent.trim() : 'Không xác định';
            const sectionKey = getSectionKey(sectionText);

            console.log(`\nTable ${tableIndex + 1}: ${sectionText}`);

            // Find all important elements in table
            const codeElements = table.querySelectorAll('code');
            const markElements = table.querySelectorAll('mark');
            const linkElements = table.querySelectorAll('a');

            // Process <code> elements
            codeElements.forEach((elem, idx) => {
                const text = elem.textContent.trim();
                if (!text || text.length < 2) return; // Skip empty or very short

                const id = elem.id || generateTermId(sectionKey);
                if (!elem.id) {
                    elem.id = id; // Assign ID to element
                }

                results.push({
                    hang_muc: sectionText,
                    id_the: id,
                    ten_the: text,
                    url: '',
                    tag_type: 'code'
                });
                totalTerms++;
            });

            // Process <mark> elements (not inside <a>)
            markElements.forEach((elem, idx) => {
                // Skip if inside <a> tag
                if (elem.closest('a')) return;

                const text = elem.textContent.trim();
                if (!text || text.length < 2) return;

                const id = elem.id || generateTermId(sectionKey);
                if (!elem.id) {
                    elem.id = id;
                }

                results.push({
                    hang_muc: sectionText,
                    id_the: id,
                    ten_the: text,
                    url: '',
                    tag_type: 'mark'
                });
                totalTerms++;
            });

            // Process <a> elements
            linkElements.forEach((elem, idx) => {
                const text = elem.textContent.trim();
                const url = elem.getAttribute('href') || '';
                
                if (!text || text.length < 2) return;

                const id = elem.id || generateTermId(sectionKey);
                if (!elem.id) {
                    elem.id = id;
                }

                results.push({
                    hang_muc: sectionText,
                    id_the: id,
                    ten_the: text,
                    url: url,
                    tag_type: 'link'
                });
                totalTerms++;
            });

            console.log(`  → Found ${codeElements.length} <code>, ${markElements.length} <mark>, ${linkElements.length} <a>`);
        });

        console.log(`\n✅ Total terms extracted: ${totalTerms}`);
        return results;
    }

    // Convert to CSV format (TSV for easy paste to Google Sheets)
    function convertToCSV(data) {
        const header = 'hang_muc\tid_the\tten_the\turl\ttag_type\n';
        const rows = data.map(row => {
            return [
                row.hang_muc,
                row.id_the,
                row.ten_the.replace(/\t/g, ' ').replace(/\n/g, ' '), // Remove tabs and newlines
                row.url,
                row.tag_type
            ].join('\t');
        });

        return header + rows.join('\n');
    }

    // Main execution
    console.log('🔍 Extracting terms from all tables...');
    const extractedData = extractTableTerms();

    if (extractedData.length === 0) {
        console.error('❌ No terms found! Check if tables exist.');
        return;
    }

    const csvOutput = convertToCSV(extractedData);

    console.log('\n' + '='.repeat(80));
    console.log('✅ EXTRACTION COMPLETE!');
    console.log('='.repeat(80));
    console.log(`\n📋 Total extracted: ${extractedData.length} terms`);
    console.log('\n📤 CSV OUTPUT (Copy this):\n');
    console.log('---START---');
    console.log(csvOutput);
    console.log('---END---');

    // Copy to clipboard
    navigator.clipboard.writeText(csvOutput).then(() => {
        console.log('\n✅ CSV data copied to clipboard!');
        console.log('\n📝 NEXT STEPS:');
        console.log('1. Open Google Sheets');
        console.log('2. Create new sheet or tab named "TextData"');
        console.log('3. Select cell A1');
        console.log('4. Paste with Cmd+V (Mac) or Ctrl+V (Windows)');
        console.log('5. Data will be automatically separated into columns');
        console.log('\n💡 TIP: You can also see the data in the console above');
    }).catch(err => {
        console.warn('⚠️ Could not copy to clipboard automatically');
        console.log('📝 Please copy the CSV output manually (between ---START--- and ---END---)');
    });

    // Store data globally for inspection
    window.extractedTermsData = extractedData;
    console.log('\n🔍 Data also stored in: window.extractedTermsData');
    console.log('Type "window.extractedTermsData" in console to inspect');

    // Show statistics
    console.log('\n📊 STATISTICS:');
    const stats = {
        code: extractedData.filter(d => d.tag_type === 'code').length,
        mark: extractedData.filter(d => d.tag_type === 'mark').length,
        link: extractedData.filter(d => d.tag_type === 'link').length
    };
    console.log(`  <code> tags: ${stats.code}`);
    console.log(`  <mark> tags: ${stats.mark}`);
    console.log(`  <a> tags: ${stats.link}`);

    // Show section breakdown
    console.log('\n📂 BREAKDOWN BY SECTION:');
    const sections = {};
    extractedData.forEach(d => {
        sections[d.hang_muc] = (sections[d.hang_muc] || 0) + 1;
    });
    Object.entries(sections).forEach(([section, count]) => {
        console.log(`  ${section}: ${count} terms`);
    });

    console.log('\n🎉 Done! Check your clipboard.');

})();
