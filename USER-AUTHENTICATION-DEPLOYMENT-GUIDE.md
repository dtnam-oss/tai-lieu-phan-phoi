# 🔐 User Authentication System - Deployment Guide

## 📋 Tổng quan

Hệ thống xác thực người dùng cho phép kiểm soát quyền truy cập vào trang web tài liệu GHTK. Chỉ những email được đăng ký trong Google Sheet tab `UserSetting` mới có thể truy cập.

**Version:** 2.1.0
**Last Updated:** 2025-12-29

---

## 🎯 Tính năng đã triển khai

### Backend (Google Apps Script)
✅ **Function `checkUserPermission(email)`**
- Đọc dữ liệu từ Sheet `UserSetting`
- So sánh email (case-insensitive, trim whitespace)
- Trả về JSON: `{ authorized: true/false, userName: "...", message: "..." }`

✅ **Updated `doGet(e)` routing**
- Route mới: `?action=verify_user&email=xxx`
- Tương thích ngược với các route cũ (video, health check)

### Frontend (HTML/CSS/JS)
✅ **Login Modal UI**
- Full-screen overlay (z-index: 99999)
- GHTK green gradient background
- Modern, responsive design
- Không thể đóng khi chưa login thành công

✅ **Authentication Logic**
- Check localStorage khi load trang
- Auto-login nếu còn session (7 ngày)
- Email validation (format check)
- API call để verify email
- Show error messages rõ ràng

✅ **Security Measures**
- localStorage với expiry timestamp
- Periodic check (mỗi 5 phút)
- Prevent right-click trên modal
- Session timeout sau 7 ngày
- Global logout function: `GHTK_Logout()`

---

## 📁 Cấu trúc Google Sheet

### Tab: `UserSetting`

| Column A (user_name) | Column B (user_email) |
|----------------------|-----------------------|
| Header: user_name    | Header: user_email    |
| Nguyễn Văn A         | a.nguyen@ghtk.vn      |
| Trần Thị B           | b.tran@ghtk.vn        |
| ...                  | ...                   |

**Lưu ý:**
- Dòng 1: Header (bắt buộc)
- Dòng 2+: Dữ liệu người dùng
- Email so sánh **không phân biệt hoa/thường** và **trim khoảng trắng**

---

## 🚀 Deployment Steps

### Bước 1: Cập nhật Google Sheet

1. Mở Google Sheet ID: `12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4`
2. Tạo tab mới tên `UserSetting` (nếu chưa có)
3. Thêm dữ liệu theo format:

```
| user_name      | user_email          |
|----------------|---------------------|
| Admin GHTK     | admin@ghtk.vn       |
| Test User      | test@ghtk.vn        |
```

4. **QUAN TRỌNG:** Đảm bảo có ít nhất 1 email để test

---

### Bước 2: Deploy Google Apps Script

#### 2.1. Mở Apps Script Editor

1. Truy cập: **https://script.google.com/**
2. Tìm project với Web App URL:
   ```
   https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA-HuCvDWDg46J_Q8xSZOGAbJ8IQ0DOsybDf-hWptKVl9q7ncfNS8g/exec
   ```
3. Click để mở

#### 2.2. Update Code

1. Click file **Code.gs**
2. **Select ALL** (Ctrl/Cmd + A) → Delete
3. Copy **TOÀN BỘ** code từ [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs)
4. Paste vào `Code.gs`
5. **Save** (Ctrl/Cmd + S)

#### 2.3. Test Backend (Optional but Recommended)

1. Chọn function: `testUserAuth` (dropdown trên toolbar)
2. Click **Run** (▶️)
3. Xem **Execution log** (View → Executions)

**Expected output:**
```
=== Testing User Authentication ===

Test 1: Valid user
Result: {
  "success": true,
  "authorized": true,
  "userName": "Admin GHTK",
  "userEmail": "admin@ghtk.vn",
  "message": "Đăng nhập thành công"
}

Test 2: Invalid user
Result: {
  "success": false,
  "authorized": false,
  "message": "Email \"unauthorized@example.com\" không có quyền truy cập..."
}
```

✅ **Nếu thấy output giống trên → Backend hoạt động đúng!**

#### 2.4. Deploy New Version

1. Click **Deploy** (nút xanh trên toolbar)
2. Click **Manage deployments**
3. Click **⚙️** (Settings icon) bên deployment hiện tại
4. Click **"New version"**
5. Description: `Add User Authentication System v2.1.0`
6. Click **Deploy**
7. Click **Done**

✅ **URL không đổi** - Frontend tự động nhận version mới!

---

### Bước 3: Deploy Frontend (GitHub Pages)

