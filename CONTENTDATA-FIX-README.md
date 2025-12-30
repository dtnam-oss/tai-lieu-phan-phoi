# 🔧 CONTENTDATA FIX - COMPLETE SOLUTION

## 📋 TÓM TẮT VẤN ĐỀ

ContentData trong Google Sheet có:
- ❌ Column names không match với HTML table headers
- ❌ Invalid table_id (table-19 đến table-46 không tồn tại)

**Kết quả:** Website không load content, console đầy errors.

---

## ✅ GIẢI PHÁP - 2 PHƯƠNG ÁN

### **Phương Án 1: AUTO-FIX (Khuyến nghị - Nhanh nhất)**

**Thời gian:** ~5 phút setup + 30 giây run

**Các bước:**
1. Setup Google Sheets API credentials
2. Run script auto-fix
3. Rebuild static data
4. Test & deploy

**Chi tiết:** Xem [GOOGLE-SHEETS-API-SETUP.md](GOOGLE-SHEETS-API-SETUP.md)

---

### **Phương Án 2: MANUAL FIX (Không cần API)**

**Thời gian:** ~30-60 phút

**Các bước:**
1. Import mapping reference vào Google Sheets
2. Manual update column_name
3. Manual delete invalid rows
4. Rebuild static data
5. Test & deploy

**Chi tiết:** Xem [FIX-CONTENTDATA-GUIDE.md](FIX-CONTENTDATA-GUIDE.md)

---

## 🚀 QUICK START - AUTO-FIX

### **Bước 1: Setup API (Một lần duy nhất)**

```bash
# 1. Create Google Cloud project & enable Sheets API
# 2. Create service account & download JSON key
# 3. Save key as google-sheets-credentials.json
# 4. Share Google Sheet with service account email

# Chi tiết: GOOGLE-SHEETS-API-SETUP.md
```

### **Bước 2: Install Dependencies**

```bash
cd /Users/mac/Desktop/tai-lieu-phan-phoi

pip3 install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

### **Bước 3: Preview Changes (Dry Run)**

```bash
python3 fix-contentdata-auto.py
```

**Output sẽ show:**
- Rows cần delete
- Column names cần update
- Summary of changes

### **Bước 4: Apply Fixes**

```bash
python3 fix-contentdata-auto.py --apply
```

**Confirm khi được hỏi!**

### **Bước 5: Verify & Deploy**

```bash
# 1. Check Google Sheets - verify changes
# 2. Build static data (in Google Sheets menu)
# 3. Download static-data.js
# 4. Test local
cp ~/Downloads/static-data.js .
open http://localhost:8000/index-local.html

# 5. Deploy
git add static-data.js
git commit -m "fix: Update ContentData with corrected mappings"
git push origin main
```

---

## 📊 WHAT GETS FIXED

### **Delete:**
- table-19 to table-46 (~100+ rows)
- **Reason:** These table_id values don't exist in HTML

### **Update:**
- table-2 to table-9 column_name values (~50-60 rows)
- **From:** Notion export names (e.g., "PO – Phân phối (Thương mại / Sản xuất)")
- **To:** HTML header names ("Bộ phận thực hiện" or "Nội dung")

### **Keep:**
- table-1 (special 3-column structure)
- table-10 to table-18 (already correct)
- Total: ~75 rows unchanged

---

## 📁 FILES & TOOLS

| File | Purpose | When to Use |
|------|---------|-------------|
| `fix-contentdata-auto.py` | Auto-fix script | Quick automated fix |
| `extract-table-headers.py` | Extract HTML headers | Generate reference |
| `table-headers-mapping.tsv` | HTML headers reference | Manual updates |
| `GOOGLE-SHEETS-API-SETUP.md` | API setup guide | First-time setup |
| `FIX-CONTENTDATA-GUIDE.md` | Manual fix guide | No API access |
| `CONTENTDATA-FIX-README.md` | This file | Overview |

---

## 🎯 EXPECTED RESULTS

### **Before Fix:**

**Console errors:**
```
⚠️ Column not found: "PO – Phân phối (Thương mại / Sản xuất)" in table table-2
   Available headers: ["Bộ phận thực hiện","Nội dung"]

⚠️ Table not found: table-19
   Available tables: ["table-1",...,"table-18"]

