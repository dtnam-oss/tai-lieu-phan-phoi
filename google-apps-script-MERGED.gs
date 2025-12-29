/**
 * ========================================
 * MERGED GOOGLE APPS SCRIPT
 * Kết hợp Video Database + AI Chatbot
 * ========================================
 */

// ========================================
// GEMINI AI CONFIGURATION
// ========================================

/**
 * TODO: Thay thế bằng Gemini API Key của bạn
 * Lấy tại: https://aistudio.google.com/app/apikey
 */
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash',
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.95,
  topK: 40
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
4. **In đậm điểm quan trọng**: Sử dụng **text** để làm nổi bật
5. **Thành thật**: Nếu không tìm thấy thông tin trong tài liệu, nói rõ "Thông tin này không có trong tài liệu hiện tại"

**Định dạng câu trả lời:**
- Bắt đầu với câu tóm tắt ngắn gọn
- Sử dụng gạch đầu dòng (-) cho danh sách
- Sử dụng **in đậm** cho thuật ngữ quan trọng
- Kết thúc bằng lời khuyên hoặc lưu ý (nếu cần)`;

// ========================================
// MAIN HANDLERS
// ========================================

/**
 * Handle GET requests
 * Routes between Video Database and Health Check based on params
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Check if this is a request for video data (default behavior)
    // OR has explicit action parameter
    const params = e.parameter || {};
    const action = params.action;

    // ROUTE 1: Health Check (only if explicitly requested)
    if (action === 'health' || action === 'status') {
      return output.setContent(JSON.stringify({
        status: 'ok',
        message: 'GHTK Web App is running!',
        services: ['Video Database', 'AI Chatbot'],
        version: '2.0.0',
        timestamp: new Date().toISOString()
      }));
    }

    // ROUTE 2: Video Database (DEFAULT for GET requests)
    // This ensures VideoDatabase.getData() works correctly
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
      message: 'Failed to fetch video data',
      timestamp: new Date().toISOString()
    }));
  }
}

/**
 * Handle POST requests - SAFE MODE with Debug Logging
 * Phân biệt request từ Video Database hay Chatbot bằng 'action' field
 *
 * CRITICAL FEATURES:
 * 1. LockService để tránh race conditions
 * 2. Debug logging vào Google Sheet
 * 3. Try-catch bao toàn bộ để KHÔNG BAO GIỜ crash
 * 4. CORS-friendly error responses
 */
function doPost(e) {
  // CRITICAL: Wrap EVERYTHING in try-catch to prevent crashes
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  let lock;

  try {
    // ========================================
    // STEP 1: ACQUIRE LOCK (Prevent concurrent access issues)
    // ========================================
    lock = LockService.getScriptLock();

    // Try to acquire lock, wait max 30 seconds
    const lockAcquired = lock.tryLock(30000);

    if (!lockAcquired) {
      return output.setContent(JSON.stringify({
        success: false,
        answer: 'Server đang bận xử lý request khác. Vui lòng thử lại sau 5 giây.',
        error: 'Lock timeout'
      }));
    }

    // ========================================
    // STEP 2: PARSE REQUEST DATA
    // ========================================
    let requestData;
    let rawContents = '';

    try {
      rawContents = e.postData ? e.postData.contents : '';

      // Try parsing as JSON first (from Chatbot with text/plain)
      if (rawContents) {
        requestData = JSON.parse(rawContents);
      } else if (e.parameter && Object.keys(e.parameter).length > 0) {
        // Fallback: form-urlencoded (Video Database)
        requestData = e.parameter;
      } else {
        throw new Error('No data received');
      }
    } catch (parseError) {
      // Log parse error
      logDebug('PARSE_ERROR', {
        error: parseError.toString(),
        rawContents: rawContents.substring(0, 500),
        hasParameter: !!(e.parameter),
        parameterKeys: e.parameter ? Object.keys(e.parameter).join(',') : 'none'
      });

      return output.setContent(JSON.stringify({
        success: false,
        answer: 'Không thể parse request data. Vui lòng kiểm tra format.',
        error: 'Parse error: ' + parseError.toString()
      }));
    }

    // ========================================
    // STEP 3: LOG REQUEST (For debugging)
    // ========================================
    logDebug('REQUEST_RECEIVED', {
      hasQuestion: !!(requestData.question),
      hasContext: !!(requestData.context),
      hasAction: !!(requestData.action),
      questionPreview: requestData.question ? requestData.question.substring(0, 100) : 'N/A',
      action: requestData.action || 'N/A'
    });

    // ========================================
    // STEP 4: ROUTE REQUEST
    // ========================================

    // ROUTE 1: AI CHATBOT
    if (requestData.question && requestData.context) {
      const result = handleChatbotRequest(requestData, output);

      // Release lock before returning
      if (lock) lock.releaseLock();

      return result;
    }

    // ROUTE 2: VIDEO DATABASE
    if (requestData.action) {
      const result = handleVideoDatabaseRequest(requestData, output);

      // Release lock before returning
      if (lock) lock.releaseLock();

      return result;
    }

    // ROUTE 3: UNKNOWN REQUEST
    logDebug('UNKNOWN_REQUEST', requestData);

    if (lock) lock.releaseLock();

    return output.setContent(JSON.stringify({
      success: false,
      answer: 'Request không hợp lệ. Thiếu trường bắt buộc.',
      error: 'Invalid request. Missing required fields.',
      hint: 'For Chatbot: send {question, context}. For Video DB: send {action, ...}'
    }));

  } catch (error) {
    // ========================================
    // CRITICAL ERROR HANDLER - NEVER LET SCRIPT CRASH!
    // ========================================

    // Log critical error
    try {
      logDebug('CRITICAL_ERROR', {
        error: error.toString(),
        stack: error.stack || 'No stack trace',
        message: error.message || 'No message'
      });
    } catch (logError) {
      // Even logging failed - just continue
      Logger.log('Failed to log error: ' + logError.toString());
    }

    // Release lock if held
    if (lock) {
      try {
        lock.releaseLock();
      } catch (unlockError) {
        // Ignore unlock errors
      }
    }

    // ALWAYS return valid JSON to prevent CORS errors
    return output.setContent(JSON.stringify({
      success: false,
      answer: 'Xin lỗi, đã có lỗi nghiêm trọng xảy ra trên server. Vui lòng thử lại sau.\n\n' +
              'Chi tiết lỗi: ' + error.toString(),
      error: 'Server exception: ' + error.toString(),
      timestamp: new Date().toISOString()
    }));
  }
}

/**
 * Log debug information to Google Sheet
 * Tự động tạo sheet "Debug_Log" nếu chưa có
 *
 * NOTE: Logging sẽ FAIL khi chạy từ Web App (no spreadsheet binding)
 * Nhưng vẫn log vào Logger để xem trong Executions
 */
function logDebug(eventType, data) {
  // Always log to Logger (visible in Apps Script Executions)
  Logger.log('[' + eventType + '] ' + JSON.stringify(data));

  try {
    // Try to get spreadsheet (chỉ work khi test trong editor hoặc có binding)
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) {
      // No spreadsheet available (Web App mode)
      return;
    }

    let sheet = ss.getSheetByName('Debug_Log');

    if (!sheet) {
      // Create sheet if doesn't exist
      sheet = ss.insertSheet('Debug_Log');

      // Add headers
      sheet.appendRow([
        'Timestamp',
        'Event Type',
        'Data',
        'User Agent',
        'IP (if available)'
      ]);

      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#00b14f');
      headerRange.setFontColor('#ffffff');
    }

    // Append log entry
    sheet.appendRow([
      new Date().toISOString(),
      eventType,
      JSON.stringify(data),
      '', // User agent (not available in Apps Script)
      ''  // IP (not available in Apps Script)
    ]);

    // Keep only last 1000 rows to prevent bloat
    const lastRow = sheet.getLastRow();
    if (lastRow > 1000) {
      sheet.deleteRows(2, lastRow - 1000); // Keep header + last 1000
    }

  } catch (logError) {
    // Don't let logging errors crash the main function
    // This is expected when running as Web App without spreadsheet binding
    Logger.log('Sheet logging not available (expected in Web App mode): ' + logError.toString());
  }
}

// ========================================
// CHATBOT HANDLER - WITH ERROR HANDLING
// ========================================

function handleChatbotRequest(requestData, output) {
  try {
    const question = requestData.question;
    const context = requestData.context;

    logDebug('CHATBOT_REQUEST', {
      questionLength: question ? question.length : 0,
      contextLength: context ? context.length : 0,
      questionPreview: question ? question.substring(0, 100) : 'N/A'
    });

    // Validate inputs
    if (!question || !context) {
      logDebug('CHATBOT_VALIDATION_ERROR', {
        hasQuestion: !!question,
        hasContext: !!context
      });

      return output.setContent(JSON.stringify({
        success: false,
        answer: 'Thiếu câu hỏi hoặc nội dung trang web. Vui lòng thử lại.',
        error: 'Missing required fields: question or context'
      }));
    }

    // Check API key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      logDebug('API_KEY_ERROR', {
        keyConfigured: false
      });

      return output.setContent(JSON.stringify({
        success: false,
        answer: '⚠️ **Lỗi cấu hình Backend**\n\nGemini API Key chưa được thiết lập.\n\nVui lòng liên hệ admin để cấu hình.',
        error: 'Gemini API Key not configured'
      }));
    }

    // Call Gemini API
    logDebug('CALLING_GEMINI_API', {
      questionLength: question.length,
      contextLength: context.length
    });

    const answer = callGeminiAPI(question, context);

    // Check if answer is error message
    if (answer.startsWith('Xin lỗi')) {
      logDebug('GEMINI_API_ERROR', {
        answerPreview: answer.substring(0, 200)
      });

      return output.setContent(JSON.stringify({
        success: false,
        answer: answer,
        timestamp: new Date().toISOString(),
        service: 'chatbot'
      }));
    }

    // Success
    logDebug('CHATBOT_SUCCESS', {
      answerLength: answer.length,
      answerPreview: answer.substring(0, 100)
    });

    return output.setContent(JSON.stringify({
      success: true,
      answer: answer,
      timestamp: new Date().toISOString(),
      service: 'chatbot'
    }));

  } catch (error) {
    // Log error
    logDebug('CHATBOT_EXCEPTION', {
      error: error.toString(),
      stack: error.stack || 'No stack'
    });

    // Return error response
    return output.setContent(JSON.stringify({
      success: false,
      answer: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn.\n\n' +
              'Chi tiết: ' + error.toString(),
      error: 'Chatbot handler exception: ' + error.toString(),
      timestamp: new Date().toISOString()
    }));
  }
}

// ========================================
// VIDEO DATABASE HANDLER
// ========================================

function handleVideoDatabaseRequest(requestData, output) {
  const action = requestData.action;

  Logger.log('Video Database Request - Action: ' + action);

  // TODO: Thêm logic Video Database của bạn ở đây
  // Ví dụ:

  switch (action) {
    case 'get_videos':
      // Logic lấy danh sách videos
      return output.setContent(JSON.stringify({
        videos: getVideosFromSheet(),
        service: 'video_database'
      }));

    case 'add_video':
      // Logic thêm video
      const result = addVideoToSheet(requestData);
      return output.setContent(JSON.stringify({
        success: true,
        result: result,
        service: 'video_database'
      }));

    case 'delete':
      // Logic xóa video
      deleteVideoFromSheet(requestData.id_the);
      return output.setContent(JSON.stringify({
        success: true,
        service: 'video_database'
      }));

    default:
      return output.setContent(JSON.stringify({
        error: 'Unknown action: ' + action
      }));
  }
}

// ========================================
// GEMINI API INTEGRATION
// ========================================

function callGeminiAPI(question, context) {
  try {
    const fullPrompt = buildPrompt(question, context);
    const url = `${GEMINI_CONFIG.apiEndpoint}?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        topK: GEMINI_CONFIG.topK,
        topP: GEMINI_CONFIG.topP,
        maxOutputTokens: GEMINI_CONFIG.maxTokens,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    Logger.log('Calling Gemini API...');
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log('Response Code: ' + responseCode);

    if (responseCode !== 200) {
      throw new Error(`Gemini API error (${responseCode}): ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      }
    }

    throw new Error('Unexpected API response format');

  } catch (error) {
    Logger.log('Error in callGeminiAPI: ' + error.toString());
    return 'Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.\n\nChi tiết lỗi: ' + error.toString();
  }
}

function buildPrompt(question, context) {
  const maxContextLength = 10000;
  let limitedContext = context;

  if (context.length > maxContextLength) {
    limitedContext = context.substring(0, maxContextLength) + '... (tài liệu còn tiếp)';
  }

  const prompt = `${SYSTEM_PROMPT}

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

  return prompt;
}

// ========================================
// VIDEO DATABASE FUNCTIONS
// ========================================

/**
 * Get video data from Google Sheets
 * Replace SHEET_ID and SHEET_NAME with your actual values
 */
function getVideosFromSheet() {
  try {
    // TODO: Replace with your actual Google Sheet ID
    // Get it from Sheet URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
    const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
    const SHEET_NAME = 'Videos'; // Or your sheet tab name

    Logger.log('Fetching videos from Google Sheets...');

    // Option 1: If you have a specific Sheet ID
    // Uncomment and configure this if you have video data in Sheets
    /*
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    const videos = rows.map(row => {
      const video = {};
      headers.forEach((header, index) => {
        video[header] = row[index];
      });
      return video;
    });

    Logger.log('Fetched ' + videos.length + ' videos from Sheet');
    return videos;
    */

    // Option 2: Return sample data for testing (CURRENT)
    // Remove this after you configure Option 1
    Logger.log('⚠️ Using sample data - Configure SHEET_ID to use real data');

    return getSampleVideoData();

  } catch (error) {
    Logger.log('Error in getVideosFromSheet: ' + error.toString());
    // Return empty array instead of throwing to prevent crash
    return [];
  }
}

/**
 * Sample video data for testing
 * Replace this with real Sheet data
 */
function getSampleVideoData() {
  return [
    {
      element_id: 'vid_1',
      category: 'Giới thiệu hệ thống GHTK',
      platform: 'youtube',
      video_id: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      title: 'Video hướng dẫn GHTK',
      description: 'Hệ thống phân phối của GHTK',
      duration: '5:30'
    },
    {
      element_id: 'vid_2_1',
      category: 'Quy trình ONBOARD',
      platform: 'youtube',
      video_id: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      title: 'Hướng dẫn ONBOARD',
      description: 'Quy trình đăng ký và xác minh',
      duration: '8:15'
    },
    {
      element_id: 'vid_3_1',
      category: 'Quy trình giao hàng',
      platform: 'youtube',
      video_id: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      title: 'Hướng dẫn giao hàng',
      description: 'Quy trình giao hàng từ A-Z',
      duration: '12:00'
    }
  ];
}

function addVideoToSheet(data) {
  // TODO: Implement your actual logic here
  Logger.log('addVideoToSheet() called with data: ' + JSON.stringify(data));
  return { id: 'new-video-id' };
}

function deleteVideoFromSheet(id) {
  // TODO: Implement your actual logic here
  Logger.log('deleteVideoFromSheet() called with id: ' + id);
}

// ========================================
// TESTING FUNCTIONS
// ========================================

/**
 * Test Chatbot
 */
function testChatbot() {
  const mockEvent = {
    postData: {
      type: 'application/json',
      contents: JSON.stringify({
        question: 'Quy trình ONBOARD là gì?',
        context: 'ONBOARD là quá trình đăng ký và xác minh tài khoản GHTK. Gồm 3 bước: Đăng ký, Xác minh, Cấu hình.'
      })
    }
  };

  const response = doPost(mockEvent);
  Logger.log('Chatbot Response:');
  Logger.log(response.getContent());
  return response.getContent();
}

/**
 * Test Video Database
 */
function testVideoDatabase() {
  const mockEvent = {
    postData: {
      type: 'application/x-www-form-urlencoded',
      contents: ''
    },
    parameter: {
      action: 'get_videos'
    }
  };

  const response = doPost(mockEvent);
  Logger.log('Video DB Response:');
  Logger.log(response.getContent());
  return response.getContent();
}

/**
 * Test Gemini API directly
 */
function testGeminiAPI() {
  const testQuestion = 'Quy trình ONBOARD là gì?';
  const testContext = 'ONBOARD là quá trình đăng ký và xác minh tài khoản GHTK. Gồm 3 bước: Đăng ký, Xác minh, Cấu hình.';

  Logger.log('Testing Gemini API...');
  Logger.log('Question: ' + testQuestion);
  Logger.log('Context: ' + testContext);

  const answer = callGeminiAPI(testQuestion, testContext);

  Logger.log('\n=== ANSWER ===');
  Logger.log(answer);

  return answer;
}
