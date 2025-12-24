# 🚀 TEXT CMS MIGRATION - Quick Start

## 🎯 Mục tiêu

Chuyển đổi tất cả text trong bảng (các thẻ `<code>`, `<mark>`, `<a>`) sang quản lý động từ Google Sheets.

---

## ⚡ BƯỚC 1: Extract Data (5 phút)

### 1. Mở Website

```
https://dtnam-oss.github.io/tai-lieu-phan-phoi/
```

### 2. Mở Console

- **Mac:** `Cmd + Option + J`
- **Windows:** `Ctrl + Shift + J`
- **Hoặc:** Right-click → Inspect → Console tab

### 3. Chạy Extraction Script

**Option A: Copy từ file**
1. Mở file: `extract-table-terms.js`
2. Copy toàn bộ nội dung
3. Paste vào Console
4. Nhấn Enter

**Option B: Download và chạy**
```javascript
// Paste dòng này vào Console:
fetch('https://raw.githubusercontent.com/dtnam-oss/tai-lieu-phan-phoi/main/extract-table-terms.js')
  .then(r => r.text())
  .then(code => eval(code));
```

### 4. Kết quả

Console sẽ hiển thị:
```
🚀 Starting Table Terms Extraction...
📊 Found X tables to process
...
✅ EXTRACTION COMPLETE!
✅ CSV data copied to clipboard!
```

---

## 📋 BƯỚC 2: Tạo Google Sheet

### 1. Tạo Sheet mới

- Mở [Google Sheets](https://sheets.google.com/)
- Tạo sheet mới: **"TextCMS"**

### 2. Tạo Tab "TextData"

- Click nút **+** ở dưới cùng
- Đặt tên tab: **"TextData"** (⚠️ Chính xác!)

### 3. Paste Data

1. Click vào cell **A1**
2. Paste với **Cmd+V** (Mac) hoặc **Ctrl+V** (Windows)
3. Data sẽ tự động tách thành các cột:
   - **A:** hang_muc
   - **B:** id_the
   - **C:** ten_the
   - **D:** url
   - **E:** tag_type

### 4. Format (Optional)

- Freeze row 1: `View → Freeze → 1 row`
- Bold header row
- Apply filter: `Data → Create a filter`

---

## 🔧 BƯỚC 3: Google Apps Script API

### 1. Mở Script Editor

- **Extensions → Apps Script**

### 2. Paste Code

Xóa code mặc định, paste code này:

```javascript
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('TextData');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet "TextData" not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const terms = rows
      .filter(row => row[1]) // Filter rows with id_the
      .map(row => ({
        hang_muc: row[0] || '',
        id_the: row[1] || '',
        ten_the: row[2] || '',
        url: row[3] || '',
        tag_type: row[4] || 'code'
      }));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: terms,
      timestamp: new Date().toISOString(),
      count: terms.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Deploy

1. **Deploy → New deployment**
2. Click ⚙️ → Select **Web app**
3. Settings:
   - **Execute as:** Me
   - **Who has access:** **Anyone** (⚠️ Quan trọng!)
4. **Deploy**
5. **Copy URL** (dạng: `https://script.google.com/macros/s/.../exec`)

---

## 🎨 BƯỚC 4: Frontend Integration

**Đang phát triển...**

Code sẽ được thêm vào `index.html` để:
1. Fetch data từ Google Sheets API
2. Update text vào các thẻ theo `id_the`
3. Cache với localStorage
4. Stale-while-revalidate strategy (giống video system)

---

## 📊 Preview Data

Sau khi chạy script, check Console:

```javascript
// Xem data đã extract:
window.extractedTermsData

// Xem statistics:
console.table(window.extractedTermsData)

// Filter by section:
window.extractedTermsData.filter(d => d.hang_muc.includes('ONBOARD'))

// Filter by tag type:
window.extractedTermsData.filter(d => d.tag_type === 'code')
```

---

## ✅ Checklist

- [ ] Website mở thành công
- [ ] Console mở được (F12)
- [ ] Script chạy không lỗi
- [ ] Data copied to clipboard
- [ ] Google Sheet tạo xong
- [ ] Tab "TextData" có dữ liệu
- [ ] Apps Script deployed
- [ ] URL copied

---

## 🐛 Troubleshooting

### Script không chạy?

```javascript
// Check nếu có lỗi:
console.clear();
// Paste lại script
```

### Clipboard không copy?

- Manually copy từ Console (giữa `---START---` và `---END---`)

### Data không tách cột?

- Ensure paste vào cell A1
- Try `Data → Split text to columns`

---

## 📞 Next Steps

Sau khi hoàn thành 4 bước trên, bạn sẽ có:

1. ✅ **Data extraction** từ HTML
2. ✅ **Google Sheet** với tất cả terms
3. ✅ **API endpoint** sẵn sàng
4. 🔄 **Frontend integration** (đang phát triển)

---

**🎉 Bước tiếp theo: Tôi sẽ code frontend integration để sync data!**
