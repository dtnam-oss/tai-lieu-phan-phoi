# 📊 Phân tích Logic Đồng bộ dữ liệu Backend ↔ Frontend

## 🎯 Tổng quan Kiến trúc

```
Google Sheets (Backend Data)
        ↓
Google Apps Script (API Layer)
        ↓
Frontend JavaScript (Cache Layer)
        ↓
HTML DOM (Display Layer)
```

---

## 🔄 Luồng Dữ liệu Chi tiết

### 1️⃣ **Backend: Google Sheets → Apps Script**

**File:** `google-apps-script-MERGED.gs`

**Function:** `getVideosFromSheet()` (lines 571-660)

#### Cách hoạt động:

```javascript
// 1. Mở Google Sheet
const SHEET_ID = '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4';
const SHEET_NAME = 'VideoData';
const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

// 2. Đọc tất cả dữ liệu
const data = sheet.getDataRange().getValues();

// 3. Map column headers to object keys
const headers = data[0];  // Row 1: Headers
const rows = data.slice(1);  // Row 2+: Data

// 4. Convert mỗi row thành video object
const videos = rows.map(row => {
    const rawVideo = {};
    headers.forEach((header, index) => {
        rawVideo[header] = row[index];
    });

    // 5. Field name conversion
    return {
        element_id: rawVideo.Element_ID,     // Sheet: Element_ID → Frontend: element_id
        category: rawVideo.Hang_Muc,         // Sheet: Hang_Muc → Frontend: category
        platform: extractPlatform(rawVideo.Video_URL),  // Auto-detect từ URL
        video_id: extractVideoId(rawVideo.Video_URL),   // Extract từ URL
        video_url: rawVideo.Video_URL,
        thumbnail: rawVideo.Thumbnail,
        title: rawVideo.Hang_Muc,
        description: rawVideo.Hang_Muc,
        duration: ''
    };
});

// 6. Return JSON
return videos;
```

#### ✅ **Khi nào backend update dữ liệu?**

**Real-time:** Google Apps Script đọc Sheet **mỗi khi có request GET** đến endpoint.

```
User thay đổi Sheet
    ↓
(Changes saved automatically by Google Sheets)
    ↓
Frontend gọi API endpoint
    ↓
Apps Script chạy getVideosFromSheet()
    ↓
Đọc Sheet lần nữa (fresh data)
    ↓
Return JSON với data mới nhất
```

**⚠️ Lưu ý:** Apps Script **KHÔNG cache** dữ liệu Sheet. Mỗi request = 1 lần đọc Sheet mới.

---

### 2️⃣ **API Layer: Apps Script → Frontend**

**Function:** `doGet(e)` (lines 55-99 trong google-apps-script-MERGED.gs)

```javascript
function doGet(e) {
    try {
        const params = e.parameter || {};
        const action = params.action;

        // Health check endpoint
        if (action === 'health' || action === 'status') {
            return JSON.stringify({
                status: 'ok',
                message: 'GHTK Web App is running!'
            });
        }

        // DEFAULT: Video data endpoint
        const videos = getVideosFromSheet();

        return JSON.stringify({
            success: true,
            data: videos,
            timestamp: new Date().toISOString(),
            source: 'google-apps-script'
        });
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}
```

#### API Response Format:

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
      "thumbnail": "https://...",
      "title": "Giới thiệu hệ thống GHTK",
      "description": "Giới thiệu hệ thống GHTK",
      "duration": ""
    },
    ...
  ],
  "timestamp": "2025-12-29T10:30:00.000Z",
  "source": "google-apps-script"
}
```

---

### 3️⃣ **Frontend: Cache Strategy**

**File:** `index.html` (VideoDatabase object, lines 6153-6500)

**Cache Strategy:** **Stale-While-Revalidate**

#### Cách hoạt động:

```javascript
const VideoDatabase = {
    API_URL: 'https://script.google.com/.../exec',
    CACHE_KEY: 'video_data_cache',
    CACHE_DURATION: 5 * 60 * 1000,  // 5 minutes

    async getData() {
        // 1. Check cache
        const cache = this.getCache();

        if (cache) {
            // 2. Return cached data IMMEDIATELY (instant load)
            console.log('📦 Loading videos from cache (instant)');

            // 3. Background fetch to check for updates
            this.fetchAndUpdateCache().then(freshData => {
                if (this.hasChanged(cache.data, freshData)) {
                    console.log('🔄 Cache updated, re-rendering videos');
                    this.renderVideos(freshData);
                }
            });

            return cache.data;
        }

        // 4. No cache: Fetch from API
        console.log('🌐 Fetching videos from Google Sheets...');
        const data = await this.fetchAndUpdateCache();
        return data;
    }
};
```

---

## 🔄 Timeline: User Update Sheet → Frontend Hiển thị

### Scenario 1: **User đang xem trang (không reload)**

```
T0: User mở trang
    → Frontend load cache (instant)
    → Background fetch API

T1: User sửa Sheet (thêm/xóa/sửa video)
    → Sheet saved by Google

