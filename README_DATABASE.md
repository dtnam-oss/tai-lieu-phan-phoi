# 🚀 QUICK START - Google Sheets Database

## TÓM TẮT NHANH

Website này đã được tích hợp hệ thống quản lý nội dung qua Google Sheets. Bạn có thể cập nhật nội dung mà không cần chỉnh sửa code HTML.

---

## ⚡ 3 BƯỚC CƠ BẢN

### Bước 1: Tạo Google Sheet
1. Vào https://sheets.google.com
2. Tạo spreadsheet mới
3. Tạo 4 tabs: **Sections**, **Tables**, **Images**, **Metadata**
4. Import các file CSV từ thư mục `templates/`

### Bước 2: Publish Sheet
1. File → Share → Publish to web
2. Chọn "Entire Document"
3. Click "Publish"
4. Copy Sheet ID từ URL

### Bước 3: Cấu hình
1. Mở `index.html`
2. Tìm dòng: `SHEET_ID: 'YOUR_SHEET_ID_HERE'`
3. Thay bằng Sheet ID của bạn
4. Save file

---

## 📁 CẤU TRÚC TEMPLATE

Thư mục `templates/` chứa 4 file CSV mẫu:

1. **Sections.csv** - Nội dung text các phần
2. **Images.csv** - Đường dẫn hình ảnh
3. **Metadata.csv** - Thông tin metadata
4. **Tables.csv** - Dữ liệu bảng

### Import vào Google Sheets:
1. Tạo tab mới trong Sheet
2. File → Import → Upload
3. Chọn file CSV tương ứng
4. Import data

---

## 🔑 LẤY SHEET ID

URL Google Sheet:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit
```

**Sheet ID**: `1ABC123xyz456`

---

## 🎯 SỬ DỤNG

### Cập nhật nội dung:
1. Chỉnh sửa trong Google Sheet
2. Vào website
3. Click nút **"🔄 Refresh Content"** (góc dưới phải)
4. Nội dung tự động cập nhật!

### Console Commands:
```javascript
// Refresh toàn bộ
SheetDB.refresh();

// Xóa cache
SheetDB.clearCache();

// Cập nhật 1 element
SheetDB.updateElement('element-id', 'New content', 'text');
```

---

## 📊 CẤU TRÚC DỮ LIỆU

### Tab "Sections"
| element_id | content | type |
|------------|---------|------|
| section-onboard | 1. ONBOARD | text |

### Tab "Images"
| element_id | content | type |
|------------|---------|------|
| image-id | https://imgur.com/abc.jpg | src |

### Tab "Metadata"
| element_id | content | type |
|------------|---------|------|
| page-title | Tài liệu | text |

### Tab "Tables"
| table_id | row_number | column_1 | column_2 |
|----------|------------|----------|----------|
| table-id | 1 | Cell 1 | Cell 2 |

---

## 🔧 TROUBLESHOOTING

**Lỗi "Error fetching":**
- ✅ Sheet đã publish chưa?
- ✅ Sheet ID đúng chưa?
- ✅ Sheet có public không?

**Nội dung không cập nhật:**
- ✅ Click "Refresh Content"
- ✅ Clear browser cache (Ctrl+Shift+R)
- ✅ Kiểm tra Console (F12)

---

## 📖 DOCS

Xem file **GOOGLE_SHEETS_SETUP.md** để có hướng dẫn chi tiết đầy đủ.

---

## ✨ TÍNH NĂNG

✅ Quản lý nội dung qua Google Sheets
✅ Không cần chỉnh sửa code
✅ Cập nhật realtime
✅ Cache thông minh (5 phút)
✅ Button refresh thủ công
✅ Multi-user friendly
✅ Console API cho developers

---

## 🎨 DEMO

1. Mở Google Sheet
2. Đổi nội dung cell
3. Vào website → Click "🔄 Refresh"
4. Xem nội dung cập nhật!

**Happy coding! 🚀**
