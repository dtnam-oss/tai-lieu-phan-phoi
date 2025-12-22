# 📊 HƯỚNG DẪN CẤU HÌNH GOOGLE SHEETS DATABASE

## 🎯 MỤC ĐÍCH
Quản lý nội dung website thông qua Google Sheets mà không cần chỉnh sửa code HTML.

---

## 📝 BƯỚC 1: TẠO GOOGLE SHEET

### 1.1. Tạo Sheet mới
1. Truy cập: https://sheets.google.com
2. Tạo "Blank spreadsheet" mới
3. Đặt tên: **"Tai Lieu Phan Phoi - Database"**

### 1.2. Tạo 4 Tabs (Sheets)
Tạo 4 tabs với tên chính xác như sau:
- **Sections** - Nội dung các phần
- **Tables** - Nội dung bảng
- **Images** - Đường dẫn hình ảnh
- **Metadata** - Thông tin metadata

---

## 📋 BƯỚC 2: CẤU TRÚC DỮ LIỆU

### Tab 1: **Sections**
Quản lý nội dung text của các phần trong trang

| element_id | content | type |
|------------|---------|------|
| section-onboard | 1. ONBOARD | text |
| section-dang-don | 2. ĐĂNG ĐƠN | text |
| faeda640-dac4-4844-9dad-9606804fd78c | Nội dung phần ONBOARD chi tiết... | html |

**Cột:**
- `element_id`: ID của thẻ HTML (ví dụ: id="section-onboard")
- `content`: Nội dung muốn hiển thị
- `type`: Loại nội dung (text, html, src, href, class, style)

**Ví dụ thực tế:**
```
element_id                                  | content                           | type
-------------------------------------------|-----------------------------------|------
section-onboard                            | 1. ONBOARD - MỞ TÀI KHOẢN        | text
2ceec18e-70ae-8090-98f5-ddfffa556484      | Hình minh hoạ sản phẩm           | text
```

---

### Tab 2: **Tables**
Quản lý nội dung bảng

| table_id | row_number | column_1 | column_2 | column_3 |
|----------|------------|----------|----------|----------|
| 70fe4b0d-c3af-486e-8387-de3a7ced6ce4 | 1 | Nhóm tiêu chí | PO – Phân phối | SO – Shop Online |
| 70fe4b0d-c3af-486e-8387-de3a7ced6ce4 | 2 | I. Đặc thù kinh doanh | Đơn vị PHẢI hoạt động... | Hoạt động chính... |

**Cột:**
- `table_id`: ID của bảng HTML
- `row_number`: Số thứ tự dòng
- `column_1`, `column_2`, `column_3`, ...: Nội dung các cột

---

### Tab 3: **Images**
Quản lý đường dẫn hình ảnh

| element_id | content | type |
|------------|---------|------|
| 2ceec18e-70ae-80a2-82c0-fbc34569c941 | https://i.imgur.com/example.jpg | src |
| image-onboard-demo | https://example.com/image.png | src |

**Cột:**
- `element_id`: ID của thẻ img hoặc thẻ chứa ảnh
- `content`: URL đầy đủ của ảnh
- `type`: Luôn là "src"

---

### Tab 4: **Metadata**
Thông tin chung của trang

| element_id | content | type |
|------------|---------|------|
| page-title | Tài liệu tổng quan luồng phân phối | text |
| page-description | Hướng dẫn chi tiết quy trình phân phối | text |
| last-updated | 22/12/2025 | text |

---

## 🔧 BƯỚC 3: PUBLISH GOOGLE SHEET

### 3.1. Publish to Web
1. Vào menu **File** → **Share** → **Publish to web**
2. Tab "Link":
   - **Entire Document** hoặc chọn từng sheet riêng
   - **Web page** hoặc **CSV**
3. Click **Publish**
4. Copy **Sheet ID** từ URL

### 3.2. Lấy Sheet ID
URL Google Sheet có dạng:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit
                                      ↑
                                 Sheet ID này
```

**Ví dụ:**
- URL: `https://docs.google.com/spreadsheets/d/1qY8HvZ3MnR2kL4pW7xT9sE6/edit`
- **Sheet ID**: `1qY8HvZ3MnR2kL4pW7xT9sE6`

---

## 🔗 BƯỚC 4: KẾT NỐI VỚI WEBSITE

### 4.1. Cập nhật Sheet ID
Mở file `index.html`, tìm dòng:
```javascript
SHEET_ID: 'YOUR_SHEET_ID_HERE',
```

