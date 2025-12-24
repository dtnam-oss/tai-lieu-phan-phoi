# 📝 CONTENT UPDATE WORKFLOW - ContentData

## 🎯 Mục tiêu
Cho phép admin **cập nhật nội dung table** qua Google Sheets mà **KHÔNG cần chỉnh sửa code HTML**.

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐
│  Google Sheets  │  ← Admin chỉnh sửa tại đây
│   ContentData   │
└────────┬────────┘
         │
         │ Apps Script API
         │ (Auto sync mỗi 5 phút)
         ▼
┌─────────────────┐
│   Frontend      │  ← Website tự động cập nhật
│   index.html    │
└─────────────────┘
```

**Luồng dữ liệu:**
1. Admin edit Google Sheets
2. Apps Script expose data qua API endpoint
3. Frontend fetch data định kỳ (5 phút)
4. Frontend tự động update DOM (không reload page)

---

## 📊 CẤU TRÚC GOOGLE SHEETS

### Sheet: ContentData
| table_id | section_name | row_number | column_name | content_text | content_html |
|----------|--------------|------------|-------------|--------------|--------------|
| table-onboard-01 | 1. ONBOARD | 1 | Bộ phận thực hiện | Admin | Admin |
| table-onboard-01 | 1. ONBOARD | 1 | Nội dung | Bước 1: Truy cập... | `<strong>Bước 1:</strong> Truy cập...` |

### Các cột:

#### 🔒 **KHÔNG NÊN SỬA** (System columns):
- `table_id`: ID của bảng (VD: `table-onboard-01`)
- `section_name`: Tên section (VD: `1. ONBOARD`)
- `row_number`: Số thứ tự row (1, 2, 3...)
- `column_name`: Tên cột (Bộ phận thực hiện, Nội dung...)

#### ✅ **ĐƯỢC PHÉP SỬA** (Content columns):
- **`content_text`**: Nội dung dạng text thuần (no HTML)
- **`content_html`**: Nội dung dạng HTML (có formatting)

---

## 🔄 CÁCH CẬP NHẬT NỘI DUNG

### ✅ Option 1: Chỉnh sửa `content_text` (Recommended)

**Khi nào dùng:**
- Nội dung đơn giản, không cần format đặc biệt
- Chỉ cần đổi text

**Ví dụ:**
```
TRƯỚC:
content_text: "Bước 1: Truy cập dashboard.ghtk.vn"

SAU:
content_text: "Bước 1: Truy cập vào trang quản trị"
```

**Kết quả:**
- Frontend sẽ hiển thị text mới
- Giữ nguyên format HTML từ `content_html`

---

### ✅ Option 2: Chỉnh sửa `content_html` (Advanced)

**Khi nào dùng:**
- Cần thay đổi format (bold, link, code tag...)
- Thêm/bớt HTML elements

**Ví dụ:**
```html
TRƯỚC:
content_html: "<strong>Bước 1:</strong> Truy cập <code>dashboard.ghtk.vn</code>"

