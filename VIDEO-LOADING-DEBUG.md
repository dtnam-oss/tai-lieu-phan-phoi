# 🐛 Video Loading Error - Debug Guide

## 📊 Phân tích lỗi từ screenshot:

### Lỗi hiện tại:
```
❌ Failed to load videos: Error: Unknown error
   at Object.fetchAndUpdateCache
   at async Object.getData
   at async HTMLDocument.initVideoSystem
```

### Vấn đề:
1. ❌ Error message không cụ thể ("Unknown error")
2. ❌ Không biết lỗi xảy ra ở đâu (Network? JSON? API?)
3. ❌ `initVideoSystem` vẫn log "success" dù có lỗi

---

## ✅ Đã fix gì:

### 1. Enhanced Error Logging

**Trước (Cũ):**
```javascript
const result = await response.json();
if (!result.success) {
    throw new Error(result.error || 'Unknown error'); // ❌ Không rõ ràng
}
```

**Sau (Mới):**
```javascript
// Log raw response trước khi parse
const rawText = await response.text();
console.log('📄 Raw response (first 500 chars):', rawText.substring(0, 500));

try {
    result = JSON.parse(rawText);
    console.log('✅ JSON parsed successfully:', {
        success: result.success,
        hasData: !!result.data,
        dataLength: result.data?.length
    });
} catch (jsonError) {
    console.error('❌ JSON Parse Error:', {
        name: jsonError.name,
        message: jsonError.message,
        rawResponsePreview: rawText.substring(0, 500)
    });
    throw new Error(`Invalid JSON. Server returned: ${rawText.substring(0, 200)}`);
}
```

### 2. Separate Error Categories

Bây giờ lỗi được phân loại rõ ràng:

| Error Type | Message Example | Cause |
|------------|----------------|-------|
| **Network Error** | `Network Error: Failed to fetch. Check internet connection` | Không có mạng, CORS |
| **HTTP Error** | `HTTP 404: Not Found. Response: <!DOCTYPE html>...` | URL sai, endpoint không tồn tại |
| **JSON Parse Error** | `Invalid JSON. Server returned: <html>...` | Server trả về HTML thay vì JSON |
| **API Error** | `API Error: {"error": "Sheet not found"}` | Backend xử lý lỗi |
| **Data Format Error** | `Invalid data format: Expected array, got object` | Cấu trúc data sai |

### 3. Step-by-Step Logging

Console bây giờ sẽ hiển thị:

```
================================================================================
🎬 Initializing Video System (Google Sheets)...
================================================================================
📍 API Endpoint: https://script.google.com/.../exec

📊 Pre-initialization check:
================================================================================
🔍 VIDEO DATA STATUS CHECK
================================================================================
📦 Data Source: LIVE API (no cache)
⚠️ Cache is empty - will fetch from Google Sheets
...

🚀 Starting video data fetch...
🌐 Fetching from API: https://...
📡 Response received: {
  status: 200,
  statusText: "OK",
  ok: true,
  headers: { contentType: "application/json" }
}
📄 Raw response (first 500 chars): {"success":true,"data":[...]}
✅ JSON parsed successfully: {
  success: true,
  hasData: true,
  dataLength: 15
}
📊 Received 15 videos from API
💾 Data saved to cache
✅ Fetched 15 videos from Google Sheets

✅ Data fetched successfully: 15 videos

🎨 Rendering videos to page...
...

================================================================================
✅ VIDEO SYSTEM INITIALIZED SUCCESSFULLY!
================================================================================
```

**Nếu có lỗi:**

```
================================================================================
🎬 Initializing Video System (Google Sheets)...
================================================================================
📍 API Endpoint: https://...

🚀 Starting video data fetch...
🌐 Fetching from API: https://...
❌ Network/Fetch Error: {
  name: "TypeError",
  message: "Failed to fetch",
  stack: "TypeError: Failed to fetch at ..."
}

================================================================================
❌ VIDEO SYSTEM INITIALIZATION FAILED!
================================================================================
Error details: {
  name: "Error",
  message: "Network Error: Failed to fetch. Check internet connection",
  stack: "..."
}
================================================================================

💡 Troubleshooting tips:
1. Check API URL: https://...
2. Test API manually: fetch(VideoDatabase.API_URL).then(r=>r.json()).then(console.log)
3. Check Google Apps Script deployment
4. Verify Sheet data exists and is accessible
```

---

## 🧪 Hướng dẫn Debug:

### Bước 1: Clear cache và reload

```javascript
// Trong Console (F12)
localStorage.clear();
location.reload();
```

### Bước 2: Xem logs chi tiết

Sau khi reload, Console sẽ hiển thị:
- ✅ API URL đang được gọi
- ✅ Response status code
- ✅ Content-Type header
- ✅ Raw response (500 chars đầu)
- ✅ JSON parse kết quả
- ✅ Data structure

**Nếu thấy:**

#### A) Network Error (CORS / No Internet)
```
❌ Network/Fetch Error: {
  name: "TypeError",
  message: "Failed to fetch"
}
```

**Nguyên nhân:**
- Không có internet
- CORS policy chặn
- URL sai hoàn toàn

**Fix:**
1. Kiểm tra internet
2. Test URL trực tiếp: Mở tab mới, paste URL API
3. Check Apps Script deployment (Web App settings)

