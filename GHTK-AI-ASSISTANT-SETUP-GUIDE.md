# 🤖 GHTK AI Assistant - Hướng dẫn cài đặt

## 📋 Tổng quan

GHTK AI Assistant là chatbot thông minh có khả năng đọc hiểu toàn bộ nội dung trang web và trả lời câu hỏi về quy trình phân phối của GHTK.

### ✨ Tính năng chính

- 💬 **Chat Widget hiện đại**: Giao diện glassmorphism đẹp mắt với GHTK green theme
- 🧠 **Context-Aware AI**: Đọc và hiểu toàn bộ nội dung trang web
- 📱 **Responsive Design**: Tương thích hoàn hảo trên mobile và desktop
- 💾 **Chat History**: Lưu lịch sử chat trong localStorage
- ⚡ **Quick Actions**: Các nút gợi ý câu hỏi nhanh
- 🎨 **Markdown Support**: Hỗ trợ in đậm, gạch đầu dòng trong câu trả lời

---

## 🚀 Hướng dẫn cài đặt (3 bước)

### **Bước 1: Chuẩn bị Gemini API Key**

1. Truy cập Google AI Studio: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Click **"Create API Key"**
4. Chọn Google Cloud Project (hoặc tạo mới)
5. **Copy API Key** (lưu lại để dùng ở bước 2)

> ⚠️ **Lưu ý bảo mật**: KHÔNG chia sẻ API key với người khác!

---

### **Bước 2: Deploy Google Apps Script Backend**

#### 2.1. Tạo dự án Google Apps Script

1. Mở Google Apps Script: https://script.google.com/
2. Đăng nhập bằng tài khoản Google
3. Click **"New Project"**
4. Đặt tên: `GHTK AI Assistant Backend`

#### 2.2. Thêm code backend

1. Mở file `google-apps-script-backend.gs` trong thư mục dự án
2. **Copy toàn bộ code** trong file này
3. Quay lại Google Apps Script
4. **Paste code** vào file `Code.gs` (xóa code mẫu cũ)

#### 2.3. Cấu hình API Key

1. Tìm dòng:
```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

2. Thay `'YOUR_GEMINI_API_KEY_HERE'` bằng API key bạn đã copy ở **Bước 1**:
```javascript
const GEMINI_API_KEY = 'AIzaSy...your-actual-key-here';
```

3. **Save** (Ctrl/Cmd + S)

#### 2.4. Test Backend (Optional nhưng nên làm)

1. Chọn function `testGeminiAPI` trong dropdown
2. Click **Run** (▶️)
3. Cấp quyền nếu được yêu cầu:
   - Click "Review Permissions"
   - Chọn tài khoản Google
   - Click "Advanced" → "Go to GHTK AI Assistant Backend (unsafe)"
   - Click "Allow"
4. Kiểm tra **Logs** (Ctrl/Cmd + Enter):
   - Nếu thấy câu trả lời từ AI → ✅ Thành công!
   - Nếu có lỗi → Kiểm tra lại API key

#### 2.5. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click biểu tượng ⚙️ Settings bên cạnh "Select type"
3. Chọn **"Web app"**
4. Cấu hình:
   - **Description**: `GHTK AI Assistant v1.0`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(hoặc "Anyone with Google account" nếu muốn bảo mật hơn)*
5. Click **Deploy**
6. **Copy Web app URL** (trông giống: `https://script.google.com/macros/s/AKfycby.../exec`)

> 💡 **Quan trọng**: Lưu URL này để dùng ở Bước 3!

---

### **Bước 3: Cấu hình Frontend**

1. Mở file `index.html`
2. Tìm dòng (khoảng dòng 6575):
```javascript
const GHTK_AI_CONFIG = {
    BACKEND_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
    // ...
};
```

3. Thay `'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'` bằng **Web app URL** từ Bước 2.5:
```javascript
const GHTK_AI_CONFIG = {
    BACKEND_URL: 'https://script.google.com/macros/s/AKfycby.../exec',
    // ...
};
```

4. **Save** file

---

## 🎉 Hoàn thành!

Mở file `index.html` trong trình duyệt và test chatbot:

1. Click vào **nút chat tròn màu xanh** ở góc dưới bên phải
2. Thử hỏi: `"Quy trình ONBOARD là gì?"`
3. Hoặc click vào các **Quick Action chips**

---

## 🔧 Tùy chỉnh

### Thay đổi Quick Actions

Mở `index.html`, tìm dòng (khoảng 6621):

```html
<div id="chat-quick-actions">
    <button class="quick-action-chip" data-question="Câu hỏi của bạn">📋 Label hiển thị</button>
    <!-- Thêm các nút khác -->
</div>
```

### Thay đổi màu sắc

Mở `index.html`, tìm phần CSS (khoảng dòng 3237):

```css
/* Thay đổi màu chủ đạo */
#chat-launcher {
    background: linear-gradient(135deg, #00b14f 0%, #028a3d 100%);
    /* Thay #00b14f và #028a3d bằng màu bạn muốn */
}
```

### Thay đổi System Prompt

Mở `google-apps-script-backend.gs`, tìm `SYSTEM_PROMPT` và chỉnh sửa theo ý muốn.

---

## 🐛 Debug & Troubleshooting

### Chatbot không trả lời

**Kiểm tra Console (F12):**

