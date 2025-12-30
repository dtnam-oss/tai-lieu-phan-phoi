# 🧪 LOCAL TESTING GUIDE

## 🎯 MỤC ĐÍCH

Test changes locally **TRƯỚC KHI** deploy lên GitHub Pages.

---

## 🚀 QUICK START

### **Cách 1: Script Tự Động** (RECOMMENDED)

```bash
cd /Users/mac/Desktop/tai-lieu-phan-phoi
./start-local-server.sh
```

Sau đó mở browser:
```
http://localhost:8000/index-local.html
```

### **Cách 2: Manual**

```bash
cd /Users/mac/Desktop/tai-lieu-phan-phoi
python3 -m http.server 8000
```

Mở browser:
```
http://localhost:8000/index-local.html
```

---

## 📁 FILES

| File | Purpose | Static Data |
|------|---------|-------------|
| `index.html` | **Production** - Deploy lên GitHub Pages | ❌ API mode |
| `index-local.html` | **Local test** - Test trên localhost | ✅ Static mode |
| `static-data.js` | Data file (134 KB) | Used by local |

---

## 🔄 WORKFLOW

### **1. Update ContentData trong Google Sheet**

Edit data trong Google Sheets như bình thường.

### **2. Build Static Data**

```
Google Sheets: 🔨 Static Builder → Build Static Data
```

### **3. Download File**

```
Google Sheets: 🔨 Static Builder → Download Static File
```

### **4. Replace Local File**

```bash
cd /Users/mac/Desktop/tai-lieu-phan-phoi
cp ~/Downloads/static-data.js .
```

### **5. Test Locally**

```bash
./start-local-server.sh
```

Mở: `http://localhost:8000/index-local.html`

**Check console (F12):**
```
✅ Should see:
📦 Loading from STATIC DATA (pre-built)...
✅ MasterData: 217 items loaded (static)
✅ ContentData: 75/75 cells updated (static)
⚡ PERFORMANCE: No API calls → Ultra fast load!
```

### **6. Verify Content**

- Scroll through pages
- Check table data
- Verify images load
- Test interactive terms

### **7. If OK → Deploy**

```bash
git add index.html static-data.js
git commit -m "Update content and fix issues"
git push origin main
```

---

## 🐛 DEBUGGING

### **Check if Static Data Loaded:**

Console:
```javascript
console.log(window.STATIC_DATA ? 'Static mode ✅' : 'API mode ❌');
```

### **View Data:**

```javascript
// View stats
console.log(window.STATIC_DATA.getStats());

// View specific table data
const table6 = window.STATIC_DATA.getContentByTable('table-6');
console.log('Table 6 data:', table6);

// View master data
console.log('MasterData:', window.STATIC_DATA.masterData);
```

### **Check Errors:**

F12 → Console → Look for:
- ⚠️ Table not found
- ⚠️ Column not found
- ✗ Error updating

---

## 🔍 COMMON ISSUES

### **Issue 1: static-data.js not found**

**Error:**
```
GET http://localhost:8000/static-data.js 404 (Not Found)
```

**Fix:**
```bash
# Check file exists
ls -lh static-data.js

# If not, download from Google Sheets
# Or use existing: cp static-data.js.backup static-data.js
```

### **Issue 2: Table/Column not found**

**Console shows:**
```
⚠️ Table not found: table-19
   Available tables: ["table-1", ..., "table-18"]
```

**Fix:**
- Update ContentData sheet
- Remove invalid table_id values
- Re-build static data

### **Issue 3: CORS Error**

**Error:**
```
Access to fetch at 'file://...' has been blocked by CORS policy
```

**Fix:**
Must use HTTP server (not `file://` protocol):
```bash
./start-local-server.sh
```

---

## 📊 COMPARISON

| Feature | Local (index-local.html) | Production (index.html) |
|---------|--------------------------|-------------------------|
| **Data Source** | static-data.js | Google Apps Script API |
| **Update Method** | Download + replace file | Auto from Sheet |
| **Speed** | ⚡ Ultra fast (~50ms) | 🐢 Slower (~500ms) |
| **Testing** | ✅ Instant feedback | ❌ Need deployment |
| **Best For** | Development, debugging | End users |

---

## ✅ BEST PRACTICES

### **1. Always Test Locally First**

```
❌ BAD:  Edit Sheet → Push to GitHub → Check production
✅ GOOD: Edit Sheet → Build → Test local → Push
```

### **2. Check Console Logs**

- No errors/warnings = Ready to deploy
- Fix all warnings before pushing

### **3. Verify Data Accuracy**

- Spot-check random tables
- Verify special characters render correctly
- Test interactive features

### **4. Performance Check**

```javascript
// Should be < 200ms
console.time('Load');
// ... page loads ...
console.timeEnd('Load');
```

---

## 🎓 FAQ

**Q: Có cần internet không?**
A: KHÔNG - Local server chạy offline hoàn toàn (trừ fonts/CDN)

**Q: Port 8000 bị chiếm?**
A: Dùng port khác: `python3 -m http.server 8080`

**Q: Làm sao biết đang test local hay production?**
A: Check URL: `localhost` = local, `github.io` = production

**Q: File nào deploy lên GitHub?**
A: `index.html` (API mode), `index-local.html` chỉ dùng local

**Q: Có cần rebuild static-data.js không?**
A: CÓ - Mỗi lần sửa ContentData phải rebuild

---

## 🚀 QUICK COMMANDS

```bash
# Start server
./start-local-server.sh

# Update data
cp ~/Downloads/static-data.js .

# Reload browser
Cmd+R (Mac) or Ctrl+R (Windows)

# Check file
ls -lh static-data.js

# Stop server
Ctrl+C
```

---

**📅 Created:** 2025-12-30
**👤 Author:** Claude Code Agent
**🎯 Purpose:** Local testing workflow guide