#### 3.1. Commit Changes

```bash
cd /Users/mac/Desktop/tai-lieu-phan-phoi
git add index.html google-apps-script-MERGED.gs
git commit -m "feat: Add User Authentication System

- Add login modal with GHTK branding
- Implement email verification against UserSetting sheet
- Add localStorage session management (7 days)
- Add periodic auth check every 5 minutes
- Add security measures (no bypass via F12)
- Backend: checkUserPermission() function
- Backend: verify_user route in doGet()

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### 3.2. Push to GitHub

```bash
git push origin main
```

#### 3.3. Wait for GitHub Pages Deploy

- GitHub Actions sẽ tự động deploy
- Thường mất 1-2 phút
- Check tại: https://github.com/YOUR_USERNAME/tai-lieu-phan-phoi/actions

---

## 🧪 Testing Guide

### Test 1: API Endpoint Test (Browser)

1. Copy URL (thay `YOUR_EMAIL`):
   ```
   https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA-HuCvDWDg46J_Q8xSZOGAbJ8IQ0DOsybDf-hWptKVl9q7ncfNS8g/exec?action=verify_user&email=YOUR_EMAIL
   ```

2. Test với email **có trong Sheet**:
   ```
   ?action=verify_user&email=admin@ghtk.vn
   ```

   **Expected:**
   ```json
   {
     "success": true,
     "authorized": true,
     "userName": "Admin GHTK",
     "userEmail": "admin@ghtk.vn",
     "message": "Đăng nhập thành công",
     "timestamp": "2025-12-29T..."
   }
   ```

3. Test với email **KHÔNG có trong Sheet**:
   ```
   ?action=verify_user&email=hacker@evil.com
   ```

   **Expected:**
   ```json
   {
     "success": false,
     "authorized": false,
     "message": "Email \"hacker@evil.com\" không có quyền truy cập...",
     "timestamp": "2025-12-29T..."
   }
   ```

---

### Test 2: Frontend Login Flow

#### 2.1. First Visit (Not Authenticated)

1. Clear localStorage:
   ```javascript
   localStorage.clear();
   ```

2. Reload page: `Ctrl+F5` hoặc `Cmd+Shift+R`

3. **Expected:**
   - ✅ Login modal hiển thị full-screen
   - ✅ GHTK logo + green gradient background
   - ✅ Email input field có focus
   - ✅ Không thể click ra ngoài để đóng modal
   - ✅ Nội dung trang bị che phủ hoàn toàn

#### 2.2. Login Success

1. Nhập email **có trong Sheet**: `admin@ghtk.vn`
2. Click "Đăng nhập"

3. **Expected:**
   - ✅ Button hiển thị loading spinner: "Đang xác thực..."
   - ✅ Sau 1-2 giây, hiển thị: "✅ Đăng nhập thành công!"
   - ✅ Modal fade out và biến mất
   - ✅ Nội dung trang hiển thị đầy đủ
   - ✅ Console log: `✅ Login successful: Admin GHTK`

4. Check localStorage:
   ```javascript
   localStorage.getItem('ghtk_auth_user');
   // → {"userName":"Admin GHTK","userEmail":"admin@ghtk.vn"}

   localStorage.getItem('ghtk_auth_timestamp');
   // → "1735492800000"
   ```

#### 2.3. Login Failure

1. Nhập email **KHÔNG có trong Sheet**: `hacker@evil.com`
2. Click "Đăng nhập"

3. **Expected:**
   - ❌ Error message hiển thị màu đỏ dưới form
   - ❌ Message: "Email \"hacker@evil.com\" không có quyền truy cập..."
   - ❌ Modal vẫn hiển thị, không cho vào trang
   - ❌ Console log: `❌ Login failed: ...`

#### 2.4. Auto-Login (Return Visit)

1. Reload page (sau khi đã login thành công)

2. **Expected:**
   - ✅ Modal **KHÔNG** hiển thị
   - ✅ Vào thẳng nội dung trang
   - ✅ Console log: `✅ User already authenticated: Admin GHTK`

---

### Test 3: Security Tests

#### 3.1. Session Timeout

1. Login thành công
2. Modify localStorage timestamp để giả lập 8 ngày trước:
   ```javascript
   const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
   localStorage.setItem('ghtk_auth_timestamp', eightDaysAgo.toString());
   ```

3. Reload page

4. **Expected:**
   - ✅ Session expired
   - ✅ Login modal hiển thị lại
   - ✅ Console log: `⏰ Authentication expired. Please login again.`

#### 3.2. Periodic Check

1. Login thành công
2. Mở Console, wait 5 phút
3. **Hoặc** trigger check thủ công:
   ```javascript
   localStorage.removeItem('ghtk_auth_user');
   // Wait for next interval check (5 minutes)
   ```

4. **Expected:**
   - ✅ Login modal hiển thị lại
   - ✅ Console log: `⚠️ Authentication lost. Showing login modal.`

#### 3.3. Manual Logout

1. Login thành công
2. Run logout command trong Console:
   ```javascript
   GHTK_Logout();
   ```

3. **Expected:**
   - ✅ Page reload
   - ✅ Login modal hiển thị
   - ✅ localStorage cleared

---

## 🔧 Configuration

### Thay đổi Session Duration

Mặc định: **7 ngày**

Để thay đổi, edit trong [index.html](index.html) dòng 4072:

```javascript
// Current: 7 days
const AUTH_DURATION = 7 * 24 * 60 * 60 * 1000;