T2: Background fetch chạy (mỗi 5 phút hoặc khi user interact)
    → API call → Apps Script đọc Sheet mới
    → Nhận data mới
    → So sánh với cache

T3: Nếu có thay đổi
    → Re-render videos tự động
    → Update cache
    → User thấy videos mới NGAY trên trang
```

**⏱️ Độ trễ:** **0-5 phút** (tùy vào lần fetch tiếp theo)

---

### Scenario 2: **User reload trang (F5 / Cmd+R)**

```
T0: User sửa Sheet

T1: User reload page
    → Frontend load cache (nếu còn fresh < 5 phút)
    → Background fetch ngay lập tức

T2: API call
    → Apps Script đọc Sheet mới
    → Return data mới

T3: Frontend nhận data mới
    → So sánh với cache
    → Re-render nếu có thay đổi
    → Update cache
```

**⏱️ Độ trễ:** **2-5 giây** (thời gian API response)

---

### Scenario 3: **Force Reload (Click nút refresh / ?reload=true)**

```
T0: User click nút refresh (hoặc thêm ?reload=true vào URL)

T1: Frontend xóa cache
    → localStorage.removeItem('video_data_cache')

T2: API call
    → Apps Script đọc Sheet hiện tại
    → Return data mới nhất

T3: Frontend nhận data
    → Save to cache
    → Render videos
```

**⏱️ Độ trễ:** **0 giây** (force refresh → data ngay lập tức)

---

## 📊 Cache Lifecycle

### Cache được lưu ở đâu?

**LocalStorage** (`localStorage.video_data_cache`)

```javascript
{
  "data": [...videos...],
  "timestamp": 1735469400000  // Unix timestamp (ms)
}
```

### Cache được update khi nào?

1. **Initial load:** Lần đầu load page (no cache)
2. **Background revalidation:** Mỗi lần page load (nếu cache tồn tại)
3. **Force refresh:** Click nút refresh / ?reload=true
4. **Auto-refresh:** Mỗi 5 phút (nếu user vẫn ở trên page)

### Cache bị xóa khi nào?

1. User clear browser data
2. User click nút refresh
3. URL có `?reload=true`
4. Code gọi `localStorage.removeItem('video_data_cache')`

---

## ⚡ Performance Optimizations

### 1. **Instant Load (Cache-First)**

- User mở page → Thấy videos NGAY (từ cache)
- Không cần đợi API response
- **Trải nghiệm:** Trang load instant như offline-first app

### 2. **Background Revalidation**

- Fetch API **không block** UI
- Update dữ liệu **trong background**
- User không thấy loading spinner

### 3. **Smart Comparison**

```javascript
hasChanged(oldData, newData) {
    if (oldData.length !== newData.length) return true;

    // So sánh từng video
    for (let i = 0; i < oldData.length; i++) {
        if (oldData[i].element_id !== newData[i].element_id ||
            oldData[i].title !== newData[i].title ||
            oldData[i].video_url !== newData[i].video_url) {
            return true;
        }
    }
    return false;
}
```

**→ Chỉ re-render nếu data THỰC SỰ thay đổi**

---

## 🐛 Debug Tools

### 1. Check Data Status

```javascript
VideoDatabase.checkDataStatus();
```

**Output:**
```
================================================================================
🔍 VIDEO DATA STATUS CHECK
================================================================================
📦 Data Source: CACHE (localStorage)
⏰ Cache Age: 2 minutes ago
📊 Videos in Cache: 15
🔄 Cache Status: ✅ Fresh

📹 Videos loaded:
  1. vid_1 - Giới thiệu hệ thống GHTK (streamable)
  2. vid_2_1 - Quy trình ONBOARD (cloudinary)
  ...
```

### 2. Force Reload

**Method 1: Click nút refresh** (có UI button)

**Method 2: URL parameter**
```
https://dtnam-oss.github.io/tai-lieu-phan-phoi/?reload=true
```

**Method 3: Console**
```javascript
VideoDatabase.forceRefresh();
```

### 3. Manual API Test

```javascript
fetch('https://script.google.com/.../exec')
  .then(r => r.json())
  .then(d => {
    console.log('Videos from API:', d.data.length);
    console.table(d.data);
  });
