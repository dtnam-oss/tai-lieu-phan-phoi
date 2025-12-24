# 🔄 Hướng dẫn Update Google Apps Script hiện có

## 📋 Tổng quan

Bạn đã có Google Apps Script Web App đang chạy. Chúng ta sẽ **thêm logic Chatbot vào Web App hiện có** thay vì tạo mới, để:

✅ **Dùng chung 1 URL** cho tất cả tính năng
✅ **Không cần deploy thêm Web App mới**
✅ **Quản lý tập trung** tất cả backend logic

---

## 🚀 Cách cập nhật (2 bước đơn giản)

### **Bước 1: Lấy Gemini API Key**

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập Google
3. Click **"Create API Key"**
4. **Copy API Key** (lưu lại để dùng ở bước 2)

---

### **Bước 2: Update Google Apps Script**

#### Option A: Merge vào code hiện có (Khuyến nghị)

1. Mở Google Apps Script hiện tại: https://script.google.com/
2. Tìm project có URL: `AKfycbxaujZ9IVqRWnpAOA-HuCvDWDg46J_Q8xSZOGAbJ8IQ0DOsybDf-hWptKVl9q7ncfNS8g`
3. Mở file `google-apps-script-MERGED.gs` trong thư mục dự án này
4. **Copy toàn bộ code**
5. Quay lại Google Apps Script, **backup code cũ** (copy sang file mới tên `Code-backup.gs`)
6. **Paste code mới** vào file `Code.gs`
7. **Tìm và thay thế**:

```javascript
// Dòng ~13
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

→ Thay bằng:

```javascript
const GEMINI_API_KEY = 'AIzaSy...your-actual-key-here';
```

8. **Thêm logic Video Database** của bạn vào các function:
   - `getVideosFromSheet()`
   - `addVideoToSheet(data)`
   - `deleteVideoFromSheet(id)`

9. **Save** (Ctrl/Cmd + S)

#### Option B: Chỉ thêm phần Chatbot vào code hiện có

Nếu bạn muốn giữ nguyên cấu trúc code hiện tại, chỉ cần:

**1. Thêm constants vào đầu file:**

```javascript
// Thêm vào đầu file Code.gs
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Thay bằng API key thực

const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash',
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.95,
  topK: 40
};

const SYSTEM_PROMPT = \`Bạn là trợ lý AI chuyên nghiệp của GHTK.
[...copy toàn bộ SYSTEM_PROMPT từ file google-apps-script-MERGED.gs...]\`;
```

**2. Sửa function `doPost` hiện có:**

Tìm function `doPost`, thay thế bằng:

```javascript
function doPost(e) {
  try {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    // Parse request
    const contentType = e.postData.type;
    let requestData;

    if (contentType === 'application/json') {
      requestData = JSON.parse(e.postData.contents);
    } else {
      requestData = e.parameter;
    }

    // ========================================
    // ROUTE 1: AI CHATBOT
    // ========================================
    if (requestData.question && requestData.context) {
      const answer = callGeminiAPI(requestData.question, requestData.context);
      return output.setContent(JSON.stringify({
        answer: answer,
        timestamp: new Date().toISOString(),
        service: 'chatbot'
      }));
    }

    // ========================================
    // ROUTE 2: VIDEO DATABASE (Code cũ của bạn)
    // ========================================
    if (requestData.action) {
      // GIỮ NGUYÊN CODE CŨ CỦA BẠN Ở ĐÂY
      // Ví dụ:
      // return handleVideoDatabaseRequest(requestData, output);
    }

    // Unknown request
    return output.setContent(JSON.stringify({
      error: 'Invalid request'
    }));

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    return output.setContent(JSON.stringify({
      error: error.toString()
    }));
  }
}
```

**3. Thêm các functions mới:**

Copy các functions sau từ `google-apps-script-MERGED.gs`:
- `callGeminiAPI(question, context)`
- `buildPrompt(question, context)`
- `testChatbot()` (optional, for testing)

**4. Save và Test**

---

### **Bước 3: Test Backend**

1. Trong Google Apps Script, chọn function **`testChatbot`** trong dropdown
2. Click **Run** (▶️)
3. Cấp quyền nếu được yêu cầu
4. Xem **Logs** (Ctrl/Cmd + Enter):
   - Nếu thấy câu trả lời từ AI → ✅ Thành công!
   - Nếu lỗi → Kiểm tra API key

---

### **Bước 4: Deploy lại (Nếu cần)**

Nếu bạn đã sửa code `doPost`, cần deploy lại:

1. Click **Deploy** → **Manage deployments**
2. Click ⚙️ bên cạnh deployment hiện tại
3. Click **New version**
4. Mô tả: `Added AI Chatbot support`
5. Click **Deploy**

> ⚠️ **Lưu ý**: URL sẽ không đổi, frontend không cần update!

---

## 🎯 Cách hoạt động

### Backend sẽ phân biệt requests như sau:

