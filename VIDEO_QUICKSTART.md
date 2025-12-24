# 🚀 QUICK START: Hệ thống Video Google Sheets

## ⚡ Setup Nhanh (5 phút)

### 1️⃣ Tạo Google Sheet

```
1. Vào https://sheets.google.com/ → Tạo sheet mới
2. Đặt tên tab: "VideoData" (chính xác)
3. Tạo header row:
   A: Hang_Muc | B: Element_ID | C: Video_URL | D: Thumbnail | E: Platform
```

### 2️⃣ Thêm dữ liệu mẫu

| Hang_Muc           | Element_ID | Video_URL                          | Thumbnail | Platform   |
|--------------------|------------|------------------------------------|-----------|------------|
| 2.1. CONFIG SHOP   | vid_2_1    | https://streamable.com/e/oronb2?   |           | streamable |
| 2.2. CHUẨN HÓA KHO | vid_2_2    | https://player.cloudinary.com/...  |           | cloudinary |

### 3️⃣ Deploy Google Apps Script

```
1. Extensions → Apps Script
2. Xóa code cũ, paste code từ VIDEO_GOOGLE_SHEETS_SETUP.md
3. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
4. Copy URL (https://script.google.com/macros/s/.../exec)
```

### 4️⃣ Update Website

**File: index.html (line ~5250)**

```javascript
const VideoDatabase = {
    API_URL: 'PASTE_URL_Ở_ĐÂY',  // ⚠️ Thay URL vừa copy
```

### 5️⃣ Thêm Video Slots

**Tại vị trí cần hiển thị video:**

```html
<div id="vid_2_1" class="video-slot"></div>
```

⚠️ **ID phải trùng với Element_ID trong Sheet!**

---

## ✅ Test

```bash
1. Mở URL Apps Script trên browser → Phải thấy JSON
2. F5 website → Console: "🎬 Video system ready!"
3. Click play button → Video load
4. F5 lần 2 → Load tức thì (cache)
```

---

## 📌 Thêm Video Mới (1 phút)

### Google Sheet:
```
Thêm 1 row: 3.1. TẠO BOOKING | vid_3_1 | https://... | | streamable
```

### HTML:
```html
<div id="vid_3_1" class="video-slot"></div>
```

**Done!** Không cần deploy code.

---

## 🐛 Debug

### Video không hiện?

```javascript
// Console:
localStorage.removeItem('video_data_cache');
location.reload();
```

### Check API:
```
Mở URL Apps Script trên browser → Phải thấy:
{
  "success": true,
  "data": [...],
  "count": 2
}
```

---

## 📖 Chi tiết

Xem file: **VIDEO_GOOGLE_SHEETS_SETUP.md**

---

**🎉 Done! Bây giờ bạn quản lý video từ Google Sheets!**
