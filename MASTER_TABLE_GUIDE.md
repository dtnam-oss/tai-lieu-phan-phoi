# 📊 HƯỚNG DẪN GOOGLE SHEETS - MASTER TABLE

## 🎯 THIẾT KẾ ĐƠN GIẢN

Chỉ cần **1 TABLE DUY NHẤT** với **4 CỘT**.

---

## 📝 BƯỚC 1: TẠO GOOGLE SHEET

1. Truy cập: https://sheets.google.com
2. Tạo "Blank spreadsheet" mới
3. Đặt tên: **"Tai Lieu Phan Phoi - Database"**
4. Đổi tên tab thành: **"MasterData"**

---

## 📋 BƯỚC 2: CẤU TRÚC 4 CỘT

### Cột A: hang_muc (Hạng mục)
Các tiêu đề lớn, gồm 6 giá trị cố định:
- **ONBOARD**
- **CẤU HÌNH**
- **ĐĂNG ĐƠN**
- **VẬN HÀNH**
- **HUB**
- **KHO ĐÍCH**

### Cột B: id_the (ID Thẻ)
ID của element HTML (từ thuộc tính `id="..."`)

**Ví dụ:**
- `section-onboard`
- `faeda640-dac4-4844-9dad-9606804fd78c`
- `2ceec18e-70ae-80a2-82c0-fbc34569c941`

### Cột C: ten_the (Tên Thẻ / Nội dung)
Nội dung text hoặc HTML của element

**Ví dụ:**
- `1. ONBOARD`
- `Hình minh hoạ sản phẩm`
- `<p>Nội dung chi tiết...</p>`

### Cột D: url
Link hình ảnh hoặc video (để trống nếu không có)

**Ví dụ:**
- `https://i.imgur.com/abc123.jpg`
- `https://drive.google.com/file/d/xyz/view`
- (trống nếu không có)

---

## 📊 VÍ DỤ CỤ THỂ

```
| hang_muc  | id_the              | ten_the                | url                          |
|-----------|---------------------|------------------------|------------------------------|
| ONBOARD   | section-onboard     | 1. ONBOARD            |                              |
| ONBOARD   | abc123-xyz          | Hình minh hoạ sản phẩm |                              |
| ONBOARD   | image-001           |                        | https://imgur.com/abc.jpg    |
| CẤU HÌNH  | section-dang-don    | 2. ĐĂNG ĐƠN           |                              |
| CẤU HÌNH  | config-table        | Cấu hình shop          |                              |
| ĐĂNG ĐƠN  | section-dang-don-3  | 3. ĐĂNG ĐƠN           |                              |
```

---

## 🔧 BƯỚC 3: IMPORT TEMPLATE

### Option 1: Import CSV
1. Download file `templates/MasterData.csv`
2. Vào Google Sheet
3. File → Import → Upload
4. Chọn file MasterData.csv
5. Import location: "Replace current sheet"
6. Click "Import data"

### Option 2: Nhập thủ công
1. Tạo header row (row 1):
   - A1: `hang_muc`
   - B1: `id_the`
   - C1: `ten_the`
   - D1: `url`

2. Nhập dữ liệu từ row 2 trở đi

---

## 📐 QUY TẮC NHẬP LIỆU

### 1. Header Row (Row 1)
**BẮT BUỘC** có đúng 4 tên cột:
```
hang_muc | id_the | ten_the | url
```

### 2. Hạng mục
Chỉ dùng 1 trong 6 giá trị:
- ✅ `ONBOARD` (viết hoa)
- ✅ `CẤU HÌNH`
- ✅ `ĐĂNG ĐƠN`
- ✅ `VẬN HÀNH`
- ✅ `HUB`
- ✅ `KHO ĐÍCH`

### 3. ID Thẻ
- **BẮT BUỘC** nhập
- Phải khớp với ID trong HTML
- Không có khoảng trắng
- Case-sensitive (phân biệt hoa thường)

### 4. Tên Thẻ
- Có thể để trống nếu chỉ update URL
- Có thể chứa HTML tags
- Có thể nhiều dòng

