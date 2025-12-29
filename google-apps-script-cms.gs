/**
 * ============================================
 * CMS BACKEND - Google Apps Script
 * Content Management System API
 * ============================================
 * 
 * Deploy: Web App → Execute as: Me → Access: Anyone
 * Copy Web App URL và thêm vào CONFIG.CMS_API_URL trong index.html
 */

// Configuration
const CONFIG = {
  SHEET_ID: '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4',
  ADMIN_EMAILS: [
    'admin@example.com',
    'dtnamtoday@gmail.com'
  ]
};

/**
 * Handle POST requests
 * Actions: update_content
 */
function doPost(e) {
  try {
    // Parse request body - Handle both JSON and form-urlencoded
    let params;
    
    if (e.postData && e.postData.contents) {
      // Try JSON first
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        // If JSON fails, try form-urlencoded
        const formData = e.parameter;
        if (formData && formData.payload) {
          params = JSON.parse(formData.payload);
        } else {
          params = formData;
        }
      }
    } else if (e.parameter) {
      // Form data
      if (e.parameter.payload) {
        params = JSON.parse(e.parameter.payload);
      } else {
        params = e.parameter;
      }
    }
    
    if (!params) {
      return jsonResponse({
        success: false,
        error: 'No parameters received'
      });
    }
    
    const action = params.action;
    
    // Verify admin (optional - có thể verify email từ params)
    if (params.user_email && !isAdmin(params.user_email)) {
      return jsonResponse({
        success: false,
        error: 'Unauthorized: Admin access required'
      });
    }
    
    // Route actions
    switch (action) {
      case 'update_content':
        return handleUpdateContent(params);
      
      case 'batch_update':
        return handleBatchUpdate(params);
        
      default:
        return jsonResponse({
          success: false,
          error: 'Invalid action: ' + action
        });
    }
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return jsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Handle update single content
 * @param {Object} params - {sheet_name, id, column_name, new_value}
 */
function handleUpdateContent(params) {
  const { sheet_name, id, column_name, new_value } = params;
  
  // Validate required fields
  if (!sheet_name || !id || !column_name) {
    return jsonResponse({
      success: false,
      error: 'Missing required fields: sheet_name, id, column_name'
    });
  }
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(sheet_name);
    
    if (!sheet) {
      return jsonResponse({
        success: false,
        error: 'Sheet not found: ' + sheet_name
      });
    }
    
    // Update row
    const result = updateRow(sheet, id, column_name, new_value);
    
    if (result.success) {
      // Clear cache (optional - trigger re-fetch)
      return jsonResponse({
        success: true,
        message: 'Updated successfully',
        updated: {
          sheet: sheet_name,
          id: id,
          column: column_name,
          value: new_value
        }
      });
    } else {
      return jsonResponse(result);
    }
    
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * Update a single row in sheet
 * @param {Sheet} sheet - Google Sheet object
 * @param {string} id - Row identifier (id_the, table_id, etc.)
 * @param {string} columnName - Column header name
 * @param {string} newValue - New value to set
 */
function updateRow(sheet, id, columnName, newValue) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column index by name
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) {
    return {
      success: false,
      error: 'Column not found: ' + columnName
    };
  }
  
  // Find ID column (try common names)
  let idColIndex = headers.indexOf('id_the');
  if (idColIndex === -1) idColIndex = headers.indexOf('table_id');
  if (idColIndex === -1) idColIndex = headers.indexOf('id');
  
  if (idColIndex === -1) {
    return {
      success: false,
      error: 'ID column not found (tried: id_the, table_id, id)'
    };
  }
  
  // Find row with matching ID
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColIndex] === id) {
      // Update cell
      sheet.getRange(i + 1, colIndex + 1).setValue(newValue);
      
      // Add timestamp (if timestamp column exists)
      const timestampColIndex = headers.indexOf('last_modified');
      if (timestampColIndex !== -1) {
        sheet.getRange(i + 1, timestampColIndex + 1).setValue(new Date());
      }
      
      return {
        success: true,
        row: i + 1,
        updated_at: new Date().toISOString()
      };
    }
  }
  
  return {
    success: false,
    error: 'Row not found with id: ' + id
  };
}

/**
 * Handle batch update (multiple rows at once)
 * @param {Object} params - {updates: [{sheet_name, id, column_name, new_value}]}
 */
function handleBatchUpdate(params) {
  const { updates } = params;
  
  if (!updates || !Array.isArray(updates)) {
    return jsonResponse({
      success: false,
      error: 'Invalid updates array'
    });
  }
  
  const results = [];
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  
  updates.forEach(update => {
    try {
      const sheet = ss.getSheetByName(update.sheet_name);
      if (!sheet) {
        results.push({
          success: false,
          id: update.id,
          error: 'Sheet not found'
        });
        return;
      }
      
      const result = updateRow(sheet, update.id, update.column_name, update.new_value);
      results.push({
        ...result,
        id: update.id
      });
      
    } catch (error) {
      results.push({
        success: false,
        id: update.id,
        error: error.toString()
      });
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  
  return jsonResponse({
    success: true,
    total: updates.length,
    succeeded: successCount,
    failed: updates.length - successCount,
    results: results
  });
}

/**
 * Check if email is admin
 */
function isAdmin(email) {
  return CONFIG.ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Return JSON response with CORS headers
 */
function jsonResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  return output;
}

/**
 * Handle GET requests (optional - for testing)
 * ROUTING:
 * - No action / action=get_content → Return video/content data
 * - action=status → Return API status
 */
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action;
  
  // ROUTE 1: API Status Check
  if (action === 'status') {
    return jsonResponse({
      status: 'CMS API is running',
      version: '1.0.0',
      endpoints: {
        GET: {
          get_content: 'Get videos/content data (default)',
          status: 'Check API status'
        },
        POST: {
          update_content: 'Update single cell',
          batch_update: 'Update multiple cells'
        }
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // ROUTE 2: Get Content/Video Data (DEFAULT)
  // This is the default behavior to maintain compatibility
  try {
    Logger.log('GET request - Returning video/content data');
    
    const videos = getVideosFromSheet();
    
    return jsonResponse({
      success: true,
      data: videos,
      timestamp: new Date().toISOString(),
      source: 'google-apps-script'
    });
    
  } catch (error) {
    Logger.log('Error fetching videos: ' + error.toString());
    return jsonResponse({
      success: false,
      error: error.toString(),
      message: 'Failed to fetch video data',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Get video data from Google Sheets
 * Reads from VideoData sheet
 */
function getVideosFromSheet() {
  try {
    const SHEET_NAME = 'VideoData';
    
    Logger.log('Fetching videos from sheet: ' + SHEET_NAME);
    
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log('No video data found (only headers or empty)');
      return [];
    }
    
    const headers = data[0];
    const videos = [];
    
    // Convert rows to objects
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const video = {};
      
      headers.forEach((header, index) => {
        video[header] = row[index];
      });
      
      // Only include non-empty rows
      if (video[headers[0]]) {
        videos.push(video);
      }
    }
    
    Logger.log('Found ' + videos.length + ' videos');
    return videos;
    
  } catch (error) {
    Logger.log('Error in getVideosFromSheet: ' + error.toString());
    throw error;
  }
}