#### B) HTTP Error (404, 500, etc.)
```
📡 Response received: {
  status: 404,
  statusText: "Not Found"
}
❌ HTTP Error Response: {
  status: 404,
  body: "<!DOCTYPE html><html>..."
}
```

**Nguyên nhân:**
- URL deployment cũ (đã xóa hoặc chưa deploy)
- Apps Script chưa deploy as Web App
- Permission không đúng

**Fix:**
1. Vào Google Apps Script
2. Click **Deploy** → **Manage deployments**
3. Copy **Web App URL** mới nhất
4. Update `VideoDatabase.API_URL` trong code

#### C) JSON Parse Error (Server trả về HTML)
```
📄 Raw response (first 500 chars): <!DOCTYPE html><html lang="en">...
❌ JSON Parse Error: {
  message: "Unexpected token '<' at position 0"
}
```

**Nguyên nhân:**
- Apps Script có lỗi runtime
- Apps Script trả về error page HTML
- Chưa deploy đúng cách

**Fix:**
1. Mở Apps Script
2. Run hàm `doGet()` hoặc `doPost()` để test
3. Xem Executions logs (View → Executions)
4. Fix lỗi trong script
5. Redeploy

#### D) API Error (success: false)
```
✅ JSON parsed successfully: {
  success: false,
  hasData: false,
  hasError: true
}
❌ API returned success=false: {
  error: "Sheet 'MasterData' not found"
}
```

**Nguyên nhân:**
- Sheet name sai
- Sheet không tồn tại
- Permission không đủ

**Fix:**
1. Check Sheet name trong Apps Script code
2. Verify Sheet tồn tại
3. Check Sheet sharing settings

#### E) Data Format Error
```
❌ Data is not an array: object { ... }
```

**Nguyên nhân:**
- Backend trả về object thay vì array
- Cấu trúc response sai

**Fix:**
1. Check Apps Script code
2. Đảm bảo `doGet()` return `{success: true, data: [...]}`

---

## 🔧 Quick Fixes

### Fix 1: Test API manually

```javascript
// Copy paste vào Console
fetch(VideoDatabase.API_URL)
  .then(r => {
    console.log('Status:', r.status);
    return r.text();
  })
  .then(text => {
    console.log('Raw response:', text);
    const json = JSON.parse(text);
    console.log('Parsed JSON:', json);
  })
  .catch(e => console.error('Error:', e));
```

### Fix 2: Force clear và re-fetch

```javascript
localStorage.removeItem('video_data_cache');
VideoDatabase.forceRefresh();
```

### Fix 3: Check API endpoint

```javascript
console.log('Current API URL:', VideoDatabase.API_URL);

// Test với timeout
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

fetch(VideoDatabase.API_URL, { signal: controller.signal })
  .then(r => r.json())
  .then(d => {
    clearTimeout(timeout);
    console.log('✅ API Working:', d);
  })
  .catch(e => {
    clearTimeout(timeout);
    console.error('❌ API Failed:', e);
  });
```

---

## 📋 Checklist Debug

Khi gặp lỗi "Failed to load videos", check theo thứ tự:

- [ ] **Internet connection:** Mở https://google.com test
- [ ] **API URL correct:** Log ra và verify
- [ ] **API accessible:** Paste URL vào browser, xem response
- [ ] **Response is JSON:** Không phải HTML error page
- [ ] **Response structure:** `{success: true, data: [...]}`
- [ ] **Data is array:** `Array.isArray(data) === true`
- [ ] **Console logs:** Xem từng bước để tìm failure point

---

## 🎯 Expected Console Output (Success)

```
================================================================================
🎬 Initializing Video System (Google Sheets)...
================================================================================
📍 API Endpoint: https://script.google.com/macros/s/.../exec

📊 Pre-initialization check:
🔍 VIDEO DATA STATUS CHECK
📦 Data Source: LIVE API (no cache)

🚀 Starting video data fetch...
🌐 Fetching from API: https://...
📡 Response received: { status: 200, statusText: "OK", ok: true }
📄 Raw response: {"success":true,"data":[{"element_id":"vid_1"...
✅ JSON parsed successfully: { success: true, hasData: true, dataLength: 15 }
📊 Received 15 videos from API
💾 Data saved to cache
✅ Fetched 15 videos from Google Sheets

✅ Data fetched successfully: 15 videos

🎨 Rendering videos to page...
🎬 Rendering 15 videos...
✅ Rendered vid_1
✅ Rendered vid_2_1
...

================================================================================
✅ VIDEO SYSTEM INITIALIZED SUCCESSFULLY!
================================================================================
🔍 VIDEO DATA STATUS CHECK
📦 Data Source: CACHE (localStorage)
⏰ Cache Age: 0 minutes ago
📊 Videos in Cache: 15
🔄 Cache Status: ✅ Fresh
================================================================================
```

---

## 🚨 Next Steps

1. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear "Cached images and files"
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

2. **Open site:**
   - Go to: https://dtnam-oss.github.io/tai-lieu-phan-phoi/

3. **Open Console (F12)**

4. **Xem logs mới:**
   - Bây giờ sẽ thấy chi tiết từng bước
   - Xác định chính xác lỗi ở đâu
   - Screenshot và gửi cho tôi nếu vẫn lỗi

---

**Updated:** 2025-12-24 | **Version:** 2.0.0
