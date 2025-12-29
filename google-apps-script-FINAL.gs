/**
 * ============================================
 * GHTK FINAL BACKEND - Google Apps Script
 * ALL-IN-ONE: Video Database + AI Chatbot + CMS + Auth
 * ============================================
 * 
 * FEATURES:
 * 1. Video Database - Serve video data from VideoData sheet
 * 2. AI Chatbot - Gemini AI integration for Q&A
 * 3. CMS - Content Management System for editing
 * 4. User Authentication - Verify user permissions
 * 
 * DEPLOY INSTRUCTIONS:
 * 1. Open Google Apps Script: Extensions → Apps Script
 * 2. Replace all code with this file
 * 3. Configure:
 *    - Set GEMINI_API_KEY (for AI Chatbot)
 *    - Set SHEET_ID
 *    - Set ADMIN_EMAILS (for CMS)
 * 4. Deploy → New deployment
 * 5. Type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Copy Web App URL to frontend
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Google Sheets
  SHEET_ID: '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4',
  VIDEO_SHEET: 'VideoData',
  MASTER_DATA_SHEET: 'MasterData',
  CONTENT_DATA_SHEET: 'ContentData',
  USER_SHEET: 'UserSetting',
  
  // CMS Admins
  ADMIN_EMAILS: [
    'dtnam@nakvn.com',
    'admin@example.com'
  ],
  
  // Gemini AI (for Chatbot)
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
  GEMINI_MODEL: 'gemini-1.5-flash',
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
};

const SYSTEM_PROMPT = `Bạn là trợ lý AI chuyên nghiệp của GHTK (Giao Hàng Tiết Kiệm).

**Vai trò của bạn:**
- Hỗ trợ người dùng tìm hiểu về quy trình phân phối của GHTK
- Trả lời câu hỏi dựa trên tài liệu được cung cấp
- Cung cấp thông tin chính xác, súc tích và dễ hiểu

**Nguyên tắc trả lời:**
1. **Chính xác**: Chỉ trả lời dựa trên thông tin trong tài liệu được cung cấp
2. **Súc tích**: Trả lời ngắn gọn, đi thẳng vào vấn đề (2-5 câu)
3. **Dễ đọc**: Sử dụng gạch đầu dòng (-) khi liệt kê nhiều điểm
4. **In đậm điểm quan trọng**: Sử dụng **text** để làm nổi bật`;

// ============================================
// MAIN GET HANDLER - ROUTING
// ============================================

/**
 * Handle GET requests with routing
 * Routes: verify_user, status, video data (default)
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const params = e.parameter || {};
    const action = params.action;

    // ROUTE 1: User Authentication
    if (action === 'verify_user') {
      const email = params.email;
      if (!email) {
        return output.setContent(JSON.stringify({
          success: false,
          authorized: false,
          error: 'Email parameter is required'
        }));
      }
      return output.setContent(JSON.stringify(checkUserPermission(email)));
    }

    // ROUTE 2: Health Check / API Status
    if (action === 'status' || action === 'health') {
      return output.setContent(JSON.stringify({
        status: 'ok',
        message: 'GHTK Final Backend is running!',
        features: ['Video Database', 'AI Chatbot', 'CMS', 'User Auth', 'MasterData', 'ContentData'],
        version: '3.0.0',
        timestamp: new Date().toISOString()
      }));
    }

    // ROUTE 3: MasterData (for hover preview / interactive terms)
    if (action === 'get_master_data') {
      Logger.log('GET request - Returning MasterData');
      const masterData = getMasterDataFromSheet();
      
      return output.setContent(JSON.stringify({
        success: true,
        data: masterData,
        timestamp: new Date().toISOString(),
        source: 'google-apps-script'
      }));
    }

    // ROUTE 4: ContentData (for table cells)
    if (action === 'get_content_data') {
      Logger.log('GET request - Returning ContentData');
      const contentData = getContentDataFromSheet();
      
      return output.setContent(JSON.stringify({
        success: true,
        data: contentData,
        timestamp: new Date().toISOString(),
        source: 'google-apps-script'
      }));
    }

    // ROUTE 5: Video Database (DEFAULT for backward compatibility)
    Logger.log('GET request - Returning video data');
    const videos = getVideosFromSheet();
    
    return output.setContent(JSON.stringify({
      success: true,
      data: videos,
      timestamp: new Date().toISOString(),
      source: 'google-apps-script'
    }));

  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return output.setContent(JSON.stringify({
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    }));
  }
}

// ============================================
// MAIN POST HANDLER - ROUTING
// ============================================

/**
 * Handle POST requests with routing
 * Routes: AI Chatbot, CMS updates
 */
