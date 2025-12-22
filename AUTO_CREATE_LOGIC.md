# 🔧 AUTO-CREATE LOGIC - Tự động tạo thẻ HTML

## 📋 Tổng quan

Logic tự động **mapping và tạo mới** elements khi người dùng thêm/cập nhật data trong Google Sheets.

## 🎯 Chức năng chính

### 1️⃣ **Mapping theo `id_the`**
```javascript
// Tìm element theo ID
const element = document.getElementById(row.id_the);

if (element) {
  // Element tồn tại → UPDATE
  updateExistingElement(element, content, url);
} else {
  // Element KHÔNG tồn tại → CREATE NEW
  createElement(id_the, content, url, category);
}
```

### 2️⃣ **Tự động phân loại element**

Dựa vào pattern của `id_the`:

| Pattern | Element Type | Ví dụ |
|---------|-------------|--------|
| `image-XXX` | Button placeholder cho ảnh | `image-001` |
| `term-code-XXX` | Interactive code tag | `term-code-057` |
| `term-default-XXX` | Mark tag (highlight) | `term-default-007` |
| `term-blue-XXX` | Blue highlight | `term-blue-001` |
| `term-yellow-XXX` | Yellow highlight | `term-yellow-001` |
| `term-gray-XXX` | Gray highlight | `term-gray-001` |
| `section-XXX` | Section header (h3) | `section-van-hanh` |
| Other | Div container | Any custom ID |

### 3️⃣ **Map hạng mục → Section**

```javascript
const sectionMap = {
  'ONBOARD': 'section-onboard',
  'CẤU HÌNH': 'section-dang-don',
  'ĐĂNG ĐƠN': 'section-dang-don-3',
  'VẬN HÀNH': 'section-van-hanh',
  'HUB': 'section-hub',
  'KHO ĐÍCH': 'section-kho-dich'
};
```

## 🔨 Cách tạo elements mới

### **Ví dụ 1: Tạo interactive term (code)**

**Google Sheets:**
```csv
VẬN HÀNH,term-code-999,Chức năng mới,
```

**HTML được tạo:**
```html
<code class="interactive-term" 
      id="term-code-999" 
      data-term-id="term-code-999">
  Chức năng mới
</code>
```

### **Ví dụ 2: Tạo button image với link**

**Google Sheets:**
```csv
VẬN HÀNH,image-999,Hình mới,https://drive.google.com/file/d/abc123/view
```

**HTML được tạo:**
```html
<div style="text-align: center; margin: 1rem 0;">
  <button class="image-placeholder-btn" 
          data-image-id="image-999" 
          id="image-999"
          onclick="window.open('https://...', '_blank')"
          style="cursor: pointer;">
    Hình mới
  </button>
</div>
```

### **Ví dụ 3: Tạo link term**

**Google Sheets:**
```csv
ĐĂNG ĐƠN,term-default-999,Link hệ thống mới,https://new-system.ghtk.vn/
```

**HTML được tạo:**
```html
<mark class="highlight-default interactive-term" 
      data-term-id="term-default-999">
  <code class="interactive-term" data-term-id="term-default-999">
    <a href="https://new-system.ghtk.vn/">Link hệ thống mới</a>
  </code>
</mark>
```

### **Ví dụ 4: Tạo section header**

**Google Sheets:**
```csv
VẬN HÀNH,section-new,7. PHẦN MỚI,
```

**HTML được tạo:**
```html
<h3 id="section-new">7. PHẦN MỚI</h3>
```

## 📍 Insertion Logic

### **Quy tắc chèn element mới:**

1. **Xác định section** dựa trên `hang_muc`
2. **Tìm container** của section đó
3. **Append element** vào cuối container

```javascript
const sectionId = getSectionId(category); // 'section-van-hanh'
const section = document.getElementById(sectionId);
const container = section.parentElement;
container.appendChild(newElement);
```

## 🎨 CSS Classes tự động

### **Interactive terms:**

```javascript
getTermClass(termId) {
  if (termId.includes('default')) return 'highlight-default interactive-term';
  if (termId.includes('blue')) return 'highlight-blue interactive-term';
  if (termId.includes('yellow')) return 'highlight-yellow interactive-term';
  if (termId.includes('gray')) return 'highlight-gray interactive-term';
  return 'interactive-term';
}
```

### **Image buttons:**

```css
.image-placeholder-btn {
  background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
```

## 📊 Statistics & Feedback

### **Console output:**

```javascript
✓ Created #term-code-999 in VẬN HÀNH
✓ Updated #term-code-057
✓ Created #image-999 in VẬN HÀNH

✅ Content loaded successfully!
📊 Updates: 45 updated, 3 created, 0 errors
📋 Categories: { 
  ONBOARD: 3, 
  CẤU HÌNH: 14, 
  ĐĂNG ĐƠN: 58, 
  VẬN HÀNH: 95, // +3 new
  HUB: 79, 
  KHO ĐÍCH: 63 
}
📝 Total rows processed: 315
```

