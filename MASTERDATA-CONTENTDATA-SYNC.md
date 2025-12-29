# 📊 Phân tích Logic Load Dữ liệu MasterData & ContentData

## 🎯 Tổng quan

Hệ thống sử dụng **2 Google Sheets tabs** để quản lý nội dung động:

```
Google Sheet: 12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4
├── Tab 1: MasterData      → Dữ liệu hover preview (image tooltip)
└── Tab 2: ContentData     → Nội dung table cells (text content)
```

---

## 📚 Sheet Structures

### 1️⃣ **MasterData Sheet**

**Purpose:** Lưu dữ liệu cho **hover preview** (hiển thị image tooltip khi hover vào text màu)

**Columns:**
- `term` - Từ khóa cần hover (ví dụ: "ONBOARD", "GHTK")
- `definition` - Định nghĩa của term
- `category` - Phân loại
- `image_url` - URL hình ảnh hiển thị khi hover

**Example:**
```
term         | definition                    | category  | image_url
-------------|-------------------------------|-----------|------------------
ONBOARD      | Quy trình đăng ký tài khoản   | Process   | https://...
GHTK         | Giao Hàng Tiết Kiệm          | Company   | https://...
COD          | Thu tiền tại nhà             | Payment   | https://...
```

### 2️⃣ **ContentData Sheet**

**Purpose:** Lưu nội dung động cho **table cells** trong HTML

**Columns:**
- `table_id` - ID của table element trong HTML
- `section_name` - Tên section (ví dụ: "4. VẬN HÀNH")
- `row_num` - Số thứ tự dòng
- `column_name` - Tên cột (ví dụ: "Bộ phận thực hiện", "Nội dung")
- `content_text` - Nội dung text thuần
- `content_html` - Nội dung HTML (với formatting)

**Example:**
```
table_id  | section_name | row_num | column_name        | content_text | content_html
----------|--------------|---------|-------------------|--------------|------------------
table_001 | 4. VẬN HÀNH  | 1       | Bộ phận thực hiện | VHXT - TÀI XẾ | <strong>VHXT</strong>...
table_001 | 4. VẬN HÀNH  | 1       | Nội dung          | Bước 1: ...  | <strong>Bước 1</strong>...
```

---

## 🔄 Data Loading Flow

### 📍 **Entry Point**

**File:** `index.html` (line 5353-5363)

```javascript
document.addEventListener('DOMContentLoaded', () => {
    SheetLoader.init();  // ← Load data khi page load
});
```

---

### 🔧 **Step 1: SheetLoader.init()**

**Location:** `index.html` lines 5180-5245

#### Logic Flow:

```javascript
async init() {
    // 1. Check if Sheet ID is configured
    if (!CONFIG.SHEET_ID || CONFIG.SHEET_ID === 'YOUR_SHEET_ID_HERE') {
        console.warn('⚠️ Google Sheet ID not configured');
        return;
    }

    console.log('🔄 Loading content from Google Sheets...');

    try {
        // 2. Load MasterData
        const masterData = await GoogleSheetsAPI.fetchSheet('MasterData');

        if (!masterData || masterData.length === 0) {
            throw new Error('No data found in master table');
        }

        // 3. Store in global cache
        window.masterDataCache = masterData;

        // 4. Load ContentData
        console.log('📊 Loading ContentData for table cells...');
        const contentData = await GoogleSheetsAPI.fetchSheet('ContentData');

        if (contentData && contentData.length > 1) {
            // 5. Update table cells
            const stats = TableContentUpdater.updateTableContent(contentData);
            console.log(`✅ ContentData: ${stats.updated}/${stats.total} cells updated`);
        } else {
            console.log('ℹ️ No ContentData found - table cells remain static');
        }

        // 6. Populate image URLs for hover preview
        setTimeout(() => {
            if (window.populateImageUrls) {
                window.populateImageUrls();
            }
        }, 500);

        console.log(`✅ Content loaded successfully!`);
        this.showNotification(`✅ Đã load nội dung từ Google Sheets`, 'success');

    } catch (error) {
        console.error('✗ Error loading content:', error);
        this.showNotification('⚠️ Không thể tải nội dung', 'error');
    }
}
```

---

### 🌐 **Step 2: GoogleSheetsAPI.fetchSheet()**

**Location:** `index.html` lines 4744-4817

#### How it works:

