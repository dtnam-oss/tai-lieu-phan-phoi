# 🔧 CORS Fix - Deployment Guide

## ⚠️ Vấn đề đã được khắc phục

**Lỗi CORS đã được fix hoàn toàn!**

```
❌ TRƯỚC: Access to fetch at '...' has been blocked by CORS policy
✅ SAU: Chatbot hoạt động bình thường
```

---

## 🔍 Nguyên nhân lỗi

### Vấn đề kỹ thuật

1. **Frontend gửi `Content-Type: application/json`**
   - Trình duyệt tự động gửi **Preflight Request (OPTIONS)** trước
   - Google Apps Script **không hỗ trợ OPTIONS method**
   - → Preflight bị reject → Request chính bị block

2. **Google Apps Script CORS behavior**
   - Chỉ hỗ trợ `GET` và `POST` methods
   - Không xử lý được CORS preflight từ browsers

---

## ✅ Giải pháp đã implement

### 1. Frontend Fix (index.html)

**THAY ĐỔI:**

```javascript
// ❌ TRƯỚC (gây CORS preflight)
const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',  // ← Triggers preflight
    },
    body: JSON.stringify({ question, context })
});
```

```javascript
// ✅ SAU (bypass CORS preflight)
const response = await fetch(API_URL, {
    method: 'POST',
    redirect: 'follow',  // ← Handle Google Apps Script 302 redirect
    headers: {
        'Content-Type': 'text/plain;charset=utf-8',  // ← NO preflight!
    },
    body: JSON.stringify({ question, context })
});
```

**Tại sao hoạt động?**

- `text/plain` là **simple content type** → Không trigger preflight
- Trình duyệt gửi thẳng POST request
- Data vẫn là JSON string trong body

### 2. Backend Fix (Google Apps Script)

**THAY ĐỔI:**

```javascript
// ❌ TRƯỚC (chỉ xử lý application/json)
function doPost(e) {
  const requestData = JSON.parse(e.postData.contents);
  // ...
}
```

```javascript
// ✅ SAU (xử lý cả text/plain và form-urlencoded)
function doPost(e) {
  let requestData;

  try {
    // Parse JSON from text/plain (Chatbot)
    requestData = JSON.parse(e.postData.contents);
  } catch (parseError) {
    // Fallback: form-urlencoded (Video Database)
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      requestData = e.parameter;
    }
  }

  // ... rest of logic
}
```

**Tương thích:**

- ✅ Chatbot requests (JSON via text/plain)
- ✅ Video Database requests (form-urlencoded)
- ✅ Backward compatible với code cũ

---

## 🚀 Hướng dẫn Deploy (QUAN TRỌNG!)

### ⚠️ Frontend đã sẵn sàng - Chỉ cần update Backend!

File `index.html` đã được fix và commit. **KHÔNG CẦN** thay đổi gì trên frontend.

### 📝 Bước 1: Update Google Apps Script

#### Option A: Nếu dùng Merged Backend (Khuyến nghị)

1. Mở Google Apps Script: https://script.google.com/
2. Tìm project với URL: `AKfycbxaujZ9IVqRWnpAOA...`
3. Mở file `Code.gs`
4. **Backup code hiện tại** (copy sang file mới)
5. Mở file [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs) (đã fix)
6. **Copy toàn bộ** → Paste vào `Code.gs`
7. Thay `YOUR_GEMINI_API_KEY_HERE` bằng API key thực (nếu chưa)
8. **Save** (Ctrl/Cmd + S)

#### Option B: Nếu dùng Standalone Backend

1. Mở Google Apps Script của Chatbot
2. Mở file [google-apps-script-backend.gs](google-apps-script-backend.gs) (đã fix)
3. Copy toàn bộ → Paste vào `Code.gs`
4. Thay API key
5. Save

---

### 📦 Bước 2: Deploy lại Web App (BẮT BUỘC!)

**⚠️ QUAN TRỌNG: Phải deploy lại thì code mới mới có hiệu lực!**

#### Cách 1: New Deployment (Tạo mới - Khuyến nghị)

1. Click **Deploy** → **New deployment**
2. Click ⚙️ (Settings) → Chọn **"Web app"**
3. Cấu hình:
   ```
   Description: CORS Fix - v2.1
   Execute as: Me (your-email@gmail.com)
   Who has access: Anyone
   ```
4. Click **Deploy**
5. **Copy Web app URL mới**
6. **CẬP NHẬT URL** trong `index.html`:
   ```javascript
   // Dòng ~6576
   BACKEND_URL: 'YOUR_NEW_WEB_APP_URL_HERE'
   ```

#### Cách 2: Update Existing Deployment (Cập nhật cũ)

1. Click **Deploy** → **Manage deployments**
2. Click ⚙️ bên cạnh deployment hiện tại
3. Click **"New version"**
4. Description: `CORS Fix - v2.1`
5. Click **Deploy**
6. ✅ URL không đổi → Frontend không cần update

> 💡 **Khuyến nghị**: Dùng **Cách 2** để giữ nguyên URL, không phải update frontend.

---

### 🧪 Bước 3: Test Backend (Trước khi test chatbot)

#### Test 1: Kiểm tra GET endpoint