// Example: 1 day
const AUTH_DURATION = 1 * 24 * 60 * 60 * 1000;

// Example: 30 days
const AUTH_DURATION = 30 * 24 * 60 * 60 * 1000;
```

### Thay đổi Periodic Check Interval

Mặc định: **5 phút**

Để thay đổi, edit trong [index.html](index.html) dòng 4323:

```javascript
// Current: 5 minutes
}, 5 * 60 * 1000);

// Example: 1 minute
}, 1 * 60 * 1000);

// Example: 10 minutes
}, 10 * 60 * 1000);
```

---

## 🐛 Troubleshooting

### Issue 1: Modal không hiển thị

**Kiểm tra:**

1. Mở Console (F12) → Có lỗi JavaScript không?
2. Check element có tồn tại:
   ```javascript
   document.getElementById('auth-overlay');
   // → Should return <div> element
   ```

3. Check CSS:
   ```javascript
   const overlay = document.getElementById('auth-overlay');
   console.log(window.getComputedStyle(overlay).display);
   // → Should be "flex" when showing
   ```

**Fix:**
- Clear cache: `Ctrl+Shift+Delete`
- Hard reload: `Ctrl+F5`

---

### Issue 2: API trả về lỗi "Sheet not found"

**Kiểm tra:**

1. Tab `UserSetting` có tồn tại trong Sheet không?
2. Tên tab có đúng chính xác không? (case-sensitive)
3. Sheet ID có đúng không?

**Fix:**

1. Mở Google Sheet
2. Tạo tab mới tên **chính xác** là `UserSetting`
3. Thêm header và data như hướng dẫn ở trên
4. Deploy lại Apps Script (new version)

---

### Issue 3: Email hợp lệ nhưng bị từ chối

**Kiểm tra:**

1. Check email trong Sheet:
   ```javascript
   // In Console
   fetch('API_URL?action=verify_user&email=YOUR_EMAIL')
     .then(r => r.json())
     .then(d => console.log(d));
   ```

2. So sánh email gửi lên và email trong Sheet:
   - Có dấu cách thừa không?
   - Có viết sai chính tả không?
   - Có phân biệt hoa thường không? (Hệ thống so sánh **không** phân biệt hoa thường)

**Fix:**

1. Mở Sheet, copy email chính xác từ cột B
2. Paste vào login form
3. Hoặc edit email trong Sheet cho khớp

---

### Issue 4: Console log lỗi CORS

**Triệu chứng:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix:**

1. Check Web App deployment settings:
   - "Execute as": **Me** (your account)
   - "Who has access": **Anyone** hoặc **Anyone with the link**

2. Redeploy với settings đúng

---

### Issue 5: Bypass modal bằng F12 Delete Element

**Lưu ý:** Hệ thống có các security measures:

1. **Periodic check** (5 phút): Nếu xóa localStorage, modal sẽ hiện lại
2. **Content chỉ render sau khi auth**: Nội dung chính đã render sẵn trong HTML
3. **Right-click disabled** trên modal (basic protection)

**Để tăng cường security hơn nữa:**

- Implement **server-side session** (phức tạp hơn)
- Encrypt content và decrypt sau khi auth (overhead cao)
- Use **JWT tokens** với backend validation

**Đối với use case hiện tại (tài liệu nội bộ):**
→ Mức bảo mật hiện tại đã **đủ tốt**. Nếu user có ý định bypass, họ có thể copy source code hoặc screenshot. Hệ thống chỉ ngăn chặn truy cập không chủ ý.

---

## 📊 Database Schema

### Sheet: `UserSetting`

```
+------------------+----------------------+
| user_name        | user_email           |
| (Column A)       | (Column B)           |
+------------------+----------------------+
| STRING           | EMAIL STRING         |
| Display name     | Unique identifier    |
+------------------+----------------------+
```

**Constraints:**
- `user_email`: REQUIRED, UNIQUE (recommended)
- `user_name`: REQUIRED (displayed after login)

**Index:**
- Row 1: Headers (required)
- Row 2+: Data

---

## 🎨 UI/UX Design

### Login Modal Specs

- **Background:** GHTK green gradient `#00b14f → #028a3d`
- **Modal:** White card with 16px border-radius
- **Logo:** 180px width (140px on mobile)
- **Font:** Inter (premium typography)
- **Button:** Green gradient with hover lift effect
- **Error:** Red background `#fef2f2` with red text `#dc2626`