```javascript
// Request từ Chatbot (có question + context)
{
  "question": "Quy trình ONBOARD là gì?",
  "context": "Nội dung trang web..."
}
→ Backend xử lý bằng callGeminiAPI()

// Request từ Video Database (có action)
{
  "action": "get_videos"
}
→ Backend xử lý bằng logic cũ của bạn
```

### Frontend đã được cấu hình:

```javascript
// File index.html (dòng 6576)
const GHTK_AI_CONFIG = {
    BACKEND_URL: 'https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA.../exec',
    // Đây chính là URL Web App hiện có của bạn!
};
```

---

## ✅ Checklist

Đảm bảo bạn đã:

- [ ] Lấy Gemini API Key từ https://aistudio.google.com/app/apikey
- [ ] Cập nhật `GEMINI_API_KEY` trong Google Apps Script
- [ ] Thêm logic Chatbot vào `doPost` function
- [ ] Thêm các functions: `callGeminiAPI`, `buildPrompt`
- [ ] Test bằng function `testChatbot()`
- [ ] Deploy lại (nếu cần)
- [ ] Mở index.html trong browser và test chat

---

## 🐛 Debug

### Test Backend trực tiếp

**1. Test với Browser:**

Mở URL này (thay bằng Web App URL của bạn):

```
https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA.../exec
```

Nếu thấy:
```json
{
  "status": "ok",
  "message": "GHTK Web App is running!",
  "services": ["Video Database", "AI Chatbot"]
}
```

→ ✅ Backend đang chạy!

**2. Test Chatbot với curl:**

```bash
curl -X POST 'https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA.../exec' \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "Quy trình ONBOARD là gì?",
    "context": "ONBOARD là quá trình đăng ký tài khoản GHTK."
  }'
```

**3. Xem Logs trong Apps Script:**

1. Mở Apps Script
2. Click **Executions** (⏱️) ở sidebar
3. Xem lịch sử requests và errors

### Lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|------|------------|-----------|
| `Gemini API Key chưa được cấu hình` | Chưa update API key | Kiểm tra lại constant `GEMINI_API_KEY` |
| `HTTP 403` | Deploy settings sai | Deploy với "Who has access" = "Anyone" |
| `Gemini API error (400)` | API key không đúng | Tạo lại API key tại https://aistudio.google.com/app/apikey |
| `Unexpected API response` | Prompt quá dài hoặc safety filter | Giảm MAX_CONTEXT_LENGTH xuống 10000 |

---

## 📊 So sánh 2 Options

| Tiêu chí | Option A: Merged File | Option B: Chỉ thêm code |
|----------|----------------------|-------------------------|
| **Dễ cài đặt** | ⭐⭐⭐⭐⭐ Copy-paste toàn bộ | ⭐⭐⭐ Cần merge thủ công |
| **Bảo toàn code cũ** | ⚠️ Cần implement lại logic Video DB | ✅ Giữ nguyên code cũ |
| **Cấu trúc code** | 📦 Tổ chức rõ ràng, dễ maintain | 🔀 Trộn lẫn code mới/cũ |
| **Testing** | ✅ Có sẵn test functions | ⚠️ Cần tự viết |
| **Khuyến nghị** | ✅ Nếu code cũ đơn giản | ✅ Nếu code cũ phức tạp |

**Khuyến nghị của tôi:**

- **Code cũ đơn giản (< 200 dòng)**: Dùng **Option A** (Merged file)
- **Code cũ phức tạp, nhiều logic**: Dùng **Option B** (Chỉ thêm)

---

## 🎉 Hoàn tất!

Sau khi cập nhật:

1. **Mở index.html** trong browser
2. **Click nút chat** ở góc phải dưới
3. **Hỏi thử**: "Quy trình ONBOARD là gì?"
4. **Kiểm tra Console** (F12) nếu có lỗi

---

## 💡 Tips

### Tối ưu chi phí API

```javascript
// Trong GHTK_AI_CONFIG (frontend)
MAX_CONTEXT_LENGTH: 10000  // Giảm từ 15000 → tiết kiệm tokens
```

### Cache responses (Advanced)

```javascript
// Trong callGeminiAPI (backend)
const cache = CacheService.getScriptCache();
const cacheKey = Utilities.computeDigest(
  Utilities.DigestAlgorithm.MD5,
  question + context
).toString();

const cached = cache.get(cacheKey);
if (cached) {
  return cached;
}

// ... call API ...

cache.put(cacheKey, answer, 3600); // Cache 1 hour
```

### Rate limiting

```javascript
// Trong doPost
const userIp = e.parameter.userIp || 'unknown';
const cache = CacheService.getScriptCache();
const requestCount = parseInt(cache.get('rate_' + userIp) || 0);

if (requestCount > 20) {  // Max 20 requests/hour
  return output.setContent(JSON.stringify({
    error: 'Rate limit exceeded'
  }));
}

cache.put('rate_' + userIp, requestCount + 1, 3600);
```

---

**Chúc bạn thành công! 🚀**
