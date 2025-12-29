/**
 * ============================================
 * NOTION API SYNC MODULE
 * Tự động đồng bộ dữ liệu từ Notion → Google Sheets
 * ============================================
 * 
 * WORKFLOW AN TOÀN:
 * 1. Backup dữ liệu hiện tại
 * 2. Fetch data từ Notion API
 * 3. Parse thành ContentData và MasterData format
 * 4. Validate dữ liệu mới
 * 5. Update Google Sheets
 * 6. Verify tính toàn vẹn
 * 7. Rollback nếu có lỗi
 * 
 * SETUP REQUIREMENTS:
 * 1. Notion Integration: https://www.notion.so/my-integrations
 * 2. Share Notion page với Integration
 * 3. Lấy Page ID từ Notion URL
 * 4. Configure NOTION_CONFIG bên dưới
 */

// ============================================
// NOTION CONFIGURATION
// ============================================

const NOTION_CONFIG = {
  // TODO: Thay bằng Notion Integration Token của bạn
  // Lấy tại: https://www.notion.so/my-integrations
  API_TOKEN: 'secret_YOUR_NOTION_INTEGRATION_TOKEN',
  
  // TODO: Thay bằng Notion Page ID của bạn
  // Format: 32 ký tự hex (ví dụ: 123e4567e89b12d3a456426614174000)
  // Lấy từ URL: notion.so/PAGE_TITLE-123e4567e89b12d3a456426614174000
  PAGE_ID: 'YOUR_NOTION_PAGE_ID',
  
  // Notion API endpoints
  API_BASE: 'https://api.notion.com/v1',
  API_VERSION: '2022-06-28'
};

const SHEETS_CONFIG = {
  SHEET_ID: '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4',
  MASTER_DATA_SHEET: 'MasterData',
  CONTENT_DATA_SHEET: 'ContentData',
  BACKUP_SUFFIX: '_Backup',
  LOG_SHEET: 'Sync_Log'
};

// ============================================
// 1. NOTION API CLIENT
// ============================================

/**
 * Fetch Notion page content với all child blocks
 * 
 * @param {string} pageId - Notion Page ID
 * @returns {Object} Page object with blocks
 */
function fetchNotionPage(pageId) {
  try {
    logSync('FETCH_START', { pageId: pageId });
    
    // Fetch page metadata
    const pageUrl = `${NOTION_CONFIG.API_BASE}/pages/${pageId}`;
    const pageResponse = makeNotionRequest(pageUrl);
    
    if (!pageResponse || !pageResponse.id) {
      throw new Error('Failed to fetch page metadata');
    }
    
    // Fetch all child blocks (recursive để lấy nested content)
    const blocks = fetchAllBlocks(pageId);
    
    logSync('FETCH_SUCCESS', {
      pageId: pageId,
      blockCount: blocks.length,
      pageTitle: extractPageTitle(pageResponse)
    });
    
    return {
      page: pageResponse,
      blocks: blocks,
      fetchedAt: new Date().toISOString()
    };
    
  } catch (error) {
    logSync('FETCH_ERROR', { error: error.toString() });
    throw error;
  }
}

/**
 * Fetch all child blocks (recursive)
 * 
 * @param {string} blockId - Parent block ID
 * @returns {Array} All blocks including nested children
 */
function fetchAllBlocks(blockId) {
  const allBlocks = [];
  let hasMore = true;
  let startCursor = undefined;
  
  while (hasMore) {
    const url = `${NOTION_CONFIG.API_BASE}/blocks/${blockId}/children` +
                (startCursor ? `?start_cursor=${startCursor}` : '');
    
    const response = makeNotionRequest(url);
    
    if (!response || !response.results) {
      break;
    }
    
    // Add blocks to results
    allBlocks.push(...response.results);
    
    // Fetch children recursively nếu block có has_children = true
    response.results.forEach(block => {
      if (block.has_children) {
        const children = fetchAllBlocks(block.id);
        // Gán children vào block để dễ parse sau
        block.children = children;
      }
    });
    
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }
  
  return allBlocks;
}

