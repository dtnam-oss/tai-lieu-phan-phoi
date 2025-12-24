# 🛡️ Safe Mode & Debug Guide - GHTK AI Assistant

## 🎯 Vấn đề đã được fix

**Backend Safe Mode đã được implement!**

```
❌ TRƯỚC: Script crash → HTML error page → CORS blocked
✅ SAU: Script NEVER crash → Always JSON → No CORS errors
```

---

## ✨ Safe Mode Features

### 1. **Never Crash Promise**
- ✅ Triple-layer try-catch wrapping
- ✅ All errors caught and returned as JSON
- ✅ No more HTML error pages
- ✅ CORS-friendly error responses

### 2. **Comprehensive Logging**
- ✅ All requests logged to `Logger` (Apps Script Executions)
- ✅ Optional Google Sheet logging (if spreadsheet available)
- ✅ Every step logged: Parse → Validate → API Call → Response
- ✅ Error stack traces captured

### 3. **Lock Service**
- ✅ Prevents concurrent request conflicts
- ✅ 30-second timeout
- ✅ Graceful "Server busy" message

### 4. **Enhanced Error Messages**
- ✅ User-friendly Vietnamese messages
- ✅ Technical details for debugging
- ✅ Timestamp for tracking

---

## 🔍 How to Debug

### Method 1: Apps Script Executions (Recommended)

**Bước 1: Mở Apps Script**
1. Vào: https://script.google.com/
2. Mở project của bạn

**Bước 2: Xem Executions Log**
1. Click biểu tượng **⏱️ Executions** ở sidebar bên trái
2. Bạn sẽ thấy danh sách tất cả requests

**Bước 3: Phân tích Log**
```
✅ Success:
- Status: "Completed"
- Duration: ~2-5 seconds
- Logs: [REQUEST_RECEIVED] → [CHATBOT_REQUEST] → [CALLING_GEMINI_API] → [CHATBOT_SUCCESS]

❌ Error:
- Status: "Failed" hoặc "Completed" with errors
- Logs: [PARSE_ERROR] hoặc [CRITICAL_ERROR] hoặc [API_KEY_ERROR]
```

**Bước 4: Click vào execution để xem chi tiết**

Ví dụ log thành công:
```
[REQUEST_RECEIVED] {"hasQuestion":true,"hasContext":true,"questionPreview":"Quy trình ONBOARD là gì?"}
[CHATBOT_REQUEST] {"questionLength":25,"contextLength":15234}
[CALLING_GEMINI_API] {"questionLength":25,"contextLength":15234}
[CHATBOT_SUCCESS] {"answerLength":523,"answerPreview":"Quy trình ONBOARD gồm 3 bước..."}
```

Ví dụ log lỗi:
```
[REQUEST_RECEIVED] {"hasQuestion":true,"hasContext":true}
[CHATBOT_REQUEST] {"questionLength":25,"contextLength":15234}
[API_KEY_ERROR] {"keyConfigured":false}
```

---

### Method 2: Google Sheet Debug Log (Optional)

**NOTE:** Sheet logging chỉ hoạt động khi Apps Script được gắn với Google Spreadsheet. Nếu deploy as standalone Web App, chỉ có Logger works.

**Nếu muốn enable Sheet logging:**

**Bước 1: Gắn Script với Spreadsheet**
1. Tạo Google Sheet mới
2. **Extensions** → **Apps Script**
3. Paste code vào đó
4. Deploy từ bound script này

**Bước 2: Xem Debug_Log Sheet**
1. Sau khi gửi request, quay lại Spreadsheet
2. Sẽ có sheet mới tên **"Debug_Log"**
3. Xem logs theo thời gian thực

**Cột trong Debug_Log:**
| Timestamp | Event Type | Data | User Agent | IP |
|-----------|------------|------|------------|-----|
| 2025-01-24... | REQUEST_RECEIVED | {"hasQuestion":true...} | N/A | N/A |

---

## 🐛 Common Errors & Solutions

### Error 1: PARSE_ERROR

**Log:**
```json
{
  "error": "SyntaxError: Unexpected token...",
  "rawContents": "undefined",
  "hasParameter": false
}
```

**Nguyên nhân:**
- Frontend gửi sai format
- Request body rỗng

**Fix:**
1. Kiểm tra frontend code
2. Verify `JSON.stringify()` đang hoạt động
3. Check Console (F12) → Network → Request payload

