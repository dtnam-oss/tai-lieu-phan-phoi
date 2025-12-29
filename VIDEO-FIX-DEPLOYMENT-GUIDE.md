# 🔧 Video Loading Fix - Deployment Guide

## 📋 Vấn đề đã fix:

### Lỗi trước đây:
```
❌ Failed to load videos: Error: Unknown error
API returned success=false
message: 'GHTK Web App is running!'
```

### Root Cause:
1. ❌ `doGet()` trả về health check message thay vì video data
2. ❌ `getVideosFromSheet()` là placeholder (return [])
3. ❌ Frontend crash khi nhận health check response

### Fix đã implement:
1. ✅ `doGet()` bây giờ **mặc định** trả về video data
2. ✅ `getVideosFromSheet()` return sample data (3 videos)
3. ✅ Frontend xử lý mềm dẻo (return [] thay vì crash)

---

## 🚀 Deployment Steps:

### Bước 1: Update Google Apps Script

1. **Mở Apps Script:**
   - Truy cập: https://script.google.com/
   - Mở project của bạn (có deployment Web App)

2. **Update Code:**
   - Mở file `Code.gs`
   - **Select ALL** (Ctrl/Cmd + A) → Delete
   - Copy **TOÀN BỘ** code từ [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs)
   - Paste vào `Code.gs`
   - **Save** (Ctrl/Cmd + S)

3. **Test trong Editor:**
   ```javascript
   // Chọn function: testVideoDatabase
   // Click Run
   ```

   **Expected output in Logs:**
   ```
   Fetching videos from Google Sheets...
   ⚠️ Using sample data - Configure SHEET_ID to use real data
   Video DB Response:
   {
     "success": true,
     "data": [
       {
         "element_id": "vid_1",
         "category": "Giới thiệu hệ thống GHTK",
         ...
       },
       ...
     ]
   }
   ```

4. **Deploy New Version:**
   - Click **Deploy** → **Manage deployments**
   - Click ⚙️ (Settings) next to active deployment
   - Click **"New version"**
   - Description: `Fix video loading - return data instead of health check`
   - Click **Deploy**
   - ✅ **URL không đổi** - Frontend không cần update!

---

### Bước 2: Test API Endpoint

**Method 1: Browser Test**
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
         ...
       },
       {
         "element_id": "vid_2_1",
         ...
       },
       {
         "element_id": "vid_3_1",
         ...
       }
     ],
     "timestamp": "2025-12-24T...",
     "source": "google-apps-script"
   }
   ```

**Method 2: Console Test**
```javascript
fetch('YOUR_WEB_APP_URL')
  .then(r => r.json())
  .then(d => {
    console.log('Success:', d.success);
    console.log('Videos:', d.data.length);
    console.table(d.data);
  });