... (100+ more errors)
```

**Website:** Empty tables, no content loaded

---

### **After Fix:**

**Console:**
```
✅ ContentData: 75/75 cells updated (static)
📦 Loading from STATIC DATA (pre-built)...
⚡ PERFORMANCE: No API calls → Ultra fast load!
```

**Website:** All tables populated with correct content

---

## 🐛 TROUBLESHOOTING

### **Auto-Fix Issues:**

**Problem:** Credentials file not found
```bash
# Solution:
ls -la google-sheets-credentials.json
# If missing, download from Google Cloud Console
```

**Problem:** Permission denied (403)
```bash
# Solution:
# 1. Check service account email is shared in Google Sheet
# 2. Permission must be "Editor"
# 3. Wait 1-2 minutes after sharing
```

**Problem:** API not enabled
```bash
# Solution:
# Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com
# Click ENABLE
```

---

### **General Issues:**

**Problem:** Local server not working
```bash
# Solution:
./start-local-server.sh
# Then: http://localhost:8000/index-local.html
```

**Problem:** Static data not loading
```bash
# Solution:
# 1. Check file exists: ls -la static-data.js
# 2. Should be ~134 KB
# 3. Hard refresh: Cmd+Shift+R
```

---

## 🎓 HOW IT WORKS

### **Auto-Fix Logic:**

```python
def determine_column_name(table_id, content_text):
    """
    Determine correct column name based on content

    Logic:
    - table-1: Keep original (special 3-column case)
    - table-2 to table-18:
      - Short content (< 50 chars) → "Bộ phận thực hiện"
      - Long content (> 50 chars) → "Nội dung"
    """
```

### **Why This Works:**

Looking at actual ContentData:
```
Row 1: "CSKH" (4 chars) → Column 1: "Bộ phận thực hiện" ✅
Row 1: "Bước 1: Truy cập..." (500+ chars) → Column 2: "Nội dung" ✅
```

Content length is a reliable indicator of which column it belongs to.

---

## 📈 PERFORMANCE IMPACT

### **Before Fix:**
- ⏱️ Load time: N/A (failed to load)
- ❌ Console: 100+ errors
- 🚫 Tables: Empty

### **After Fix:**
- ⏱️ Load time: ~130ms (ultra fast)
- ✅ Console: No errors
- 📋 Tables: All populated (75 cells)

---

## 🔒 SECURITY NOTES

### **API Credentials:**

```bash
# NEVER commit credentials
echo "google-sheets-credentials.json" >> .gitignore

# Set restrictive permissions
chmod 600 google-sheets-credentials.json

# Verify
ls -la google-sheets-credentials.json
# Should show: -rw------- (owner only)
```

### **Revoke Access:**

When done, revoke service account access:
1. Google Cloud Console → IAM → Service Accounts
2. Delete service account
OR
3. Google Sheet → Share → Remove service account email

---

## 📞 SUPPORT

### **Need Help?**

1. **Check guides:**
   - [GOOGLE-SHEETS-API-SETUP.md](GOOGLE-SHEETS-API-SETUP.md) - API setup
   - [FIX-CONTENTDATA-GUIDE.md](FIX-CONTENTDATA-GUIDE.md) - Manual fix
   - [LOCAL-TEST-GUIDE.md](LOCAL-TEST-GUIDE.md) - Local testing

2. **Check logs:**
   ```bash
   # Script output shows detailed error messages
   python3 fix-contentdata-auto.py
   ```

3. **Check Google Sheet:**
   - Verify service account has Editor access
   - Check sheet name is exactly "ContentData"
   - Verify data structure matches expected format

---

## ✅ CHECKLIST

### **Auto-Fix Workflow:**

- [ ] Setup Google Cloud project
- [ ] Enable Google Sheets API
- [ ] Create service account
- [ ] Download JSON credentials
- [ ] Save as `google-sheets-credentials.json`
- [ ] Share Google Sheet with service account
- [ ] Install Python dependencies
- [ ] Run dry-run preview
- [ ] Review changes (verify looks correct)
- [ ] Run with `--apply` flag
- [ ] Verify in Google Sheets
- [ ] Rebuild static data
- [ ] Download static-data.js
- [ ] Test locally
- [ ] Deploy to GitHub
- [ ] Verify production website

---

## 🎉 SUCCESS CRITERIA

You know it worked when:

1. ✅ Script runs without errors
2. ✅ Google Sheets shows ~75 rows (table-1 to table-18 only)
3. ✅ Column names match HTML headers
4. ✅ Local test shows no console errors
5. ✅ Website loads all table content correctly
6. ✅ Performance is fast (~130ms load time)

---

**📅 Created:** 2025-12-30
**👤 Author:** Claude Code Agent
**🎯 Purpose:** Complete solution for ContentData column mismatch
**⏱️ Est. Time:** 5 minutes (auto) or 30-60 minutes (manual)