/**
 * Make authenticated request to Notion API
 * 
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PATCH)
 * @param {Object} payload - Request body (optional)
 * @returns {Object} Response JSON
 */
function makeNotionRequest(url, method = 'GET', payload = null) {
  const options = {
    method: method,
    headers: {
      'Authorization': `Bearer ${NOTION_CONFIG.API_TOKEN}`,
      'Notion-Version': NOTION_CONFIG.API_VERSION,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };
  
  if (payload) {
    options.payload = JSON.stringify(payload);
  }
  
  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  
  if (statusCode !== 200) {
    const errorBody = response.getContentText();
    throw new Error(`Notion API error (${statusCode}): ${errorBody}`);
  }
  
  return JSON.parse(response.getContentText());
}

/**
 * Extract page title từ page object
 */
function extractPageTitle(pageResponse) {
  try {
    const titleProperty = pageResponse.properties?.title || pageResponse.properties?.Name;
    if (titleProperty && titleProperty.title && titleProperty.title.length > 0) {
      return titleProperty.title.map(t => t.plain_text).join('');
    }
    return 'Untitled';
  } catch (error) {
    return 'Unknown';
  }
}

// ============================================
// 2. NOTION CONTENT PARSER
// ============================================

/**
 * Parse Notion blocks thành ContentData format
 * 
 * ContentData format:
 * - table_id: string (ví dụ: "table-1", "table-2")
 * - section_name: string (tên section chứa table)
 * - row_num: number (số thứ tự row trong table, 1-based)
 * - column_name: string (tên cột: "Bộ phận thực hiện", "Nội dung")
 * - content_text: string (plain text, no HTML)
 * - content_html: string (formatted HTML with highlights)
 * 
 * @param {Array} blocks - Array of Notion blocks
 * @returns {Array} ContentData rows
 */
function parseContentData(blocks) {
  const contentData = [];
  let currentSection = 'Unknown Section';
  let tableCounter = 0;
  
  blocks.forEach((block, blockIndex) => {
    const type = block.type;
    
    // Track current section (heading_1, heading_2, heading_3)
    if (type.startsWith('heading_')) {
      currentSection = extractPlainText(block[type]);
    }
    
    // Parse table blocks
    if (type === 'table') {
      tableCounter++;
      const tableId = `table-${tableCounter}`;
      const tableRows = parseTableBlock(block, tableId, currentSection);
      contentData.push(...tableRows);
    }
  });
  
  logSync('PARSE_CONTENT', {
    totalRows: contentData.length,
    tableCount: tableCounter
  });
  
  return contentData;
}

/**
 * Parse single table block thành rows
 * 
 * @param {Object} tableBlock - Notion table block
 * @param {string} tableId - Table ID (table-1, table-2, etc.)
 * @param {string} sectionName - Section name
 * @returns {Array} ContentData rows
 */
function parseTableBlock(tableBlock, tableId, sectionName) {
  const rows = [];
  
  // Table có children = array of table_row blocks
  const tableRows = tableBlock.children || [];
  const hasColumnHeader = tableBlock.table?.has_column_header || false;
  
  // Row đầu tiên là header (nếu has_column_header = true)
  const headerRow = hasColumnHeader && tableRows.length > 0 ? tableRows[0] : null;
  const columnNames = headerRow ? extractTableRowCells(headerRow) : [];
  
  // Parse data rows (skip header)
  const dataRows = hasColumnHeader ? tableRows.slice(1) : tableRows;
  
  dataRows.forEach((rowBlock, rowIndex) => {
    const cells = extractTableRowCells(rowBlock);
    
    cells.forEach((cellContent, colIndex) => {
      const columnName = columnNames[colIndex] || `Column ${colIndex + 1}`;
      
      rows.push({
        table_id: tableId,
        section_name: sectionName,
        row_num: rowIndex + 1, // 1-based
        column_name: columnName,
        content_text: extractPlainText(cellContent),
        content_html: convertRichTextToHTML(cellContent)
      });
    });
  });
  
  return rows;
}

/**
 * Extract cells from table_row block
 * 
 * @param {Object} rowBlock - table_row block
 * @returns {Array} Array of rich_text arrays (one per cell)
 */
function extractTableRowCells(rowBlock) {
  return rowBlock.table_row?.cells || [];
}

/**
 * Parse Notion blocks thành MasterData format
 * 
 * MasterData format:
 * - hang_muc: string (section category: "CẤU HÌNH", "ĐĂNG ĐƠN", "VẬN HÀNH")
 * - id_the: string (unique ID: "term-code-001", "term-code-002")
 * - ten_the: string (term name: tên thuật ngữ được highlight)
 * - url: string (image URL)
 * 
 * LOGIC:
 * - Quét toàn bộ blocks tìm rich_text có annotations (color/bold/highlight)
 * - Chỉ lấy các term có màu: red, blue, yellow, green, purple, etc.
 * - Generate unique ID cho mỗi term
 * - Extract image URL từ image blocks (nếu có)
 * 
 * @param {Array} blocks - Array of Notion blocks
 * @returns {Array} MasterData rows
 */
function parseMasterData(blocks) {
  const masterData = [];
  let currentSection = 'Unknown Section';
  let termCounter = 0;
  
  blocks.forEach((block) => {
    const type = block.type;
    
    // Track current section
    if (type.startsWith('heading_')) {
      const headingText = extractPlainText(block[type]);
      // Classify section dựa trên keywords
      currentSection = classifySection(headingText);
    }
    
    // Extract highlighted terms từ tất cả block types có rich_text
    const richTextBlocks = getRichTextFromBlock(block);
    
    richTextBlocks.forEach(richTextArray => {
      richTextArray.forEach(richText => {
        // Check if text có annotation (color hoặc highlight)
        const annotations = richText.annotations || {};
        const hasColor = annotations.color && annotations.color !== 'default';
        const isBold = annotations.bold;
        const isHighlighted = hasColor || isBold;
        
        if (isHighlighted && richText.plain_text.trim()) {
          termCounter++;
          
          masterData.push({
            hang_muc: currentSection,
            id_the: `term-code-${String(termCounter).padStart(3, '0')}`,
            ten_the: richText.plain_text.trim(),
            url: '' // TODO: Implement image matching logic nếu có
          });
        }
      });
    });
  });
  
  logSync('PARSE_MASTER', {
    totalTerms: masterData.length,
    sections: [...new Set(masterData.map(t => t.hang_muc))]
  });
  
  return masterData;
}

/**
 * Classify section thành categories (CẤU HÌNH, ĐĂNG ĐƠN, VẬN HÀNH, etc.)
 */
function classifySection(headingText) {
  const text = headingText.toLowerCase();
  
  if (text.includes('cấu hình') || text.includes('config')) return 'CẤU HÌNH';
  if (text.includes('đăng đơn') || text.includes('order')) return 'ĐĂNG ĐƠN';
  if (text.includes('vận hành') || text.includes('operation')) return 'VẬN HÀNH';
  if (text.includes('báo cáo') || text.includes('report')) return 'BÁO CÁO';
  if (text.includes('khách hàng') || text.includes('customer')) return 'KHÁCH HÀNG';
  
  return 'KHÁC';
}

/**
 * Extract rich_text arrays từ bất kỳ block type nào
 * 
 * @param {Object} block - Notion block
 * @returns {Array} Array of rich_text arrays
 */
function getRichTextFromBlock(block) {
  const type = block.type;
  const richTextArrays = [];
  
  // Paragraph, heading, quote, callout, bulleted_list_item, numbered_list_item
  if (block[type]?.rich_text) {
    richTextArrays.push(block[type].rich_text);
  }
  
  // Table cells
  if (type === 'table_row' && block.table_row?.cells) {
    richTextArrays.push(...block.table_row.cells);
  }
  
  // Toggle, child_page có thể có rich_text
  if (block[type]?.text) {
    richTextArrays.push([block[type].text]);
  }
  
  return richTextArrays;
}

/**
 * Extract plain text từ rich_text array hoặc block
 * 
 * @param {Array|Object} richTextOrBlock - Rich text array hoặc block object
 * @returns {string} Plain text
 */
function extractPlainText(richTextOrBlock) {
  // Nếu là array (rich_text)
  if (Array.isArray(richTextOrBlock)) {
    return richTextOrBlock.map(rt => rt.plain_text || '').join('');
  }
  
  // Nếu là object có rich_text property
  if (richTextOrBlock?.rich_text) {
    return richTextOrBlock.rich_text.map(rt => rt.plain_text || '').join('');
  }
  
  return '';
}

/**
 * Convert rich_text array sang HTML với formatting
 * 
 * @param {Array} richTextArray - Array of rich_text objects
 * @returns {string} HTML string
 */
function convertRichTextToHTML(richTextArray) {
  if (!Array.isArray(richTextArray)) return '';
  
  return richTextArray.map(richText => {
    let html = richText.plain_text || '';
    const annotations = richText.annotations || {};
    
    // Apply formatting
    if (annotations.bold) html = `<strong>${html}</strong>`;
    if (annotations.italic) html = `<em>${html}</em>`;
    if (annotations.strikethrough) html = `<s>${html}</s>`;
    if (annotations.underline) html = `<u>${html}</u>`;
    if (annotations.code) html = `<code>${html}</code>`;
    
    // Apply color/highlight
    if (annotations.color && annotations.color !== 'default') {
      const colorClass = annotations.color.replace('_background', '-bg');
      html = `<span class="notion-${colorClass}">${html}</span>`;
    }
    
    // Handle links
    if (richText.href) {
      html = `<a href="${richText.href}" target="_blank">${html}</a>`;
    }
    
    return html;
  }).join('');
}

// ============================================
// 3. BACKUP & ROLLBACK SYSTEM
// ============================================

/**
 * Backup sheet trước khi update
 * 
 * @param {string} sheetName - Tên sheet cần backup
 * @returns {Object} Backup info
 */
function backupSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SHEETS_CONFIG.SHEET_ID);
    const sourceSheet = ss.getSheetByName(sheetName);
    
    if (!sourceSheet) {
      throw new Error(`Sheet không tồn tại: ${sheetName}`);
    }
    
    const backupName = `${sheetName}${SHEETS_CONFIG.BACKUP_SUFFIX}`;
    const timestamp = Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss');
    
    // Delete old backup nếu tồn tại
    const oldBackup = ss.getSheetByName(backupName);
    if (oldBackup) {
      ss.deleteSheet(oldBackup);
    }
    
    // Copy sheet
    const backupSheet = sourceSheet.copyTo(ss);
    backupSheet.setName(backupName);
    
    // Add timestamp vào cell A1
    backupSheet.getRange('A1').setNote(`Backup created: ${timestamp}`);
    
    const rowCount = sourceSheet.getLastRow();
    
    logSync('BACKUP_SUCCESS', {
      sheetName: sheetName,
      backupName: backupName,
      rowCount: rowCount,
      timestamp: timestamp
    });
    
    return {
      success: true,
      sheetName: sheetName,
      backupName: backupName,
      rowCount: rowCount,
      timestamp: timestamp
    };
    
  } catch (error) {
    logSync('BACKUP_ERROR', { sheetName: sheetName, error: error.toString() });
    throw error;
  }
}

