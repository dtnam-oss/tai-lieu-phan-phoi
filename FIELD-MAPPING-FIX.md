# 🔧 Field Name Mapping Fix - Deployment Guide

## 🎯 Vấn đề đã fix:

### Trước (Lỗi):
```
Console log:
📹 Videos loaded:
  1. undefined - Untitled (undefined)
  2. undefined - Untitled (undefined)
  3. undefined - Untitled (undefined)
```

**Root cause:** Google Sheet sử dụng column names viết hoa (`Element_ID`, `Video_URL`, `Hang_Muc`) nhưng frontend expect lowercase (`element_id`, `video_id`, `category`)

### Sau (Fixed):
```
Console log:
📹 Videos loaded:
  1. vid_1 - Giới thiệu hệ thống GHTK (streamable)
  2. vid_2_1 - Quy trình ONBOARD (cloudinary)
  3. vid_3_1 - Quy trình giao hàng (youtube)
```

---

## ✅ Những gì đã được fix:

### 1. Field Name Mapping

**Code mới trong `getVideosFromSheet()`** (lines 610-640):

```javascript
.map(row => {
  // First, create raw object from Sheet
  const rawVideo = {};
  headers.forEach((header, index) => {
    rawVideo[header] = row[index];
  });

  // Extract video info from URL
  const videoUrl = rawVideo.Video_URL || '';
  const platform = extractPlatform(videoUrl);
  const videoId = extractVideoId(videoUrl, platform);

  // Convert to frontend-compatible format
  const video = {
    element_id: rawVideo.Element_ID || '',        // ✅ Element_ID → element_id
    category: rawVideo.Hang_Muc || 'Video',       // ✅ Hang_Muc → category
    platform: platform,                            // ✅ Auto-detect from URL
    video_id: videoId,                             // ✅ Extract from URL
    video_url: videoUrl,                           // ✅ Full URL
    thumbnail: rawVideo.Thumbnail || '',           // ✅ Thumbnail → thumbnail
    title: rawVideo.Hang_Muc || 'Video',          // ✅ Use Hang_Muc as title
    description: rawVideo.Hang_Muc || '',          // ✅ Use Hang_Muc as description
    duration: ''
  };

  return video;
})
```

### 2. Platform Detection

**New helper function:** `extractPlatform(url)` (lines 666-677)

Tự động detect platform từ URL:
- `streamable.com` → `"streamable"`
- `cloudinary.com` → `"cloudinary"`
- `youtube.com` hoặc `youtu.be` → `"youtube"`
- `vimeo.com` → `"vimeo"`
- Unknown → `"unknown"`

### 3. Video ID Extraction

**New helper function:** `extractVideoId(url, platform)` (lines 682-719)

Extract video ID từ URL theo platform:

#### Streamable:
```
https://streamable.com/abc123 → "abc123"
```

#### Cloudinary:
```
https://res.cloudinary.com/.../sample.mp4 → "https://res.cloudinary.com/.../sample.mp4"
(Returns full URL as video_id for cloudinary)
```

#### YouTube:
```
https://www.youtube.com/watch?v=abc123 → "abc123"
https://youtu.be/abc123 → "abc123"
```

#### Vimeo:
```
https://vimeo.com/123456789 → "123456789"
```

---

## 🚀 Deployment Steps (5 phút):

### Bước 1: Mở Google Apps Script

1. Truy cập: **https://script.google.com/**
2. Tìm project có Web App URL:
   ```
   https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA-HuCvDWDg46J_Q8xSZOGAbJ8IQ0DOsybDf-hWptKVl9q7ncfNS8g/exec
   ```
3. Click để mở

### Bước 2: Update Code

1. Click file **Code.gs**
2. **Select ALL** (Ctrl/Cmd + A) → Delete
3. Copy **TOÀN BỘ** code từ [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs)
4. Paste vào `Code.gs`
5. **Save** (Ctrl/Cmd + S)

### Bước 3: Test Code (Optional but Recommended)

1. Chọn function: `getVideosFromSheet` (dropdown trên toolbar)
2. Click **Run** (▶️)
3. Xem **Execution log** (View → Executions)

