# ⚡ Quick Start - GHTK AI Assistant

## 🎯 Bạn đã có Web App URL sẵn? → Chỉ cần 2 bước!

### ✅ **Bước 1: Lấy Gemini API Key (2 phút)**

1. Mở: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy key → Lưu lại

### ✅ **Bước 2: Cập nhật Google Apps Script (5 phút)**

#### **Cách 1: Nhanh nhất (Copy-Paste toàn bộ)**

1. Mở Apps Script: https://script.google.com/
2. Tìm project có URL: `AKfycbxaujZ9IVqRWnpAOA-HuCvDWDg46J_Q8xSZOGAbJ8IQ0DOsybDf-hWptKVl9q7ncfNS8g`
3. Backup code cũ (copy sang file mới)
4. Mở file **`google-apps-script-MERGED.gs`** trong thư mục này
5. Copy toàn bộ → Paste vào Code.gs
6. Tìm dòng 13:
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
   → Thay bằng API key của bạn
7. Implement logic Video Database cũ vào các function:
   - `getVideosFromSheet()`
   - `addVideoToSheet()`
   - `deleteVideoFromSheet()`
8. Save → Test bằng `testChatbot()` → Deploy lại

#### **Cách 2: Chỉ thêm code Chatbot (Giữ nguyên code cũ)**

Xem chi tiết trong: **`HUONG-DAN-UPDATE-GOOGLE-APPS-SCRIPT.md`** → Option B

---

## 🎉 Xong!

Frontend đã được cấu hình sẵn với URL của bạn:

```javascript
// index.html - dòng 6576
BACKEND_URL: 'https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA.../exec'
```

**Mở index.html → Click nút chat → Hỏi thử!**

---

## 📁 Files trong dự án

| File | Mô tả |
|------|-------|
| **index.html** | ✅ Đã tích hợp chatbot (Frontend) |
| **google-apps-script-MERGED.gs** | Code backend để merge vào Apps Script |
| **HUONG-DAN-UPDATE-GOOGLE-APPS-SCRIPT.md** | Hướng dẫn chi tiết 2 cách update |
| **GHTK-AI-ASSISTANT-SETUP-GUIDE.md** | Guide đầy đủ (nếu tạo Web App mới) |
| **google-apps-script-backend.gs** | Code backend standalone (nếu tạo Web App riêng) |

---

## 🐛 Lỗi phổ biến

### "Chưa cấu hình Backend API"
→ Kiểm tra `GEMINI_API_KEY` trong Apps Script

### "HTTP 403"
→ Deploy với "Who has access" = "Anyone"

### "Gemini API error"
→ API key sai → Tạo lại tại https://aistudio.google.com/app/apikey

---

## 💬 Debug Commands

Mở Console (F12):

```javascript
ghtkChat.toggleChat()      // Mở/đóng chat
ghtkChat.messages          // Xem lịch sử
ghtkChat.clearHistory()    // Xóa lịch sử
```

---

## 📞 Cần trợ giúp?

1. ✅ Đọc **HUONG-DAN-UPDATE-GOOGLE-APPS-SCRIPT.md**
2. 🔍 Xem phần Troubleshooting
3. 🪵 Kiểm tra Console (F12) + Apps Script Logs

---

**Chúc bạn thành công! 🚀**
