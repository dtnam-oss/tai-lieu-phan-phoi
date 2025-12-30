# 🔑 GOOGLE SHEETS API SETUP - HƯỚNG DẪN

## 🎯 MỤC ĐÍCH

Setup Google Sheets API để script Python có thể tự động fix ContentData.

---

## 📋 YÊU CẦU

- Google Cloud Console account
- Quyền admin trên Google Sheet ContentData
- Python 3.x với pip3

---

## 🚀 BƯỚC 1: TẠO PROJECT TRONG GOOGLE CLOUD

### **1.1. Truy cập Google Cloud Console**

```
https://console.cloud.google.com/
```

### **1.2. Tạo Project Mới**

1. Click **Select a project** (top left)
2. Click **NEW PROJECT**
3. Điền thông tin:
   ```
   Project name: GHTK ContentData Fixer
   Location: No organization
   ```
4. Click **CREATE**

---

## 🔧 BƯỚC 2: ENABLE GOOGLE SHEETS API

### **2.1. Enable API**

1. Trong project vừa tạo
2. Go to: **APIs & Services** → **Library**
3. Search: `Google Sheets API`
4. Click vào **Google Sheets API**
5. Click **ENABLE**

---

## 🔐 BƯỚC 3: TẠO SERVICE ACCOUNT

### **3.1. Create Service Account**

1. Go to: **APIs & Services** → **Credentials**
2. Click **CREATE CREDENTIALS** → **Service account**
3. Điền thông tin:
   ```
   Service account name: contentdata-fixer
   Service account ID: contentdata-fixer (auto-filled)
   Description: Service account for auto-fixing ContentData
   ```
4. Click **CREATE AND CONTINUE**
5. Skip **Grant this service account access to project** (click CONTINUE)
6. Skip **Grant users access to this service account** (click DONE)

### **3.2. Create Key**

1. Click vào service account vừa tạo
2. Go to **KEYS** tab
3. Click **ADD KEY** → **Create new key**
4. Choose **JSON** format
5. Click **CREATE**

**File JSON sẽ tự động download!**

### **3.3. Save Key File**

```bash
# Di chuyển file vào project folder
cd /Users/mac/Desktop/tai-lieu-phan-phoi
mv ~/Downloads/ghtk-contentdata-fixer-*.json google-sheets-credentials.json

# Set permissions
chmod 600 google-sheets-credentials.json
```

---

## 📤 BƯỚC 4: SHARE GOOGLE SHEET

### **4.1. Get Service Account Email**

Mở file `google-sheets-credentials.json`:

```bash
cat google-sheets-credentials.json | grep client_email
```

**Output example:**
```json
"client_email": "contentdata-fixer@ghtk-contentdata-fixer.iam.gserviceaccount.com"
```

Copy email này!

### **4.2. Share Sheet**

1. Mở Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4
   ```

2. Click **Share** button (top right)

3. Paste service account email

4. Set permission: **Editor**

5. **Uncheck**: "Notify people"

6. Click **Share**

---

## 📦 BƯỚC 5: INSTALL DEPENDENCIES

```bash
cd /Users/mac/Desktop/tai-lieu-phan-phoi

# Install Google API client
pip3 install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

**Expected output:**
```
Successfully installed google-api-python-client-X.X.X ...
```

---

## ✅ BƯỚC 6: TEST CONNECTION

### **6.1. Make Script Executable**

```bash
chmod +x fix-contentdata-auto.py
```

### **6.2. Run Dry-Run Test**

```bash
python3 fix-contentdata-auto.py
```

**Expected output:**
```
================================================================================
🔧 CONTENTDATA AUTO-FIX TOOL
================================================================================

📊 Spreadsheet ID: 12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4
📋 Sheet Name: ContentData
🔑 Credentials: google-sheets-credentials.json

✅ Connected to Google Sheets API

📖 Reading ContentData...
✅ Read XXX rows

🔍 Analyzing fixes needed...

================================================================================
🔧 APPLYING FIXES
================================================================================
⚠️  DRY RUN MODE - No changes will be made
...
```

---

## 🚀 BƯỚC 7: RUN AUTO-FIX

### **7.1. Dry Run (Preview)**

```bash
python3 fix-contentdata-auto.py
```

Review output để xem sẽ fix gì.

### **7.2. Apply Changes**

```bash
python3 fix-contentdata-auto.py --apply
```

**Confirm khi script hỏi!**

### **7.3. Verify**

1. Mở Google Sheet ContentData
2. Check rows đã được update/delete
3. Verify column_name values

---

## 🐛 TROUBLESHOOTING

### **Error 1: Credentials file not found**

```
❌ Error loading credentials: [Errno 2] No such file or directory: 'google-sheets-credentials.json'
```

**Fix:**
```bash
# Check file exists
ls -la google-sheets-credentials.json

# If not, download again from Google Cloud Console
```

---

### **Error 2: Permission denied**

```
HttpError 403: The caller does not have permission
```

**Fix:**
1. Check service account email đã được share chưa
2. Permission phải là **Editor** (không phải Viewer)
3. Wait 1-2 minutes for permissions to propagate

---

### **Error 3: API not enabled**

```
HttpError 403: Google Sheets API has not been used in project
```

**Fix:**
1. Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com
2. Click **ENABLE**
3. Wait 1-2 minutes
4. Try again

---

## 🔒 SECURITY NOTES

### **Protect Credentials File**

```bash
# Never commit to git
echo "google-sheets-credentials.json" >> .gitignore

# Set restrictive permissions
chmod 600 google-sheets-credentials.json

# Verify
ls -la google-sheets-credentials.json
# Should show: -rw------- (owner read/write only)
```

### **Revoke Access When Done**

If you no longer need the script:

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Find service account
3. Click **DELETE**

Or remove from Google Sheet:
1. Open Sheet → Click Share
2. Find service account email
3. Click X to remove

---

## 📊 WHAT THE SCRIPT DOES

### **Dry Run Mode (Default):**
```bash
python3 fix-contentdata-auto.py
```

- ✅ Read ContentData sheet
- ✅ Analyze what needs fixing
- ✅ Show preview of changes
- ❌ Does NOT modify anything

### **Apply Mode:**
```bash
python3 fix-contentdata-auto.py --apply
```

- ✅ Read ContentData sheet
- ✅ Analyze fixes needed
- ✅ **DELETE** rows with table_id > 18
- ✅ **UPDATE** column_name values to match HTML
- ✅ Show summary of changes made

---

## 🎯 EXPECTED RESULTS

After running with `--apply`:

**Deleted:**
- ~100+ rows (table-19 to table-46)

**Updated:**
- ~50-60 rows (column_name corrections)

**Kept:**
- ~75 rows (already correct)

**Total time:** ~30 seconds

---

## 📋 NEXT STEPS AFTER FIX

```bash
# 1. Rebuild static data
# In Google Sheets: Tools → Static Builder → Build

# 2. Download new file
# Tools → Static Builder → Download Static File

# 3. Test locally
cp ~/Downloads/static-data.js .
open http://localhost:8000/index-local.html

# 4. Check console - should see:
# ✅ ContentData: 75/75 cells updated (static)
# (No errors!)

# 5. Deploy
git add static-data.js
git commit -m "fix: Update ContentData with corrected column names"
git push origin main
```

---

**📅 Created:** 2025-12-30
**👤 Author:** Claude Code Agent
**🎯 Purpose:** Setup guide for Google Sheets API automation