SAU:
content_html: "<strong>Bước 1:</strong> Truy cập <a href='https://dashboard.ghtk.vn'>dashboard.ghtk.vn</a>"
```

**Kết quả:**
- Frontend sẽ render HTML mới
- Text sẽ có hyperlink thay vì `<code>` tag

---

### ⚠️ LƯU Ý QUAN TRỌNG

#### 1. **Sync cả 2 columns:**
Nếu sửa `content_html`, nhớ cập nhật `content_text` tương ứng:

```
content_text: "Bước 1: Truy cập dashboard.ghtk.vn"
content_html: "<strong>Bước 1:</strong> Truy cập <a href='...'>dashboard.ghtk.vn</a>"
```

#### 2. **HTML Tags được hỗ trợ:**
- `<strong>` hoặc `<b>`: Text đậm
- `<em>` hoặc `<i>`: Text nghiêng
- `<code>`: Code snippet (nền xám)
- `<a href="...">`: Link
- `<mark>`: Highlight (nền vàng)
- `<br>`: Line break

#### 3. **Escape đúng:**
- Nếu nội dung có dấu `<` hoặc `>`, cần escape:
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `&` → `&amp;`

---

## 📝 VÍ DỤ CỤ THỂ

### Ví dụ 1: Đổi text đơn giản

**Tình huống:** Admin muốn đổi tên bộ phận thực hiện

**Google Sheets - TRƯỚC:**
| column_name | content_text | content_html |
|-------------|--------------|--------------|
| Bộ phận thực hiện | Admin | Admin |

**Google Sheets - SAU:**
| column_name | content_text | content_html |
|-------------|--------------|--------------|
| Bộ phận thực hiện | Admin + CS | Admin + CS |

**Frontend - Kết quả:**
```html
<td>Admin + CS</td>
```

---

### Ví dụ 2: Thêm link vào text

**Tình huống:** Admin muốn thêm link vào URL

**Google Sheets - TRƯỚC:**
| column_name | content_text | content_html |
|-------------|--------------|--------------|
| Nội dung | Truy cập dashboard.ghtk.vn | Truy cập <code>dashboard.ghtk.vn</code> |

**Google Sheets - SAU:**
| column_name | content_text | content_html |
|-------------|--------------|--------------|
| Nội dung | Truy cập dashboard.ghtk.vn | Truy cập <a href="https://dashboard.ghtk.vn" target="_blank">dashboard.ghtk.vn</a> |

**Frontend - Kết quả:**
```html
<td>Truy cập <a href="https://dashboard.ghtk.vn" target="_blank">dashboard.ghtk.vn</a></td>
```

---

### Ví dụ 3: Thêm nhiều format

**Tình huống:** Admin muốn format phức tạp hơn

**Google Sheets - TRƯỚC:**
| content_text | content_html |
|--------------|--------------|
| Bước 1: Click vào Shop | <strong>Bước 1:</strong> Click vào <code>Shop</code> |

**Google Sheets - SAU:**
| content_text | content_html |
|--------------|--------------|
| Bước 1: Click vào Shop (bên trái) | <strong>Bước 1:</strong> Click vào <code>Shop</code> <mark>(bên trái)</mark> |

**Frontend - Kết quả:**
```html
<td>
  <strong>Bước 1:</strong> Click vào <code>Shop</code> <mark>(bên trái)</mark>
</td>
```

---

### Ví dụ 4: Đổi cả đoạn văn

**Tình huống:** Admin muốn viết lại toàn bộ hướng dẫn

**Google Sheets - TRƯỚC:**
| content_text | content_html |
|--------------|--------------|
| Bước 1: Truy cập trang quản trị. Bước 2: Chọn Shop. | `<strong>Bước 1:</strong> Truy cập trang quản trị.<br><strong>Bước 2:</strong> Chọn <code>Shop</code>.` |

**Google Sheets - SAU:**
| content_text | content_html |
|--------------|--------------|
| Bước 1: Login vào hệ thống GHTK. Nhập username và password. | `<strong>Bước 1:</strong> Login vào hệ thống GHTK.<br>Nhập <code>username</code> và <code>password</code>.` |

**Frontend - Kết quả:**
- Toàn bộ cell sẽ hiển thị nội dung mới
- Giữ nguyên structure của table

---

## 🔧 FRONTEND SYNC MECHANISM

### Cách frontend cập nhật:

```javascript
// 1. Fetch data từ Google Sheets API
const response = await fetch('https://script.google.com/.../exec');
const data = await response.json();