```javascript
async fetchSheet(sheetName) {
    // 1. Check cache first
    const cacheKey = `sheet_${sheetName}`;
    const cached = CacheManager.get(cacheKey);

    if (cached) {
        console.log(`✓ Loaded ${sheetName} from cache`);
        return cached;
    }

    try {
        // 2. Build URL to fetch published Sheet
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

        // 3. Fetch data
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();

        // 4. Parse Google Sheets JSON response
        // Format: google.visualization.Query.setResponse({...})
        let jsonString = text;
        if (text.startsWith('/*O_o*/')) {
            jsonString = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
        } else {
            jsonString = text.substring(47, text.length - 2);
        }

        const json = JSON.parse(jsonString);

        // 5. Check if data exists
        if (!json.table || !json.table.rows) {
            throw new Error('No table data found in response');
        }

        // 6. Parse to array of objects
        const data = this.parseGoogleSheetsData(json);

        // 7. Save to cache
        CacheManager.set(cacheKey, data);
        console.log(`✓ Fetched ${sheetName} from Google Sheets (${data.length} rows)`);

        return data;

    } catch (error) {
        console.error(`✗ Error fetching ${sheetName}:`, error);

        // Show helpful error messages
        if (error.message.includes('Failed to fetch')) {
            console.error('❌ CORS Error: Google Sheet chưa được publish to web!');
            console.error('📋 Hướng dẫn fix:');
            console.error('   1. Mở Google Sheet');
            console.error('   2. File → Share → Publish to web');
            console.error('   3. Sheet: "MasterData" | Format: "Web page"');
            console.error('   4. ✓ Check "Automatically republish..."');
            console.error('   5. Click "Publish" → Confirm');
        }

        return [];
    }
}
```

#### URL Format:

```
https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:json&sheet=SHEET_NAME
```

**Example:**
```
https://docs.google.com/spreadsheets/d/12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4/gviz/tq?tqx=out:json&sheet=MasterData
```

---

### 🔍 **Step 3: parseGoogleSheetsData()**

**Location:** `index.html` lines 4820-4844

```javascript
parseGoogleSheetsData(json) {
    try {
        const rows = json.table.rows;
        const cols = json.table.cols;

        // 1. Get headers from column labels
        const headers = cols.map(col => col.label || col.id || '');

        // 2. Convert to array of objects
        return rows.map(row => {
            const obj = {};
            if (row.c) {
                row.c.forEach((cell, index) => {
                    const header = headers[index] || `col_${index}`;
                    obj[header] = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
                });
            }
            return obj;
        }).filter(row => Object.keys(row).length > 0); // Remove empty rows

    } catch (error) {
        console.error('Error parsing Google Sheets data:', error);
        return [];
    }
}
```

#### Input Format (Google Sheets JSON):

```json
{
  "table": {
    "cols": [
      { "label": "term", "type": "string" },
      { "label": "definition", "type": "string" },
      { "label": "category", "type": "string" },
      { "label": "image_url", "type": "string" }
    ],
    "rows": [
      {
        "c": [
          { "v": "ONBOARD" },
          { "v": "Quy trình đăng ký" },
          { "v": "Process" },
          { "v": "https://..." }
        ]
      },
      ...
    ]
  }
}
```

#### Output Format:

```javascript
[
  {
    term: "ONBOARD",
    definition: "Quy trình đăng ký",
    category: "Process",
    image_url: "https://..."
  },
  {
    term: "GHTK",
    definition: "Giao Hàng Tiết Kiệm",
    category: "Company",
    image_url: "https://..."
  },
  ...
]
```

---

## 💾 Cache Strategy

### CacheManager

**Location:** `index.html` lines 4712-4738

```javascript
const CacheManager = {
    // Get from cache
    get(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const data = JSON.parse(item);

        // Check expiry
        if (Date.now() > data.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return data.value;
    },

    // Save to cache
    set(key, value, duration = CONFIG.CACHE_DURATION) {
        const data = {
            value: value,
            expiry: Date.now() + duration  // Default: 1 minute
        };
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Clear all cache
    clear() {
        localStorage.clear();
        console.log('🗑️ Cache cleared');
    }
};
```

### Cache Keys:

- `sheet_MasterData` → Cached MasterData
- `sheet_ContentData` → Cached ContentData

### Cache Duration:

```javascript
const CONFIG = {
    CACHE_DURATION: 1 * 60 * 1000  // 1 minute
};
```

---

## 🔄 Update Workflow

### Scenario: User sửa MasterData/ContentData Sheet

