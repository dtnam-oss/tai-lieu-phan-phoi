# ⚡ NOTION SYNC - QUICK START (5 PHÚT)

> **Đồng bộ Notion → Google Sheets tự động trong 5 phút**

---

## 📋 CHUẨN BỊ

- ✅ Notion page với tables và highlighted terms
- ✅ Google Sheets với sheets: `ContentData`, `MasterData`
- ✅ 5 phút

---

## 🚀 5 BƯỚC SETUP

### 1️⃣ TẠO NOTION INTEGRATION (1 phút)

```
1. Truy cập: https://www.notion.so/my-integrations
2. Click: "+ New integration"
3. Name: "GHTK Sync"
4. Click: "Submit"
5. Copy token: secret_XXXXXXXX...
```

**✅ Xong!** Lưu token lại.

---

### 2️⃣ SHARE PAGE VỚI INTEGRATION (30 giây)

```
1. Mở Notion page
2. Click: "Share" (góc phải trên)
3. Click: "Invite" → Tìm "GHTK Sync"
4. Click: "Invite"
```

**✅ Xong!** Integration có quyền đọc page.

---

### 3️⃣ LẤY PAGE ID (30 giây)

```
1. Trong Notion page, click: "Share" → "Copy link"
2. URL: https://www.notion.so/PAGE_TITLE-123e4567e89b12d3a456426614174000
3. Copy 32 ký tự cuối: 123e4567e89b12d3a456426614174000
```

**✅ Xong!** Lưu Page ID lại.

---

### 4️⃣ CÀI CODE VÀO GOOGLE SHEETS (2 phút)

```
1. Mở Google Sheets
2. Menu: Extensions → Apps Script
3. Click: "+" → "Script" → Đặt tên: "NotionSync"
4. Copy code từ: google-apps-script-NOTION-SYNC.gs
5. Paste vào editor
6. Tìm dòng 20-30, thay đổi:
   - API_TOKEN: 'secret_XXXXXXXX...'  ← Token từ bước 1
   - PAGE_ID: '123e4567...'            ← Page ID từ bước 3
7. Click: Save (Ctrl+S)
```

**✅ Xong!** Code đã cài xong.

---

### 5️⃣ CHẠY SYNC (1 phút)

```
1. Trong Apps Script editor
2. Chọn function: testNotionConnection
3. Click: Run (▶️)
4. Grant permissions (lần đầu):
   - Review permissions → Chọn account → Allow
5. Check log: Nếu thấy "✅ Connection successful!" → OK!

6. Chọn function: syncNotionToSheets
7. Click: Run (▶️)
8. Đợi 10-30 giây
9. Check log: Nếu thấy "✅ SYNC SUCCESS" → Done!
```

**✅ Xong!** Dữ liệu đã sync vào Google Sheets.

---

## ✅ XÁC NHẬN THÀNH CÔNG

Check Google Sheets:

- ✅ **ContentData** sheet: Có data mới (table rows)
- ✅ **MasterData** sheet: Có terms mới (highlighted terms)
- ✅ **ContentData_Backup**: Backup của data cũ
- ✅ **MasterData_Backup**: Backup của data cũ
- ✅ **Sync_Log**: Log của sync activities

**🎉 HOÀN TẤT!** Hệ thống đã sẵn sàng.

---

## 🔄 SỬ DỤNG HÀNG NGÀY

### Sync thủ công (khi có update)

```javascript
// Trong Apps Script, chạy:
syncNotionToSheets()
```

### Hoặc: Thêm Custom Menu (recommended)

Paste code này vào cuối file script:

```javascript
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔄 Notion Sync')
    .addItem('▶️ Sync Now', 'syncNotionToSheets')
    .addItem('🔬 Test Connection', 'testNotionConnection')
    .addItem('⏪ Rollback', 'manualRollback')
    .addItem('📋 View Logs', 'viewSyncLogs')
    .addToUi();
}
```

Save → Reload Sheets → Menu **"🔄 Notion Sync"** xuất hiện

**Sync bằng 1 click:** Menu → "🔄 Notion Sync" → "▶️ Sync Now"