function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  let lock;

  try {
    // Acquire lock to prevent race conditions
    lock = LockService.getScriptLock();
    const lockAcquired = lock.tryLock(30000);

    if (!lockAcquired) {
      return output.setContent(JSON.stringify({
        success: false,
        error: 'Server busy, please retry'
      }));
    }

    // Parse request data
    let requestData;
    
    if (e.postData && e.postData.contents) {
      // Try JSON first
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        // Try form-urlencoded (CMS format)
        const formData = e.parameter;
        if (formData && formData.payload) {
          requestData = JSON.parse(formData.payload);
        } else {
          requestData = formData;
        }
      }
    } else if (e.parameter) {
      // Form data
      if (e.parameter.payload) {
        requestData = JSON.parse(e.parameter.payload);
      } else {
        requestData = e.parameter;
      }
    }

    if (!requestData) {
      if (lock) lock.releaseLock();
      return output.setContent(JSON.stringify({
        success: false,
        error: 'No parameters received'
      }));
    }

    // ROUTE 1: AI Chatbot (has question + context)
    if (requestData.question && requestData.context) {
      const result = handleChatbot(requestData);
      if (lock) lock.releaseLock();
      return output.setContent(JSON.stringify(result));
    }

    // ROUTE 2: CMS Operations (has action)
    if (requestData.action) {
      let result;
      
      switch (requestData.action) {
        case 'update_content':
          result = handleCMSUpdate(requestData);
          break;
        case 'batch_update':
          result = handleCMSBatchUpdate(requestData);
          break;
        default:
          result = {
            success: false,
            error: 'Unknown action: ' + requestData.action
          };
      }
      
      if (lock) lock.releaseLock();
      return output.setContent(JSON.stringify(result));
    }

    // ROUTE 3: Unknown request
    if (lock) lock.releaseLock();
    return output.setContent(JSON.stringify({
      success: false,
      error: 'Invalid request format',
      hint: 'For Chatbot: send {question, context}. For CMS: send {action, ...}'
    }));

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    if (lock) {
      try {
        lock.releaseLock();
      } catch (e) {}
    }
    
    return output.setContent(JSON.stringify({
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    }));
  }
}

// ============================================
// VIDEO DATABASE FUNCTIONS
// ============================================

function getVideosFromSheet() {
  try {
    Logger.log('Fetching videos from sheet: ' + CONFIG.VIDEO_SHEET);
    
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.VIDEO_SHEET);
    
    if (!sheet) {
      Logger.log('Sheet not found: ' + CONFIG.VIDEO_SHEET);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log('No data found');
      return [];
    }
    
    const headers = data[0];
    const videos = [];
    
    // Convert rows to video objects
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[0] || row[0].toString().trim() === '') continue;
      
      const video = {};
      headers.forEach((header, index) => {
        video[header] = row[index];
      });
      
      // Add extracted platform info
      const videoUrl = video.Video_URL || '';
      video.platform = extractPlatform(videoUrl);
      video.video_id = extractVideoId(videoUrl, video.platform);
      
      videos.push(video);
    }
    
    Logger.log('Found ' + videos.length + ' videos');
    return videos;
    
  } catch (error) {
    Logger.log('Error in getVideosFromSheet: ' + error.toString());
    return [];
  }
}

function extractPlatform(url) {
  if (!url) return 'unknown';
  url = url.toLowerCase();
  
  if (url.includes('streamable.com')) return 'streamable';
  if (url.includes('cloudinary.com')) return 'cloudinary';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  
  return 'unknown';
}

function extractVideoId(url, platform) {
  if (!url) return '';
  
  try {
    switch (platform) {
      case 'streamable':
        const match = url.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
        return match ? match[1] : '';
      case 'cloudinary':
        const cldMatch = url.match(/upload\/([^/]+)/);
        return cldMatch ? cldMatch[1] : '';
      case 'youtube':
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
        return ytMatch ? ytMatch[1] : '';
      default:
        return '';
    }
  } catch (error) {
    return '';
  }
}

// ============================================
// MASTER DATA FUNCTIONS (Interactive Terms / Hover Preview)
// ============================================

