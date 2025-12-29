# 🚀 STATIC DATA BUILD - HƯỚNG DẪN SỬ DỤNG

## 📋 **Tổng Quan**

Hệ thống Static Data Build giúp:
- ✅ **Tốc độ cực nhanh**: Load 10-50ms (thay vì 500ms với API)
- ✅ **Không có API calls**: Dữ liệu đã được build sẵn
- ✅ **Cập nhật đơn giản**: Chạy script khi content thay đổi
- ✅ **Fallback an toàn**: Tự động dùng API nếu static file không có

---

## 🎯 **Workflow**

```
┌─────────────────────────────────────────────────────────────┐
│  1. Sửa dữ liệu trong Google Sheets                        │
│     (MasterData, ContentData, VideoData)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Run: Build Static Data trong Google Apps Script        │
│     Tools → 🔨 Static Builder → Build Static Data          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Download file static-data.js                            │
│     Tools → 🔨 Static Builder → Download Static File       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Upload static-data.js lên hosting (same folder HTML)   │
│     - GitHub Pages: Commit & push                           │
│     - Netlify: Drop file vào folder                         │
│     - Server: Upload via FTP/SFTP                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. ✅ Done! Website auto-load static data (ultra fast)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 **SETUP - Lần Đầu (5 phút)**

### **Step 1: Add Script vào Google Apps Script**

1. Mở Google Sheets: https://docs.google.com/spreadsheets/d/12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4
2. Click: **Extensions** → **Apps Script**
3. Click: **+** button → **New Script File**
4. Tên file: `StaticDataBuilder`
5. Copy toàn bộ code từ `google-apps-script-STATIC-BUILD.gs` paste vào
6. **Save** (Ctrl+S hoặc Cmd+S)

### **Step 2: Deploy as Web App (Optional - for download)**

1. Trong Apps Script editor, click: **Deploy** → **New deployment**
2. Type: **Web app**
3. Description: "Static Data Builder"
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click: **Deploy**
7. Copy **Web app URL** (sẽ dùng để download file)

### **Step 3: Test Build**

1. Reload Google Sheets
2. Bạn sẽ thấy menu mới: **🔨 Static Builder**
3. Click: **🔨 Static Builder** → **Build Static Data**
4. Chọn: **Yes**
5. Đợi vài giây → Popup hiển thị thống kê:
   ```
   ✅ Build Completed
   MasterData: XX items
   ContentData: XX items
   VideoData: XX items
   
   File size: XX KB
   ```

---

## 🔧 **SỬ DỤNG HÀNG NGÀY**

### **Scenario 1: Sửa Nội Dung (Content Update)**

```
Ví dụ: Sửa ten_the của term-001 từ "Đăng đơn" → "Đăng đơn giao hàng"

1. Sửa trong Google Sheets (MasterData)
2. Google Sheets → Tools → 🔨 Static Builder → Build Static Data
3. Tools → 🔨 Static Builder → Download Static File
4. Copy URL từ popup, mở trong browser
5. Browser sẽ download file static-data.js
6. Upload file này lên hosting (replace file cũ)
7. ✅ Done! Website tự động dùng data mới
```

### **Scenario 2: Thêm Term Mới**

```
Ví dụ: Thêm term-030 mới

1. Thêm row mới trong MasterData:
   ┌──────────┬────────────────────┬──────────────────────────┐
   │ ĐĂNG ĐƠN │ term-030           │ Chọn thời gian giao hàng │
   └──────────┴────────────────────┴──────────────────────────┘

2. Upload ảnh lên Cloudinary với tên: term-030.png
3. Copy URL, paste vào cột "url"
4. Run: Build Static Data
5. Download & upload static-data.js
6. ✅ Done!
```

### **Scenario 3: Update Table Content**

```
Ví dụ: Sửa nội dung cell trong table

1. Sửa trong ContentData sheet:
   ┌──────────┬──────────────┬─────────┬─────────────┬──────────────┐
   │ table_id │ section_name │ row_num │ column_name │ content_text │
   ├──────────┼──────────────┼─────────┼─────────────┼──────────────┤
   │ table-01 │ Section 1    │ 2       │ Column A    │ NEW CONTENT  │
   └──────────┴──────────────┴─────────┴─────────────┴──────────────┘

2. Run: Build Static Data
3. Download & upload static-data.js
4. ✅ Table auto-updated!
```

---

## 📊 **MONITORING & VALIDATION**

### **Check Build Status**

```javascript
// Trong browser console (F12)
console.log(window.STATIC_DATA.getStats());