// 2. Loop qua từng cell data
data.forEach(cellData => {
  const { table_id, row_number, column_name, content_html } = cellData;
  
  // 3. Tìm cell tương ứng trong HTML
  const table = document.getElementById(table_id);
  const row = table.querySelector(`tbody tr:nth-child(${row_number})`);
  const cell = row.querySelector(`td[data-column="${column_name}"]`);
  
  // 4. Update innerHTML
  if (cell && cell.innerHTML !== content_html) {
    cell.innerHTML = content_html;
    console.log(`✓ Updated: ${table_id} row ${row_number}`);
  }
});
```

### Tần suất sync:
- **Optimal:** 5 phút (tránh spam API)
- **Max:** 1 giờ (fallback nếu network lỗi)
- **Manual:** User có thể click "Refresh" để force reload

---

## 🎯 WORKFLOW THỰC TẾ

### Quy trình admin cập nhật nội dung:

```
┌─────────────────────────────────────────────────┐
│ BƯỚC 1: Mở Google Sheets                         │
│ → Sheets: "ContentData"                          │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ BƯỚC 2: Tìm content cần sửa                      │
│ → Filter theo table_id hoặc section_name        │
│ → Ví dụ: table-onboard-01, row 3                │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ BƯỚC 3: Edit content_text hoặc content_html     │
│ ✓ Simple: Chỉ sửa content_text                   │
│ ✓ Advanced: Sửa cả content_html (với HTML tags) │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ BƯỚC 4: Save (Cmd+S hoặc tự động save)          │
│ → Google Sheets tự động lưu                      │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ BƯỚC 5: Đợi frontend sync (tối đa 5 phút)       │
│ → Website tự động fetch data mới                 │
│ → DOM được update mà không reload page          │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│ ✅ HOÀN THÀNH                                     │
│ → Nội dung mới đã hiển thị trên website         │
│ → User thấy content đã update                    │
└─────────────────────────────────────────────────┘
```

---

## 🚨 TROUBLESHOOTING

### ❌ Problem: Nội dung không cập nhật sau 5 phút

**Nguyên nhân:**
- Apps Script API chưa deploy đúng cách
- Frontend fetch bị cache
- Google Sheets chưa save

**Giải pháp:**
1. Check Apps Script API endpoint hoạt động:
   ```bash
   curl "https://script.google.com/.../exec"
   ```
2. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+F5)
3. Kiểm tra Google Sheets đã save chưa (xem version history)

---

### ❌ Problem: HTML bị render sai (hiển thị tags thay vì format)

**Nguyên nhân:**
- `content_html` có syntax lỗi
- Tag không được đóng đúng
- Frontend dùng `.textContent` thay vì `.innerHTML`

**Giải pháp:**
1. Validate HTML syntax:
   ```html
   ❌ SAI: <strong>Text
   ✅ ĐÚNG: <strong>Text</strong>
   
   ❌ SAI: <a href="...">Link
   ✅ ĐÚNG: <a href="...">Link</a>
   ```
2. Check frontend code dùng `.innerHTML` không phải `.textContent`

---

### ❌ Problem: Một số cells cập nhật, một số không

**Nguyên nhân:**
- `table_id`, `row_number`, hoặc `column_name` không match với HTML
- HTML structure thay đổi (thêm/bớt rows)

**Giải pháp:**
1. Run extraction script lại để sync IDs:
   ```javascript
   // Trong console:
   window.extractedContentData.filter(d => d.table_id === 'table-onboard-01')
   ```
2. So sánh IDs trong Google Sheets vs HTML
3. Update `table_id` trong HTML nếu cần:
   ```html
   <table id="table-onboard-01" class="simple-table">
   ```

---

## 📚 TÀI LIỆU LIÊN QUAN

- **Extraction Script:** `extract-table-content.js`
- **Quick Start Guide:** `TEXT_CMS_QUICKSTART.md`
- **Apps Script Template:** (Coming soon)
- **Frontend Integration:** (Coming soon)

---

## 🎓 BEST PRACTICES

### ✅ DO:
- Luôn test trong Google Sheets trước khi apply production
- Backup data trước khi edit hàng loạt (File → Version History)
- Dùng `content_text` cho simple edits
- Validate HTML syntax trước khi paste vào `content_html`
- Document changes trong Sheet Notes (Right-click → Insert note)

### ❌ DON'T:
- Sửa `table_id`, `section_name`, `row_number`, `column_name` (trừ khi biết rõ impact)
- Paste HTML phức tạp có `<script>` tags (security risk)
- Edit trực tiếp HTML file (mất khi frontend sync)
- Xóa rows mà không update frontend structure

---

## 💡 TIPS & TRICKS

### 1. Bulk Edit nhiều cells cùng lúc:
- Select range trong Google Sheets
- Edit với formula: `=SUBSTITUTE(A2, "old", "new")`

### 2. Preview HTML trước khi paste:
```javascript
// Test trong browser console:
const html = '<strong>Bước 1:</strong> Test';
const div = document.createElement('div');
div.innerHTML = html;
console.log(div); // Xem preview
```

### 3. Find & Replace toàn bộ sheet:
- `Cmd+H` (Mac) hoặc `Ctrl+H` (Windows)
- Chọn column `content_text` hoặc `content_html`
- Replace all

### 4. Export để review offline:
- File → Download → CSV
- Review trong Excel/Numbers
- Re-import nếu cần

---

## 🔮 FUTURE ENHANCEMENTS

- [ ] Real-time sync (WebSocket thay vì polling)
- [ ] Visual editor trong Google Sheets (Rich Text → HTML auto convert)
- [ ] Version control cho content changes
- [ ] Rollback mechanism (undo published changes)
- [ ] Preview environment trước khi publish
- [ ] Approval workflow (Admin review trước khi apply)

---

**Last updated:** 2025-12-24  
**Version:** 1.0  
**Author:** GHTK Tech Team