1. Mở Developer Tools (F12)
2. Vào tab **Console**
3. Xem các thông báo lỗi

**Lỗi thường gặp:**

| Lỗi | Nguyên nhân | Giải pháp |
|------|------------|-----------|
| `Chưa cấu hình Backend API` | Chưa cập nhật `BACKEND_URL` | Kiểm tra lại Bước 3 |
| `HTTP error! status: 403` | Web App chưa deploy đúng | Kiểm tra lại Bước 2.5, đảm bảo "Who has access" là "Anyone" |
| `Gemini API Key chưa được cấu hình` | Chưa cập nhật API key trong Apps Script | Kiểm tra lại Bước 2.3 |
| `CORS error` | Lỗi CORS từ Apps Script | Deploy lại Web App với quyền "Anyone" |

### Kiểm tra Google Apps Script Logs

1. Mở Google Apps Script: https://script.google.com/
2. Mở dự án `GHTK AI Assistant Backend`
3. Click **Executions** (⏱️) ở sidebar
4. Xem lịch sử requests và lỗi

### Test Backend trực tiếp

Mở URL này trong trình duyệt (thay bằng Web app URL của bạn):
```
https://script.google.com/macros/s/AKfycby.../exec
```

Nếu thấy:
```json
{"status":"ok","message":"GHTK AI Assistant Backend is running!","version":"1.0.0"}
```

→ ✅ Backend hoạt động tốt!

---

## 🎨 Demo Commands (Debug trong Console)

Mở Developer Tools (F12) và thử các lệnh:

```javascript
// Mở/đóng chat
ghtkChat.toggleChat()

// Xem lịch sử chat
ghtkChat.messages

// Xóa lịch sử chat
ghtkChat.clearHistory()

// Gửi tin nhắn từ code
ghtkChat.sendMessage('Quy trình Đăng đơn là gì?')
```

---

## 📊 Giới hạn & Lưu ý

### Gemini API Free Tier

- **15 requests/minute**
- **1500 requests/day**
- **1 million tokens/minute**

→ Đủ cho việc sử dụng cá nhân và team nhỏ.

### Context Length

- Mặc định giới hạn **15,000 ký tự** context
- Có thể thay đổi trong `GHTK_AI_CONFIG.MAX_CONTEXT_LENGTH`
- Context quá dài → tốn token, tăng chi phí

### Chat History

- Lưu tối đa **50 tin nhắn** trong localStorage
- Có thể thay đổi trong `GHTK_AI_CONFIG.MAX_MESSAGES`
- Clear cache/localStorage → mất lịch sử chat

---

## 🔐 Bảo mật & Best Practices

### 1. Bảo vệ API Key

❌ **KHÔNG:**
- Commit API key lên GitHub/GitLab
- Chia sẻ API key qua email/chat
- Hardcode API key trong frontend

✅ **NÊN:**
- Lưu API key trong Google Apps Script Properties
- Sử dụng environment variables
- Rotate API key định kỳ

### 2. Rate Limiting

Thêm rate limiting trong Google Apps Script:

```javascript
// Trong doPost function
const cache = CacheService.getScriptCache();
const userIp = e.parameter.userIp;
const cacheKey = `ratelimit_${userIp}`;

const requestCount = cache.get(cacheKey) || 0;
if (requestCount > 10) {  // Max 10 requests per minute
  return ContentService.createTextOutput(JSON.stringify({
    error: 'Rate limit exceeded. Please try again later.'
  }));
}

cache.put(cacheKey, parseInt(requestCount) + 1, 60);  // Expire in 60s
```

### 3. Access Control

Trong Apps Script Deploy settings:
- **Development**: `Anyone` (để test)
- **Production**: `Anyone with Google account` (bảo mật hơn)

---

## 🚀 Nâng cao

### 1. Thêm Analytics

Track số lượng câu hỏi:

```javascript
// Trong callBackendAPI (frontend)
const response = await fetch(GHTK_AI_CONFIG.BACKEND_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        question: question,
        context: context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
    })
});
```

### 2. Streaming Responses

Hiện tại chatbot chờ toàn bộ response rồi hiển thị.

Để streaming (hiển thị từng chữ):
- Sử dụng Server-Sent Events (SSE)
- Hoặc polling với streaming API

### 3. Multi-language Support

Thêm ngôn ngữ khác trong System Prompt:

```javascript
const SYSTEM_PROMPT = `You are a professional AI assistant for GHTK...

If the user asks in English, respond in English.
If the user asks in Vietnamese, respond in Vietnamese.`;
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. ✅ Kiểm tra lại tất cả các bước
2. 🔍 Xem phần Troubleshooting
3. 📖 Đọc docs:
   - Gemini API: https://ai.google.dev/docs
   - Apps Script: https://developers.google.com/apps-script
4. 💬 Hỏi trong Console (F12) để debug

---

## 📝 License

MIT License - Free to use and modify.

---

## 🎯 Version

**v1.0.0** - Initial Release (2025-01-24)

### Changelog

- ✅ Chat widget với glassmorphism UI
- ✅ Context-aware AI với Gemini 1.5 Flash
- ✅ localStorage chat history
- ✅ Quick action chips
- ✅ Markdown rendering
- ✅ Mobile responsive
- ✅ Debug commands

---

**Chúc bạn sử dụng GHTK AI Assistant hiệu quả! 🚀**