### **Notification:**

```
✅ Cập nhật 45 | Tạo mới 3 elements
```

## 🔄 Workflow người dùng

### **Bước 1: Thêm dòng mới vào Google Sheets**

```csv
hang_muc,id_the,ten_the,url
VẬN HÀNH,term-code-999,Tính năng mới ABC,
VẬN HÀNH,image-999,Screenshot tính năng,https://imgur.com/abc.jpg
```

### **Bước 2: Click "🔄 Refresh Content"**

Hệ thống tự động:
1. ✅ Load data từ Google Sheets
2. ✅ Phát hiện `term-code-999` chưa tồn tại
3. ✅ Tạo `<code>` element mới
4. ✅ Gắn vào section VẬN HÀNH
5. ✅ Áp dụng CSS classes
6. ✅ Hiển thị thông báo

### **Bước 3: Element mới xuất hiện**

```html
<!-- Tự động được thêm vào HTML -->
<code class="interactive-term" 
      id="term-code-999" 
      data-term-id="term-code-999">
  Tính năng mới ABC
</code>
```

## ⚠️ Error Handling

### **Trường hợp xử lý lỗi:**

```javascript
try {
  const result = updateOrCreateElement(elementId, content, url, category);
  
  if (result.created) {
    stats.created++;
    console.log(`✓ Created #${elementId}`);
  } else if (result.updated) {
    stats.updated++;
    console.log(`✓ Updated #${elementId}`);
  }
} catch (error) {
  stats.errors++;
  console.error(`✗ Error processing #${elementId}:`, error);
}
```

### **Các lỗi có thể gặp:**

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|-----------|
| `no insertion point` | Không tìm thấy section | Check `hang_muc` đúng format |
| `invalid category` | `hang_muc` không hợp lệ | Chỉ dùng 6 categories chuẩn |
| `element creation failed` | Pattern `id_the` không được hỗ trợ | Dùng pattern chuẩn |

## 🚀 Performance

### **Cache mechanism:**

- **5 phút cache** trong localStorage
- Click "Refresh" → Clear cache → Reload từ Google Sheets
- Chỉ tạo element khi thực sự cần (không duplicate)

### **Optimization:**

```javascript
// Check exist trước khi create
let element = document.getElementById(elementId);
if (!element) {
  element = createElement(...); // Only create if needed
}
```

## 🧪 Testing

### **Test case 1: Thêm term mới**

```javascript
// Console test
const testData = [{
  hang_muc: 'VẬN HÀNH',
  id_the: 'term-code-999',
  ten_the: 'Test term',
  url: ''
}];

SheetDB.updateFromData(testData);
// ✓ Created #term-code-999 in VẬN HÀNH
```

### **Test case 2: Update term đã có**

```javascript
const testData = [{
  hang_muc: 'VẬN HÀNH',
  id_the: 'term-code-057', // Đã tồn tại
  ten_the: 'QUÉT PHIẾU - UPDATED',
  url: ''
}];

SheetDB.updateFromData(testData);
// ✓ Updated #term-code-057
```

## 📚 API Reference

### **Exposed functions:**

```javascript
// Manual refresh
await SheetDB.refresh();

// Get master data
const data = await SheetDB.getMasterData();

// Update from custom data
const stats = SheetDB.updateFromData(data);

// Get statistics
const categoryStats = SheetDB.getStats(data);

// Clear cache
SheetDB.clearCache();
```

## 🎓 Best Practices

### ✅ **DO:**

- Đặt `id_the` theo pattern chuẩn
- Điền đầy đủ `hang_muc`, `ten_the`
- Dùng URL đầy đủ (bắt đầu `http://` hoặc `https://`)
- Test với ít dòng trước khi thêm nhiều

### ❌ **DON'T:**

- Đặt `id_the` trùng nhau
- Để trống `hang_muc`
- Dùng `hang_muc` không thuộc 6 categories chuẩn
- Thêm quá nhiều rows cùng lúc (lag browser)

## 🔍 Debug

### **Console commands:**

```javascript
// Xem tất cả term IDs
document.querySelectorAll('[data-term-id]').forEach(el => {
  console.log(el.getAttribute('data-term-id'));
});

// Xem elements trong section
const section = document.getElementById('section-van-hanh');
console.log(section.parentElement.children);

// Force refresh (bỏ cache)
SheetDB.clearCache();
await SheetDB.refresh();
```

---

**Version:** 1.0  
**Last Updated:** December 22, 2025  
**Status:** ✅ Production Ready