```
T0: User mở Google Sheet
    → Sửa dữ liệu trong MasterData hoặc ContentData tab
    → Google auto-save

T1: User reload page (F5 hoặc Cmd+R)
    → SheetLoader.init() chạy

T2: Check cache
    → Nếu cache < 1 phút tuổi: Load từ cache (instant)
    → Nếu cache > 1 phút: Fetch từ Sheet (2-5 giây)

T3: Fetch from Sheet
    → URL: https://docs.google.com/.../gviz/tq?tqx=out:json&sheet=MasterData
    → Parse JSON response
    → Convert to array of objects

T4: Update UI
    → MasterData → window.masterDataCache (for hover preview)
    → ContentData → TableContentUpdater.updateTableContent() (for table cells)

T5: Save to cache
    → localStorage.setItem('sheet_MasterData', ...)
    → localStorage.setItem('sheet_ContentData', ...)
```

### Timeline:

| Action | Delay | Notes |
|--------|-------|-------|
| Cache < 1 phút | **0 giây** | Load instant từ localStorage |
| Cache > 1 phút | **2-5 giây** | Fetch từ Google Sheets API |
| Force refresh | **2-5 giây** | Clear cache → Fetch mới |

---

## 🎨 Usage: MasterData vs ContentData

### 📌 **MasterData** → Hover Preview

**Used for:**
- Displaying image tooltip when hovering over colored text
- Interactive glossary terms

**Example:**
```html
<span class="interactive-term" data-term="ONBOARD">ONBOARD</span>
```

When user hovers → Show tooltip with:
- Image from `MasterData.image_url`
- Definition from `MasterData.definition`

---

### 📌 **ContentData** → Table Cells

**Used for:**
- Updating table cell content dynamically
- Keeping documentation in sync with Google Sheet

**Example:**

HTML before:
```html
<table id="table_001">
  <tr>
    <td>Static content</td>
    <td>Static content</td>
  </tr>
</table>
```

After `TableContentUpdater.updateTableContent()`:
```html
<table id="table_001">
  <tr>
    <td>VHXT - TÀI XẾ | LM - COD</td>
    <td><strong>Bước 1:</strong> Chọn truy cập...</td>
  </tr>
</table>
```

---

## 🐛 Debug Tools

### 1. Check Cache Status

```javascript
// Check if MasterData cached
console.log('MasterData cache:', localStorage.getItem('sheet_MasterData'));

// Check if ContentData cached
console.log('ContentData cache:', localStorage.getItem('sheet_ContentData'));

// Check global cache
console.log('Global MasterData:', window.masterDataCache);
```

### 2. Manual Refresh

```javascript
// Method 1: Via window API
window.SheetDB.refresh();

// Method 2: Clear cache + reload
window.SheetDB.clearCache();
location.reload();

// Method 3: Direct call
SheetLoader.init();
```

### 3. Test API Endpoint

```javascript
// Test MasterData endpoint
const sheetId = '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4';
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=MasterData`;

fetch(url)
  .then(r => r.text())
  .then(text => {
    console.log('Raw response:', text.substring(0, 500));
    // Parse manually to see structure
  });
```

### 4. Check Load Stats

```javascript
// Get stats of current data
const stats = window.SheetDB.getStats(window.masterDataCache);
console.log('MasterData stats:', stats);
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Failed to fetch" / CORS Error

**Problem:** Sheet chưa được publish to web

**Solution:**
1. Mở Google Sheet
2. File → Share → **Publish to web**
3. Sheet: Select **"MasterData"** (hoặc "ContentData")
4. Format: **"Web page"**
5. ✅ Check **"Automatically republish when changes are made"**
6. Click **Publish** → Confirm
7. Repeat cho sheet "ContentData"

**Verify:**
```javascript
// Test URL trong browser
https://docs.google.com/spreadsheets/d/12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4/gviz/tq?tqx=out:json&sheet=MasterData
```

Nếu thấy JSON data → Published thành công ✅

---

### Issue 2: Cache không update

**Problem:** User sửa Sheet nhưng frontend vẫn hiển thị data cũ

**Check:**
```javascript
// Check cache age
const cache = JSON.parse(localStorage.getItem('sheet_MasterData'));
const age = Date.now() - cache.expiry + (1 * 60 * 1000);
console.log('Cache age (minutes):', Math.floor(age / 60000));
```

**Solution:**
```javascript
// Clear cache
window.SheetDB.clearCache();
location.reload();
```

---

### Issue 3: Empty data / No rows

**Problem:** API trả về empty array

**Check:**
1. Sheet có data chưa?
2. Sheet name đúng không? (`MasterData` vs `masterdata`)
3. Sheet đã publish chưa?

**Debug:**
```javascript
GoogleSheetsAPI.fetchSheet('MasterData')
  .then(data => {
    console.log('Data length:', data.length);
    console.log('First row:', data[0]);
  });
```

---

### Issue 4: Hover preview không hoạt động