**Expected output:**
```
Fetching videos from Google Sheets...
Sheet ID: 12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4
Sheet Name: VideoData
📊 Headers: Hang_Muc, Element_ID, Video_URL, Thumbnail, Platform
📊 Total rows: 15
✅ Fetched 15 videos from Sheet
📹 Video IDs: vid_1, vid_2_1, vid_3_1, ...
📹 Sample video: {
  "element_id": "vid_1",
  "category": "Giới thiệu hệ thống GHTK",
  "platform": "streamable",
  "video_id": "abc123",
  "video_url": "https://streamable.com/abc123",
  "thumbnail": "...",
  "title": "Giới thiệu hệ thống GHTK",
  "description": "Giới thiệu hệ thống GHTK",
  "duration": ""
}
```

✅ **Nếu thấy output giống trên → Code hoạt động đúng!**

### Bước 4: Deploy New Version

1. Click **Deploy** (nút xanh trên toolbar)
2. Click **Manage deployments**
3. Click **⚙️** (Settings icon) bên deployment hiện tại
4. Click **"New version"**
5. Description: `Fix field name mapping - convert Sheet columns to frontend format`
6. Click **Deploy**
7. Click **Done**

✅ **URL không đổi** - Frontend tự động nhận version mới!

---

## 🧪 Test Ngay:

### Test 1: API Test trong Browser

1. Copy Web App URL:
   ```
   https://script.google.com/macros/s/AKfycbxaujZ9IVqRWnpAOA-HuCvDWDg46J_Q8xSZOGAbJ8IQ0DOsybDf-hWptKVl9q7ncfNS8g/exec
   ```
2. Paste vào browser tab mới
3. **Kết quả mong đợi:**

```json
{
  "success": true,
  "data": [
    {
      "element_id": "vid_1",
      "category": "Giới thiệu hệ thống GHTK",
      "platform": "streamable",
      "video_id": "abc123",
      "video_url": "https://streamable.com/abc123",
      "thumbnail": "...",
      "title": "Giới thiệu hệ thống GHTK",
      "description": "Giới thiệu hệ thống GHTK",
      "duration": ""
    },
    ...
  ],
  "timestamp": "2025-12-29T...",
  "source": "google-apps-script"
}
```

**✅ Nếu thấy `element_id`, `category`, `platform`, `video_id` → THÀNH CÔNG!**

**❌ Nếu vẫn thấy `Element_ID`, `Hang_Muc` → Chưa deploy đúng, làm lại Bước 4**

### Test 2: Website Test

1. Mở: https://dtnam-oss.github.io/tai-lieu-phan-phoi/
2. Clear cache: `Ctrl+Shift+Delete` → Clear "Cached images and files"
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
📄 Raw response: {"success":true,"data":[...]}
✅ JSON parsed successfully: { success: true, hasData: true, dataLength: 15 }
📊 Received 15 videos from API
💾 Data saved to cache
✅ Fetched 15 videos from Google Sheets

✅ Data fetched successfully: 15 videos

🎨 Rendering videos to page...
🎬 Rendering 15 videos...
✅ Rendered vid_1
✅ Rendered vid_2_1
✅ Rendered vid_3_1
...

================================================================================
✅ VIDEO SYSTEM INITIALIZED SUCCESSFULLY!
================================================================================
🔍 VIDEO DATA STATUS CHECK
📦 Data Source: CACHE (localStorage)
⏰ Cache Age: 0 minutes ago
📊 Videos in Cache: 15

📹 Videos loaded:
  1. vid_1 - Giới thiệu hệ thống GHTK (streamable)
  2. vid_2_1 - Quy trình ONBOARD (cloudinary)
  3. vid_3_1 - Quy trình giao hàng (youtube)
  ...