function getMasterDataFromSheet() {
  try {
    Logger.log('Fetching MasterData from sheet: ' + CONFIG.MASTER_DATA_SHEET);
    
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.MASTER_DATA_SHEET);
    
    if (!sheet) {
      Logger.log('Sheet not found: ' + CONFIG.MASTER_DATA_SHEET);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log('No data found in MasterData');
      return [];
    }
    
    const headers = data[0];
    const masterData = [];
    
    // Convert rows to objects
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[0] || row[0].toString().trim() === '') continue;
      
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      
      masterData.push(item);
    }
    
    Logger.log('Found ' + masterData.length + ' MasterData items');
    return masterData;
    
  } catch (error) {
    Logger.log('Error in getMasterDataFromSheet: ' + error.toString());
    return [];
  }
}

// ============================================
// CONTENT DATA FUNCTIONS (Table Cells)
// ============================================

function getContentDataFromSheet() {
  try {
    Logger.log('Fetching ContentData from sheet: ' + CONFIG.CONTENT_DATA_SHEET);
    
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.CONTENT_DATA_SHEET);
    
    if (!sheet) {
      Logger.log('Sheet not found: ' + CONFIG.CONTENT_DATA_SHEET);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log('No data found in ContentData');
      return [];
    }
    
    const headers = data[0];
    const contentData = [];
    
    // Convert rows to objects
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[0] || row[0].toString().trim() === '') continue;
      
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      
      contentData.push(item);
    }
    
    Logger.log('Found ' + contentData.length + ' ContentData items');
    return contentData;
    
  } catch (error) {
    Logger.log('Error in getContentDataFromSheet: ' + error.toString());
    return [];
  }
}

// ============================================
// AI CHATBOT FUNCTIONS
// ============================================

function handleChatbot(requestData) {
  try {
    const question = requestData.question;
    const context = requestData.context;

    if (!question || !context) {
      return {
        success: false,
        error: 'Missing question or context'
      };
    }

    // Check API key
    if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return {
        success: false,
        error: 'Gemini API Key chưa được cấu hình'
      };
    }

    const answer = callGeminiAPI(question, context);

    return {
      success: true,
      answer: answer,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    Logger.log('Error in handleChatbot: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

function callGeminiAPI(question, context) {
  try {
    const prompt = buildPrompt(question, context);
    const url = `${CONFIG.GEMINI_ENDPOINT}?key=${CONFIG.GEMINI_API_KEY}`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      throw new Error(`Gemini API error (${responseCode})`);
    }

    const data = JSON.parse(response.getContentText());

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      }
    }

    throw new Error('Unexpected API response format');

  } catch (error) {
    Logger.log('Error in callGeminiAPI: ' + error.toString());
    return 'Xin lỗi, đã có lỗi xảy ra khi kết nối với AI.\n\nChi tiết: ' + error.toString();
  }
}

function buildPrompt(question, context) {
  const maxContextLength = 10000;
  let limitedContext = context;

  if (context.length > maxContextLength) {
    limitedContext = context.substring(0, maxContextLength) + '... (tài liệu còn tiếp)';
  }

  return `${SYSTEM_PROMPT}

========================================
TÀI LIỆU QUY TRÌNH PHÂN PHỐI GHTK:
========================================

${limitedContext}

========================================
CÂU HỎI TỪ NGƯỜI DÙNG:
========================================

${question}

========================================
YÊU CẦU:
========================================

Hãy trả lời câu hỏi trên dựa vào tài liệu được cung cấp. Nhớ tuân thủ các nguyên tắc đã nêu.`;
}

// ============================================
// CMS FUNCTIONS
// ============================================

