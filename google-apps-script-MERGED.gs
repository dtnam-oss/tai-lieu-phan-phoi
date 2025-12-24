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
 * Có thể dùng cho cả Video Database và test Chatbot
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  // Test endpoint
  return output.setContent(JSON.stringify({
    status: 'ok',
    message: 'GHTK Web App is running!',
    services: ['Video Database', 'AI Chatbot'],
    version: '2.0.0',
    timestamp: new Date().toISOString()
  }));
}

/**
 * Handle POST requests
 * Phân biệt request từ Video Database hay Chatbot bằng 'action' field
 *
 * CORS FIX: Frontend gửi text/plain để bypass preflight
 * Data luôn ở dạng JSON string trong e.postData.contents
 */
function doPost(e) {
  try {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // Parse request body
    // CRITICAL: Frontend gửi Content-Type: text/plain (bypass CORS)
    // Nên data luôn nằm trong e.postData.contents dưới dạng JSON string
    let requestData;

    try {
      // Try parsing as JSON first (from Chatbot with text/plain)
      requestData = JSON.parse(e.postData.contents);
      Logger.log('Parsed as JSON from text/plain: ' + JSON.stringify(requestData));
    } catch (parseError) {
      // Fallback: Check if it's form-urlencoded (Video Database)
      if (e.parameter && Object.keys(e.parameter).length > 0) {
        requestData = e.parameter;
        Logger.log('Using form-urlencoded data: ' + JSON.stringify(requestData));
      } else {
        throw new Error('Cannot parse request data');
      }
    }

    Logger.log('Final request data: ' + JSON.stringify(requestData));

    // ========================================
    // ROUTE 1: AI CHATBOT
    // Detect by presence of 'question' and 'context' fields
    // ========================================
    if (requestData.question && requestData.context) {
      return handleChatbotRequest(requestData, output);
    }

    // ========================================
    // ROUTE 2: VIDEO DATABASE
    // Detect by presence of 'action' field
    // ========================================
    if (requestData.action) {
      return handleVideoDatabaseRequest(requestData, output);
    }

    // ========================================
    // ROUTE 3: UNKNOWN REQUEST
    // ========================================
    return output.setContent(JSON.stringify({
      error: 'Invalid request. Missing required fields.',
      hint: 'For Chatbot: send {question, context}. For Video DB: send {action, ...}'
    }));

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    return output.setContent(JSON.stringify({
      error: 'Server error: ' + error.toString()
    }));
  }
}

// ========================================
// CHATBOT HANDLER
// ========================================

function handleChatbotRequest(requestData, output) {
  const question = requestData.question;
  const context = requestData.context;

  Logger.log('Chatbot Request - Question: ' + question.substring(0, 100));

  // Validate inputs
  if (!question || !context) {
    return output.setContent(JSON.stringify({
      error: 'Missing required fields: question or context'
    }));
  }

  // Check API key
  if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return output.setContent(JSON.stringify({
      error: 'Gemini API Key chưa được cấu hình. Vui lòng cập nhật GEMINI_API_KEY trong Google Apps Script.'
    }));
  }

  // Call Gemini API
  const answer = callGeminiAPI(question, context);

  // Return response
  return output.setContent(JSON.stringify({
    answer: answer,
    timestamp: new Date().toISOString(),
    service: 'chatbot'
  }));
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
// VIDEO DATABASE FUNCTIONS (PLACEHOLDER)
// Thay thế bằng logic thực tế của bạn
// ========================================

function getVideosFromSheet() {
  // TODO: Implement your actual logic here
  // Example:
  // const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Videos');
  // return sheet.getDataRange().getValues();

  Logger.log('getVideosFromSheet() called - implement your logic here');
  return [];
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
