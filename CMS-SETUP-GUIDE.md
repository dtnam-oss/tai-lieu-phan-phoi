# 🎨 CMS Setup Guide - Content Management System

## Tổng quan

Hệ thống CMS cho phép Admin **chỉnh sửa nội dung trực tiếp trên giao diện web** thay vì phải vào Google Sheets.

### Kiến trúc
```
Browser (index.html)
    ↓ Click Edit
    ↓ Save Changes
Google Apps Script (API)
    ↓ Update Row
Google Sheets (Database)
    ↓ Auto Publish
Browser (Cache Cleared) → Reload → Updated Content
```

---

## 📋 Phần 1: Deploy Google Apps Script Backend

### Bước 1: Tạo Script mới

1. Mở Google Sheet: https://docs.google.com/spreadsheets/d/12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4/edit
2. Menu: **Extensions → Apps Script**
3. Click **New file** → Đặt tên: `cms-backend.gs`
4. Copy toàn bộ code từ file `google-apps-script-cms.gs` vào

### Bước 2: Cấu hình Admin Emails

Trong file `cms-backend.gs`, sửa mảng `ADMIN_EMAILS`:

```javascript
const CONFIG = {
  SHEET_ID: '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4',
  ADMIN_EMAILS: [
    'dtnamtoday@gmail.com',  // ✅ Email admin của bạn
    'admin@example.com'      // ❌ Xóa hoặc thay bằng email khác
  ]
};
```

### Bước 3: Deploy Web App

1. Click nút **Deploy** (góc trên bên phải)
2. Chọn **New deployment**
3. Settings:
   - **Type:** Web app
   - **Execute as:** Me (dtnamtoday@gmail.com)
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy Web App URL** (dạng: `https://script.google.com/macros/s/AKfy...xyz/exec`)

### Bước 4: Thêm API URL vào Frontend

Mở file `index.html`, tìm dòng:

```javascript
const CMS_CONFIG = {
    API_URL: '', // TODO: Thêm Web App URL
    ADMIN_EMAILS: [...]
};
```

Paste URL vừa copy:

```javascript
const CMS_CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfy...xyz/exec',
    ADMIN_EMAILS: [
        'dtnamtoday@gmail.com',
        'admin@example.com'
    ]
};
```

---

## 🔧 Phần 2: Thêm `data-editable` Attributes

Để một phần tử có thể chỉnh sửa được, thêm 3 attributes:

### Cú pháp

```html
<element 
    data-editable 
    data-id="unique-id" 
    data-sheet="ContentData" 
    data-column="content_html">
    Nội dung có thể chỉnh sửa
</element>
```

### Ví dụ: Interactive Term

```html
<code 
    data-editable 
    data-id="term-code-001" 
    data-sheet="MasterData" 
    data-column="dinh_nghia">
    ONBOARD
</code>
```

### Ví dụ: Table Cell

```html
<td 
    data-editable 
    data-id="701fe4b04-c3af-49be-8387-dc3a7ced6ce4" 
    data-sheet="ContentData" 
    data-column="content_html">
    <strong>I. Nhóm siêu chi</strong>
</td>
```

### Ví dụ: Paragraph

```html
<p 
    data-editable 
    data-id="section-onboard-desc" 
    data-sheet="ContentData" 
    data-column="content_text">
    Hướng dẫn onboard shop mới lên hệ thống GHTK.
</p>
```

---

## 📝 Phần 3: Cấu trúc Google Sheets

### Sheet: `MasterData`

Dùng cho **Interactive Terms** (hover preview).

| id_the | ten_thuat_ngu | dinh_nghia | hinh_anh |
|--------|---------------|------------|----------|
| term-code-001 | ONBOARD | Quy trình đưa shop mới... | url_image |
| term-code-002 | API | Application Program... | url_image |

### Sheet: `ContentData`

Dùng cho **Table Cells** và **Dynamic Content**.

| table_id | section_name | row_num | column_name | content_text | content_html |
|----------|--------------|---------|-------------|--------------|--------------|
| 701fe4b04-... | ONBOARD | 1 | Nhóm siêu chi | I. Nhóm siêu chi | `<strong>I. Nhóm siêu chi</strong>` |
| 2ceec18e-7... | CẤU HÌNH | 1 | Nội dung | Bước 1: Truy cập... | `<li>Bước 1: Truy cập...</li>` |

---

## 🎯 Phần 4: Sử dụng CMS

### Bước 1: Login với Admin Email

1. Mở `index.html`
2. Login với email trong `ADMIN_EMAILS`
3. Sau login thành công → Góc phải màn hình xuất hiện **Admin Toolbar**

### Bước 2: Bật Edit Mode

1. Click vào **Toggle Switch** (nút gạt)
2. Màn hình chuyển sang **Edit Mode**:
   - Tất cả phần tử có `data-editable` được viền nét đứt màu xanh
   - Icon ✏️ xuất hiện ở góc phải mỗi phần tử

### Bước 3: Chỉnh sửa nội dung

1. Click vào phần tử muốn sửa
2. Modal popup xuất hiện với:
   - Textarea chứa nội dung hiện tại
   - Thông tin Sheet và ID
3. Sửa nội dung trong Textarea
4. Click **"Lưu thay đổi"**

### Bước 4: Xác nhận

- ✅ **Thành công:** Toast "Đã lưu thay đổi thành công"
- ❌ **Lỗi:** Toast hiển thị lỗi chi tiết
- Nội dung **tự động cập nhật ngay trên giao diện** (không cần reload)
- Cache tự động xóa → Lần reload sau sẽ load dữ liệu mới từ Google Sheets