**Problem:** `window.masterDataCache` empty hoặc undefined

**Check:**
```javascript
console.log('MasterData cache:', window.masterDataCache);
console.log('Length:', window.masterDataCache?.length);
```

**Solution:**
```javascript
// Force reload MasterData
window.SheetDB.refresh();
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ USER UPDATES GOOGLE SHEET                                   │
│ - Edit MasterData tab (hover preview data)                  │
│ - Edit ContentData tab (table cell content)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Google auto-saves
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ GOOGLE SHEETS (Published to Web)                           │
│                                                             │
│ Sheet ID: 12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4     │
│                                                             │
│ Tab 1: MasterData                                           │
│ ├── term                                                    │
│ ├── definition                                              │
│ ├── category                                                │
│ └── image_url                                               │
│                                                             │
│ Tab 2: ContentData                                          │
│ ├── table_id                                                │
│ ├── section_name                                            │
│ ├── row_num                                                 │
│ ├── column_name                                             │
│ ├── content_text                                            │
│ └── content_html                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Published as JSON via gviz/tq API
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ GOOGLE SHEETS API                                           │
│                                                             │
│ URL Format:                                                 │
│ https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?   │
│   tqx=out:json&sheet=SHEET_NAME                             │
│                                                             │
│ Returns:                                                    │
│ google.visualization.Query.setResponse({                    │
│   table: {                                                  │
│     cols: [...],                                            │
│     rows: [...]                                             │
│   }                                                         │
│ })                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP GET request
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: GoogleSheetsAPI.fetchSheet()                     │
│                                                             │
│ 1. Check localStorage cache                                 │
│    - If cached & < 1 min old → Return cache (instant)       │
│                                                             │
│ 2. Fetch from API                                           │
│    - Parse JSON response                                    │
│    - Extract table.rows + table.cols                        │
│                                                             │
│ 3. parseGoogleSheetsData()                                  │
│    - Map rows to array of objects                           │
│    - Use col.label as keys                                  │
│                                                             │
│ 4. Save to cache                                            │
│    - localStorage.setItem('sheet_MasterData', ...)          │
│    - Expiry: Date.now() + 1 minute                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Data ready
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: SheetLoader.init()                               │
│                                                             │
│ Processing:                                                 │
│                                                             │
│ 1. MasterData:                                              │
│    - Store in window.masterDataCache                        │
│    - Used for hover preview tooltips                        │
│    - Trigger: window.populateImageUrls()                    │
│                                                             │
│ 2. ContentData:                                             │
│    - Pass to TableContentUpdater.updateTableContent()       │
│    - Updates table cells in HTML                            │
│    - Maps table_id + row_num + column_name → cell content   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Render to DOM
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ BROWSER DISPLAY                                             │
│                                                             │
│ 1. Hover Preview:                                           │
│    <span class="interactive-term" data-term="ONBOARD">      │
│    → Show tooltip with image from MasterData               │
│                                                             │
│ 2. Table Cells:                                             │
│    <table id="table_001">                                   │
│      <td>Content from ContentData</td>                      │
│    </table>                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Best Practices

### 1. After updating Sheets:

**Option A: Wait for cache to expire (1 minute)**
- User thấy data mới sau 1 phút

**Option B: Manual refresh**
```javascript
window.SheetDB.refresh();
```

**Option C: Hard reload browser**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 2. Ensure Sheets are published:

- File → Share → Publish to web
- ✅ Both "MasterData" AND "ContentData" tabs
- ✅ Format: "Web page"
- ✅ "Automatically republish when changes are made"

### 3. Verify data structure:

**MasterData must have:**
- `term` column
- `definition` column
- `image_url` column

**ContentData must have:**
- `table_id` column
- `row_num` column
- `column_name` column
- `content_html` or `content_text` column

---

## 📝 Summary

### ✅ MasterData:
- **Purpose:** Hover preview tooltips
- **Load time:** 2-5 giây (or instant from cache)
- **Cache:** 1 minute
- **Storage:** `window.masterDataCache` + `localStorage.sheet_MasterData`

### ✅ ContentData:
- **Purpose:** Dynamic table cell content
- **Load time:** 2-5 giây (or instant from cache)
- **Cache:** 1 minute
- **Storage:** `localStorage.sheet_ContentData`

### ✅ Auto-update:
- ❌ **NO real-time sync** (not WebSocket)
- ✅ **Cache-based** with 1-minute expiry
- ✅ User can force refresh via `window.SheetDB.refresh()`

---

**Updated:** 2025-12-29 | **Version:** 1.0.0 | **Status:** ✅ Production Ready
