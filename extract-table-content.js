/**
 * ========================================
 * TABLE CONTENT EXTRACTION SCRIPT (ContentData)
 * ========================================
 * 
 * HƯỚNG DẪN SỬ DỤNG:
 * 1. Mở website: https://dtnam-oss.github.io/tai-lieu-phan-phoi/
 * 2. Mở Console (F12 → Console tab)
 * 3. Copy toàn bộ code này và paste vào Console
 * 4. Nhấn Enter để chạy
 * 5. Script sẽ extract:
 *    - Toàn bộ nội dung cells trong tất cả bảng
 *    - Cả plain text và HTML formatted
 *    - Header columns (Bộ phận thực hiện, Nội dung...)
 * 6. Copy kết quả → Paste vào Google Sheet "ContentData"
 * 
 * OUTPUT FORMAT:
 * table_id | section_name | row_number | column_name | content_text | content_html
 */

(function() {
    'use strict';

    console.log('🚀 Starting Table Content Extraction (ContentData)...');
    console.log('='.repeat(80));

    let tableCounter = 0;

    // Get section name from closest h3 heading
    function findClosestHeading(element) {
        let current = element;
        while (current && current !== document.body) {
            current = current.previousElementSibling;
            if (current && current.tagName === 'H3') {
                return current;
            }
        }
        // Search in parent if not found
        const parent = element.parentElement;
        if (parent) {
            return findClosestHeading(parent);
        }
        return null;
    }

    // Clean and normalize text
    function cleanText(text) {
        return text
            .replace(/\s+/g, ' ')        // Multiple spaces → single space
            .replace(/\n+/g, ' ')        // Newlines → space
            .replace(/\t+/g, ' ')        // Tabs → space
            .trim();
    }

    // Clean HTML but preserve structure
    function cleanHTML(html) {
        return html
            .replace(/\s+/g, ' ')        // Normalize spaces
            .replace(/>\s+</g, '><')     // Remove spaces between tags
            .trim();
    }

    // Generate table ID
    function generateTableId(sectionName, index) {
        const sectionKey = sectionName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return `table-${sectionKey}-${String(index).padStart(2, '0')}`;
    }

    // Extract all tables
    function extractTableContent() {
        const tables = document.querySelectorAll('.simple-table');
        const results = [];
        let totalCells = 0;

        console.log(`\n📊 Found ${tables.length} tables to process\n`);

        tables.forEach((table, tableIndex) => {
            tableCounter++;

            // Find section heading
            const heading = findClosestHeading(table);
            const sectionName = heading ? heading.textContent.trim() : 'Không xác định';

            // Generate or use existing table ID
            const tableId = table.id || generateTableId(sectionName, tableCounter);
            if (!table.id) {
                table.id = tableId; // Assign ID to table
            }

            console.log(`\nTable ${tableCounter}: ${tableId}`);
            console.log(`  Section: ${sectionName}`);

            // Get table structure
            const thead = table.querySelector('thead');
            const tbody = table.querySelector('tbody');

            if (!tbody) {
                console.warn(`  ⚠️ No tbody found, skipping`);
                return;
            }

            // Extract header columns
            const headers = [];
            if (thead) {
                const headerCells = thead.querySelectorAll('th');
                headerCells.forEach(th => {
                    headers.push(cleanText(th.textContent));
                });
            }

            console.log(`  Columns: ${headers.join(' | ')}`);

            // Extract all body rows
            const rows = tbody.querySelectorAll('tr');
            console.log(`  Rows: ${rows.length}`);

            rows.forEach((row, rowIndex) => {
                const rowNumber = rowIndex + 1;
                const cells = row.querySelectorAll('td');

                cells.forEach((cell, cellIndex) => {
                    const columnName = headers[cellIndex] || `Column_${cellIndex + 1}`;
                    const contentText = cleanText(cell.textContent);
                    const contentHtml = cleanHTML(cell.innerHTML);

                    // Skip empty cells
                    if (!contentText || contentText.length < 2) return;

                    results.push({
                        table_id: tableId,
                        section_name: sectionName,
                        row_number: rowNumber,
                        column_name: columnName,
                        content_text: contentText,
                        content_html: contentHtml
                    });

                    totalCells++;
                });
            });

            console.log(`  ✓ Extracted ${rows.length} rows`);
        });

        console.log(`\n✅ Total cells extracted: ${totalCells}`);
        return results;
    }

    // Convert to CSV format (TSV for Google Sheets)
    function convertToCSV(data) {
        const header = 'table_id\tsection_name\trow_number\tcolumn_name\tcontent_text\tcontent_html\n';
        const rows = data.map(row => {
            return [
                row.table_id,
                row.section_name,
                row.row_number,
                row.column_name,
                row.content_text.replace(/\t/g, '    '), // Replace tabs with spaces
                row.content_html.replace(/\t/g, '    ')
            ].join('\t');
        });

        return header + rows.join('\n');
    }

    // Generate summary statistics
    function generateStatistics(data) {
        const stats = {
            totalTables: new Set(data.map(d => d.table_id)).size,
            totalRows: data.length,
            bySections: {},
            byTables: {},
            byColumns: {}
        };

        data.forEach(row => {
            // By section
            stats.bySections[row.section_name] = (stats.bySections[row.section_name] || 0) + 1;

            // By table
            stats.byTables[row.table_id] = (stats.byTables[row.table_id] || 0) + 1;

            // By column
            stats.byColumns[row.column_name] = (stats.byColumns[row.column_name] || 0) + 1;
        });

        return stats;
    }

    // Main execution
    console.log('🔍 Extracting content from all tables...');
    const extractedData = extractTableContent();

    if (extractedData.length === 0) {
        console.error('❌ No table content found! Check if tables exist.');
        return;
    }

    const csvOutput = convertToCSV(extractedData);
    const stats = generateStatistics(extractedData);

    console.log('\n' + '='.repeat(80));
    console.log('✅ EXTRACTION COMPLETE!');
    console.log('='.repeat(80));

    // Display statistics
    console.log(`\n📊 STATISTICS:`);
    console.log(`  Total tables: ${stats.totalTables}`);
    console.log(`  Total cells: ${stats.totalRows}`);
    console.log(`  Average cells per table: ${Math.round(stats.totalRows / stats.totalTables)}`);

    console.log(`\n📂 BY SECTION:`);
    Object.entries(stats.bySections)
        .sort((a, b) => b[1] - a[1])
        .forEach(([section, count]) => {
            console.log(`  ${section}: ${count} cells`);
        });

    console.log(`\n📋 BY TABLE:`);
    Object.entries(stats.byTables)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([table, count]) => {
            console.log(`  ${table}: ${count} cells`);
        });

    console.log(`\n🏷️ BY COLUMN:`);
    Object.entries(stats.byColumns)
        .sort((a, b) => b[1] - a[1])
        .forEach(([column, count]) => {
            console.log(`  ${column}: ${count} cells`);
        });

    console.log('\n📤 CSV OUTPUT:\n');

    // Try clipboard API first
    navigator.clipboard.writeText(csvOutput).then(() => {
        console.log('✅ CSV data copied to clipboard automatically!');
        console.log('📋 Just paste into Google Sheets (Cmd+V or Ctrl+V)');
    }).catch(err => {
        // Fallback: Create downloadable link
        console.warn('⚠️ Clipboard API blocked. Using alternative method...\n');
        
        // Method 1: Create download link
        const blob = new Blob([csvOutput], { type: 'text/tab-separated-values' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content-data.tsv';
        a.textContent = 'Download ContentData.tsv';
        a.style.cssText = 'display:block;padding:10px;background:#00ab56;color:white;text-decoration:none;margin:10px 0;border-radius:5px;width:200px;text-align:center;';
        
        console.log('📥 DOWNLOAD LINK CREATED:');
        console.log('Click the link below to download, then open in Google Sheets:');
        console.log(a);
        document.body.appendChild(a);
        
        // Method 2: Show in console for manual copy
        console.log('\n📋 OR COPY MANUALLY (click to expand):');
        console.log('---START CSV DATA---');
        console.log(csvOutput);
        console.log('---END CSV DATA---');
        
        console.log('\n💡 MANUAL COPY STEPS:');
        console.log('1. Expand "---START CSV DATA---" above');
        console.log('2. Select all text (triple-click or Cmd+A)');
        console.log('3. Copy (Cmd+C or Ctrl+C)');
        console.log('4. Paste into Google Sheets cell A1');
    });

    // Show next steps regardless
    setTimeout(() => {
        console.log('\n📝 NEXT STEPS:');
        console.log('1. Open Google Sheets');
        console.log('2. Create new sheet or tab named "ContentData"');
        console.log('3. Select cell A1');
        console.log('4. Paste with Cmd+V (Mac) or Ctrl+V (Windows)');
        console.log('5. Data will be automatically separated into columns');
        console.log('\n💡 COLUMN STRUCTURE:');
        console.log('  A: table_id       - Unique ID của bảng');
        console.log('  B: section_name   - Tên section (1. ONBOARD...)');
        console.log('  C: row_number     - Số thứ tự row');
        console.log('  D: column_name    - Tên cột (Bộ phận thực hiện...)');
        console.log('  E: content_text   - Text thuần (no HTML)');
        console.log('  F: content_html   - HTML formatted');
    }, 100);

    // Store data globally for inspection
    window.extractedContentData = extractedData;
    window.contentStats = stats;
    console.log('\n🔍 Data stored in:');
    console.log('  - window.extractedContentData (array)');
    console.log('  - window.contentStats (statistics)');

    // Helper functions for inspection
    console.log('\n🛠️ HELPER FUNCTIONS:');
    console.log('  // View specific table:');
    console.log('  window.extractedContentData.filter(d => d.table_id === "table-onboard-01")');
    console.log('\n  // View specific section:');
    console.log('  window.extractedContentData.filter(d => d.section_name.includes("ONBOARD"))');
    console.log('\n  // View specific column:');
    console.log('  window.extractedContentData.filter(d => d.column_name === "Nội dung")');
    console.log('\n  // Count rows per table:');
    console.log('  console.table(window.contentStats.byTables)');

    console.log('\n🎉 Done! Check your clipboard and paste into Google Sheets.');

})();