```

**Nếu muốn test health check:**
```
YOUR_WEB_APP_URL?action=health
```

Output:
```json
{
  "status": "ok",
  "message": "GHTK Web App is running!",
  "services": ["Video Database", "AI Chatbot"],
  "version": "2.0.0"
}
```

---

### Bước 3: Test trên Website

1. **Clear Cache:**
   - `Ctrl+Shift+Delete` (Windows) hoặc `Cmd+Shift+Delete` (Mac)
   - Clear "Cached images and files"

2. **Hard Refresh:**
   - Windows: `Ctrl+F5`
   - Mac: `Cmd+Shift+R`

3. **Open Console (F12)**

4. **Expected Logs:**
   ```
   ================================================================================
   🎬 Initializing Video System (Google Sheets)...
   ================================================================================
   📍 API Endpoint: https://script.google.com/.../exec

   🚀 Starting video data fetch...
   🌐 Fetching from API: https://...
   📡 Response received: { status: 200, ok: true }
   📄 Raw response: {"success":true,"data":[...]}
   ✅ JSON parsed successfully: { success: true, hasData: true, dataLength: 3 }
   📊 Received 3 videos from API
   💾 Data saved to cache
   ✅ Fetched 3 videos from Google Sheets

   ✅ Data fetched successfully: 3 videos

   🎨 Rendering videos to page...
   🎬 Rendering 3 videos...
   ✅ Rendered vid_1
   ✅ Rendered vid_2_1
   ✅ Rendered vid_3_1

   ================================================================================
   ✅ VIDEO SYSTEM INITIALIZED SUCCESSFULLY!
   ================================================================================
   ```

5. **Verify Videos Rendered:**
   - Scroll đến phần có `id="vid_1"`, `id="vid_2_1"`, `id="vid_3_1"`
   - Bạn sẽ thấy browser mockups với YouTube embeds

---

## 🎯 Migration to Real Data:

Bây giờ hệ thống dùng **sample data**. Để dùng **real Sheet data**:

### Option 1: Quick - Hardcode videos

1. Mở `google-apps-script-MERGED.gs`
2. Tìm hàm `getSampleVideoData()` (line ~617)
3. Update array với videos thực của bạn:
   ```javascript
   function getSampleVideoData() {
     return [
       {
         element_id: 'vid_1',           // ID trong HTML
         category: 'Your category',     // Tên hiển thị
         platform: 'youtube',            // youtube/vimeo
         video_id: 'YOUR_VIDEO_ID',     // ID video
         thumbnail: 'https://...',       // URL thumbnail
         title: 'Video title',
         description: 'Description',
         duration: '5:30'
       },
       // Add more videos...
     ];
   }
   ```
4. Save và deploy version mới

### Option 2: Full - Use Google Sheets

1. **Create/Open Google Sheet:**
   - Tạo sheet với columns: `element_id`, `category`, `platform`, `video_id`, `thumbnail`, `title`, `description`, `duration`

2. **Get Sheet ID:**
   - URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy `SHEET_ID_HERE`

3. **Update Apps Script:**
   ```javascript
   // In getVideosFromSheet() function (line ~571)
   const SHEET_ID = 'YOUR_ACTUAL_SHEET_ID';  // ← Paste here
   const SHEET_NAME = 'Videos';               // ← Your tab name
   ```

4. **Uncomment real code:**
   - Find comment block (lines ~582-598)
   - Remove `/*` and `*/`
   - Comment out `return getSampleVideoData();` (line ~604)

5. **Save and Deploy**

---

## 🐛 Troubleshooting:

### Issue 1: Vẫn thấy "Unknown error"

**Check:**
```javascript
// In Console
fetch(VideoDatabase.API_URL).then(r=>r.json()).then(console.log)
```

**If you see:**
```json
{
  "status": "ok",
  "message": "GHTK Web App is running!",
  ...
}
```

**Problem:** Apps Script chưa được deploy lại

**Fix:** Deploy "New version" trong Apps Script

---

### Issue 2: Videos không render

**Check Console for:**
```
⚠️ Slot not found: vid_X
```

**Problem:** HTML không có `<div id="vid_X" class="video-slot"></div>`

**Fix:** Add video slots to HTML:
```html
<div id="vid_1" class="video-slot"></div>
<div id="vid_2_1" class="video-slot"></div>
<div id="vid_3_1" class="video-slot"></div>
```

---

### Issue 3: Empty video array

**Check Console for:**
```
📊 Received 0 videos from API
```

**Problem:** `getVideosFromSheet()` return []

**Possible causes:**
1. Sample data function not working
2. Sheet ID incorrect (if using real data)
3. Sheet permissions

**Fix:**
1. Check Apps Script Executions (View → Executions)
2. Look for errors in `getVideosFromSheet`
3. Verify SHEET_ID is correct
4. Check Sheet sharing permissions

---

## 📊 Architecture:

### Before (Broken):
```
Frontend
  ↓ GET request
Backend doGet()
  ↓ Return { message: "Running!" }  ❌
Frontend
  ↓ Error: "Unknown error"
  ↓ CRASH 💥
```

### After (Fixed):
```
Frontend
  ↓ GET request
Backend doGet()
  ↓ Return { success: true, data: [...videos...] }  ✅
Frontend
  ↓ Parse data
  ↓ Render videos
  ↓ SUCCESS 🎉
```

### Special Case Handling:
```
Frontend
  ↓ GET request
Backend doGet()
  ↓ Return { message: "Running!" }  (health check)
Frontend
  ↓ Detect health check response
  ↓ Log warning
  ↓ Return empty array []
  ↓ NO CRASH (graceful) ✅
```

---

## 🎯 Testing Checklist:

- [ ] Apps Script deployed new version
- [ ] Browser test shows `{success: true, data: [...]}`
- [ ] Console shows "✅ VIDEO SYSTEM INITIALIZED SUCCESSFULLY!"
- [ ] Console shows "📊 Received 3 videos from API"
- [ ] Videos render on page (browser mockups visible)
- [ ] No errors in Console
- [ ] Cache working (reload shows "📦 Loading from cache")

---

## 📚 Related Files:

- [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs) - Backend code
- [VIDEO-LOADING-DEBUG.md](VIDEO-LOADING-DEBUG.md) - Error diagnosis guide
- [DEBUG-ACTIONS-GUIDE.md](DEBUG-ACTIONS-GUIDE.md) - General debug guide

---

**Updated:** 2025-12-24 | **Version:** 3.0.0 | **Status:** FIXED ✅