/**
 * Rollback từ backup
 * 
 * @param {string} sheetName - Tên sheet cần restore
 * @returns {Object} Rollback info
 */
function rollbackFromBackup(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SHEETS_CONFIG.SHEET_ID);
    const backupName = `${sheetName}${SHEETS_CONFIG.BACKUP_SUFFIX}`;
    const backupSheet = ss.getSheetByName(backupName);
    
    if (!backupSheet) {
      throw new Error(`Backup không tồn tại: ${backupName}`);
    }
    
    // Delete current sheet
    const currentSheet = ss.getSheetByName(sheetName);
    if (currentSheet) {
      ss.deleteSheet(currentSheet);
    }
    
    // Restore từ backup
    const restoredSheet = backupSheet.copyTo(ss);
    restoredSheet.setName(sheetName);
    
    const rowCount = restoredSheet.getLastRow();
    
    logSync('ROLLBACK_SUCCESS', {
      sheetName: sheetName,
      rowCount: rowCount
    });
    
    return {
      success: true,
      sheetName: sheetName,
      rowCount: rowCount
    };
    
  } catch (error) {
    logSync('ROLLBACK_ERROR', { sheetName: sheetName, error: error.toString() });
    throw error;
  }
}

/**
 * Verify data integrity sau khi update
 * 
 * @param {string} sheetName - Tên sheet
 * @param {number} expectedMinRows - Số rows tối thiểu mong đợi
 * @returns {Object} Verification result
 */