---

### Error 2: API_KEY_ERROR

**Log:**
```json
{
  "keyConfigured": false
}
```

**Nguyên nhân:**
- Chưa thay `YOUR_GEMINI_API_KEY_HERE`

**Fix:**
1. Mở Apps Script
2. Tìm dòng 15: `const GEMINI_API_KEY = ...`
3. Thay bằng API key thực
4. Save → Deploy lại

---

### Error 3: GEMINI_API_ERROR

**Log:**
```json
{
  "answerPreview": "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI..."
}
```

**Nguyên nhân:**
- API key sai
- Quota exceeded
- Network error
- Invalid request format

**Fix:**
1. Kiểm tra API key tại: https://aistudio.google.com/app/apikey
2. Xem quota: https://aistudio.google.com/app/quota
3. Test API key với function `testGeminiAPI()`

---

### Error 4: CRITICAL_ERROR

**Log:**
```json
{
  "error": "ReferenceError: xyz is not defined",
  "stack": "at callGeminiAPI:line 245..."
}
```

**Nguyên nhân:**
- Bug trong code
- Unexpected input
- External service failure

**Fix:**
1. Đọc stack trace để tìm dòng lỗi
2. Kiểm tra code tại dòng đó
3. Test với function `testChatbot()`
4. Report bug nếu cần

---

### Error 5: Lock Timeout

**Response:**
```json
{
  "success": false,
  "answer": "Server đang bận xử lý request khác...",
  "error": "Lock timeout"
}
```

**Nguyên nhân:**
- Nhiều người chat cùng lúc
- Request trước chưa xong

**Fix:**
- Đợi 5 giây → Thử lại
- Tăng lock timeout (dòng 93): `lock.tryLock(60000)` → 60s

---

## 🧪 Testing Functions

### Test 1: Test doPost với Mock Data

```javascript
function testChatbot() {
  const mockEvent = {
    postData: {
      type: 'application/json',
      contents: JSON.stringify({
        question: 'Quy trình ONBOARD là gì?',
        context: 'ONBOARD là quá trình đăng ký...'
      })
    }
  };

  const response = doPost(mockEvent);
  Logger.log('Response:');
  Logger.log(response.getContent());
}
```

**Chạy:**
1. Select function `testChatbot`
2. Click **Run** (▶️)
3. Xem **Logs** (Ctrl/Cmd + Enter)

**Kết quả mong đợi:**
```json
{
  "success": true,
  "answer": "Quy trình ONBOARD gồm 3 bước...",
  "timestamp": "2025-01-24T...",
  "service": "chatbot"
}
```

---

### Test 2: Test Gemini API Directly

```javascript
function testGeminiAPI() {
  const question = 'Quy trình ONBOARD là gì?';
  const context = 'ONBOARD là quá trình...';

  const answer = callGeminiAPI(question, context);

  Logger.log('Answer:');
  Logger.log(answer);
}
```

**Chạy:**
1. Select `testGeminiAPI`
2. Run
3. Xem Logs

**Nếu thành công:**
```
Answer:
Quy trình ONBOARD gồm 3 bước chính:
- Đăng ký tài khoản...
- Xác minh thông tin...
- Cấu hình hệ thống...
```

**Nếu lỗi:**
```
Xin lỗi, đã có lỗi xảy ra khi kết nối với AI.

Chi tiết lỗi: Gemini API error (400): API key not valid...
```

---

## 📊 Response Format Changes

### Old Format (Before Safe Mode)
```json
{
  "answer": "...",
  "timestamp": "...",
  "service": "chatbot"
}
```

### New Format (Safe Mode)
```json
{
  "success": true,      // NEW: Indicates success/failure
  "answer": "...",
  "timestamp": "...",
  "service": "chatbot"
}
```

**On Error:**
```json
{
  "success": false,     // NEW: false on errors
  "answer": "User-friendly error message in Vietnamese",
  "error": "Technical error details in English",
  "timestamp": "..."
}
```

---

## 🔧 Frontend Changes

### Added Console Logging

```javascript
console.log('🔌 Calling backend API...');
console.log('📝 Question length:', question.length);
console.log('📄 Context length:', context.length);
// ... after response ...
console.log('📡 Response status:', response.status);
console.log('✅ JSON parsed successfully');
console.log('📦 Response data:', data);
```