### 5. URL
- Để trống nếu không có
- Phải là URL đầy đủ (bắt đầu với http:// hoặc https://)
- Dùng cho images, videos

---

## 🔗 BƯỚC 4: PUBLISH SHEET

1. File → Share → Publish to web
2. Tab "Link":
   - Select: "Entire Document" HOẶC chọn tab "MasterData"
   - Format: "Web page"
3. Click **"Publish"**
4. Click **"OK"** to confirm
5. Copy **Sheet ID** từ URL

**URL dạng:**
```
https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit
                                      ↑
                                 Sheet ID
```

---

## 🔗 BƯỚC 5: CẤU HÌNH WEBSITE

Mở file `index.html`, tìm dòng (~line 2087):
```javascript
SHEET_ID: 'YOUR_SHEET_ID_HERE',
```

Thay bằng:
```javascript
SHEET_ID: '1ABC123xyz456',  // Sheet ID của bạn
```

**Lưu file!**

---

## 🎨 BƯỚC 6: SỬ DỤNG

### Cập nhật nội dung:
1. Mở Google Sheet
2. Chỉnh sửa trong bảng MasterData:
   - Đổi text trong cột `ten_the`
   - Đổi URL trong cột `url`
   - Thêm/xóa rows
3. Save (tự động)
4. Vào website
5. Click nút **"🔄 Refresh Content"**
6. ✅ Nội dung tự động cập nhật!

---

## 📖 VÍ DỤ THỰC TẾ

### Example 1: Cập nhật tiêu đề section
```
| hang_muc | id_the          | ten_the           | url |
|----------|-----------------|-------------------|-----|
| ONBOARD  | section-onboard | 1. ONBOARD - MỚI  |     |
```
→ Website hiển thị: **"1. ONBOARD - MỚI"**

---

### Example 2: Thay đổi hình ảnh
```
| hang_muc | id_the    | ten_the | url                         |
|----------|-----------|---------|-----------------------------|
| ONBOARD  | image-001 |         | https://imgur.com/new.jpg  |
```
→ Ảnh với id="image-001" sẽ thay đổi

---

### Example 3: Cập nhật cả text và URL
```
| hang_muc | id_the     | ten_the        | url                        |
|----------|------------|----------------|----------------------------|
| HUB      | video-hub  | Video hướng dẫn| https://drive.google.com/xyz |
```
→ Text và video cùng update

---

## 🔍 TÌM ID_THE

### Cách 1: View Source
1. Chuột phải → "View Page Source"
2. Ctrl+F tìm `id="`
3. Copy ID

### Cách 2: Inspect Element
1. Chuột phải element → "Inspect"
2. Xem attribute `id` trong DevTools
3. Copy ID

### Cách 3: Console
```javascript
// Lấy tất cả IDs
document.querySelectorAll('[id]').forEach(el => {
    console.log(`${el.id} - ${el.tagName} - ${el.textContent.slice(0, 30)}`);
});
```

---

## 💻 CONSOLE COMMANDS

```javascript
// Refresh toàn bộ
SheetDB.refresh();

// Xóa cache
SheetDB.clearCache();

// Xem data gốc từ Sheet
SheetDB.getMasterData().then(data => console.table(data));

// Xem thống kê theo hạng mục
SheetDB.getMasterData().then(data => {
    console.log(SheetDB.getStats(data));
});

// Xem config
console.log(SheetDB.config);
```

---

## 🚨 TROUBLESHOOTING

### Lỗi: "Error fetching"
✅ **Kiểm tra:**
- Sheet ID đúng chưa?
- Tab name = "MasterData" chưa?
- Đã publish sheet chưa?
- Sheet có public access không?

### Nội dung không update
✅ **Thử:**
1. Click "Refresh Content"
2. Clear cache: `SheetDB.clearCache()`
3. Hard refresh: Ctrl+Shift+R
4. Check Console (F12) xem lỗi

### Element không tìm thấy
✅ **Kiểm tra:**
- `id_the` có khớp với ID trong HTML không?
- ID có viết đúng (case-sensitive) không?
- Element có tồn tại trong HTML không?

---

## ✅ CHECKLIST

### Setup:
- [ ] Google Sheet đã tạo
- [ ] Tab đặt tên "MasterData"
- [ ] 4 cột header: hang_muc, id_the, ten_the, url
- [ ] Template đã import
- [ ] Sheet đã publish
- [ ] Sheet ID đã copy

### Configuration:
- [ ] index.html đã cập nhật SHEET_ID
- [ ] File đã save
- [ ] Browser đã refresh

### Testing:
- [ ] Website mở được
- [ ] Button "Refresh Content" hiển thị
- [ ] Click refresh → success notification
- [ ] Console không có lỗi
- [ ] Edit sheet → click refresh → content updates

---

## 📊 CẤU TRÚC HOÀN CHỈNH

```
Google Sheet: "Tai Lieu Phan Phoi - Database"
└── Tab: "MasterData"
    ├── Row 1 (Header): hang_muc | id_the | ten_the | url
    ├── Row 2: ONBOARD | section-onboard | 1. ONBOARD | 
    ├── Row 3: ONBOARD | image-001 | | https://...
    ├── Row 4: CẤU HÌNH | section-dang-don | 2. ĐĂNG ĐƠN |
    └── ...
```

---

## 🎯 LỢI ÍCH

✅ **Đơn giản**: Chỉ 1 table, 4 cột
✅ **Dễ quản lý**: Tất cả data ở 1 chỗ
✅ **Linh hoạt**: Thêm/xóa rows dễ dàng
✅ **Phân loại**: Theo hạng mục rõ ràng
✅ **Realtime**: Update ngay lập tức
✅ **No coding**: Không cần biết code

---

## 📈 WORKFLOW

```
1. Mở Google Sheet
   ↓
2. Edit data trong MasterData
   ↓
3. Vào website
   ↓
4. Click "🔄 Refresh Content"
   ↓
5. ✅ Done!
```

---

**Đơn giản và hiệu quả! 🚀**

*Last updated: December 22, 2025*
*Version: 2.0 - Master Table Edition*
