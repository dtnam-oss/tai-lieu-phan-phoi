# ⚠️ ACTION REQUIRED - Deploy Backend để Fix CORS!

## 🎯 TÓM TẮT

✅ **Frontend đã được fix** và commit lên GitHub
⚠️ **Backend CẦN được update và deploy lại** (BẠN PHẢI LÀM!)

---

## 🚀 HÀNH ĐỘNG NGAY (5 phút)

### Bước 1: Mở Google Apps Script

1. Truy cập: https://script.google.com/
2. Tìm project với URL chứa: `AKfycbxaujZ9IVqRWnpAOA...`

### Bước 2: Backup code hiện tại (An toàn)

1. Select toàn bộ code trong `Code.gs`
2. Copy
3. Tạo file mới: **File** → **New** → **Script file**
4. Đặt tên: `Code-backup`
5. Paste code cũ vào đó
6. **Save**

### Bước 3: Update code mới (FIX CORS)

1. Mở file này: [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs)
2. **Select ALL** (Ctrl/Cmd + A)
3. **Copy** (Ctrl/Cmd + C)
4. Quay lại Apps Script → Mở `Code.gs`
5. **Select ALL** → **Delete**
6. **Paste** code mới
7. **Tìm dòng 15:**
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
8. **Thay** bằng Gemini API key thực của bạn (nếu chưa có)
9. **Save** (Ctrl/Cmd + S hoặc File → Save)

### Bước 4: Deploy lại (QUAN TRỌNG NHẤT!)

**Option A: Update Deployment hiện tại (Khuyến nghị - URL không đổi)**

1. Click **Deploy** → **Manage deployments**
2. Click ⚙️ (icon Settings) bên cạnh deployment hiện có
3. Click **"New version"**
4. Mô tả (Description): `CORS Fix v2.1`
5. Click **Deploy**
6. Đợi vài giây
7. Click **Done**

✅ **Xong! URL không đổi, frontend không cần update.**

**Option B: Tạo Deployment mới (Nếu option A không có)**

1. Click **Deploy** → **New deployment**
2. Click ⚙️ → Chọn **"Web app"**
3. Cấu hình:
   ```
   Description: CORS Fix v2.1
   Execute as: Me
   Who has access: Anyone
   ```
4. Click **Deploy**
5. **Copy Web app URL mới**
6. **MỞ** file `index.html` (local)
7. **Tìm dòng ~6576:**
   ```javascript
   BACKEND_URL: 'https://script.google.com/macros/s/...',
   ```
8. **Thay** bằng URL mới
9. **Save** → **Commit** → **Push** lên GitHub

---

## ✅ Bước 5: Test ngay!

### Test 1: Kiểm tra backend đang chạy

Mở URL này trong browser (thay bằng URL deployment của bạn):

```
https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA.../exec
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

✅ Backend live!

### Test 2: Test Chatbot

1. Mở `index.html` trong browser
   - **Local**: Double-click file
   - **Live**: https://dtnam-oss.github.io/tai-lieu-phan-phoi/

2. **Hard refresh** (Ctrl+F5 hoặc Cmd+Shift+R) để clear cache

3. Click **nút chat tròn xanh** ở góc phải dưới

4. Gửi tin nhắn: **"Quy trình ONBOARD là gì?"**

5. Chờ 2-5 giây...

**Kết quả mong đợi:**

```
🤖 Bot: Quy trình ONBOARD gồm 3 bước chính:
- Đăng ký tài khoản: Cung cấp thông tin...
- Xác minh: GHTK xác minh trong 24h...
- Cấu hình: Thiết lập thông tin shop...
```

✅ **CHATBOT HOẠT ĐỘNG!**

---

## 🐛 Nếu vẫn lỗi CORS

### Kiểm tra lại:

- [ ] Đã deploy **New version** chưa?
- [ ] Đã **hard refresh** browser chưa? (Ctrl+F5)
- [ ] Đã thay **Gemini API Key** chưa?
- [ ] URL trong `BACKEND_URL` có đúng không?

### Debug:

1. Mở **Console** (F12) → Tab **Console**
2. Xem có lỗi gì không
3. Nếu vẫn CORS:
   - Mở tab **Network**
   - Gửi tin nhắn chat
   - Tìm request đến Apps Script
   - Click vào → Xem **Headers** → Content-Type phải là `text/plain`

4. Kiểm tra **Apps Script Logs**:
   - Apps Script → Click **Executions** (⏱️)
   - Xem log request vừa gửi
   - Nếu có lỗi → Đọc message

---

## 📚 Tài liệu chi tiết

Xem hướng dẫn đầy đủ tại:

- [CORS-FIX-DEPLOYMENT-GUIDE.md](CORS-FIX-DEPLOYMENT-GUIDE.md) - Complete guide
- [QUICK-START.md](QUICK-START.md) - Quick setup
- [HUONG-DAN-UPDATE-GOOGLE-APPS-SCRIPT.md](HUONG-DAN-UPDATE-GOOGLE-APPS-SCRIPT.md) - Update guide

---

## 📞 Cần trợ giúp?

### Debug Commands (Console - F12)

```javascript
// Kiểm tra config
console.log(GHTK_AI_CONFIG);

// Test chat manager
ghtkChat.toggleChat();

// Xem messages
ghtkChat.messages;

// Clear history
ghtkChat.clearHistory();
```

### Liên hệ

- GitHub Issues: https://github.com/dtnam-oss/tai-lieu-phan-phoi/issues
- Check console logs (F12)
- Check Apps Script logs (Executions)

---

## 🎉 Sau khi hoàn thành

Chatbot sẽ:

✅ Hoạt động bình thường, không lỗi CORS
✅ Trả lời câu hỏi về tài liệu
✅ Lưu lịch sử chat trong localStorage
✅ Hiển thị markdown đẹp (bold, bullets)
✅ Responsive trên mobile

---

**NHẮC NHỞ:** Deploy backend là **BẮT BUỘC** để fix CORS work!

**Thời gian:** ~5 phút
**Độ khó:** ⭐⭐ (Easy - chỉ copy/paste)

**LÀM NGAY!** 🚀