```

---

## 🔐 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ USER UPDATES GOOGLE SHEET                                   │
│ (Add/Edit/Delete videos in VideoData tab)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Google auto-saves
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ GOOGLE SHEETS                                               │
│ Sheet ID: 12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4      │
│ Sheet Name: VideoData                                       │
│                                                             │
│ Columns:                                                    │
│ - Hang_Muc                                                  │
│ - Element_ID                                                │
│ - Video_URL                                                 │
│ - Thumbnail                                                 │
│ - Platform                                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Apps Script reads on each GET request
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ GOOGLE APPS SCRIPT                                          │
│ Function: doGet() → getVideosFromSheet()                    │
│                                                             │
│ Processing:                                                 │
│ 1. Read all rows from Sheet                                 │
│ 2. Map columns to object keys                               │
│ 3. Field name conversion (Element_ID → element_id)          │
│ 4. Extract platform & video_id from Video_URL               │
│ 5. Return JSON                                              │
│                                                             │
│ Output:                                                     │
│ {                                                           │
│   success: true,                                            │
│   data: [...videos...],                                     │
│   timestamp: "2025-12-29T..."                               │
│ }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP GET request
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND CACHE LAYER (localStorage)                        │
│                                                             │
│ Strategy: Stale-While-Revalidate                            │
│ Duration: 5 minutes                                         │
│                                                             │
│ Flow:                                                       │
│ 1. Check cache → Return immediately (instant)               │
│ 2. Background fetch → Update if changed                     │
│ 3. No cache → Fetch & save                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Render to DOM
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ BROWSER DISPLAY                                             │
│                                                             │
│ Videos render into slots:                                   │
│ <div id="vid_1" class="video-slot"></div>                   │
│ <div id="vid_2_1" class="video-slot"></div>                 │
│                                                             │
│ User sees:                                                  │
│ - Browser mockup with embedded video player                 │
│ - Thumbnail, title, category                                │
│ - Click to play video                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Cơ chế Update Tự động

### Khi nào frontend tự động update?

| Scenario | Auto Update? | Delay | Notes |
|----------|-------------|-------|-------|
| User sửa Sheet → Page đang mở (không reload) | ✅ Yes | 0-5 phút | Background fetch theo interval |
| User sửa Sheet → User reload page (F5) | ✅ Yes | 2-5 giây | Fetch ngay khi page load |
| User sửa Sheet → User click nút refresh | ✅ Yes | 0 giây | Force fetch & clear cache |
| User sửa Sheet → User thêm ?reload=true | ✅ Yes | 0 giây | Force fetch & clear cache |
| Cache > 5 phút tuổi | ✅ Yes | 2-5 giây | Auto-revalidate on next page load |

---

## 🚀 Làm sao để update NGAY LẬP TỨC?

### Option 1: Click nút Refresh (Recommended)

Frontend có nút refresh button:

```javascript
// In index.html
document.getElementById('refreshButton').click();
```

Hoặc user click vào icon refresh trên trang.

### Option 2: URL Parameter

```
https://dtnam-oss.github.io/tai-lieu-phan-phoi/?reload=true
```

### Option 3: Console Command

```javascript
// Trong Console (F12)
VideoDatabase.forceRefresh();
```

### Option 4: Hard Reload Browser

- **Windows:** `Ctrl + Shift + R` hoặc `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

---

## 🔧 Troubleshooting

### Issue 1: Videos không update sau khi sửa Sheet

**Check:**
```javascript
// 1. Kiểm tra cache age
VideoDatabase.checkDataStatus();

// 2. Test API trực tiếp
fetch(VideoDatabase.API_URL)
  .then(r => r.json())
  .then(d => {
    console.log('Latest data from API:', d.data);
    console.log('Data in cache:', VideoDatabase.getCache().data);
  });

// 3. So sánh
// Nếu API có data mới nhưng cache cũ → Cache chưa update
```

**Fix:**
```javascript
VideoDatabase.forceRefresh();  // Force clear cache & reload
```

---

### Issue 2: API trả về data cũ

**Nguyên nhân:** Apps Script có thể bị cache bởi Google infrastructure

**Check:**
```javascript
// Test với timestamp
fetch(VideoDatabase.API_URL)
  .then(r => r.json())
  .then(d => console.log('API timestamp:', d.timestamp));
```

**Fix:**
1. Deploy **New version** của Apps Script
2. Click **"New version"** trong Manage deployments
3. URL sẽ vẫn giữ nguyên nhưng nội code mới

---

### Issue 3: Browser cache

**Nguyên nhân:** Browser cache HTML/JS file cũ

**Fix:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard reload: `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac)
3. Incognito mode: `Ctrl+Shift+N`

---

## 📝 Summary

### ✅ Ưu điểm của Architecture hiện tại:

1. **Fast:** Instant load từ cache
2. **Fresh:** Background auto-update
3. **Reliable:** Fallback to sample data nếu API fail
4. **User-friendly:** Force refresh button có sẵn
5. **Debug-friendly:** Nhiều debug tools

### ⚠️ Lưu ý:

1. **Cache duration:** 5 phút → User có thể thấy data cũ trong tối đa 5 phút
2. **Manual refresh:** Khuyến khích user click nút refresh sau khi sửa Sheet
3. **Browser compatibility:** LocalStorage cần enable trong browser settings

### 🎯 Best Practices:

1. **Sau khi sửa Sheet:**
   - Click nút Refresh trên trang
   - Hoặc thêm `?reload=true` vào URL

2. **Kiểm tra data đã update:**
   ```javascript
   VideoDatabase.checkDataStatus();
   ```

3. **Debug API:**
   ```javascript
   fetch(VideoDatabase.API_URL).then(r=>r.json()).then(console.log);
   ```

---

**Updated:** 2025-12-29 | **Version:** 1.0.0 | **Status:** ✅ Production Ready