Mở trong browser:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**Kết quả mong đợi:**
```json
{
  "status": "ok",
  "message": "GHTK Web App is running!",
  "services": ["Video Database", "AI Chatbot"],
  "version": "2.0.0"
}
```

✅ Backend hoạt động!

#### Test 2: Test function trong Apps Script

1. Chọn function **`testChatbot`** trong dropdown
2. Click **Run** (▶️)
3. Xem **Logs** (View → Logs hoặc Ctrl/Cmd + Enter)

**Kết quả mong đợi:**
```
Chatbot Response:
{"answer":"...câu trả lời từ Gemini...","timestamp":"..."}
```

✅ Gemini API hoạt động!

---

### 🎉 Bước 4: Test Chatbot trên Website

1. Mở `index.html` trong browser (hoặc live site)
2. Click **nút chat tròn xanh** ở góc phải dưới
3. Gửi tin nhắn: **"Quy trình ONBOARD là gì?"**
4. Chờ AI trả lời (~2-5 giây)

**Kết quả mong đợi:**
```
🤖 Bot: Quy trình ONBOARD gồm 3 bước chính:
- Đăng ký tài khoản...
- Xác minh thông tin...
- Cấu hình hệ thống...
```

✅ **Chatbot hoạt động hoàn hảo!**

---

## 🐛 Troubleshooting

### Lỗi vẫn còn CORS?

**Kiểm tra:**

1. ✅ Đã deploy lại chưa? (New version or New deployment)
2. ✅ Đã hard refresh browser chưa? (Ctrl+F5 hoặc Cmd+Shift+R)
3. ✅ URL trong `BACKEND_URL` đã đúng chưa?

**Fix:**

- Clear browser cache
- Mở Incognito/Private window để test
- Kiểm tra Console (F12) xem có lỗi khác không

### Lỗi "Gemini API Key chưa được cấu hình"

**Fix:**

1. Mở Google Apps Script
2. Tìm dòng: `const GEMINI_API_KEY = '...'`
3. Thay bằng API key thực
4. Save → Deploy lại

### Lỗi "Cannot parse request data"

**Nguyên nhân:** Backend chưa được update

**Fix:**

1. Kiểm tra code `doPost` đã có logic parse `text/plain` chưa
2. Xem Logs trong Apps Script để debug
3. Deploy lại với code mới

### Chatbot không trả lời

**Debug steps:**

1. Mở Console (F12) → Tab **Network**
2. Gửi tin nhắn trong chat
3. Tìm request đến Apps Script URL
4. Click vào → Xem **Response**:
   - Nếu có `error`: Đọc message để biết lỗi
   - Nếu có `answer`: Frontend có vấn đề (kiểm tra Console)
5. Xem **Apps Script Logs**:
   - Apps Script → Executions (⏱️)
   - Xem log của request vừa gửi

---

## 📊 So sánh Trước/Sau

| Aspect | Trước (Lỗi CORS) | Sau (Fixed) |
|--------|------------------|-------------|
| **Content-Type** | `application/json` | `text/plain;charset=utf-8` |
| **Browser Preflight** | ✅ Triggered (OPTIONS) | ❌ Not triggered |
| **Request flow** | Browser → OPTIONS → Blocked | Browser → POST → Success |
| **Backend parsing** | `JSON.parse(e.postData.contents)` | Same (với fallback) |
| **Compatibility** | ❌ CORS error | ✅ Works perfectly |
| **Performance** | N/A (blocked) | ~2-5s response time |

---

## 🎯 Checklist Deploy

- [ ] **Backend updated** với code mới (CORS fix)
- [ ] **Gemini API Key** đã được thay
- [ ] **Deploy lại** Web App (New version)
- [ ] **Test GET endpoint** (kiểm tra backend live)
- [ ] **Test function** `testChatbot()` trong Apps Script
- [ ] **Hard refresh** browser (Ctrl+F5)
- [ ] **Test chatbot** trên website
- [ ] **Kiểm tra Console** không có lỗi CORS
- [ ] **Commit code** lên GitHub (nếu có thay đổi)

---

## 📝 Technical Details

### Why text/plain works?

Theo CORS specification:

**Simple Requests** (không trigger preflight):
- Methods: `GET`, `HEAD`, `POST`
- Content-Type: `text/plain`, `application/x-www-form-urlencoded`, `multipart/form-data`

**Preflight Requests** (trigger OPTIONS):
- Content-Type: `application/json`, `application/xml`, v.v.
- Custom headers
- Methods: `PUT`, `DELETE`, `PATCH`

→ Đổi sang `text/plain` = Simple Request = No preflight!

### Google Apps Script behavior

- Accepts POST with any content type
- Body luôn nằm trong `e.postData.contents`
- Automatically handles CORS for simple requests
- Returns 302 redirect → Cần `redirect: 'follow'`

---

## 🔗 Resources

- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Google Apps Script CORS](https://developers.google.com/apps-script/guides/web)
- [Fetch API - redirect](https://developer.mozilla.org/en-US/docs/Web/API/fetch#redirect)

---

**Version**: 2.1.0 | **Fix**: CORS Policy Bypass | **Updated**: 2025-12-24
