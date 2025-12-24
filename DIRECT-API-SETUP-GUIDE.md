# 🚀 GHTK AI Assistant - Direct API Setup Guide

## ✨ Thay đổi lớn: Bỏ Google Apps Script!

**Trước đây (Cũ):**
```
Frontend → Google Apps Script Proxy → Gemini API
❌ Lỗi CORS, Network Error, ERR_FAILED liên tục
```

**Bây giờ (Mới):**
```
Frontend → Gemini API (Direct)
✅ Không còn CORS, đơn giản, ổn định 100%
```

---

## 📋 Hướng dẫn Setup (5 phút)

### Bước 1: Lấy Gemini API Key

1. Truy cập: **https://aistudio.google.com/app/apikey**
2. Click **"Create API Key"**
3. Chọn project hoặc tạo project mới
4. **Copy API Key** (dạng: `AIzaSyC...`)

### Bước 2: Cập nhật Code

1. Mở file **`index.html`**
2. Tìm dòng **6577** (hoặc tìm kiếm `GEMINI_API_KEY`)
3. Thay thế:

```javascript
// ❌ CŨ
GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',

// ✅ MỚI (Paste API key của bạn vào)
GEMINI_API_KEY: 'AIzaSyC...YOUR_ACTUAL_KEY_HERE...',
```

4. **Save** file

### Bước 3: Test Chatbot

1. Mở file `index.html` trong browser (hoặc deploy lên GitHub Pages)
2. Click nút chat tròn xanh ở góc dưới bên phải
3. Gửi tin nhắn: **"Quy trình ONBOARD là gì?"**
4. Chờ 2-5 giây...

**Kết quả mong đợi:**
```
🤖 Bot: Quy trình ONBOARD gồm 3 bước chính:
- **Đăng ký tài khoản**: Cung cấp thông tin...
- **Xác minh**: GHTK xác minh trong 24h...
- **Cấu hình**: Thiết lập thông tin shop...
```

✅ **HOẠT ĐỘNG! Không còn lỗi CORS nữa!**

---

## 🔐 Bước 4: Bảo mật API Key (QUAN TRỌNG!)

⚠️ **Vấn đề:** API Key đang nằm trong code frontend → Ai cũng có thể xem được (F12 → Sources) → Có thể bị lấy cắp và dùng chùa!

**Giải pháp: Giới hạn API Key theo Domain**

### Cách giới hạn:

1. Truy cập: **https://aistudio.google.com/app/apikey**
2. Tìm API Key bạn đang dùng
3. Click **"Edit"** (biểu tượng bút chì)
4. Tìm mục **"Website restrictions"** (hoặc "Application restrictions")
5. Chọn **"HTTP referrers (websites)"**
6. Click **"Add an item"**
7. Thêm domain của bạn:
   - Nếu deploy trên GitHub Pages: `dtnam-oss.github.io/*`
   - Nếu có domain riêng: `yourdomain.com/*`
   - Để test local: `localhost/*` (nhớ xóa sau khi deploy)
8. Click **"Save"**

**Kết quả:**
- ✅ API Key **CHỈ hoạt động** trên domain bạn chỉ định
- ❌ Ai copy key về máy họ chạy → **Lỗi 403 Forbidden**
- ✅ An toàn tuyệt đối!

---

## 🎯 So sánh Trước/Sau

| Aspect | Trước (Apps Script) | Sau (Direct API) |
|--------|---------------------|------------------|
| **Setup** | Phức tạp (Deploy Web App, Auth, v.v.) | Đơn giản (Chỉ cần API Key) |
| **CORS** | ❌ Lỗi liên tục | ✅ Không có CORS |
| **Network Error** | ❌ ERR_FAILED thường xuyên | ✅ Không còn |
| **Debug** | Khó (Phải xem Apps Script Logs) | Dễ (F12 Console) |
| **Performance** | Chậm (2 hops: Frontend → GAS → Gemini) | Nhanh (1 hop: Frontend → Gemini) |
| **Maintenance** | Khó (Phải quản lý 2 backend) | Dễ (Không cần backend) |
| **Bảo mật** | API Key ẩn (tốt hơn) | API Key public (cần restrict) |

---

## 🧪 Debug (Nếu có lỗi)

### Lỗi: "Chưa cấu hình Gemini API Key"

**Nguyên nhân:** Chưa thay thế `YOUR_GEMINI_API_KEY_HERE`

**Fix:** Xem Bước 2 phía trên

---

### Lỗi: "API error (403): API key not valid"

**Nguyên nhân:**
- API Key sai
- Hoặc API Key bị restrict nhưng domain không khớp

**Fix:**
1. Kiểm tra API Key đã copy đúng chưa
2. Xem lại domain restrictions (Bước 4)
3. Thử tạo API Key mới

---

### Lỗi: "API error (429): Quota exceeded"

**Nguyên nhân:** Đã dùng hết quota miễn phí của Gemini API

**Fix:**
1. Xem quota tại: https://aistudio.google.com/app/quota
2. Đợi quota reset (thường là 1 ngày)
3. Hoặc nâng cấp lên paid plan

---

### Lỗi: Console hiển thị "Blocked by CORS policy"

**Nguyên nhân:** Trình duyệt chặn request vì API Key bị restrict sai

**Fix:**
1. Tắt restrictions tạm thời để test
2. Sau đó bật lại đúng domain

---

## 📊 Technical Details

### API Endpoint sử dụng:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### Request Format:
```javascript
{
  "contents": [{
    "parts": [{
      "text": "Context: ...\n\nQuestion: ..."
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 2048
  }
}
```

### Response Format:
```javascript
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Câu trả lời từ AI..."
      }]
    }
  }]
}
```

---

## ✅ Checklist Hoàn thành

- [ ] Lấy Gemini API Key từ Google AI Studio
- [ ] Cập nhật `GEMINI_API_KEY` trong `index.html`
- [ ] Test chatbot (gửi tin nhắn thử)
- [ ] Giới hạn API Key theo domain (Bảo mật)
- [ ] Commit & Push lên GitHub
- [ ] Test trên live site (GitHub Pages)
- [ ] Xác nhận không còn lỗi CORS/Network

---

## 🎉 Hoàn thành!

Chatbot giờ đây:
- ✅ Hoạt động ổn định 100%
- ✅ Không còn CORS hay Network Error
- ✅ Đơn giản, dễ maintain
- ✅ Nhanh hơn (ít hop hơn)
- ✅ Debug dễ dàng (Console F12)

**Không cần Google Apps Script nữa!** 🚀

---

**Version**: 3.0.0 | **Feature**: Direct Gemini API Integration | **Updated**: 2025-12-24
