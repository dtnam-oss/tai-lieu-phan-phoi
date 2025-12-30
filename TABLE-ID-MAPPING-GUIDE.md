# 📋 TABLE ID MAPPING GUIDE

## 🎯 **Mục đích**

Tài liệu này giúp bạn map giữa:
- **Friendly ID** trong Google Sheet ContentData (`table-1`, `table-2`, ...)
- **Notion UUID** trong HTML (`70fe4b0d-c3af-486e-8387...`)

---

## 📊 **MAPPING TABLE**

| Friendly ID | Notion UUID | Section | Description |
|-------------|-------------|---------|-------------|
| `table-1` | `70fe4b0d-c3af-486e-8387-de3a7ced6ce4` | **1. ONBOARD** | Bảng phân biệt PO vs SO |
| `table-2` | `2ceec18e-70ae-80b2-9e7e-d80f760da1c2` | **2. CẤU HÌNH** | 2.1. Cấu hình shop được phép đăng đơn |
| `table-3` | `2ceec18e-70ae-80cd-8e35-f94c0e842b35` | **2. CẤU HÌNH** | 2.2. Chuẩn hoá kho sản phẩm |
| `table-4` | `2ceec18e-70ae-807e-838e-df7e38e8efb0` | **3. ĐĂNG ĐƠN** | 3.1. Tạo PO (PO điện tử) |
| `table-5` | `2ceec18e-70ae-803e-9504-feeb85525d0e` | **3. ĐĂNG ĐƠN** | 3.2. Tạo Booking phân phối |
| `table-6` | `2ceec18e-70ae-8043-a7f1-f27b4830da83` | **3. ĐĂNG ĐƠN** | 3.3. Phân phối xe tải lấy hàng |
| `table-7` | `2ceec18e-70ae-807e-9bd7-dd2afb44fde9` | **4. VẬN HÀNH** | 4.1. PO điện tử (PO shop tạo sẵn) |
| `table-8` | `2ceec18e-70ae-80ac-90f2-ca21a3c6c099` | **4. VẬN HÀNH** | 4.2. PO tiêu chuẩn (Thao tác chung) |
| `table-9` | `2ceec18e-70ae-8087-aa3a-f32aff8f25a6` | **4. VẬN HÀNH** | 4.2. PO tiêu chuẩn (Shop có PO vật lý) |
| `table-10` | `2ceec18e-70ae-80a3-91a5-c10810e8110f` | **4. VẬN HÀNH** | 4.3. Xử lý tại điểm (Không theo vật chứa) |
| `table-11` | `2ceec18e-70ae-8074-8925-ef32698e3be0` | **4. VẬN HÀNH** | 4.3. Xử lý tại điểm (Vận hành theo vật chứa) |
| `table-12` | `2ceec18e-70ae-8053-9c6b-f22573be56d2` | **5. HUB** | Nhập kho nguồn |
| `table-13` | `2ceec18e-70ae-80ed-9e7f-dfd91d7f397e` | **5. HUB** | Nhập kho trung chuyển |
| `table-14` | `2ceec18e-70ae-8067-936c-cd745269b96d` | **5. HUB** | Xuất trung chuyển |
| `table-15` | `2ceec18e-70ae-80d7-8068-f659ede186aa` | **6. KHO ĐÍCH** | Xuất giao đơn phân phối |
| `table-16` | `2ceec18e-70ae-8008-b424-db5827a04d84` | **6. KHO ĐÍCH** | Giao hàng |
| `table-17` | `2ceec18e-70ae-80dc-8daa-eff73336229f` | **6. KHO ĐÍCH** | Trả hàng |
| `table-18` | `2ceec18e-70ae-80aa-b861-c6afdec35654` | **6. KHO ĐÍCH** | (Table cuối cùng) |

---

## 🔧 **CÁCH SỬ DỤNG**

### **1. Trong Google Sheet ContentData:**

Sử dụng **Friendly ID** (`table-1`, `table-2`, ...):

```
┌───────────┬───────────────┬──────────┬──────────────┬───────────────┐
│ table_id  │ section_name  │ row_num  │ column_name  │ content_text  │
├───────────┼───────────────┼──────────┼──────────────┼───────────────┤
│ table-1   │ 1. ONBOARD    │ 1        │ Nhóm tiêu... │ I. Đặc thù... │
│ table-2   │ 2. CẤU HÌNH   │ 1        │ Bộ phận...   │ CSKH          │
│ table-3   │ 2. CẤU HÌNH   │ 1        │ Nội dung...  │ Bước 1...     │
└───────────┴───────────────┴──────────┴──────────────┴───────────────┘
```

### **2. Trong HTML:**

Mỗi table có **2 attributes**:

```html
<table id="70fe4b0d-c3af-486e-8387-de3a7ced6ce4"    <!-- Notion UUID -->
       data-table-id="table-1"                        <!-- Friendly ID -->
       class="simple-table">
  ...
</table>
```

### **3. Trong JavaScript:**

Code tự động tìm table theo cả 2 cách:

```javascript
// Cách 1: Tìm theo data-table-id (RECOMMENDED)
let table = document.querySelector(`table[data-table-id="table-1"]`);

// Cách 2: Tìm theo Notion UUID (FALLBACK)
if (!table) {
  table = document.getElementById("70fe4b0d-c3af-486e-8387-de3a7ced6ce4");
}
```

---

## ✅ **WORKFLOW UPDATE CONTENT**

```
1. Sửa ContentData trong Google Sheet
   ↓
   Sử dụng: table-1, table-2, table-3, ...

2. Build Static Data
   ↓
   Tools → 🔨 Static Builder → Build Static Data

3. Download static-data.js
   ↓
   Tools → 🔨 Static Builder → Download Static File

4. Upload lên hosting
   ↓
   git add static-data.js && git commit && git push

5. ✅ Code tự động map table-1 → HTML table
   ↓
   Không cần sửa gì thêm!
```

---

## 🆘 **TROUBLESHOOTING**

### **Problem: "Table not found: table-X"**

**Kiểm tra:**

1. **Trong HTML**, table có `data-table-id` chưa?
   ```bash
   grep 'data-table-id="table-1"' index.html
   ```

2. **Trong ContentData**, `table_id` có đúng không?
   - ✅ Đúng: `table-1`, `table-2`
   - ❌ Sai: `Table-1`, `TABLE-1`, `table_1`

3. **Run lại script** để add `data-table-id`:
   ```bash
   python3 add-table-ids.py
   ```

---

## 📝 **LƯU Ý QUAN TRỌNG**

### **✅ DO:**
- Dùng `table-1`, `table-2`, ... trong Google Sheet
- Giữ nguyên Notion UUID trong HTML
- Chạy script `add-table-ids.py` khi cần thiết

### **❌ DON'T:**
- Thay đổi Notion UUID trong HTML (vì sẽ phá vỡ cấu trúc Notion)
- Đặt tên khác cho friendly ID (phải dùng `table-1`, `table-2`, ...)
- Xóa attribute `data-table-id` trong HTML

---

## 🔍 **QUICK REFERENCE**

### **Tìm table nào là table-X:**

1. Mở [index.html](index.html)
2. Search: `data-table-id="table-5"`
3. Xem nội dung table để biết đó là section nào

### **Tìm Notion UUID của table-X:**

1. Xem bảng mapping ở trên
2. Hoặc trong HTML: `<table id="..." data-table-id="table-5">`

---

**📅 Last Updated:** 2025-12-30
**📌 Version:** 1.0.0
**👤 Maintainer:** Claude Code Agent
