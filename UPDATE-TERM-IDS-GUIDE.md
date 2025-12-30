# 🔄 CẬP NHẬT TERM IDs - HƯỚNG DẪN

## 📋 TÓM TẮT

Cập nhật `data-term-id` attributes cho các colored terms trong HTML theo mapping mới.

---

## 🎯 MỤC ĐÍCH

Map các terms (`<code>` và `<mark>` tags) sang term IDs mới (term-code-001, term-code-002, etc.) để:
- Hover preview hoạt động đúng
- Tracking và analytics chính xác
- Consistent với backend data

---

## 🔧 PHƯƠNG ÁN 1: CẬP NHẬT QUA GOOGLE SHEETS (KHUYẾN NGHỊ)

### **Bước 1: Cập nhật MasterData Sheet**

1. Mở Google Sheet: `12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4`
2. Go to tab `MasterData`
3. Cập nhật cột `id_the` theo mapping file `term-id-mapping.json`

**Ví dụ:**
```
| hang_muc     | id_the        | ten_the          | url |
|--------------|---------------|------------------|-----|
| 2. CẤU HÌNH  | term-code-001 | Shop             | ... |
| 2. CẤU HÌNH  | term-code-002 | Danh sách Shop   | ... |
| 3. ĐĂNG ĐƠN  | term-code-011 | Phiếu PO         | ... |
```

### **Bước 2: Reload Website**

1. Refresh page (F5)
2. JavaScript sẽ tự động:
   - Load MasterData từ backend
   - Match terms by `ten_the`
   - Set `data-term-id` attributes

**Expected console log:**
```
✅ Matched: 217/217
🖼️ With URLs: 150/217 (example)
```

---

## 🔧 PHƯƠNG ÁN 2: CẬP NHẬT TRỰC TIẾP TRONG HTML

**⚠️ Không khuyến nghị** - phải update lại mỗi khi ContentData thay đổi

### **Bước 1: Run Script in Browser Console**

1. Open website: https://dtnam-oss.github.io/tai-lieu-phan-phoi/
2. Open DevTools (F12)
3. Go to Console tab
4. Copy nội dung file `update-term-ids.js`
5. Paste vào console và Enter

### **Bước 2: Verify**

Check console output:
```
✅ Shop → term-code-001
✅ Danh sách Shop → term-code-002
...
📊 Summary:
   ✅ Updated: 150
   ⚠️ Not found: 67
```

### **Bước 3: Save HTML**

1. Right-click page → Save As → Complete HTML
2. Replace old HTML file
3. Commit and push

**Nhược điểm:**
- Phải làm lại mỗi khi ContentData update
- Manual process, dễ sai
- Không scalable

---

## 📊 MAPPING REFERENCE

File `term-id-mapping.json` chứa full mapping:

```json
{
  "Shop": "term-code-001",
  "Danh sách Shop": "term-code-002",
  "mã Shop cần config": "term-code-003",
  ...
}
```

**Total terms:** 217 terms
- Sections: 1. ONBOARD, 2. CẤU HÌNH, 3. ĐĂNG ĐƠN, 4. VẬN HÀNH, 5. HUB, 6. KHO ĐÍCH

---

## ✅ VERIFICATION

Sau khi update, verify bằng cách:

### **Method 1: Browser Console**
```javascript
// Count terms with IDs
const withIds = document.querySelectorAll('[data-term-id]').length;
const total = document.querySelectorAll('td code, td mark').length;
console.log(`Terms with IDs: ${withIds}/${total}`);
```

### **Method 2: Hover Test**
1. Hover over colored terms
2. Should see image preview popup (if URLs available)
3. Console should log term ID

---

## 🐛 TROUBLESHOOTING

### **Problem: Terms không match**

**Check:**
```javascript
// Find unmatched terms
const terms = document.querySelectorAll('td code, td mark');
terms.forEach(t => {
  if (!t.hasAttribute('data-term-id')) {
    console.log('Missing ID:', t.textContent.trim());
  }
});
```

**Fix:**
- Add missing terms to `term-id-mapping.json`
- Update MasterData sheet với term mới

### **Problem: Hover không hoạt động**

**Check:**
1. Console có log `🔄 Re-initializing hover events`?
2. Terms có class `interactive-term`?
3. MasterData có load thành công?

**Debug:**
```javascript
// Check if term has ID
const term = document.querySelector('code');
console.log('ID:', term.getAttribute('data-term-id'));
console.log('Class:', term.className);
```

---

## 📝 BEST PRACTICE

### **Recommended Flow:**

1. ✅ **Update MasterData in Google Sheets** (preferred)
   - Single source of truth
   - Auto-sync to website
   - No manual HTML edits

2. ✅ **Backend returns correct data**
   - API response has `id_the` field
   - JavaScript auto-maps by `ten_the`

3. ✅ **Frontend auto-updates**
   - `populateImageUrls()` runs after ContentData load
   - Sets `data-term-id` attributes
   - Attaches hover events

### **Avoid:**
- ❌ Manual HTML editing
- ❌ Hardcoding term IDs in HTML
- ❌ Inconsistent data between backend and frontend

---

## 🎯 EXPECTED RESULT

After successful update:

```javascript
// All terms should have IDs
<code data-term-id="term-code-001">Shop</code>
<code data-term-id="term-code-002">Danh sách Shop</code>
<mark data-term-id="term-code-042">UT1</mark>
```

**Console:**
```
✅ Matched: 217/217
🖼️ With URLs: 150/217
🔄 Re-initializing hover events for updated content...
✅ Attached events to 217 terms
```

**Behavior:**
- ✅ Hover over terms shows preview
- ✅ Correct term IDs in tracking
- ✅ Consistent with backend data

---

## 📞 SUPPORT

**Files:**
- `term-id-mapping.json` - Full term mapping
- `update-term-ids.js` - Browser console script
- `UPDATE-TERM-IDS-GUIDE.md` - This guide

**Related Docs:**
- `SIMPLIFIED-DATA-LOADING.md` - Data loading architecture
- `AUTHENTICATION-QUICK-START.md` - Authentication setup

---

**📅 Created:** 2025-12-30
**👤 Author:** Claude Code Agent
**🎯 Purpose:** Guide for updating term IDs
**⏱️ Method:** Google Sheets (recommended) or Browser Script