**Benefit:** Easy debugging in browser Console (F12)

### Added Error Handling

```javascript
// Check for errors
if (data.error) {
  return data.answer || data.error;
}

// Check success field
if (data.success === false) {
  return data.answer || 'Có lỗi xảy ra...';
}
```

**Benefit:** Graceful error display to users

---

## 🚀 Deployment Checklist

- [ ] **Backend updated** với Safe Mode code
- [ ] **API Key** đã được thay thế
- [ ] **Test function** `testChatbot()` chạy OK
- [ ] **Test function** `testGeminiAPI()` chạy OK
- [ ] **Deploy** new version (Manage deployments → New version)
- [ ] **Test GET** endpoint (mở URL trong browser)
- [ ] **Frontend updated** với enhanced logging
- [ ] **Hard refresh** browser (Ctrl+F5)
- [ ] **Test chatbot** end-to-end
- [ ] **Check Executions** log để verify
- [ ] **Commit & Push** to GitHub

---

## 📝 Debug Workflow

```
1. User sends chat message
         ↓
2. Open Console (F12) → Check frontend logs
   - 🔌 Calling backend...
   - 📡 Response status: 200
   - ✅ JSON parsed
         ↓
3. If CORS error → Check backend deployment
         ↓
4. If JSON parse error → Check Apps Script Executions
         ↓
5. Apps Script → Executions → Latest run
   - Click to expand
   - Read logs step by step
   - Find error event type
         ↓
6. Match error type to "Common Errors" above
         ↓
7. Apply fix
         ↓
8. Deploy new version
         ↓
9. Test again
```

---

## 🎯 Expected Log Flow (Success Case)

### Frontend Console:
```
🔌 Calling backend API...
📝 Question length: 25
📄 Context length: 15234
📡 Response status: 200
📡 Response ok: true
✅ JSON parsed successfully
📦 Response data: {success: true, answer: "...", ...}
✅ Got answer, length: 523
```

### Apps Script Executions:
```
[REQUEST_RECEIVED] {"hasQuestion":true,"hasContext":true,"questionPreview":"Quy trình ONBOARD là gì?","action":"N/A"}
[CHATBOT_REQUEST] {"questionLength":25,"contextLength":15234,"questionPreview":"Quy trình ONBOARD là gì?"}
[CALLING_GEMINI_API] {"questionLength":25,"contextLength":15234}
Calling Gemini API...
Response Code: 200
[CHATBOT_SUCCESS] {"answerLength":523,"answerPreview":"Quy trình ONBOARD gồm 3 bước chính:\n- Đăng ký tài khoản: Cung cấp..."}
```

### Result:
```
✅ User sees AI answer in chat
✅ No errors
✅ Chat history saved
```

---

## 💡 Pro Tips

### Tip 1: Clear Logs Regularly
Apps Script keeps logs for **7 days**. Để dễ debug, clear old logs:
1. Executions → Filter by date
2. Focus on latest requests

### Tip 2: Use Filter in Executions
Filter by:
- Status: "Failed" để chỉ xem lỗi
- Date range: Hôm nay
- Function: `doPost`

### Tip 3: Copy Logs for Analysis
1. Click execution → Copy log text
2. Paste vào text editor
3. Search for `[ERROR]` hoặc `[CRITICAL_ERROR]`

### Tip 4: Compare Before/After
Chạy `testChatbot()` function:
- Trước deploy: Xem logs
- Sau deploy: Xem logs
- So sánh để verify fix

---

## 📞 Still Having Issues?

### 1. Verify Backend Deployment
```bash
# Test GET endpoint
curl https://script.google.com/macros/s/YOUR_ID/exec

# Should return:
{"status":"ok","message":"GHTK Web App is running!","services":["Video Database","AI Chatbot"],"version":"2.0.0"}
```

### 2. Test with curl
```bash
curl -X POST https://script.google.com/macros/s/YOUR_ID/exec \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"question":"Test","context":"Test context"}'
```

### 3. Check Quotas
- Gemini API: https://aistudio.google.com/app/quota
- Apps Script: https://script.google.com/home/executions

---

**Safe Mode = No More Crashes! 🛡️**

**Version**: 2.2.0 | **Feature**: Safe Mode & Debug Logging | **Updated**: 2025-12-24