Output:
{
  masterData: 25,
  contentData: 150,
  videoData: 10,
  version: 1735459200000,
  age: "5 minutes"
}
```

### **Force Refresh**

```javascript
// Clear cache và reload
localStorage.clear();
location.reload(true);
```

### **Check if Using Static or API**

```javascript
// Trong console khi load page:
if (window.STATIC_DATA) {
  console.log('✅ Using STATIC data (fast mode)');
  console.log('   Version:', window.STATIC_DATA.version);
} else {
  console.log('⚠️ Using API mode (fallback)');
}
```

---

## 🆘 **TROUBLESHOOTING**

### **Problem 1: Website vẫn chậm (500ms)**

**Nguyên nhân**: Static file chưa load được, đang dùng API mode

**Solution**:
```bash
# Check trong console (F12):
1. Xem log: "📦 Loading from STATIC DATA" → ✅ OK
2. Nếu thấy: "🔄 Loading content from backend API" → ❌ File chưa có

# Fix:
- Check file static-data.js có trong cùng folder với index.html không
- Check syntax error trong static-data.js
- Hard refresh: Ctrl+Shift+R (hoặc Cmd+Shift+R)
```

### **Problem 2: Nội dung cũ không update**

**Nguyên nhân**: Browser cache file cũ

**Solution**:
```bash
# Option 1: Version busting (Recommended)
Rename file: static-data.js → static-data.js?v=20250129

Trong HTML:
<script src="static-data.js?v=20250129"></script>

# Option 2: Clear cache
localStorage.clear();
location.reload(true);
```

### **Problem 3: Build failed**

**Error**: "Cannot read property 'getRange' of null"

**Solution**:
- Check sheet names: `MasterData`, `ContentData`, `VideoData` (chính xác)
- Check DATABASE_ID trong script
- Check permissions: Script có quyền đọc sheets không

---

## ⚡ **PERFORMANCE COMPARISON**

| Metric | API Mode (Old) | Static Mode (New) |
|--------|----------------|-------------------|
| **Initial Load** | 500-800ms | 10-50ms |
| **MasterData** | 200ms (API call) | 0ms (instant) |
| **ContentData** | 200ms (API call) | 0ms (instant) |
| **VideoData** | 100ms (API call) | 0ms (instant) |
| **Total Time** | ~500ms | ~50ms |
| **Speed Up** | 1x | **10x faster!** |

---

## 🎯 **BEST PRACTICES**

### **✅ DO:**
- Build static data sau mỗi lần update content
- Version file khi deploy (`?v=timestamp`)
- Check console log để verify static mode
- Keep backup của file cũ trước khi update

### **❌ DON'T:**
- Edit static-data.js manually (sẽ bị ghi đè)
- Quên upload file sau khi build
- Dùng static data cho content thay đổi liên tục (dùng API mode)

---

## 📞 **QUICK REFERENCE**

### **Commands**

```bash
# Build (trong Google Sheets)
Tools → 🔨 Static Builder → Build Static Data

# Download
Tools → 🔨 Static Builder → Download Static File

# View Stats
Tools → 🔨 Static Builder → View Build Stats

# Check in Browser
console.log(window.STATIC_DATA.getStats());
```

### **Files**

```
google-apps-script-STATIC-BUILD.gs  → Backend script
static-data.js                       → Generated data file
index.html                           → Frontend (auto-detect static)
```

### **Workflow Summary**

```
Edit Sheets → Build → Download → Upload → ✅ Done!
   (2 min)    (5 sec)  (5 sec)   (30 sec)  (Ultra fast)
```

---

## 🚀 **NEXT LEVEL (Optional)**

### **Auto-Build on Schedule**

Tự động build mỗi ngày:

```javascript
// Trong Apps Script
function setupScheduledBuild() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  
  // Create new trigger: Daily at 2 AM
  ScriptApp.newTrigger('scheduledBuild')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();
}
```

### **Webhook Auto-Deploy**

Tự động upload lên hosting sau khi build:
- GitHub: Use GitHub API to commit
- Netlify: Use Deploy Hooks
- Server: Use SFTP/FTP API

---

## 📚 **FAQ**

**Q: Có cần xóa API_URL trong HTML không?**
A: Không. Giữ nguyên để fallback khi static file không có.

**Q: File static-data.js có an toàn không?**
A: Có, nó chỉ chứa data công khai (giống API response).

**Q: Có thể dùng CDN cho static-data.js không?**
A: Có, nhưng cần version busting để tránh cache cũ.

**Q: Khi nào nên dùng API mode thay vì Static?**
A: Khi content thay đổi liên tục (nhiều lần/ngày) và cần realtime.

---

## ✅ **CHECKLIST - Lần Deploy Đầu**

- [ ] Add script vào Google Apps Script
- [ ] Deploy as Web App (for download URL)
- [ ] Test build trong Google Sheets
- [ ] Download static-data.js
- [ ] Upload lên hosting (same folder with index.html)
- [ ] Test website: Check console log "📦 Loading from STATIC DATA"
- [ ] Verify speed: Load time < 100ms
- [ ] Document download URL cho team

---

**🎉 Hoàn thành! Website giờ load siêu nhanh với static data!**
