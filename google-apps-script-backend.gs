/**
 * ========================================
 * GHTK AI ASSISTANT - GOOGLE APPS SCRIPT BACKEND
 * ========================================
 *
 * HƯỚNG DẪN CÀI ĐẶT:
 *
 * 1. Mở Google Apps Script: https://script.google.com/
 * 2. Tạo dự án mới: "New Project" → Đặt tên: "GHTK AI Assistant Backend"
 * 3. Copy toàn bộ code này vào file Code.gs
 * 4. Lấy Gemini API Key:
 *    - Truy cập: https://aistudio.google.com/app/apikey
 *    - Tạo API key mới
 *    - Copy API key và paste vào biến GEMINI_API_KEY bên dưới
 * 5. Deploy as Web App:
 *    - Click "Deploy" → "New deployment"
 *    - Type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (hoặc "Anyone with Google account" nếu muốn bảo mật hơn)
 *    - Click "Deploy"
 *    - Copy "Web app URL"
 * 6. Cập nhật Frontend:
 *    - Mở file index.html
 *    - Tìm GHTK_AI_CONFIG.BACKEND_URL
 *    - Paste Web app URL vào đó
 *
 * LƯU Ý BẢO MẬT:
 * - KHÔNG share API key với người khác
 * - NÊN sử dụng Google Apps Script Properties để lưu API key thay vì hardcode
 * - Có thể thêm rate limiting để tránh lạm dụng
 */

// ========================================
// CONFIGURATION
// ========================================

/**
 * TODO: Thay thế bằng Gemini API Key của bạn
 * Lấy tại: https://aistudio.google.com/app/apikey
 */
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

/**
 * Gemini API Configuration
 */
const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash',  // Fast and efficient model
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.95,
  topK: 40
};

/**
 * System Prompt Template
 */
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
- Kết thúc bằng lời khuyên hoặc lưu ý (nếu cần)

**Ví dụ câu trả lời tốt:**
"Quy trình ONBOARD gồm 3 bước chính:
- **Đăng ký tài khoản**: Cung cấp thông tin doanh nghiệp
- **Xác minh**: GHTK xác minh thông tin trong 24h
- **Cấu hình**: Thiết lập thông tin shop và sản phẩm

Lưu ý: Chuẩn bị đầy đủ giấy tờ để quá trình xác minh nhanh chóng."`;

// ========================================
// MAIN HANDLER
// ========================================

/**
 * Handle POST requests from frontend
 */
function doPost(e) {
  try {
    // Enable CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // Parse request body
    const requestData = JSON.parse(e.postData.contents);
    const question = requestData.question;
    const context = requestData.context;

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
      timestamp: new Date().toISOString()
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

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  return output.setContent(JSON.stringify({
    status: 'ok',
    message: 'GHTK AI Assistant Backend is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }));
}

// ========================================
// GEMINI API INTEGRATION
// ========================================

/**
 * Call Google Gemini API
 */
function callGeminiAPI(question, context) {
  try {
    // Build prompt
    const fullPrompt = buildPrompt(question, context);

    // Prepare API request
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

    // Make API call
    Logger.log('Calling Gemini API...');
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response: ' + responseText.substring(0, 500));

    // Parse response
    if (responseCode !== 200) {
      throw new Error(`Gemini API error (${responseCode}): ${responseText}`);
    }

    const data = JSON.parse(responseText);

    // Extract answer
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

/**
 * Build full prompt for Gemini
 */
function buildPrompt(question, context) {
  // Limit context length to avoid token limits
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
// TESTING & DEBUGGING FUNCTIONS
// ========================================

/**
 * Test function - call this from Apps Script editor to test
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

/**
 * Test doPost function
 */
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        question: 'Quy trình ONBOARD là gì?',
        context: 'ONBOARD là quá trình đăng ký và xác minh tài khoản GHTK. Gồm 3 bước: Đăng ký, Xác minh, Cấu hình.'
      })
    }
  };

  const response = doPost(mockEvent);
  Logger.log(response.getContent());

  return response.getContent();
}

/**
 * Get API configuration (for debugging)
 */
function getConfig() {
  return {
    hasApiKey: GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE',
    model: GEMINI_CONFIG.model,
    endpoint: GEMINI_CONFIG.apiEndpoint
  };
}
