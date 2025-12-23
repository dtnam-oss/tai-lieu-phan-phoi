# 🗑️ Delete Behavior - Xóa Định Dạng Khối

## Hành Vi Khi Xóa Khối

### ❌ **KHÔNG** xóa văn bản
### ✅ **CHỈ** xóa định dạng khối tương tác

---

## 📊 Before & After

### **Before Delete (Trước khi xóa):**
```html
<p>
  Hệ thống 
  <span class="interactive-term" data-term-id="PP_001" data-image-url="...">
    phân phối
  </span>
  sản phẩm
</p>
```

**Hiển thị:**
- Text "phân phối" có màu highlight 🟢
- Hover → hiện ảnh preview
- Click → popup edit/delete

---

### **After Delete (Sau khi xóa):**
```html
<p>
  Hệ thống 
  phân phối
  sản phẩm
</p>
```

**Hiển thị:**
- Text "phân phối" còn nguyên ✅
- Không còn màu highlight
- Không còn hover preview
- Không còn click popup
- → **Trở thành text thường**

---

## 🔄 Process Flow

```
User click khối "phân phối"
         ↓
Click nút "🗑️ Xóa"
         ↓
Confirm dialog
         ↓
① API call → Xóa khỏi Google Sheets
         ↓
② Wait 1.5s for processing
         ↓
③ Clear cache & reload from Sheets
         ↓
④ DOM transformation:
   <span class="interactive-term">phân phối</span>
                  ↓
              "phân phối"  (plain text)
         ↓
⑤ Alert: "Xóa khối thành công!"
         ↓
✅ Text vẫn hiển thị, không còn tương tác
```

---

## 💡 Use Cases

### **Case 1: Xóa khối nhầm**
- ✅ Text vẫn còn, không mất nội dung
- ✅ Có thể tạo lại khối với text đó

### **Case 2: Không cần tương tác nữa**
- ✅ Text giữ nguyên
- ✅ Giảm số lượng khối tương tác
- ✅ Cải thiện performance

### **Case 3: Multiple instances**
```html
<!-- Trước xóa -->
<p>Phân phối hàng hóa qua phân phối trực tiếp</p>
         ↑              ↑
     [Khối 1]      [Khối 2]

<!-- Sau xóa khối -->
<p>Phân phối hàng hóa qua phân phối trực tiếp</p>
    ↑ Plain text         ↑ Plain text
```

**TẤT CẢ** các instance của khối đều được convert sang plain text.

---

## 🎯 Implementation Details

### JavaScript Code:
```javascript
// Remove interactive format, keep text
const termElements = document.querySelectorAll(`[data-term-id="${termId}"]`);

termElements.forEach(el => {
    // Get original text
    const text = el.textContent;
    
    // Create plain text node
    const textNode = document.createTextNode(text);
    
    // Replace <span> with text node
    el.parentNode.replaceChild(textNode, el);
});
```

### What happens:
1. Find all elements with matching `data-term-id`
2. Extract text content
3. Create plain DOM text node
4. Replace entire `<span>` element
5. No more classes, no more attributes, no more events

---

## ⚠️ Important Notes

### **Data in Google Sheets:**
- ✅ Row is **DELETED** from MasterData sheet
- ❌ Cannot restore from backend
- ✅ Must create new khối to restore interaction

### **Frontend Display:**
- ✅ Text **PRESERVED** in HTML
- ✅ Lost all interactive features:
  - No highlight color
  - No hover image preview
  - No click popup
  - No data attributes

### **Cache:**
- ✅ Cleared after deletion
- ✅ Fresh data loaded from Sheets
- ✅ No trace of deleted khối

---

## 🔍 Verification

### Check in Browser DevTools:

**Before:**
```html
<span class="interactive-term highlight-default" 
      data-term-id="PP_001" 
      data-image-url="https://...">
  phân phối
</span>
```

**After:**
```
phân phối
```

Just a text node, no wrapping element!

---

## ✅ Summary

| Aspect | Status |
|--------|--------|
| Text content | ✅ Preserved |
| Visual highlight | ❌ Removed |
| Hover preview | ❌ Removed |
| Click interaction | ❌ Removed |
| Google Sheets row | ❌ Deleted |
| Can restore | ⚠️ Create new only |

**Result:** Clean text, no interaction, backend cleaned up! 🎉