function handleCMSUpdate(params) {
  const { sheet_name, id, column_name, new_value, user_email } = params;
  
  // Validate required fields
  if (!sheet_name || !id || !column_name) {
    return {
      success: false,
      error: 'Missing required fields: sheet_name, id, column_name'
    };
  }
  
  // Verify admin
  if (user_email && !CONFIG.ADMIN_EMAILS.includes(user_email.toLowerCase())) {
    return {
      success: false,
      error: 'Unauthorized: Admin access required'
    };
  }
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(sheet_name);
    
    if (!sheet) {
      return {
        success: false,
        error: 'Sheet not found: ' + sheet_name
      };
    }
    
    const result = updateRow(sheet, id, column_name, new_value);
    
    if (result.success) {
      return {
        success: true,
        message: 'Updated successfully',
        updated: {
          sheet: sheet_name,
          id: id,
          column: column_name,
          value: new_value
        }
      };
    } else {
      return result;
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateRow(sheet, id, columnName, newValue) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column index
  const colIndex = headers.indexOf(columnName);
  if (colIndex === -1) {
    return {
      success: false,
      error: 'Column not found: ' + columnName
    };
  }
  
  // Find ID column
  let idColIndex = headers.indexOf('id_the');
  if (idColIndex === -1) idColIndex = headers.indexOf('table_id');
  if (idColIndex === -1) idColIndex = headers.indexOf('id');
  
  if (idColIndex === -1) {
    return {
      success: false,
      error: 'ID column not found'
    };
  }
  
  // Find row with matching ID
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColIndex] === id) {
      sheet.getRange(i + 1, colIndex + 1).setValue(newValue);
      
      // Add timestamp if column exists
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

function handleCMSBatchUpdate(params) {
  const { updates } = params;
  
  if (!updates || !Array.isArray(updates)) {
    return {
      success: false,
      error: 'Invalid updates array'
    };
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
  
  return {
    success: true,
    total: updates.length,
    succeeded: successCount,
    failed: updates.length - successCount,
    results: results
  };
}

// ============================================
// USER AUTHENTICATION FUNCTIONS
// ============================================

function checkUserPermission(email) {
  try {
    if (!email || email.trim() === '') {
      return {
        success: false,
        authorized: false,
        message: 'Email is required'
      };
    }

    // Normalize email
    email = email.trim().toLowerCase();

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.USER_SHEET);

    if (!sheet) {
      return {
        success: false,
        authorized: false,
        message: 'UserSetting sheet not found'
      };
    }

    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return {
        success: false,
        authorized: false,
        message: 'No users configured'
      };
    }

    const headers = data[0];
    const emailColIndex = headers.indexOf('email');
    const nameColIndex = headers.indexOf('ten_nhan_vien');

    if (emailColIndex === -1) {
      return {
        success: false,
        authorized: false,
        message: 'Email column not found in UserSetting'
      };
    }

    // Search for user
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailColIndex];
      
      if (rowEmail && rowEmail.toString().trim().toLowerCase() === email) {
        const userName = nameColIndex !== -1 ? data[i][nameColIndex] : email;
        
        return {
          success: true,
          authorized: true,
          email: email,
          userName: userName,
          message: 'User authorized',
          timestamp: new Date().toISOString()
        };
      }
    }

    // User not found
    return {
      success: true,
      authorized: false,
      message: 'User not found in system',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    Logger.log('Error in checkUserPermission: ' + error.toString());
    return {
      success: false,
      authorized: false,
      error: error.toString(),
      message: 'Error checking user permission'
    };
  }
}

// ============================================
// TESTING FUNCTIONS (Run in Script Editor)
// ============================================

function testVideoAPI() {
  Logger.log('=== Testing Video API ===');
  const videos = getVideosFromSheet();
  Logger.log('Found ' + videos.length + ' videos');
  if (videos.length > 0) {
    Logger.log('Sample: ' + JSON.stringify(videos[0]));
  }
}

function testMasterData() {
  Logger.log('=== Testing MasterData API ===');
  const masterData = getMasterDataFromSheet();
  Logger.log('Found ' + masterData.length + ' MasterData items');
  if (masterData.length > 0) {
    Logger.log('Sample: ' + JSON.stringify(masterData[0]));
  }
}

function testContentData() {
  Logger.log('=== Testing ContentData API ===');
  const contentData = getContentDataFromSheet();
  Logger.log('Found ' + contentData.length + ' ContentData items');
  if (contentData.length > 0) {
    Logger.log('Sample: ' + JSON.stringify(contentData[0]));
  }
}

function testChatbot() {
  Logger.log('=== Testing Chatbot ===');
  const result = handleChatbot({
    question: 'Quy trình ONBOARD là gì?',
    context: 'ONBOARD là quá trình đăng ký shop mới.'
  });
  Logger.log('Result: ' + JSON.stringify(result));
}

function testAuth() {
  Logger.log('=== Testing Auth ===');
  const result = checkUserPermission('test@example.com');
  Logger.log('Result: ' + JSON.stringify(result));
}

function testAllAPIs() {
  Logger.log('======================================');
  Logger.log('TESTING ALL APIS');
  Logger.log('======================================\n');
  
  testVideoAPI();
  Logger.log('\n');
  
  testMasterData();
  Logger.log('\n');
  
  testContentData();
  Logger.log('\n');
  
  testAuth();
  Logger.log('\n');
  
  Logger.log('======================================');
  Logger.log('ALL TESTS COMPLETED');
  Logger.log('======================================');
}
