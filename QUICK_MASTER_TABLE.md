# ⚡ QUICK GUIDE - Master Table (1 phút đọc)

## 🎯 CONCEPT

**1 Google Sheet = 1 Tab = 4 Cột**

```
┌───────────┬────────────┬──────────────┬─────────────────────┐
│ hang_muc  │ id_the     │ ten_the      │ url                 │
├───────────┼────────────┼──────────────┼─────────────────────┤
│ ONBOARD   │ section-01 │ 1. ONBOARD   │                     │
│ ONBOARD   │ image-01   │              │ https://imgur.../jpg│
│ CẤU HÌNH  │ section-02 │ 2. CẤU HÌNH  │                     │
└───────────┴────────────┴──────────────┴─────────────────────┘
```

---

## 🚀 3 BƯỚC SETUP

### 1. Tạo Sheet (30 giây)
- https://sheets.google.com → New
- Tab name: **"MasterData"**
- Import: `templates/MasterData.csv`

### 2. Publish (30 giây)
- File → Publish to web → Publish
- Copy Sheet ID từ URL

### 3. Config (30 giây)
```javascript
// index.html, tìm dòng:
SHEET_ID: 'YOUR_SHEET_ID_HERE',
// Thay bằng ID của bạn
```

---

## 📋 4 CỘT

| Cột | Tên | Mô tả | Ví dụ |
|-----|-----|-------|-------|
| A | **hang_muc** | Hạng mục (ONBOARD, CẤU HÌNH, ĐĂNG ĐƠN, VẬN HÀNH, HUB, KHO ĐÍCH) | ONBOARD |
| B | **id_the** | ID element HTML | section-onboard |
| C | **ten_the** | Nội dung text/HTML | 1. ONBOARD |
| D | **url** | Link ảnh/video (hoặc trống) | https://... |

---

## 🎨 SỬ DỤNG

```
1. Edit Google Sheet
2. Click "🔄 Refresh Content" trên website
3. Done! ✅
```

---

## 💻 COMMANDS

```javascript
SheetDB.refresh()        // Refresh all
SheetDB.clearCache()     // Clear cache
SheetDB.getMasterData()  // View data
SheetDB.getStats(data)   // Statistics
```

---

## 🔍 TÌM ID

```javascript
// Console (F12)
document.querySelectorAll('[id]').forEach(el => {
    console.log(el.id);
});
```

---

## ❓ TROUBLESHOOT

| Vấn đề | Giải pháp |
|--------|-----------|
| Error fetching | Check Sheet ID, đã publish chưa? |
| Không update | Click Refresh, clear cache |
| Element not found | Check id_the khớp với HTML |

---

## 📊 EXAMPLE

**Đổi tiêu đề section:**
```
hang_muc: ONBOARD
id_the: section-onboard
ten_the: 1. ONBOARD - CẬP NHẬT MỚI
url: (trống)
```

**Đổi ảnh:**
```
hang_muc: ONBOARD
id_the: image-logo
ten_the: (trống)
url: https://imgur.com/newimage.jpg
```

---

**Chi tiết → Xem MASTER_TABLE_GUIDE.md**