---

## 🐛 Troubleshooting

### 1. Admin Toolbar không hiển thị

**Nguyên nhân:** Email không khớp với `ADMIN_EMAILS`

**Fix:**
```javascript
// Kiểm tra localStorage
const user = JSON.parse(localStorage.getItem('user'));
console.log('User email:', user.email);

// So sánh với CMS_CONFIG.ADMIN_EMAILS
console.log('Admin emails:', CMS_CONFIG.ADMIN_EMAILS);
```

### 2. Lỗi "CMS API URL chưa được cấu hình"

**Nguyên nhân:** Chưa thêm Web App URL vào `CMS_CONFIG.API_URL`

**Fix:** Làm theo **Phần 1 → Bước 4**

### 3. Lỗi "Column not found"

**Nguyên nhân:** Tên cột trong `data-column` không khớp với header Google Sheets

**Fix:**
- Kiểm tra header row trong Sheet
- Đảm bảo `data-column="content_html"` khớp chính xác (phân biệt hoa/thường)

### 4. Lỗi "Row not found with id"

**Nguyên nhân:** Giá trị `data-id` không tồn tại trong cột `id_the` hoặc `table_id`

**Fix:**
- Kiểm tra ID trong Google Sheet
- Google Apps Script tìm kiếm trong các cột: `id_the`, `table_id`, `id`

### 5. Lỗi CORS / Failed to fetch

**Nguyên nhân:** Web App chưa deploy hoặc quyền truy cập sai

**Fix:**
1. Deploy lại Web App
2. Đảm bảo **"Who has access"** = **"Anyone"**
3. Test API bằng cách truy cập URL trong browser → Phải trả về JSON

---

## ⚡ Advanced Features

### Batch Update (Cập nhật nhiều phần tử cùng lúc)

```javascript
const updates = [
    {
        sheet_name: 'ContentData',
        id: 'term-001',
        column_name: 'content_html',
        new_value: 'New content 1'
    },
    {
        sheet_name: 'MasterData',
        id: 'term-002',
        column_name: 'dinh_nghia',
        new_value: 'New definition'
    }
];

fetch(CMS_CONFIG.API_URL, {
    method: 'POST',
    body: JSON.stringify({
        action: 'batch_update',
        updates: updates
    })
});
```

### Custom Validation

Thêm validation trước khi save (trong `ContentEditor.saveChanges()`):

```javascript
// Validate minimum length
if (newValue.length < 10) {
    this.showToast('Nội dung quá ngắn (tối thiểu 10 ký tự)', 'error');
    return;
}

// Validate HTML tags
if (newValue.includes('<script>')) {
    this.showToast('Không được chứa <script> tag', 'error');
    return;
}
```

### Timestamp Tracking

Google Apps Script tự động thêm timestamp nếu sheet có cột `last_modified`:

```javascript
// Trong hàm updateRow()
const timestampColIndex = headers.indexOf('last_modified');
if (timestampColIndex !== -1) {
    sheet.getRange(i + 1, timestampColIndex + 1).setValue(new Date());
}
```

---

## 📚 Reference

### Data Attributes Reference

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `data-editable` | ✅ | Đánh dấu phần tử có thể edit | - |
| `data-id` | ✅ | Unique identifier | `term-code-001` |
| `data-sheet` | ⚠️ | Sheet name (default: ContentData) | `MasterData` |
| `data-column` | ⚠️ | Column name (default: content_html) | `dinh_nghia` |

### API Endpoints

**POST** `{API_URL}`

#### Action: `update_content`

Request:
```json
{
    "action": "update_content",
    "sheet_name": "ContentData",
    "id": "term-001",
    "column_name": "content_html",
    "new_value": "Updated content",
    "user_email": "admin@example.com"
}
```

Response:
```json
{
    "success": true,
    "message": "Updated successfully",
    "updated": {
        "sheet": "ContentData",
        "id": "term-001",
        "column": "content_html",
        "value": "Updated content"
    }
}
```

#### Action: `batch_update`

Request:
```json
{
    "action": "batch_update",
    "updates": [
        { "sheet_name": "...", "id": "...", "column_name": "...", "new_value": "..." },
        { "sheet_name": "...", "id": "...", "column_name": "...", "new_value": "..." }
    ]
}
```

Response:
```json
{
    "success": true,
    "total": 2,
    "succeeded": 2,
    "failed": 0,
    "results": [...]
}
```

---

## ✅ Checklist

- [ ] Deploy Google Apps Script → Copy Web App URL
- [ ] Thêm URL vào `CMS_CONFIG.API_URL`
- [ ] Thêm admin email vào `CMS_CONFIG.ADMIN_EMAILS`
- [ ] Thêm `data-editable` attributes cho các phần tử cần edit
- [ ] Đảm bảo `data-id` khớp với ID trong Google Sheet
- [ ] Đảm bảo `data-column` khớp với tên cột trong Sheet
- [ ] Test: Login → Bật Edit Mode → Click → Edit → Save
- [ ] Kiểm tra Console không có lỗi
- [ ] Xác nhận dữ liệu đã cập nhật trong Google Sheet

---

## 🎉 Hoàn thành!

Bây giờ bạn đã có hệ thống CMS đơn giản để chỉnh sửa nội dung trực tiếp trên web. 

**Next Steps:**
- Thêm nhiều `data-editable` cho các phần tử khác
- Tùy chỉnh UI/UX của Modal theo brand
- Thêm permission management nâng cao
- Implement version history/audit log
