# 📝 TEMPLATE GOOGLE SHEETS

## CÁCH SỬ DỤNG TEMPLATE

### Option 1: Tạo từ đầu
1. Tạo Google Sheet mới: https://sheets.google.com
2. Tạo 4 tabs: Sections, Tables, Images, Metadata
3. Import các file CSV từ thư mục `templates/`

### Option 2: Copy Template có sẵn (Recommended)
**Đang cập nhật link template...**

---

## CẤU TRÚC 4 TABS

### 1️⃣ Tab: Sections
**Mục đích**: Quản lý nội dung text của các section

| Column A: element_id | Column B: content | Column C: type |
|---------------------|-------------------|----------------|
| section-onboard | 1. ONBOARD | text |
| section-dang-don | 2. ĐĂNG ĐƠN | text |
| section-dang-don-3 | 3. ĐĂNG ĐƠN | text |

**Headers (Row 1):**
- A1: `element_id`
- B1: `content`
- C1: `type`

---

### 2️⃣ Tab: Tables
**Mục đích**: Quản lý nội dung bảng

| table_id | row_number | column_1 | column_2 | column_3 |
|----------|------------|----------|----------|----------|
| 70fe4b0d-c3af-486e-8387-de3a7ced6ce4 | 1 | Header 1 | Header 2 | Header 3 |
| 70fe4b0d-c3af-486e-8387-de3a7ced6ce4 | 2 | Data 1 | Data 2 | Data 3 |

**Headers (Row 1):**
- A1: `table_id`
- B1: `row_number`
- C1: `column_1`
- D1: `column_2`
- E1: `column_3`

---

### 3️⃣ Tab: Images
**Mục đích**: Quản lý đường dẫn hình ảnh

| element_id | content | type |
|------------|---------|------|
| 2ceec18e-70ae-80a2-82c0-fbc34569c941 | https://i.imgur.com/abc.jpg | src |

**Headers (Row 1):**
- A1: `element_id`
- B1: `content`
- C1: `type`

**Note**: Column C luôn là "src" cho images

---

### 4️⃣ Tab: Metadata
**Mục đích**: Thông tin meta của trang

| element_id | content | type |
|------------|---------|------|
| page-title | Tài liệu tổng quan | text |
| last-updated | 22/12/2025 | text |
| version | 1.0 | text |

**Headers (Row 1):**
- A1: `element_id`
- B1: `content`
- C1: `type`

---

## 🎨 FORMAT CELLS

### Colors (Recommended):
- **Header row**: Green background (#D9EAD3)
- **element_id column**: Light blue (#D0E0E3)
- **content column**: White
- **type column**: Light gray (#F3F3F3)

### Fonts:
- **Headers**: Bold, 11pt
- **Content**: Regular, 10pt
- Font family: Arial hoặc Roboto

---

## 🔄 IMPORT CSV FILES

### Cách import:
1. Click tab muốn import (ví dụ: Sections)
2. File → Import → Upload
3. Chọn file `Sections.csv`
4. Import location: "Replace current sheet"
5. Separator type: "Comma"
6. Click "Import data"

Lặp lại cho 4 tabs:
- Sections.csv → Tab "Sections"
- Tables.csv → Tab "Tables"
- Images.csv → Tab "Images"
- Metadata.csv → Tab "Metadata"

---

## ✅ CHECKLIST

Trước khi publish, kiểm tra:

- [ ] Có đủ 4 tabs: Sections, Tables, Images, Metadata
- [ ] Mỗi tab có header row (row 1)
- [ ] Column names đúng: element_id, content, type
- [ ] Không có spaces thừa trong column names
- [ ] Data bắt đầu từ row 2
- [ ] File → Publish to web đã được thực hiện
- [ ] Sheet ID đã được copy

---

## 📊 EXAMPLE DATA

### Sections Example:
```
element_id                      | content                  | type
-------------------------------|--------------------------|------
section-onboard                | 1. ONBOARD               | text
section-dang-don               | 2. ĐĂNG ĐƠN              | text
faeda640-dac4-4844-9dad...     | Nội dung chi tiết...     | html
```

### Images Example:
```
element_id                      | content                           | type
-------------------------------|-----------------------------------|------
2ceec18e-70ae-80a2...          | https://i.imgur.com/abc.jpg      | src
logo-image                     | https://example.com/logo.png     | src
```

### Metadata Example:
```
element_id      | content                          | type
----------------|----------------------------------|------
page-title      | Tài liệu tổng quan               | text
last-updated    | 22/12/2025                       | text
author          | GHTK Team                        | text
version         | 1.0                              | text
```

---

## 🎯 BEST PRACTICES

1. **Naming convention**: Sử dụng ID có ý nghĩa
   - ✅ Good: `section-onboard`, `table-pricing`
   - ❌ Bad: `abc123`, `test1`

2. **Content**: Giữ format nhất quán
   - Text ngắn: type = "text"
   - HTML code: type = "html"
   - Images: type = "src"

3. **URLs**: Luôn dùng HTTPS
   - ✅ Good: `https://example.com/image.jpg`
   - ❌ Bad: `http://example.com/image.jpg`

4. **Backup**: Thường xuyên File → Download → CSV
   - Backup hàng tuần recommended

---

## 🚀 PUBLISH STEPS

1. File → Share → Publish to web
2. Select: "Entire Document"
3. Format: "Web page"
4. Click "Publish"
5. Confirm
6. Copy Sheet ID from URL
7. Update `index.html` with Sheet ID

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Xem file GOOGLE_SHEETS_SETUP.md
2. Check Console (F12) for errors
3. Verify Sheet ID
4. Ensure sheet is published

---

**Template ready to use! 🎉**