---

## 🤔 GẶP LỖI?

### ❌ "Notion API error (401): Unauthorized"
→ Token sai. Copy lại token từ https://www.notion.so/my-integrations

### ❌ "Notion API error (404): Not found"
→ Page ID sai hoặc chưa share. Check lại bước 2 và 3.

### ❌ "No ContentData parsed"
→ Notion page không có tables hoặc tables không có header row.

### ❌ "No MasterData parsed"
→ Không có text nào được highlight. Select text → Click "A" → Chọn màu.

**Chi tiết:** Xem [NOTION-API-SETUP.md](NOTION-API-SETUP.md) - Troubleshooting section

---

## 📅 TỰ ĐỘNG SYNC HÀNG NGÀY (Optional)

```
1. Apps Script editor → Click: "Triggers" (⏰ icon)
2. Click: "+ Add Trigger"
3. Config:
   - Function: syncNotionToSheets
   - Event source: Time-driven
   - Type: Day timer
   - Time: 3am - 4am
4. Click: "Save"
```

**✅ Done!** Script tự chạy mỗi ngày lúc 3am.

---

## 📚 TÀI LIỆU ĐẦY ĐỦ

- **Setup Guide**: [NOTION-API-SETUP.md](NOTION-API-SETUP.md)
- **Troubleshooting**: [NOTION-API-SETUP.md#troubleshooting](NOTION-API-SETUP.md#troubleshooting)
- **Advanced Usage**: [NOTION-API-SETUP.md#advanced-usage](NOTION-API-SETUP.md#advanced-usage)
- **API Reference**: [NOTION-API-SETUP.md#api-reference](NOTION-API-SETUP.md#api-reference)

---

## 🎯 WORKFLOW HOẠT ĐỘNG NHƯ NÀO?

```
┌────────────────────────────────────────────────────┐
│  BẠN: Update content trong Notion                 │
│       - Sửa tables                                 │
│       - Thêm/xóa highlights                        │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  SYNC: Click "▶️ Sync Now"                         │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  HỆ THỐNG:                                         │
│  1. ✅ Backup ContentData & MasterData              │
│  2. 📥 Fetch data từ Notion API                     │
│  3. 🔄 Parse thành ContentData & MasterData format  │
│  4. ✔️  Validate dữ liệu                            │
│  5. 💾 Update Google Sheets                         │
│  6. ✅ Verify tính toàn vẹn                         │
│  7. 🎉 Done! (hoặc ⏪ Rollback nếu lỗi)            │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  FRONTEND: Tự động load data mới từ Sheets         │
│            - Không cần refresh                     │
│            - Instant preview với ResourceManager   │
└────────────────────────────────────────────────────┘
```

---

## 🔒 AN TOÀN

✅ **Backup tự động** trước mỗi sync  
✅ **Validation** trước khi ghi data  
✅ **Verify** sau khi update  
✅ **Auto rollback** nếu có lỗi  
✅ **Logging** mọi hoạt động  

→ **Data của bạn luôn an toàn!**

---

## ⚡ PERFORMANCE

- **Sync time**: 10-30 giây (tùy kích thước data)
- **Network**: 3-5 requests đến Notion API
- **Rate limit**: OK cho 100+ blocks
- **Frontend**: Không ảnh hưởng (sync chạy backend)

---

## 💡 TIPS

1. **Test trước**: Chạy `testNotionConnection()` trước khi sync
2. **Check logs**: Xem Sync_Log sheet sau mỗi sync
3. **Backup manual**: Export Sheets trước khi deploy changes lớn
4. **Monitor duration**: Sync time > 60s → Cần optimize Notion page
5. **Clean up**: Xóa old backups định kỳ (keep last 3-5)

---

**🚀 BẮT ĐẦU NGAY:** Follow 5 bước trên!

**❓ CÓ THẮC MẮC:** Xem [NOTION-API-SETUP.md](NOTION-API-SETUP.md)

**🎉 CHÚC MỪNG:** Bạn đã có hệ thống CMS tự động!