Thay bằng:
```javascript
SHEET_ID: '1qY8HvZ3MnR2kL4pW7xT9sE6',  // Sheet ID của bạn
```

### 4.2. Test kết nối
1. Mở file `index.html` trong browser
2. Kiểm tra Console (F12):
   - ✅ "Content loaded successfully!" → Thành công
   - ⚠️ "Error fetching" → Lỗi kết nối

---

## 🎨 BƯỚC 5: SỬ DỤNG

### Cập nhật nội dung
1. Vào Google Sheet
2. Chỉnh sửa nội dung trong các tabs
3. Quay lại website
4. Click nút **"🔄 Refresh Content"** (góc dưới bên phải)
5. Nội dung tự động cập nhật!

### Cache
- Nội dung được cache 5 phút
- Click "Refresh Content" để cập nhật ngay lập tức
- Hoặc gõ vào Console: `SheetDB.refresh()`

---

## 📖 VÍ DỤ CỤ THỂ

### Cập nhật tiêu đề section
**Google Sheet (Tab: Sections):**
| element_id | content | type |
|------------|---------|------|
| section-onboard | 1. ONBOARD - ĐĂNG KÝ TÀI KHOẢN | text |

**Kết quả:** Tiêu đề section sẽ đổi thành "1. ONBOARD - ĐĂNG KÝ TÀI KHOẢN"

### Thay đổi hình ảnh
**Google Sheet (Tab: Images):**
| element_id | content | type |
|------------|---------|------|
| 2ceec18e-70ae-80a2-82c0-fbc34569c941 | https://i.imgur.com/newimage.jpg | src |

**Kết quả:** Hình ảnh sẽ thay đổi

---

## 🔍 TÌM ELEMENT ID

### Cách 1: View Source
1. Chuột phải vào trang → "View Page Source"
2. Tìm `id="..."` trong code
3. Copy ID đó

### Cách 2: Inspect Element
1. Chuột phải vào element → "Inspect"
2. Xem thuộc tính `id` trong DevTools
3. Copy ID

### Cách 3: Console
Gõ vào Console:
```javascript
// Lấy tất cả elements có ID
document.querySelectorAll('[id]').forEach(el => {
    console.log(el.id, el.tagName);
});
```

---

## ⚙️ JAVASCRIPT API

### Sử dụng trong Console

```javascript
// Refresh toàn bộ nội dung
SheetDB.refresh();

// Xóa cache
SheetDB.clearCache();

// Cập nhật 1 element cụ thể
SheetDB.updateElement('section-onboard', 'Nội dung mới', 'text');

// Kiểm tra config
console.log(SheetDB.config);
```

---

## 🚨 TROUBLESHOOTING

### Lỗi: "Error fetching"
- ✅ Kiểm tra Sheet ID đúng chưa
- ✅ Đã publish sheet chưa (File → Publish to web)
- ✅ Sheet phải public hoặc "Anyone with link can view"

### Nội dung không cập nhật
- ✅ Clear cache: Click "Refresh Content"
- ✅ Kiểm tra `element_id` có khớp không
- ✅ Kiểm tra Console có lỗi không (F12)

### Sheet ID sai
- ✅ Lấy lại từ URL Google Sheet
- ✅ Không lấy phần `/edit` hoặc `/gid=0`

---

## 📚 CẤU TRÚC HOÀN CHỈNH

### Template Google Sheet
[Copy template này](https://docs.google.com/spreadsheets/d/YOUR_TEMPLATE_ID/copy)

### Tabs cần có:
1. ✅ **Sections** - Nội dung text
2. ✅ **Tables** - Dữ liệu bảng
3. ✅ **Images** - Links hình ảnh
4. ✅ **Metadata** - Thông tin meta

---

## 🎯 LỢI ÍCH

✅ **Không cần code**: Chỉnh sửa trên Google Sheets
✅ **Realtime**: Cập nhật nội dung ngay lập tức
✅ **Multi-user**: Nhiều người cùng chỉnh sửa
✅ **Version control**: Google Sheets tự động lưu lịch sử
✅ **Easy backup**: Export/Import dễ dàng
✅ **Cache thông minh**: Tải nhanh, tiết kiệm bandwidth

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12) để xem lỗi
2. Đảm bảo Google Sheet đã publish
3. Kiểm tra Sheet ID đúng chưa
4. Test với ví dụ đơn giản trước

---

**Chúc bạn sử dụng thành công! 🚀**