```

**✅ Không còn "undefined - Untitled (undefined)" nữa!**

---

## 🔍 Mapping Table:

| Google Sheet Column | Frontend Field | Example Value |
|---------------------|----------------|---------------|
| `Hang_Muc` | `category`, `title`, `description` | "Giới thiệu hệ thống GHTK" |
| `Element_ID` | `element_id` | "vid_1" |
| `Video_URL` | `video_url`, extracted to `platform` + `video_id` | "https://streamable.com/abc123" |
| `Thumbnail` | `thumbnail` | "https://..." |
| `Platform` | *(ignored, auto-detected from URL)* | "streamable" |

---

## 📊 Before vs After:

### BEFORE (Broken):
```javascript
// Apps Script returned:
{
  "Element_ID": "vid_1",          // ❌ Capitalized
  "Hang_Muc": "Giới thiệu",       // ❌ Vietnamese name
  "Video_URL": "https://...",     // ❌ Full URL, no extracted ID
  "Thumbnail": "...",
  "Platform": "streamable"
}

// Frontend expected:
video.element_id  // ❌ undefined
video.category    // ❌ undefined
video.video_id    // ❌ undefined

// Result:
"undefined - Untitled (undefined)"  // 💥 CRASH
```

### AFTER (Fixed):
```javascript
// Apps Script returns:
{
  "element_id": "vid_1",           // ✅ Lowercase
  "category": "Giới thiệu",        // ✅ English name
  "platform": "streamable",        // ✅ Auto-detected
  "video_id": "abc123",            // ✅ Extracted from URL
  "video_url": "https://...",      // ✅ Full URL kept
  "thumbnail": "...",
  "title": "Giới thiệu",
  "description": "Giới thiệu",
  "duration": ""
}

// Frontend receives:
video.element_id → "vid_1"        // ✅ Works
video.category → "Giới thiệu"     // ✅ Works
video.video_id → "abc123"         // ✅ Works

// Result:
"vid_1 - Giới thiệu (streamable)"  // ✅ SUCCESS
```

---

## ❓ Troubleshooting:

### Issue 1: Vẫn thấy "undefined - Untitled"

**Check 1:** API có trả về field names đúng chưa?
```javascript
// In Console
fetch(VideoDatabase.API_URL)
  .then(r => r.json())
  .then(d => {
    console.log('First video:', d.data[0]);
    console.log('Has element_id?', 'element_id' in d.data[0]);
    console.log('Has category?', 'category' in d.data[0]);
  });
```

**Nếu vẫn thấy `Element_ID`, `Hang_Muc`:**
- Chưa deploy version mới
- Vào Apps Script → Deploy → Manage deployments → New version

### Issue 2: Platform detection sai

**Check logs trong Apps Script:**
1. View → Executions
2. Tìm execution gần nhất
3. Xem log có hiển thị:
   ```
   📹 Sample video: {"platform":"streamable",...}
   ```

**Nếu platform = "unknown":**
- URL không match pattern
- Check URL format trong Sheet
- Thêm pattern vào `extractPlatform()` nếu cần

### Issue 3: Video ID extraction lỗi

**Check video_id trong API response:**
```javascript
fetch(VideoDatabase.API_URL)
  .then(r => r.json())
  .then(d => console.table(d.data.map(v => ({
    element_id: v.element_id,
    platform: v.platform,
    video_id: v.video_id,
    url: v.video_url
  }))));
```

**Nếu video_id sai:**
- Check regex pattern trong `extractVideoId()`
- Thêm log để debug URL parsing

---

## ✅ Success Criteria:

Deploy thành công khi:

- [ ] API test trong browser → Field names là `element_id`, `category`, `platform`, `video_id`
- [ ] Console log → `✅ Data fetched successfully: 15 videos`
- [ ] Console log → `📹 Videos loaded: 1. vid_1 - Giới thiệu (streamable)`
- [ ] Không còn "undefined - Untitled (undefined)"
- [ ] Videos hiển thị đúng trên trang

---

## 🎯 Quick Commands:

**Test API field names:**
```javascript
fetch('YOUR_WEB_APP_URL')
  .then(r => r.json())
  .then(d => {
    console.log('Keys:', Object.keys(d.data[0]));
    console.table(d.data);
  });
```

**Clear cache & reload:**
```javascript
localStorage.clear();
location.reload();
```

**Check video data:**
```javascript
VideoDatabase.checkDataStatus();
```

---

**LÀM NGAY!** Chỉ 5 phút là videos sẽ hiển thị đúng! 🚀

---

**Updated:** 2025-12-29 | **Priority:** 🔥 URGENT | **Fix:** Field Name Mapping
