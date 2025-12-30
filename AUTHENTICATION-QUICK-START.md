# 🚀 User Authentication - Quick Start (5 phút)

> **💡 QUAN TRỌNG:** Hệ thống sử dụng **hybrid loading strategy**:
> - ✅ **Authentication**: Gọi API mỗi lần login (vì user list thay đổi liên tục)
> - ✅ **Content Data**: Load 1 lần từ Static Build (vì nội dung ít thay đổi)

## 📋 Checklist Setup

### ✅ Step 1: Chuẩn bị Google Sheet (2 phút)

1. Mở Google Sheet ID: `12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4`

2. Tạo tab mới tên **chính xác**: `UserSetting`

3. Thêm data (ít nhất 1 dòng):

```
| user_name      | user_email          |
|----------------|---------------------|
| Admin GHTK     | admin@ghtk.vn       |
| Test User      | test@example.com    |
```

**Lưu ý:** Dòng 1 là header, dữ liệu bắt đầu từ dòng 2

---

### ✅ Step 2: Deploy Backend (2 phút)

1. Mở Apps Script: **https://script.google.com/**

2. Tìm project có URL:
   ```
   ...AKfycbxaujZ9IVqRWnpAOA...
   ```

3. Copy toàn bộ code từ [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs)

4. Paste vào `Code.gs` → **Save**

5. **Deploy** → **Manage deployments** → **⚙️** → **New version**
   - Description: `Add User Auth v2.1.0`
   - **Deploy** → **Done**

---

### ✅ Step 3: Test Backend (30 giây)

Mở browser, paste URL (thay YOUR_EMAIL):

```
https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA-HuCvDWDg46J_Q8xSZOGAbJ8IQ0DOsybDf-hWptKVl9q7ncfNS8g/exec?action=verify_user&email=dtnam@nakvn.com
```

**Expected:**
```json
{
  "success": true,
  "authorized": true,
  "userName": "Admin GHTK",
  "message": "Đăng nhập thành công"
}
```

✅ **Nếu thấy `"authorized": true` → Backend OK!**

---

### ✅ Step 4: Deploy Frontend (30 giây)

Frontend đã được commit vào git. Chỉ cần push:

```bash
cd /Users/mac/Desktop/tai-lieu-phan-phoi
git push origin main
```

GitHub Pages sẽ tự động deploy sau 1-2 phút.

---

### ✅ Step 5: Test Frontend (30 giây)

1. Mở website: `https://YOUR_USERNAME.github.io/tai-lieu-phan-phoi/`

2. Clear cache: `Ctrl+Shift+Delete` → Clear cache

3. Hard reload: `Ctrl+F5` (Windows) hoặc `Cmd+Shift+R` (Mac)

4. **Kết quả mong đợi:**
   - ✅ Login modal hiển thị full-screen
   - ✅ GHTK logo + green background
   - ✅ Email input field

5. Nhập email có trong Sheet → Click "Đăng nhập"

6. **Kết quả mong đợi:**
   - ✅ "✅ Đăng nhập thành công!"
   - ✅ Modal biến mất
   - ✅ Vào được nội dung trang

---

## 🧪 Quick Tests

### Test 1: Valid Email
```
Email: admin@ghtk.vn
Result: ✅ Success → Enter website
```

### Test 2: Invalid Email
```
Email: hacker@evil.com
Result: ❌ Error "Email không có quyền truy cập..."
```

### Test 3: Auto-Login
```
1. Login thành công
2. Reload page (F5)
Result: ✅ Không cần login lại (session 7 ngày)
```

### Test 4: Logout
```javascript
// Run in Console
GHTK_Logout();
// → Page reload → Login modal hiển thị lại
```

---

## 🔧 Common Issues

### Issue: "Sheet not found"
**Fix:** Kiểm tra tên tab phải là **chính xác** `UserSetting` (case-sensitive)

### Issue: Email hợp lệ nhưng bị từ chối
**Fix:** Kiểm tra email trong Sheet, đảm bảo không có dấu cách thừa

### Issue: Modal không hiển thị
**Fix:** Clear cache (`Ctrl+Shift+Delete`) và hard reload (`Ctrl+F5`)

---

## 📞 Debug Commands

```javascript
// Check auth status
console.log(localStorage.getItem('ghtk_auth_user'));

// Manual logout
GHTK_Logout();

// Test API
fetch('API_URL?action=verify_user&email=test@ghtk.vn')
  .then(r => r.json())
  .then(d => console.log(d));
```

---

## 📚 Full Documentation

Chi tiết đầy đủ: [USER-AUTHENTICATION-DEPLOYMENT-GUIDE.md](USER-AUTHENTICATION-DEPLOYMENT-GUIDE.md)

---

**🎯 DONE! Hệ thống authentication đã sẵn sàng!**

- ✅ Chỉ người có email trong Sheet mới vào được
- ✅ Session lưu 7 ngày (không cần login lại)
- ✅ UI đẹp, professional với GHTK branding
- ✅ Mobile responsive
- ✅ Có security measures cơ bản

---

**Updated:** 2025-12-29 | **Version:** 2.1.0
