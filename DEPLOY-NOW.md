# ⚡ DEPLOY NOW - Quick Fix Guide

## 🎯 Vấn đề hiện tại:

Console log:
```
📄 Raw response: {"status":"ok","message":"GHTK Web App is running!"}
⚠️ Detected health check response instead of video data
📊 Returning empty video array to prevent crash
✅ Data fetched successfully: 0 videos
```

**Root cause:** Backend Apps Script **chưa được deploy lại** sau khi fix code.

---

## 🚀 FIX NGAY (5 phút):

### Bước 1: Mở Apps Script (1 phút)

1. Truy cập: **https://script.google.com/**
2. Tìm project có **Web App URL** hiện tại
3. Click để mở

### Bước 2: Update Code (2 phút)

1. Click file **Code.gs**
2. **Select ALL** (Ctrl/Cmd + A) → **Delete**
3. **Copy** toàn bộ code từ file [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs)
4. **Paste** vào `Code.gs`
5. **Save** (Ctrl/Cmd + S)

**⚠️ QUAN TRỌNG:** Code mới có logic này:

```javascript
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action;

  // Health check CHỈ khi request rõ ràng
  if (action === 'health' || action === 'status') {
    return JSON.stringify({
      status: 'ok',
      message: 'GHTK Web App is running!'
    });
  }

  // MẶC ĐỊNH: Trả về video data
  const videos = getVideosFromSheet();

  return JSON.stringify({
    success: true,
    data: videos,  // ← 3 sample videos
    timestamp: new Date().toISOString()
  });
}
```

### Bước 3: Deploy Version Mới (2 phút)

1. Click **Deploy** (nút xanh trên)
2. Click **Manage deployments**
3. Click **⚙️** (Settings icon) bên deployment hiện tại
4. Click **"New version"**
5. Description: `Fix doGet - return video data by default`
6. Click **Deploy**
7. Click **Done**

✅ **URL không đổi** - Frontend tự động hoạt động!

---

## 🧪 Test Ngay:

### Test 1: Browser Test (30 giây)

1. Copy Web App URL của bạn
2. Paste vào browser tab mới
3. **Kết quả mong đợi:**

```json
{
  "success": true,
  "data": [
    {
      "element_id": "vid_1",
      "category": "Giới thiệu hệ thống GHTK",
      "platform": "youtube",
      "video_id": "dQw4w9WgXcQ",
      "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "title": "Video hướng dẫn GHTK",
      "description": "Hệ thống phân phối của GHTK",
      "duration": "5:30"
    },
    {
      "element_id": "vid_2_1",
      "category": "Quy trình ONBOARD",
      ...
    },
    {
      "element_id": "vid_3_1",
      "category": "Quy trình giao hàng",
      ...
    }
  ],
  "timestamp": "2025-12-24T...",
  "source": "google-apps-script"
}
```

**✅ Nếu thấy `"success": true` và `"data": [...]` → THÀNH CÔNG!**

**❌ Nếu vẫn thấy `"message": "Running!"` → Chưa deploy đúng, làm lại Bước 3**

### Test 2: Console Test (1 phút)

1. Mở trang web: https://dtnam-oss.github.io/tai-lieu-phan-phoi/
2. Clear cache: `localStorage.clear()`
3. Hard refresh: `Ctrl+F5` (Windows) hoặc `Cmd+Shift+R` (Mac)
4. Mở Console (F12)

**Kết quả mong đợi:**

```
================================================================================
🎬 Initializing Video System (Google Sheets)...
================================================================================
📍 API Endpoint: https://script.google.com/.../exec

🚀 Starting video data fetch...
🌐 Fetching from API: https://...
📡 Response received: { status: 200, ok: true }
📄 Raw response: {"success":true,"data":[...]}  ← Không còn "Running!" nữa!
✅ JSON parsed successfully: { success: true, hasData: true, dataLength: 3 }
📊 Received 3 videos from API  ← Có 3 videos rồi!
💾 Data saved to cache
✅ Fetched 3 videos from Google Sheets

✅ Data fetched successfully: 3 videos  ← Không phải 0 videos nữa!

🎨 Rendering videos to page...
🎬 Rendering 3 videos...
✅ Rendered vid_1
✅ Rendered vid_2_1
✅ Rendered vid_3_1

================================================================================
✅ VIDEO SYSTEM INITIALIZED SUCCESSFULLY!
================================================================================
```