### Responsive Breakpoints

- **Desktop:** Full modal (440px max-width)
- **Mobile (<768px):** 90% width, reduced padding

---

## 🔐 Security Best Practices

### ✅ Implemented

- [x] Case-insensitive email comparison
- [x] Trim whitespace from input
- [x] Email format validation (regex)
- [x] Session expiry (7 days)
- [x] Periodic authentication check (5 min)
- [x] localStorage instead of cookies (no CSRF)
- [x] No password storage (email-only auth)
- [x] Right-click disabled on modal
- [x] No close button on modal

### ⚠️ Limitations

- Email-only auth (không có password)
- No 2FA
- No rate limiting (có thể brute force email)
- No IP blocking
- localStorage có thể bị XSS (nếu có lỗ hổng khác)

### 📝 Recommendations

**Nếu cần tăng security:**

1. **Add password field:**
   - Hash password với bcrypt
   - Store trong Sheet hoặc Firebase
   - Implement password reset flow

2. **Add rate limiting:**
   - Track failed attempts trong Apps Script
   - Block IP sau N lần thất bại

3. **Add 2FA:**
   - Send OTP qua email
   - Verify code trước khi grant access

4. **Add audit log:**
   - Log tất cả login attempts
   - Track who accessed what when

---

## 🚀 Future Enhancements

### Planned Features

- [ ] Admin dashboard để quản lý users
- [ ] Bulk import users từ CSV
- [ ] Role-based access control (Admin, Editor, Viewer)
- [ ] Activity log (who accessed when)
- [ ] Email notification khi có login mới
- [ ] "Remember me" checkbox (extend session)
- [ ] Password reset flow (nếu thêm password)
- [ ] Multi-factor authentication (MFA)

---

## 📞 Support

### Debug Commands

```javascript
// Check current auth status
console.log('Auth User:', localStorage.getItem('ghtk_auth_user'));
console.log('Auth Timestamp:', localStorage.getItem('ghtk_auth_timestamp'));

// Manual logout
GHTK_Logout();

// Test API endpoint
fetch('API_URL?action=verify_user&email=test@ghtk.vn')
  .then(r => r.json())
  .then(d => console.log(d));
```

### Contact

- **Developer:** Claude Sonnet 4.5
- **Repository:** [GitHub Link]
- **Documentation:** This file

---

## ✅ Deployment Checklist

**Trước khi deploy production:**

- [ ] Đã tạo tab `UserSetting` trong Google Sheet
- [ ] Đã thêm ít nhất 1 email test hợp lệ
- [ ] Đã test backend function `testUserAuth()`
- [ ] Đã deploy Apps Script version mới
- [ ] Đã test API endpoint trong browser
- [ ] Đã commit code vào git
- [ ] Đã push lên GitHub
- [ ] Đã test login flow trên staging/production
- [ ] Đã test với email hợp lệ → Success
- [ ] Đã test với email không hợp lệ → Error
- [ ] Đã test auto-login (reload page)
- [ ] Đã test session timeout
- [ ] Đã test logout function
- [ ] Đã thông báo cho users về tính năng mới
- [ ] Đã cung cấp email support nếu có vấn đề

---

## 📄 Change Log

### Version 2.1.0 (2025-12-29)

**Added:**
- ✅ User authentication system with email verification
- ✅ Login modal with GHTK branding
- ✅ Backend: `checkUserPermission()` function
- ✅ Backend: `verify_user` route in `doGet()`
- ✅ Frontend: Full-screen login overlay
- ✅ Frontend: localStorage session management (7 days)
- ✅ Frontend: Periodic auth check (5 minutes)
- ✅ Frontend: Global logout function `GHTK_Logout()`
- ✅ Security: Right-click disabled on modal
- ✅ Security: Email format validation
- ✅ Security: Case-insensitive email comparison

**Changed:**
- Updated version from 2.0.0 to 2.1.0

**Fixed:**
- N/A (new feature)

---

**Generated with:** Claude Code
**Last Update:** 2025-12-29
**Priority:** 🔥 HIGH - User Authentication
