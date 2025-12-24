# 🎥 Hướng dẫn Setup Hệ thống Video Dynamic với Google Sheets

## 📋 Tổng quan

Hệ thống Video Dynamic cho phép bạn quản lý tất cả video tutorials từ Google Sheets thay vì hardcode trong code. Điều này giúp:

- ✅ **Dễ dàng cập nhật**: Chỉ cần edit Google Sheet, không cần code
- ✅ **Performance cao**: Caching với localStorage, stale-while-revalidate strategy
- ✅ **Scalable**: Dễ dàng thêm video mới chỉ bằng cách thêm 1 row
- ✅ **Click-to-load**: Video chỉ load khi user click (Facade Pattern)

---

## 🔧 BƯỚC 1: Tạo Google Sheet Database

### 1.1. Tạo Google Sheet mới

1. Mở [Google Sheets](https://sheets.google.com/)
2. Tạo sheet mới, đặt tên: **"VideoDatabase"** (hoặc tùy ý)
3. Tạo tab/sheet con tên: **"VideoData"** (⚠️ Tên này quan trọng, phải đúng)

### 1.2. Cấu trúc Sheet (VideoData)

Tạo các cột sau (Row 1 là header):

| Column | Field Name  | Description                                          | Example                                    |
|--------|-------------|------------------------------------------------------|--------------------------------------------|
| **A**  | Hang_Muc    | Tên hạng mục/category cho quản lý                   | `2.1. CẤU HÌNH SHOP`                       |
| **B**  | Element_ID  | ID của div trong HTML (phải unique)                 | `vid_2_1`                                  |
| **C**  | Video_URL   | URL embed iframe (Streamable/Cloudinary)            | `https://streamable.com/e/oronb2?`         |
| **D**  | Thumbnail   | URL ảnh thumbnail (optional, có thể để trống)      | `https://i.imgur.com/abc123.jpg`           |
| **E**  | Platform    | Platform video: `streamable` hoặc `cloudinary`      | `streamable`                               |

### 1.3. Ví dụ dữ liệu mẫu

```
| Hang_Muc                | Element_ID | Video_URL                                                    | Thumbnail | Platform    |
|-------------------------|------------|--------------------------------------------------------------|-----------|-------------|
| 2.1. CẤU HÌNH SHOP      | vid_2_1    | https://streamable.com/e/oronb2?                             |           | streamable  |
| 2.2. CHUẨN HÓA KHO      | vid_2_2    | https://player.cloudinary.com/embed/?cloud_name=...          |           | cloudinary  |
```

---

## 🚀 BƯỚC 2: Deploy Google Apps Script

### 2.1. Mở Script Editor

1. Trong Google Sheet, click **Extensions → Apps Script**
2. Xóa code mặc định (nếu có)

### 2.2. Paste Code API

Copy đoạn code sau vào Script Editor:

```javascript
/**
 * GOOGLE APPS SCRIPT - Video Database API
 * Deploy as Web App to get public URL
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('VideoData');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet "VideoData" not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data (skip header row)
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Transform to JSON array
    const videos = rows
      .filter(row => row[1]) // Filter rows with Element_ID
      .map(row => ({
        category: row[0] || '',
        element_id: row[1] || '',
        video_url: row[2] || '',
        thumbnail: row[3] || '',
        platform: row[4] || 'streamable'
      }));
    
    // Return JSON response
    const output = ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: videos,
      timestamp: new Date().toISOString(),
      count: videos.length
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    
    return output;
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 2.3. Deploy Web App

1. Click **Deploy → New deployment**
2. Click biểu tượng ⚙️ (Settings) bên cạnh "Select type"
3. Chọn **Web app**
4. **Execute as:** Chọn **"Me"** (your-email@gmail.com)
5. **Who has access:** Chọn **"Anyone"** (Quan trọng! Để public API)
6. Click **Deploy**
7. Copy **Web app URL** (dạng: `https://script.google.com/macros/s/AK...xyz/exec`)

⚠️ **Lưu ý:** Nếu bạn update code sau này:
- Click **Deploy → Manage deployments**
- Click ✏️ (Edit) → **New version** → **Deploy**

---

## 💻 BƯỚC 3: Cập nhật Frontend Code

### 3.1. Mở file index.html

Tìm dòng này (khoảng line 5250):

```javascript
const VideoDatabase = {
    // ⚠️ IMPORTANT: Thay bằng URL Google Apps Script của bạn
    API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
```

### 3.2. Thay URL

Thay `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` bằng URL bạn vừa copy ở bước 2.3:

```javascript
API_URL: 'https://script.google.com/macros/s/AKfycbxxx...xyz/exec',
```

### 3.3. Thêm Video Slots trong HTML

Tại vị trí bạn muốn hiển thị video, thêm:

```html
<div id="vid_2_1" class="video-slot"></div>
```

**⚠️ Quan trọng:** `id` phải trùng với `Element_ID` trong Google Sheet!

---

## ✅ BƯỚC 4: Test & Verify

### 4.1. Test API trực tiếp

1. Mở URL Google Apps Script trên browser
2. Bạn phải thấy JSON response:

```json
{
  "success": true,
  "data": [
    {
      "category": "2.1. CẤU HÌNH SHOP",
      "element_id": "vid_2_1",
      "video_url": "https://streamable.com/e/oronb2?",
      "thumbnail": "",
      "platform": "streamable"
    }
  ],
  "timestamp": "2025-12-24T10:30:00.000Z",
  "count": 1
}
```

### 4.2. Test trên Website

1. Mở website (F5 để refresh)
2. Mở **Console** (F12 → Console tab)
3. Kiểm tra logs:

```
🎬 Initializing Video System (Google Sheets)...
🌐 Fetching videos from Google Sheets...
✅ Fetched 2 videos from Google Sheets
🎬 Rendering 2 videos...
✓ Rendered: vid_2_1 (2.1. CẤU HÌNH SHOP)
✓ Rendered: vid_2_2 (2.2. CHUẨN HÓA KHO)
🎬 Video system ready!
```

4. Bạn sẽ thấy:
   - 📦 **Skeleton loading** (nếu chưa có cache)
   - 🎥 **Browser mockup với play button** xuất hiện
   - Click play button → Video load

### 4.3. Test Cache

1. F5 reload trang lần 2
2. Console sẽ hiện:

```
📦 Loading videos from cache (instant)
🎬 Rendering 2 videos...
```

→ **Load tức thì** từ localStorage cache!

---

## 🔄 BƯỚC 5: Cập nhật Video

### Thêm video mới

1. Mở Google Sheet
2. Thêm 1 row mới:
   - **Hang_Muc:** `3.1. TẠO BOOKING`
   - **Element_ID:** `vid_3_1`
   - **Video_URL:** `https://streamable.com/e/abc123?`
   - **Thumbnail:** (để trống hoặc URL ảnh)
   - **Platform:** `streamable`

3. Trong HTML, thêm:
```html
<div id="vid_3_1" class="video-slot"></div>
```

4. **Refresh website** → Video tự động hiện!

### Update URL video cũ

1. Chỉ cần edit **Video_URL** trong Google Sheet
2. Sau 5 phút (cache expire), website tự động cập nhật
3. Hoặc xóa cache thủ công:
   - Console: `localStorage.removeItem('video_data_cache')`
   - Refresh trang

---

## 🛠️ Debug & Troubleshooting

### Lỗi: Video không hiển thị

**Console shows:** `❌ Google Apps Script URL not configured!`

**Fix:** Kiểm tra `API_URL` đã được thay đổi chưa (không còn là `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`)

---

### Lỗi: API trả về error

**Console shows:** `❌ Failed to load videos: HTTP 403`

**Fix:** 
1. Mở Google Apps Script
2. Deploy → Manage deployments
3. Đảm bảo **"Who has access"** là **"Anyone"**

---

### Lỗi: Slot not found

**Console shows:** `⚠️ Slot not found: vid_2_3`

**Fix:** 
1. Kiểm tra `Element_ID` trong Google Sheet
2. Đảm bảo HTML có `<div id="vid_2_3" class="video-slot"></div>`
3. ID phải **trùng khớp chính xác**

---

### Xóa cache để test

```javascript
// Chạy trong Console
localStorage.removeItem('video_data_cache');
location.reload();
```

---

## 📊 Performance Optimization

### Cache Strategy (Stale-while-revalidate)

1. **Lần 1 (Cold start):**
   - Hiện skeleton loading (~1-2s)
   - Fetch từ Google Apps Script
   - Lưu vào localStorage
   - Render videos

2. **Lần 2+ (Cache hit):**
   - Load **tức thì** từ localStorage
   - **Background:** Fetch API để check update
   - Nếu có thay đổi → Re-render ngầm

3. **Cache lifetime:**
   - **Optimal:** 5 minutes
   - **Maximum:** 1 hour (sau đó force clear)

---

## 🎯 Best Practices

### Google Sheet

- ✅ **Đặt tên tab chính xác:** `VideoData` (case-sensitive)
- ✅ **Element_ID unique:** Mỗi video phải có ID riêng
- ✅ **URL đầy đủ:** Include protocol (`https://`)
- ✅ **Platform chính xác:** `streamable` hoặc `cloudinary` (lowercase)

### HTML

- ✅ **ID trùng khớp:** `<div id="vid_2_1">` ⇄ `Element_ID: vid_2_1`
- ✅ **Class video-slot:** Để CSS styling hoạt động
- ✅ **Vị trí hợp lý:** Đặt video-slot sau bảng/text mô tả

### Performance

- ✅ **Lazy loading:** Video chỉ load khi click (Facade Pattern)
- ✅ **Cache enabled:** Giảm request tới Google Apps Script
- ✅ **Skeleton loading:** UX tốt khi chờ API

---

## 📝 Example: Thêm 5 videos mới

### Google Sheet

```
| Hang_Muc              | Element_ID | Video_URL                            | Thumbnail | Platform    |
|-----------------------|------------|--------------------------------------|-----------|-------------|
| 3.1. TẠO BOOKING      | vid_3_1    | https://streamable.com/e/abc123?     |           | streamable  |
| 3.2. PHÂN XE          | vid_3_2    | https://streamable.com/e/def456?     |           | streamable  |
| 4.1. TẠO PO           | vid_4_1    | https://player.cloudinary.com/...    |           | cloudinary  |
| 4.2. XỬ LÝ TẠI ĐIỂM   | vid_4_2    | https://streamable.com/e/ghi789?     |           | streamable  |
| 5.1. NHẬP KHO         | vid_5_1    | https://streamable.com/e/jkl012?     |           | streamable  |
```

### HTML (index.html)

```html
<!-- Section 3.1 -->
<h3>3.1. Tạo Booking</h3>
<table>...</table>
<div id="vid_3_1" class="video-slot"></div>

<!-- Section 3.2 -->
<h3>3.2. Phân xe</h3>
<table>...</table>
<div id="vid_3_2" class="video-slot"></div>

<!-- Section 4.1 -->
<h3>4.1. Tạo PO</h3>
<table>...</table>
<div id="vid_4_1" class="video-slot"></div>

<!-- ... và tiếp tục -->
```

**Kết quả:** 5 videos tự động render với browser mockup + click-to-load!

---

## 🚀 Deployment Checklist

- [ ] Google Sheet tạo xong với tab "VideoData"
- [ ] Cột A-E có header đúng format
- [ ] Google Apps Script đã deploy (Who has access: Anyone)
- [ ] Copy được Web App URL
- [ ] `index.html` đã update `API_URL`
- [ ] HTML có các `<div class="video-slot">` với ID tương ứng
- [ ] Test API trên browser → trả về JSON
- [ ] Test website → Console logs OK
- [ ] Click play button → Video load thành công
- [ ] F5 lần 2 → Load tức thì từ cache

---

## 🎉 Hoàn thành!

Bây giờ bạn có:
- ✅ Hệ thống video quản lý từ Google Sheets
- ✅ Performance cao với localStorage cache
- ✅ Stale-while-revalidate strategy
- ✅ Click-to-load lazy loading
- ✅ Browser mockup UI (MacOS style)
- ✅ Scalable: Thêm video chỉ cần thêm 1 row trong Sheet

---

## 📞 Support

Nếu gặp vấn đề:

1. Check Console logs (F12 → Console)
2. Test API URL trực tiếp trên browser
3. Xóa cache: `localStorage.removeItem('video_data_cache')`
4. Kiểm tra Element_ID trùng khớp HTML ⇄ Sheet

**Happy coding! 🎥🚀**