---

## ❓ Troubleshooting:

### Issue 1: Vẫn thấy "Running!" sau khi deploy

**Nguyên nhân:** Browser cache hoặc chưa deploy đúng

**Fix:**
1. Clear browser cache hoàn toàn
2. Test API trực tiếp trong browser (paste URL vào tab mới)
3. Nếu vẫn thấy "Running!" → Chưa deploy đúng:
   - Vào Apps Script
   - View → Executions
   - Chạy function `testVideoDatabase`
   - Xem log có xuất hiện "Fetching videos from Google Sheets..." không

### Issue 2: Permission error khi deploy

**Error:** `You do not have permission to...`

**Fix:**
1. Click **Review permissions**
2. Chọn Google account của bạn
3. Click **Advanced** → **Go to [Project Name] (unsafe)**
4. Click **Allow**
5. Deploy lại

### Issue 3: Videos không render

**Console shows:**
```
📊 Received 3 videos from API
⚠️ Slot not found: vid_1
```

**Problem:** HTML không có `<div id="vid_1">` slots

**Fix:** Thêm vào HTML:
```html
<div id="vid_1" class="video-slot"></div>
<div id="vid_2_1" class="video-slot"></div>
<div id="vid_3_1" class="video-slot"></div>
```

---

## 📊 Before vs After:

### BEFORE (Hiện tại):
```
Browser → GET → Apps Script doGet()
                    ↓
                Return { message: "Running!" }
                    ↓
Browser Console:
📄 Raw response: {"status":"ok","message":"GHTK Web App is running!"}
⚠️ Detected health check response
📊 Returning empty video array
✅ Data fetched: 0 videos  ← KHÔNG CÓ VIDEO
```

### AFTER (Sau deploy):
```
Browser → GET → Apps Script doGet()
                    ↓
                Return { success: true, data: [...] }
                    ↓
Browser Console:
📄 Raw response: {"success":true,"data":[...]}
✅ JSON parsed successfully: 3 videos
📊 Received 3 videos from API
✅ Data fetched: 3 videos  ← CÓ 3 VIDEOS!
🎬 Rendering 3 videos...
✅ Rendered vid_1
✅ Rendered vid_2_1
✅ Rendered vid_3_1
```

---

## ⏱️ Timeline:

- **0:00 - 1:00** → Mở Apps Script, update code
- **1:00 - 2:00** → Save code
- **2:00 - 4:00** → Deploy new version
- **4:00 - 4:30** → Test API trong browser
- **4:30 - 5:00** → Test website, xem Console

**Total: 5 phút!**

---

## ✅ Success Criteria:

Deploy thành công khi:

- [ ] Browser test API → `{"success": true, "data": [...]}`
- [ ] Console log → `✅ Data fetched: 3 videos`
- [ ] Console log → `✅ Rendered vid_1, vid_2_1, vid_3_1`
- [ ] Không còn warning về health check
- [ ] Videos hiển thị trên trang (browser mockups)

---

## 🎯 Quick Commands:

**Test API:**
```javascript
fetch('YOUR_WEB_APP_URL')
  .then(r => r.json())
  .then(d => console.log('Videos:', d.data?.length || 0));
```

**Clear cache & reload:**
```javascript
localStorage.clear();
location.reload();
```

**Check status:**
```javascript
VideoDatabase.checkDataStatus();
```

---

**LÀM NGAY BÂY GIỜ!** Chỉ mất 5 phút! 🚀

---

**Updated:** 2025-12-24 | **Priority:** 🔥 URGENT
