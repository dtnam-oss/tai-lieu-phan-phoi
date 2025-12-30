# 🔧 FIX CONTENTDATA - HƯỚNG DẪN

## 🎯 VẤN ĐỀ

ContentData trong Google Sheet có `column_name` **không match** với HTML table headers.

**Kết quả:**
- Console errors: "Column not found"
- Data không load lên frontend
- Tables hiển thị trống

---

## 📊 DỮ LIỆU THỰC TẾ

### **HTML có:**
```
table-1: "Nhóm tiêu chí" | "PO – Phân phối (Thương mại / Sản xuất)" | "SO – Shop Online / Bán sỉ"
table-2: "Bộ phận thực hiện" | "Nội dung"
table-3: "Bộ phận thực hiện" | "Nội dung"
...
table-18: "Bộ phận thực hiện" | "Nội dung"
```

### **ContentData Sheet có:**
```
table-1: "Nhóm tiêu chí" ✅ Match
table-2: "PO – Phân phối (Thương mại / Sản xuất)" ❌ WRONG (should be "Bộ phận thực hiện")
table-3: "SO – Shop Online / Bán sỉ" ❌ WRONG
...
table-19 to table-46: ❌ KHÔNG TỒN TẠI (cần xóa)
```

---

## ✅ GIẢI PHÁP

### **Bước 1: Xem Mapping Reference**

File đã được generate: `table-headers-mapping.tsv`

**Cách xem:**
```bash
cat table-headers-mapping.tsv
```

**Hoặc open in Excel/Numbers:**
```bash
open table-headers-mapping.tsv
```

### **Bước 2: Copy vào Google Sheets**

1. **Open file TSV:**
   ```bash
   cat table-headers-mapping.tsv
   ```

2. **Copy toàn bộ nội dung** (Cmd+A, Cmd+C)

3. **Mở Google Sheets:**
   ```
   https://docs.google.com/spreadsheets/d/12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4
   ```

4. **Tạo sheet mới:**
   - Click `+` ở bottom
   - Đặt tên: `Table_Headers_Reference`

5. **Paste data:**
   - Click cell A1
   - Cmd+V (paste)

6. **Format:**
   - Bold row 1 (header)
   - Freeze row 1

---

## 🔧 BƯỚC 3: UPDATE CONTENTDATA

### **Fix 1: Delete Invalid Rows**

**Rows cần xóa:**
- Tất cả rows có `table_id` từ `table-19` đến `table-46`
- Tổng: ~100+ rows

**Cách xóa:**
1. Trong ContentData sheet
2. Filter column `table_id`
3. Chọn: `table-19`, `table-20`, ..., `table-46`
4. Right-click → Delete rows

### **Fix 2: Update Column Names**

**Mapping cần fix:**

| table_id | ContentData hiện tại | HTML thực tế (ĐÚNG) |
|----------|----------------------|---------------------|
| table-2 | "PO – Phân phối..." | "Bộ phận thực hiện" hoặc "Nội dung" |
| table-3 | "SO – Shop Online..." | "Bộ phận thực hiện" hoặc "Nội dung" |
| table-4 | "Nhóm tiêu chí" | "Bộ phận thực hiện" hoặc "Nội dung" |
| table-5 | "PO – Phân phối..." | "Bộ phận thực hiện" hoặc "Nội dung" |
| table-6 | "SO – Shop Online..." | "Bộ phận thực hiện" hoặc "Nội dung" |
| table-7 | "Nhóm tiêu chí" | "Bộ phận thực hiện" hoặc "Nội dung" |
| table-8 | "PO – Phân phối..." | "Bộ phận thực hiện" hoặc "Nội dung" |
| table-9 | "SO – Shop Online..." | "Bộ phận thực hiện" hoặc "Nội dung" |

**Cách fix:**
1. Filter ContentData by `table_id`
2. Với mỗi table (table-2 đến table-9):
   - Check `row_number` để biết row nào
   - Check nội dung để xác định column 1 hay 2
   - Update `column_name` → `"Bộ phận thực hiện"` hoặc `"Nội dung"`

---

## 🎯 LOGIC UPDATE

Dựa vào ContentData pattern:

### **table-1** (Special - 3 columns):
- Row 1: column_name = "Nhóm tiêu chí" ✅ Đúng rồi
- Row 2: column_name = "PO – Phân phối (Thương mại / Sản xuất)" → Keep (HTML có column này)
- Row 3: column_name = "SO – Shop Online / Bán sỉ" → Keep (HTML có column này)

### **table-2 đến table-18** (Standard - 2 columns):

**Quy tắc:**
- Nếu `content_text` ngắn (< 50 chars) → Column 1 = "Bộ phận thực hiện"
- Nếu `content_text` dài (> 50 chars) → Column 2 = "Nội dung"

**Ví dụ table-2:**
```
Row 1:
- content_text: "CSKH"
- → Ngắn → column_name = "Bộ phận thực hiện" ✅

Row 1 (same row, different column):
- content_text: "Bước 1: Truy cập màn hình..."
- → Dài → column_name = "Nội dung" ✅
```

---

## 🤖 AUTO-FIX SCRIPT (Optional)

Nếu muốn tự động fix, tôi có thể tạo script:

```python
# Script sẽ:
1. Read ContentData từ Google Sheets API
2. Apply rules:
   - Delete table_id > 18
   - Update column_name based on content length
3. Write back to Google Sheets
```

Nhưng cần Google Sheets API credentials.

---

## ✅ VERIFICATION

Sau khi fix:

### **Bước 1: Rebuild Static Data**

```
Google Sheets: 🔨 Static Builder → Build Static Data
```

### **Bước 2: Download & Test Local**

```bash
# Download file
# (Click menu: Download Static File)

# Copy to local
cp ~/Downloads/static-data.js .

# Test local
open http://localhost:8000/index-local.html
```

### **Bước 3: Check Console**

**Should see:**
```
✅ ContentData: 75/75 cells updated (static)
```

**Should NOT see:**
```
❌ Column not found: "PO – Phân phối..."
❌ Table not found: table-19
```

---

## 📋 SUMMARY

**Cần fix:**
1. ❌ Xóa rows table-19 đến table-46 (~100+ rows)
2. ❌ Update column_name cho table-2 đến table-9
3. ✅ Keep table-1 và table-10 đến table-18 (đã đúng)

**Ước tính:**
- ~50-60 rows cần update column_name
- ~100+ rows cần xóa
- Total: ~150-160 changes

**Thời gian:**
- Manual: ~30-60 phút
- Auto script: ~5 phút (nếu có API credentials)

---

## 🎓 WHY THIS HAPPENED?

**Root cause:**
- HTML tables được customize với headers "Bộ phận thực hiện" | "Nội dung"
- Nhưng ContentData sheet vẫn dùng column names từ Notion export gốc
- Notion export có structure khác (3 columns riêng biệt cho table-1)

**Long-term fix:**
- Standardize column naming convention
- Document trong Google Sheets
- Add validation rules

---

**📅 Created:** 2025-12-30
**👤 Author:** Claude Code Agent
**🎯 Purpose:** Fix ContentData column name mismatch