function verifyDataIntegrity(sheetName, expectedMinRows = 1) {
  try {
    const ss = SpreadsheetApp.openById(SHEETS_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return {
        success: false,
        error: `Sheet không tồn tại: ${sheetName}`
      };
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    // Check: có ít nhất expectedMinRows rows
    if (lastRow < expectedMinRows) {
      return {
        success: false,
        error: `Không đủ dữ liệu: ${lastRow} rows (expected >= ${expectedMinRows})`
      };
    }
    
    // Check: header row exists (row 1)
    const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const hasValidHeader = headerRow.some(cell => cell && String(cell).trim() !== '');
    
    if (!hasValidHeader) {
      return {
        success: false,
        error: 'Header row rỗng hoặc không hợp lệ'
      };
    }
    
    // Check: không có duplicate IDs (nếu có cột id_the hoặc table_id)
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idColIndex = headers.findIndex(h => h === 'id_the' || h === 'table_id');
    
    if (idColIndex >= 0) {
      const ids = allData.slice(1).map(row => row[idColIndex]).filter(id => id);
      const uniqueIds = new Set(ids);
      
      if (ids.length !== uniqueIds.size) {
        return {
          success: false,
          error: `Có duplicate IDs: ${ids.length} IDs, ${uniqueIds.size} unique`
        };
      }
    }
    
    logSync('VERIFY_SUCCESS', {
      sheetName: sheetName,
      rowCount: lastRow,
      columnCount: lastCol
    });
    
    return {
      success: true,
      sheetName: sheetName,
      rowCount: lastRow,
      columnCount: lastCol
    };
    
  } catch (error) {
    logSync('VERIFY_ERROR', { sheetName: sheetName, error: error.toString() });
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// 4. DATA VALIDATION
// ============================================

/**
 * Validate parsed data trước khi update
 * 
 * @param {Array} data - Array of objects
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
function validateParsedData(data, requiredFields) {
  const errors = [];
  
  // Check: data không rỗng
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('Data array rỗng hoặc không hợp lệ');
    return { success: false, errors: errors };
  }
  
  // Check: mỗi row có đủ required fields
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row.hasOwnProperty(field) || row[field] === null || row[field] === undefined) {
        errors.push(`Row ${index + 1}: Thiếu field "${field}"`);
      }
    });
  });
  
  // Check: không có row hoàn toàn rỗng
  const emptyRows = data.filter(row => {
    return Object.values(row).every(val => !val || String(val).trim() === '');
  });
  
  if (emptyRows.length > 0) {
    errors.push(`Có ${emptyRows.length} rows rỗng`);
  }
  
  if (errors.length > 0) {
    logSync('VALIDATE_FAILED', { errorCount: errors.length, errors: errors.slice(0, 5) });
    return { success: false, errors: errors };
  }
  
  logSync('VALIDATE_SUCCESS', { rowCount: data.length });
  return { success: true, rowCount: data.length };
}

// ============================================
// 5. SHEET UPDATE FUNCTIONS
// ============================================

/**
 * Update ContentData sheet với parsed data
 * 
 * @param {Array} contentData - Array of ContentData objects
 * @returns {Object} Update result
 */
function updateContentDataSheet(contentData) {
  try {
    // Validate
    const validation = validateParsedData(contentData, [
      'table_id', 'section_name', 'row_num', 'column_name', 'content_text', 'content_html'
    ]);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validation.errors
      };
    }
    
    // Backup
    const backup = backupSheet(SHEETS_CONFIG.CONTENT_DATA_SHEET);
    
    // Clear current data (keep header)
    const ss = SpreadsheetApp.openById(SHEETS_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS_CONFIG.CONTENT_DATA_SHEET);
    
    if (!sheet) {
      throw new Error(`Sheet không tồn tại: ${SHEETS_CONFIG.CONTENT_DATA_SHEET}`);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Convert objects sang 2D array
    const headers = ['table_id', 'section_name', 'row_num', 'column_name', 'content_text', 'content_html'];
    const values = contentData.map(row => headers.map(h => row[h] || ''));
    
    // Write to sheet
    if (values.length > 0) {
      sheet.getRange(2, 1, values.length, headers.length).setValues(values);
    }
    
    // Verify
    const verification = verifyDataIntegrity(SHEETS_CONFIG.CONTENT_DATA_SHEET, 2);
    
    if (!verification.success) {
      // Rollback nếu verify failed
      rollbackFromBackup(SHEETS_CONFIG.CONTENT_DATA_SHEET);
      return {
        success: false,
        error: 'Verification failed, rolled back',
        details: verification.error
      };
    }
    
    logSync('UPDATE_CONTENT_SUCCESS', {
      rowsUpdated: contentData.length,
      backupCreated: backup.backupName
    });
    
    return {
      success: true,
      sheetName: SHEETS_CONFIG.CONTENT_DATA_SHEET,
      rowsUpdated: contentData.length,
      backupCreated: backup.backupName
    };
    
  } catch (error) {
    logSync('UPDATE_CONTENT_ERROR', { error: error.toString() });
    
    // Attempt rollback
    try {
      rollbackFromBackup(SHEETS_CONFIG.CONTENT_DATA_SHEET);
    } catch (rollbackError) {
      // Log rollback error nhưng không throw
      logSync('ROLLBACK_FAILED', { error: rollbackError.toString() });
    }
    
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Update MasterData sheet với parsed data
 * 
 * @param {Array} masterData - Array of MasterData objects
 * @returns {Object} Update result
 */
function updateMasterDataSheet(masterData) {
  try {
    // Validate
    const validation = validateParsedData(masterData, [
      'hang_muc', 'id_the', 'ten_the', 'url'
    ]);
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validation.errors
      };
    }
    
    // Backup
    const backup = backupSheet(SHEETS_CONFIG.MASTER_DATA_SHEET);
    
    // Clear current data (keep header)
    const ss = SpreadsheetApp.openById(SHEETS_CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS_CONFIG.MASTER_DATA_SHEET);
    
    if (!sheet) {
      throw new Error(`Sheet không tồn tại: ${SHEETS_CONFIG.MASTER_DATA_SHEET}`);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Convert objects sang 2D array
    const headers = ['hang_muc', 'id_the', 'ten_the', 'url'];
    const values = masterData.map(row => headers.map(h => row[h] || ''));
    
    // Write to sheet
    if (values.length > 0) {
      sheet.getRange(2, 1, values.length, headers.length).setValues(values);
    }
    
    // Verify
    const verification = verifyDataIntegrity(SHEETS_CONFIG.MASTER_DATA_SHEET, 2);
    
    if (!verification.success) {
      // Rollback nếu verify failed
      rollbackFromBackup(SHEETS_CONFIG.MASTER_DATA_SHEET);
      return {
        success: false,
        error: 'Verification failed, rolled back',
        details: verification.error
      };
    }
    
    logSync('UPDATE_MASTER_SUCCESS', {
      rowsUpdated: masterData.length,
      backupCreated: backup.backupName
    });
    
    return {
      success: true,
      sheetName: SHEETS_CONFIG.MASTER_DATA_SHEET,
      rowsUpdated: masterData.length,
      backupCreated: backup.backupName
    };
    
  } catch (error) {
    logSync('UPDATE_MASTER_ERROR', { error: error.toString() });
    
    // Attempt rollback
    try {
      rollbackFromBackup(SHEETS_CONFIG.MASTER_DATA_SHEET);
    } catch (rollbackError) {
      logSync('ROLLBACK_FAILED', { error: rollbackError.toString() });
    }
    
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// 6. LOGGING SYSTEM
// ============================================

/**
 * Log sync activities vào Sync_Log sheet
 * 
 * @param {string} action - Action name
 * @param {Object} details - Additional details
 */
function logSync(action, details = {}) {
  try {
    const ss = SpreadsheetApp.openById(SHEETS_CONFIG.SHEET_ID);
    let logSheet = ss.getSheetByName(SHEETS_CONFIG.LOG_SHEET);
    
    // Create log sheet nếu chưa tồn tại
    if (!logSheet) {
      logSheet = ss.insertSheet(SHEETS_CONFIG.LOG_SHEET);
      logSheet.appendRow(['Timestamp', 'Action', 'Details', 'Status']);
      logSheet.getRange('1:1').setFontWeight('bold');
    }
    
    const timestamp = new Date().toISOString();
    const detailsStr = JSON.stringify(details);
    const status = action.includes('ERROR') || action.includes('FAILED') ? 'ERROR' : 'OK';
    
    logSheet.appendRow([timestamp, action, detailsStr, status]);
    
    // Keep only last 1000 rows
    const lastRow = logSheet.getLastRow();
    if (lastRow > 1001) {
      logSheet.deleteRows(2, lastRow - 1001);
    }
    
  } catch (error) {
    Logger.log('Failed to write log: ' + error.toString());
  }
}

// ============================================
// 7. MAIN SYNC FUNCTION
// ============================================

/**
 * MAIN FUNCTION: Sync Notion → Google Sheets
 * 
 * WORKFLOW:
 * 1. Fetch data từ Notion API
 * 2. Parse thành ContentData và MasterData
 * 3. Validate data
 * 4. Backup current sheets
 * 5. Update sheets
 * 6. Verify integrity
 * 7. Rollback nếu có lỗi
 * 
 * @returns {Object} Sync result
 */
function syncNotionToSheets() {
  const startTime = new Date();
  
  logSync('SYNC_START', { pageId: NOTION_CONFIG.PAGE_ID });
  
  try {
    // Step 1: Fetch Notion data
    Logger.log('Step 1: Fetching Notion data...');
    const notionData = fetchNotionPage(NOTION_CONFIG.PAGE_ID);
    
    if (!notionData || !notionData.blocks) {
      throw new Error('Failed to fetch Notion data');
    }
    
    // Step 2: Parse ContentData
    Logger.log('Step 2: Parsing ContentData...');
    const contentData = parseContentData(notionData.blocks);
    
    if (contentData.length === 0) {
      throw new Error('No ContentData parsed from Notion');
    }
    
    // Step 3: Parse MasterData
    Logger.log('Step 3: Parsing MasterData...');
    const masterData = parseMasterData(notionData.blocks);
    
    if (masterData.length === 0) {
      throw new Error('No MasterData parsed from Notion');
    }
    
    // Step 4: Update ContentData sheet
    Logger.log('Step 4: Updating ContentData sheet...');
    const contentResult = updateContentDataSheet(contentData);
    
    if (!contentResult.success) {
      throw new Error('Failed to update ContentData: ' + contentResult.error);
    }
    
    // Step 5: Update MasterData sheet
    Logger.log('Step 5: Updating MasterData sheet...');
    const masterResult = updateMasterDataSheet(masterData);
    
    if (!masterResult.success) {
      throw new Error('Failed to update MasterData: ' + masterResult.error);
    }
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    const result = {
      success: true,
      message: 'Sync completed successfully',
      duration: `${duration}s`,
      contentData: {
        rowsUpdated: contentResult.rowsUpdated,
        backup: contentResult.backupCreated
      },
      masterData: {
        rowsUpdated: masterResult.rowsUpdated,
        backup: masterResult.backupCreated
      },
      timestamp: endTime.toISOString()
    };
    
    logSync('SYNC_SUCCESS', result);
    
    Logger.log('✅ SYNC SUCCESS: ' + JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    const result = {
      success: false,
      error: error.toString(),
      duration: `${duration}s`,
      timestamp: endTime.toISOString()
    };
    
    logSync('SYNC_FAILED', result);
    
    Logger.log('❌ SYNC FAILED: ' + JSON.stringify(result, null, 2));
    
    return result;
  }
}

// ============================================
// 8. TESTING & UTILITIES
// ============================================

/**
 * Test Notion API connection
 */
function testNotionConnection() {
  Logger.log('=== Testing Notion API Connection ===');
  
  try {
    const pageData = fetchNotionPage(NOTION_CONFIG.PAGE_ID);
    
    Logger.log('✅ Connection successful!');
    Logger.log('Page ID: ' + pageData.page.id);
    Logger.log('Blocks count: ' + pageData.blocks.length);
    Logger.log('Fetched at: ' + pageData.fetchedAt);
    
    return {
      success: true,
      pageId: pageData.page.id,
      blockCount: pageData.blocks.length
    };
    
  } catch (error) {
    Logger.log('❌ Connection failed: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Test full sync workflow
 */
function testFullSync() {
  Logger.log('=== Testing Full Sync Workflow ===');
  return syncNotionToSheets();
}

/**
 * Manual rollback cho cả 2 sheets
 */
function manualRollback() {
  Logger.log('=== Manual Rollback ===');
  
  try {
    const contentRollback = rollbackFromBackup(SHEETS_CONFIG.CONTENT_DATA_SHEET);
    const masterRollback = rollbackFromBackup(SHEETS_CONFIG.MASTER_DATA_SHEET);
    
    Logger.log('✅ Rollback completed!');
    Logger.log('ContentData: ' + contentRollback.rowCount + ' rows restored');
    Logger.log('MasterData: ' + masterRollback.rowCount + ' rows restored');
    
    return {
      success: true,
      contentData: contentRollback,
      masterData: masterRollback
    };
    
  } catch (error) {
    Logger.log('❌ Rollback failed: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * View sync logs (last 20 entries)
 */
function viewSyncLogs() {
  try {
    const ss = SpreadsheetApp.openById(SHEETS_CONFIG.SHEET_ID);
    const logSheet = ss.getSheetByName(SHEETS_CONFIG.LOG_SHEET);
    
    if (!logSheet) {
      Logger.log('No sync logs found');
      return [];
    }
    
    const lastRow = logSheet.getLastRow();
    const numRows = Math.min(20, lastRow - 1);
    
    if (numRows <= 0) {
      Logger.log('No sync logs found');
      return [];
    }
    
    const logs = logSheet.getRange(lastRow - numRows + 1, 1, numRows, 4).getValues();
    
    Logger.log('=== Last ' + numRows + ' Sync Logs ===');
    logs.forEach((log, index) => {
      Logger.log(`${index + 1}. [${log[0]}] ${log[1]} - ${log[3]}`);
    });
    
    return logs;
    
  } catch (error) {
    Logger.log('Error viewing logs: ' + error.toString());
    return [];
  }
}
