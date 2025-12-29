# 🚀 NOTION API SYNC - HƯỚNG DẪN CÀI ĐẶT

> **Tự động đồng bộ dữ liệu từ Notion sang Google Sheets với workflow an toàn: Backup → Validate → Update → Verify → Rollback**

---

## 📋 MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Chuẩn bị](#2-chuẩn-bị)
3. [Bước 1: Tạo Notion Integration](#bước-1-tạo-notion-integration)
4. [Bước 2: Share Notion Page](#bước-2-share-notion-page)
5. [Bước 3: Lấy Page ID](#bước-3-lấy-page-id)
6. [Bước 4: Cấu hình Google Apps Script](#bước-4-cấu-hình-google-apps-script)
7. [Bước 5: Test Connection](#bước-5-test-connection)
8. [Bước 6: Chạy Sync](#bước-6-chạy-sync)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Usage](#advanced-usage)

---

## 1. TỔNG QUAN

### 🎯 Mục đích
- Tự động kéo dữ liệu từ Notion về Google Sheets
- Không cần export/parse/paste thủ công
- Workflow an toàn với backup/rollback tự động

### 📊 Luồng dữ liệu

```
┌─────────────────┐
│  Notion Page    │
│  - Tables       │
│  - Highlights   │
└────────┬────────┘
         │
         │ Fetch via API
         ▼
┌─────────────────┐
│  Parser Module  │
│  - ContentData  │
│  - MasterData   │
└────────┬────────┘
         │
         │ Validate
         ▼
┌─────────────────┐
│ Google Sheets   │
│  - ContentData  │
│  - MasterData   │
└─────────────────┘
```

### ⚡ Tính năng

✅ **Automatic Sync**: Fetch + Parse + Update tự động  
✅ **Safe Workflow**: Backup trước khi update  
✅ **Data Validation**: Kiểm tra dữ liệu trước khi ghi  
✅ **Auto Rollback**: Phục hồi nếu có lỗi  
✅ **Logging System**: Ghi log mọi hoạt động  
✅ **Error Handling**: Xử lý lỗi comprehensive

---

## 2. CHUẨN BỊ

### ✅ Checklist

- [ ] Có tài khoản Notion (miễn phí)
- [ ] Có Notion page chứa nội dung (tables + highlights)
- [ ] Có Google Sheets spreadsheet với 2 sheets:
  - `ContentData` (columns: table_id, section_name, row_num, column_name, content_text, content_html)
  - `MasterData` (columns: hang_muc, id_the, ten_the, url)
- [ ] Quyền edit Google Apps Script của spreadsheet

### 📁 Cấu trúc Notion Page yêu cầu

Notion page cần có:

1. **Sections** (Headings): Để phân loại nội dung
   ```
   # CẤU HÌNH HỆ THỐNG
   # ĐĂNG ĐƠN
   # VẬN HÀNH
   ```

2. **Tables**: Với header row
   ```
   | Bộ phận thực hiện | Nội dung |
   |-------------------|----------|
   | IT                | Config   |
   ```

3. **Highlighted terms**: Text có màu (red, blue, yellow, etc.) hoặc bold
   ```
   Text bình thường **term được highlight** text tiếp theo
   ```

---

## BƯỚC 1: TẠO NOTION INTEGRATION

### 1.1. Truy cập Notion Integrations

Mở trình duyệt và truy cập:
```
https://www.notion.so/my-integrations
```

### 1.2. Create New Integration

1. Click **"+ New integration"**
2. Điền thông tin:
   - **Name**: `GHTK Sync` (hoặc tên bất kỳ)
   - **Logo**: Upload logo (optional)
   - **Associated workspace**: Chọn workspace của bạn
3. Click **"Submit"**

### 1.3. Lấy Integration Token

Sau khi tạo xong:

1. Trong trang integration details
2. Tìm section **"Internal Integration Token"**
3. Click **"Show"** → Copy token
4. Token có format: `secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**⚠️ BẢO MẬT TOKEN:**
- Không share token công khai
- Không commit token vào Git
- Token có quyền truy cập toàn bộ pages được share

### 1.4. Configure Capabilities

Trong tab **"Capabilities"**:

✅ Enable:
- **Read content**: ✓
- **Read user information**: ✓ (optional)

❌ Disable (không cần):
- Update content
- Insert content

Click **"Save changes"**

---

## BƯỚC 2: SHARE NOTION PAGE

### 2.1. Mở Notion Page

Mở Notion page chứa nội dung cần sync

### 2.2. Share với Integration

1. Click **"Share"** (góc phải trên)
2. Click **"Invite"**
3. Tìm integration vừa tạo: `GHTK Sync`
4. Click vào integration → Click **"Invite"**

### 2.3. Verify Access

Sau khi invite:
- Integration name sẽ xuất hiện trong danh sách "Shared with"
- Có icon 🔗 kế bên tên integration

**✅ HOÀN TẤT**: Integration giờ có quyền đọc page này

---

## BƯỚC 3: LẤY PAGE ID

### 3.1. Copy Page URL

Trong Notion page:
1. Click vào **"Share"** → **"Copy link"**
2. URL có format:
   ```
   https://www.notion.so/PAGE_TITLE-123e4567e89b12d3a456426614174000
   ```

### 3.2. Extract Page ID

Page ID là **32 ký tự cuối** (hex string):

**Ví dụ:**
```
URL: https://www.notion.so/My-Documentation-123e4567e89b12d3a456426614174000
Page ID: 123e4567e89b12d3a456426614174000
```

**Format đúng:**
```
✅ 123e4567e89b12d3a456426614174000    (32 ký tự hex)
✅ 123e4567-e89b-12d3-a456-426614174000 (có dấu gạch ngang - cũng OK)
❌ My-Documentation-123e4567...         (có text - SAI)
❌ 123e4567                             (thiếu ký tự - SAI)
```

**💡 TIP**: Nếu URL có dấu `?v=`, bỏ phần `?v=...` đi:
```
URL: https://www.notion.so/PAGE-123abc?v=456def
Page ID: 123abc (chỉ lấy phần trước ?v=)
```

---

## BƯỚC 4: CẤU HÌNH GOOGLE APPS SCRIPT

### 4.1. Mở Google Apps Script Editor

1. Mở Google Sheets spreadsheet
2. Menu: **Extensions → Apps Script**
3. Script editor sẽ mở trong tab mới

### 4.2. Add Notion Sync Module

1. Trong Apps Script editor
2. Click **"+"** bên cạnh **"Files"**
3. Chọn **"Script"**
4. Đặt tên: `NotionSync`
5. Copy toàn bộ code từ file `google-apps-script-NOTION-SYNC.gs`
6. Paste vào editor

### 4.3. Configure Constants

Tìm section **NOTION_CONFIG** (dòng ~20):

```javascript
const NOTION_CONFIG = {
  API_TOKEN: 'secret_YOUR_NOTION_INTEGRATION_TOKEN',  // ← THAY ĐỔI
  PAGE_ID: 'YOUR_NOTION_PAGE_ID',                     // ← THAY ĐỔI
  API_BASE: 'https://api.notion.com/v1',
  API_VERSION: '2022-06-28'
};
```

**Thay đổi:**

1. **API_TOKEN**: Paste token từ Bước 1.3
   ```javascript
   API_TOKEN: 'secret_ABCxyz123...',
   ```

2. **PAGE_ID**: Paste Page ID từ Bước 3.2
   ```javascript
   PAGE_ID: '123e4567e89b12d3a456426614174000',
   ```

### 4.4. Configure Sheets

Tìm section **SHEETS_CONFIG** (dòng ~35):

```javascript
const SHEETS_CONFIG = {
  SHEET_ID: '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4',  // ← THAY ĐỔI nếu cần
  MASTER_DATA_SHEET: 'MasterData',
  CONTENT_DATA_SHEET: 'ContentData',
  BACKUP_SUFFIX: '_Backup',
  LOG_SHEET: 'Sync_Log'
};
```

**Lấy SHEET_ID:**

Từ URL của Google Sheets:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

Copy phần **SHEET_ID_HERE** và paste vào config.

### 4.5. Save Script

1. Click **"Save"** (icon đĩa mềm) hoặc `Ctrl+S`
2. Đặt tên project: `GHTK Notion Sync` (optional)

---

## BƯỚC 5: TEST CONNECTION

### 5.1. Run Test Function

1. Trong Apps Script editor
2. Chọn function: **`testNotionConnection`** (dropdown phía trên)
3. Click **"Run"** (▶️ play button)

### 5.2. Grant Permissions (lần đầu chạy)

1. Popup xuất hiện: **"Authorization required"**
2. Click **"Review permissions"**
3. Chọn tài khoản Google của bạn
4. Click **"Advanced"** → **"Go to GHTK Notion Sync (unsafe)"**
5. Click **"Allow"**

**⚠️ SECURITY NOTE:**
- Script cần quyền để truy cập Google Sheets và Notion API
- Chỉ bạn có quyền chạy script (không public)

### 5.3. Check Results

Sau khi chạy xong:

1. Click **"Execution log"** (icon 📄 phía dưới)
2. Kiểm tra output:

**✅ Success:**
```
=== Testing Notion API Connection ===
✅ Connection successful!
Page ID: 123e4567e89b12d3a456426614174000
Blocks count: 42
Fetched at: 2024-12-29T10:30:00.000Z
```

**❌ Error:**
```
❌ Connection failed: Notion API error (401): Unauthorized
```

→ Xem [Troubleshooting](#troubleshooting) để fix

---

## BƯỚC 6: CHẠY SYNC

### 6.1. Full Sync (Manual)

#### Option A: Chạy từ Apps Script

1. Trong Apps Script editor
2. Chọn function: **`syncNotionToSheets`**
3. Click **"Run"** (▶️)
4. Chờ khoảng 10-30 giây (tùy kích thước data)

#### Option B: Chạy từ Custom Menu (recommended)

Thêm code này vào cuối file script:

```javascript
/**
 * Add custom menu to Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔄 Notion Sync')
    .addItem('▶️ Sync Now', 'syncNotionToSheets')
    .addItem('🔬 Test Connection', 'testNotionConnection')
    .addItem('⏪ Rollback', 'manualRollback')
    .addItem('📋 View Logs', 'viewSyncLogs')
    .addToUi();
}
```

Save và reload Google Sheets → Menu **"🔄 Notion Sync"** xuất hiện

### 6.2. Check Sync Results

Sau khi sync xong:

#### Execution Log

```
Step 1: Fetching Notion data...
Step 2: Parsing ContentData...
Step 3: Parsing MasterData...
Step 4: Updating ContentData sheet...
Step 5: Updating MasterData sheet...
✅ SYNC SUCCESS: {
  "success": true,
  "message": "Sync completed successfully",
  "duration": "12.5s",
  "contentData": {
    "rowsUpdated": 156,
    "backup": "ContentData_Backup"
  },
  "masterData": {
    "rowsUpdated": 47,
    "backup": "MasterData_Backup"
  }
}
```

#### Google Sheets

1. **ContentData sheet**: Có 156 rows mới
2. **MasterData sheet**: Có 47 terms mới
3. **ContentData_Backup**: Backup của data cũ
4. **MasterData_Backup**: Backup của data cũ
5. **Sync_Log**: Log chi tiết mỗi bước

### 6.3. Verify Data

#### Check ContentData

```
table_id      | section_name  | row_num | column_name         | content_text | content_html
------------- | ------------- | ------- | ------------------- | ------------ | ------------
table-1       | CẤU HÌNH      | 1       | Bộ phận thực hiện  | IT           | IT
table-1       | CẤU HÌNH      | 1       | Nội dung           | Config API   | <strong>Config API</strong>
```

#### Check MasterData

```
hang_muc  | id_the        | ten_the         | url
--------- | ------------- | --------------- | ---
CẤU HÌNH  | term-code-001 | API Key         | https://postimg.cc/...
CẤU HÌNH  | term-code-002 | Database URL    | https://postimg.cc/...
```

---

## TROUBLESHOOTING

### ❌ Error: "Notion API error (401): Unauthorized"

**Nguyên nhân:**
- Integration token sai hoặc không hợp lệ

**Giải pháp:**
1. Kiểm tra lại token trong `NOTION_CONFIG.API_TOKEN`
2. Token phải bắt đầu bằng `secret_`
3. Copy lại token từ https://www.notion.so/my-integrations
4. Không có khoảng trắng thừa đầu/cuối token

---

### ❌ Error: "Notion API error (404): Not found"

**Nguyên nhân:**
- Page ID sai
- Page chưa được share với Integration

**Giải pháp:**
1. Kiểm tra lại Page ID trong `NOTION_CONFIG.PAGE_ID`
2. Verify format: 32 ký tự hex (không có text)
3. Kiểm tra page đã share với Integration chưa:
   - Mở Notion page → Share → Xem integration có trong danh sách không

---

### ❌ Error: "Failed to fetch Notion data"

**Nguyên nhân:**
- Network error
- Notion API rate limit

**Giải pháp:**
1. Chờ 1-2 phút rồi thử lại
2. Check internet connection
3. Kiểm tra Notion API status: https://status.notion.so/

---

### ❌ Error: "No ContentData parsed from Notion"

**Nguyên nhân:**
- Notion page không có tables
- Tables không có header row

**Giải pháp:**
1. Kiểm tra Notion page có ít nhất 1 table
2. Table phải có header row (toggle "Header row" trong table settings)
3. Header row phải có text (không rỗng)

---

### ❌ Error: "No MasterData parsed from Notion"

**Nguyên nhân:**
- Không có text nào được highlight (màu hoặc bold)

**Giải pháp:**
1. Select text trong Notion
2. Click **"A"** → Chọn màu (red, blue, yellow, etc.)
3. Hoặc: Ctrl+B để bold text
4. Chỉ text có formatting mới được parse thành MasterData

---

### ❌ Error: "Validation failed"

**Nguyên nhân:**
- Parsed data thiếu required fields
- Data có rows rỗng

**Giải pháp:**
1. Check execution log để xem field nào thiếu
2. Verify Notion page structure:
   - Tables có đủ columns
   - Không có rows hoàn toàn rỗng

---

### ❌ Error: "Verification failed, rolled back"

**Nguyên nhân:**
- Sau khi update, data integrity check failed
- Ví dụ: Duplicate IDs, empty header

**Giải pháp:**
1. Check Sync_Log sheet để xem lỗi cụ thể
2. Data đã tự động rollback về backup
3. Fix Notion page rồi sync lại

---

### ⚠️ Warning: "Lock timeout"

**Nguyên nhân:**
- Có request khác đang chạy đồng thời

**Giải pháp:**
1. Đợi 30 giây rồi thử lại
2. Không chạy nhiều sync cùng lúc

---

## ADVANCED USAGE

### 📅 Tự động Sync theo Schedule

#### Setup Time-Driven Trigger

1. Trong Apps Script editor
2. Click **"Triggers"** (icon đồng hồ ⏰ bên trái)
3. Click **"+ Add Trigger"**
4. Configure:
   - **Function**: `syncNotionToSheets`
   - **Event source**: Time-driven
   - **Type**: Day timer
   - **Time of day**: Chọn giờ (ví dụ: 3am - 4am)
5. Click **"Save"**

**Result:**
- Script tự động chạy mỗi ngày vào giờ đã chọn
- Email thông báo nếu có lỗi

#### Các tùy chọn schedule khác:

- **Hourly**: Mỗi giờ (cẩn thận với rate limit)
- **Daily**: Mỗi ngày
- **Weekly**: Mỗi tuần
- **Monthly**: Mỗi tháng

---

### 🔄 Rollback Manual

Nếu sync lỗi và muốn khôi phục data cũ:

#### Option A: Từ Apps Script

```javascript
// Chạy function này
manualRollback()
```

#### Option B: Từ Custom Menu

Menu: **"🔄 Notion Sync" → "⏪ Rollback"**

#### Kết quả:

```
=== Manual Rollback ===
✅ Rollback completed!
ContentData: 150 rows restored
MasterData: 45 rows restored
```

---

### 📊 View Sync History

#### Check Sync Logs

```javascript
// Xem 20 logs gần nhất
viewSyncLogs()
```

#### Sync_Log Sheet

Mở sheet **"Sync_Log"** để xem full history:

```
Timestamp            | Action              | Details                    | Status
-------------------- | ------------------- | -------------------------- | ------
2024-12-29T10:30:00Z | SYNC_START          | {"pageId":"123abc..."}     | OK
2024-12-29T10:30:05Z | FETCH_SUCCESS       | {"blockCount":42}          | OK
2024-12-29T10:30:08Z | PARSE_CONTENT       | {"totalRows":156}          | OK
2024-12-29T10:30:12Z | UPDATE_CONTENT      | {"rowsUpdated":156}        | OK
2024-12-29T10:30:15Z | SYNC_SUCCESS        | {"duration":"15s"}         | OK
```

---

### 🧪 Testing & Debugging

#### Test Individual Functions

```javascript
// Test Notion connection
testNotionConnection()

// Test parse ContentData only
const notionData = fetchNotionPage(NOTION_CONFIG.PAGE_ID);
const contentData = parseContentData(notionData.blocks);
Logger.log(contentData);

// Test parse MasterData only
const masterData = parseMasterData(notionData.blocks);
Logger.log(masterData);

// Test backup
backupSheet('ContentData');

// Test validation
validateParsedData(contentData, ['table_id', 'section_name']);
```

#### Enable Detailed Logging

Thêm `Logger.log()` vào các function để debug:

```javascript
function parseContentData(blocks) {
  Logger.log('Total blocks: ' + blocks.length);  // ← ADD
  
  blocks.forEach((block, index) => {
    Logger.log(`Block ${index}: ${block.type}`);  // ← ADD
    // ...
  });
}
```

---

### 🔒 Security Best Practices

#### 1. Protect Integration Token

**✅ DO:**
- Lưu token trong Google Apps Script (private)
- Không commit vào Git
- Rotate token định kỳ (6 tháng/lần)

**❌ DON'T:**
- Không share token công khai
- Không hardcode trong client-side code
- Không log token ra console

#### 2. Limit Access

- Chỉ share Notion page cần thiết với Integration
- Không enable "Update content" capability nếu không cần
- Review integration permissions định kỳ

#### 3. Monitor Activity

- Check Sync_Log regularly
- Set up email alerts cho errors
- Review backup sheets trước khi delete

---

### ⚙️ Configuration Options

#### Custom Section Classification

Modify `classifySection()` function:

```javascript
function classifySection(headingText) {
  const text = headingText.toLowerCase();
  
  // Thêm custom keywords
  if (text.includes('setup')) return 'SETUP';
  if (text.includes('troubleshoot')) return 'TROUBLESHOOTING';
  
  // Default categories...
  if (text.includes('cấu hình')) return 'CẤU HÌNH';
  // ...
}
```

#### Custom Term Filtering

Modify `parseMasterData()` function:

```javascript
// Chỉ lấy terms có màu red hoặc blue
if (annotations.color === 'red' || annotations.color === 'blue') {
  // Add to masterData...
}

// Bỏ qua terms ngắn hơn 3 ký tự
if (richText.plain_text.trim().length >= 3) {
  // Add to masterData...
}
```

#### Backup Retention

Modify `backupSheet()` to keep multiple versions:

```javascript
// Instead of deleting old backup, rename it
const timestamp = Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss');
const backupName = `${sheetName}_Backup_${timestamp}`;

// Keep last 3 backups
const backups = ss.getSheets().filter(s => s.getName().startsWith(`${sheetName}_Backup_`));
if (backups.length >= 3) {
  ss.deleteSheet(backups[0]); // Delete oldest
}
```

---

## 📚 API REFERENCE

### Main Functions

#### `syncNotionToSheets()`
- **Description**: Main sync function (full workflow)
- **Returns**: `{success, message, duration, contentData, masterData}`
- **Throws**: Error nếu sync failed (sau rollback)

#### `fetchNotionPage(pageId)`
- **Description**: Fetch Notion page với all blocks
- **Parameters**: `pageId` (string) - Notion Page ID
- **Returns**: `{page, blocks, fetchedAt}`

#### `parseContentData(blocks)`
- **Description**: Parse blocks thành ContentData format
- **Parameters**: `blocks` (array) - Notion blocks
- **Returns**: Array of ContentData objects

#### `parseMasterData(blocks)`
- **Description**: Parse blocks thành MasterData format
- **Parameters**: `blocks` (array) - Notion blocks
- **Returns**: Array of MasterData objects

### Utility Functions

#### `backupSheet(sheetName)`
- **Description**: Backup sheet trước update
- **Parameters**: `sheetName` (string)
- **Returns**: `{success, backupName, rowCount, timestamp}`

#### `rollbackFromBackup(sheetName)`
- **Description**: Restore sheet từ backup
- **Parameters**: `sheetName` (string)
- **Returns**: `{success, sheetName, rowCount}`

#### `verifyDataIntegrity(sheetName, expectedMinRows)`
- **Description**: Verify data sau update
- **Parameters**: 
  - `sheetName` (string)
  - `expectedMinRows` (number) - Default: 1
- **Returns**: `{success, error, rowCount, columnCount}`

#### `validateParsedData(data, requiredFields)`
- **Description**: Validate data trước update
- **Parameters**:
  - `data` (array) - Array of objects
  - `requiredFields` (array) - Array of field names
- **Returns**: `{success, errors, rowCount}`

### Test Functions

#### `testNotionConnection()`
- **Description**: Test Notion API connection
- **Returns**: `{success, pageId, blockCount}` hoặc `{success: false, error}`

#### `testFullSync()`
- **Description**: Alias cho `syncNotionToSheets()`

#### `manualRollback()`
- **Description**: Rollback cả ContentData và MasterData

#### `viewSyncLogs()`
- **Description**: View 20 logs gần nhất
- **Returns**: Array of log entries

---

## 🎓 BEST PRACTICES

### 1. Sync Frequency

**Recommended:**
- **Development phase**: Manual sync (khi có thay đổi)
- **Production phase**: Daily sync (1x/ngày vào sáng sớm)

**Avoid:**
- Sync quá thường xuyên (< 1 giờ/lần) → Rate limit
- Sync trong giờ cao điểm → Slow

### 2. Data Structure

**Notion page structure:**
- Dùng headings để organize sections
- Mỗi table có header row rõ ràng
- Highlight terms consistently (cùng màu cho cùng loại)

**Google Sheets structure:**
- Không edit backup sheets manually
- Không delete log sheet
- Keep sheet names consistent với config

### 3. Error Handling

**Khi có error:**
1. Check Sync_Log để xem lỗi cụ thể
2. Verify Notion page structure
3. Test connection trước khi sync lại
4. Rollback nếu cần

**Prevention:**
- Test trên dev spreadsheet trước
- Backup manually trước khi deploy changes
- Monitor logs sau mỗi sync

### 4. Performance

**Optimize sync time:**
- Notion page không quá lớn (< 500 blocks)
- Avoid deep nesting (< 3 levels)
- Clean up old backups định kỳ

**Monitor:**
- Sync duration (normal: 10-30s)
- Execution log size (< 100KB)
- API rate limit (< 100 requests/minute)

---

## 📞 SUPPORT

### Resources

- **Notion API Docs**: https://developers.notion.com/
- **Google Apps Script Docs**: https://developers.google.com/apps-script
- **GitHub Issues**: [Link to your repo]

### Common Questions

**Q: Có giới hạn kích thước Notion page không?**  
A: Notion API có rate limit 3 requests/giây. Page quá lớn (> 1000 blocks) có thể chậm.

**Q: Có thể sync nhiều pages không?**  
A: Có, thêm `PAGE_ID_2`, `PAGE_ID_3` vào config và tạo separate sync functions.

**Q: Data cũ có bị mất không?**  
A: Không, có backup tự động trước mỗi sync. Rollback nếu cần.

**Q: Có thể custom parser logic không?**  
A: Có, edit các functions `parseContentData()` và `parseMasterData()`.

---

## ✅ CHECKLIST HOÀN THÀNH

Setup hoàn tất khi:

- [ ] Notion Integration created & token saved
- [ ] Notion page shared với Integration
- [ ] Page ID extracted correctly
- [ ] Apps Script configured (token + page ID + sheet ID)
- [ ] Test connection successful
- [ ] First sync completed successfully
- [ ] Data verified trong Google Sheets
- [ ] Backup sheets tồn tại
- [ ] Sync_Log có entries
- [ ] Custom menu xuất hiện (optional)
- [ ] Scheduled trigger setup (optional)

**🎉 CHÚC MỪNG! Hệ thống đã sẵn sàng!**

---

## 📝 CHANGELOG

### Version 1.0.0 (2024-12-29)
- ✨ Initial release
- ✅ Notion API integration
- ✅ ContentData & MasterData parsers
- ✅ Backup/Rollback system
- ✅ Data validation & verification
- ✅ Logging system
- ✅ Error handling

---

**Made with ❤️ for GHTK Team**
