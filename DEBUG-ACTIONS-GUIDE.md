# 🐛 Debug Guide - Actions & Events

## 📋 Vấn đề cần kiểm tra:

1. ✅ **Image Hover** - Hiển thị preview khi hover vào text màu
2. ✅ **Video Loading** - Load videos từ Google Sheets
3. ✅ **Content Updates** - Cập nhật nội dung động
4. ❌ **Refresh Button** - Action ép load dữ liệu không hoạt động

---

## 🔍 Kiểm tra từng chức năng:

### 1. Image Hover Preview

**Cách test:**
1. Mở Console (F12)
2. Chạy lệnh:
   ```javascript
   debugHover();
   ```

**Kết quả mong đợi:**
```
🐛 DEBUG HOVER - Starting diagnostic...
✅ Interactive terms found: 305
✅ MasterData loaded: 305 items
✅ Hover events attached
💡 Hover over any colored text to see image preview!
```

**Nếu không hoạt động:**

**Nguyên nhân 1:** MasterData chưa load
```javascript
// Kiểm tra
console.log('MasterData:', window.MasterData);
console.log('Items:', window.MasterData ? Object.keys(window.MasterData).length : 0);
```

**Fix:**
```javascript
// Force reload Master Data
SheetLoader.loadData();
```

**Nguyên nhân 2:** Terms không có class `interactive-term`
```javascript
// Kiểm tra
document.querySelectorAll('.interactive-term').length
```

**Fix:** Chạy lại `initInteractiveGlossary()`

---

### 2. Video Database - Load & Refresh

**API Endpoint hiện tại:**
```
https://script.google.com/macros/s/AKfycbxtZR53gl69WcSPmMszdidycjU7b4gLzS9S4GT6uxb2iE5XszhxMVmTV5Ub1Gt8jntHhA/exec
```

**Cách test:**

#### Test 1: Kiểm tra trạng thái cache
```javascript
VideoDatabase.checkDataStatus();
```

**Kết quả mong đợi:**
```
================================================================================
🔍 VIDEO DATA STATUS CHECK
================================================================================
📦 Data Source: CACHE (localStorage)
⏰ Cache Age: 2 minutes ago
📊 Videos in Cache: 15
🔄 Cache Status: ✅ Fresh

📹 Videos loaded:
  1. vid_1 - Section 1 Video (youtube)
  2. vid_2_1 - Section 2.1 Video (youtube)
  ...

🔗 API Endpoint: https://script.google.com/...
💡 Force Refresh: Add ?reload=true to URL or click refresh button
```

#### Test 2: Test API trực tiếp
```javascript
fetch('https://script.google.com/macros/s/AKfycbxtZR53gl69WcSPmMszdidycjU7b4gLzS9S4GT6uxb2iE5XszhxMVmTV5Ub1Gt8jntHhA/exec')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e));
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": [
    {
      "element_id": "vid_1",
      "category": "Section 1 Video",
      "platform": "youtube",
      "video_id": "abc123",
      "thumbnail": "...",
      "title": "..."
    },
    ...
  ]
}
```

**Nếu lỗi 404 hoặc 500:**
- ✅ Kiểm tra Apps Script đã deploy chưa
- ✅ Kiểm tra URL có đúng không
- ✅ Kiểm tra Sheet có tồn tại không

#### Test 3: Force Refresh
```javascript
// Method 1: Via button
document.getElementById('refreshButton').click();

// Method 2: Via function
VideoDatabase.forceRefresh();

// Method 3: Via URL
window.location.href = '?reload=true';
```

**Kết quả mong đợi:**
```
🚀 Force Refresh initiated...
✅ Cache cleared
🌐 Fetching videos from Google Sheets...
✅ Fetched 15 videos from Google Sheets
🎬 Rendering 15 videos...
✅ Rendered vid_1
✅ Rendered vid_2_1
...
```

---

### 3. Refresh Button Debug

**Vấn đề:** Button không hoạt động

**Cách kiểm tra:**

#### Check 1: Button có tồn tại không?
```javascript
const btn = document.getElementById('refreshButton');
console.log('Button exists:', !!btn);
console.log('Button element:', btn);
```

**Kết quả mong đợi:**
```
Button exists: true
Button element: <div class="refresh-button" id="refreshButton">...</div>
```

#### Check 2: Event listener đã gắn chưa?
```javascript
// Xem tất cả events
getEventListeners(document.getElementById('refreshButton'));
```

**Kết quả mong đợi:**
```
{
  click: [
    {
      listener: function() { ... },
      useCapture: false,
      once: false
    }
  ]
}
```

#### Check 3: Test click manually
```javascript
const btn = document.getElementById('refreshButton');
btn.click();
// Hoặc trigger event thủ công
btn.dispatchEvent(new Event('click'));
```

**Nếu không có phản ứng:**

**Nguyên nhân 1:** `initRefreshButton()` chưa chạy
```javascript
// Check
console.log('initRefreshButton executed:', typeof initRefreshButton === 'function');

// Fix: Chạy lại
initRefreshButton();
```

**Nguyên nhân 2:** VideoDatabase không tồn tại
```javascript
// Check
console.log('VideoDatabase:', typeof VideoDatabase);
console.log('forceRefresh:', typeof VideoDatabase.forceRefresh);

// Fix: Reload page
location.reload();
```

**Nguyên nhân 3:** API_URL sai hoặc không accessible
```javascript
// Test API
fetch(VideoDatabase.API_URL)
  .then(r => {
    console.log('API Status:', r.status);
    return r.json();
  })
  .then(d => console.log('API Data:', d))
  .catch(e => console.error('API Error:', e));
```

---

### 4. Content Updates (Dynamic Data)

**Hệ thống SheetLoader:**

#### Test SheetLoader
```javascript
// Check status
console.log('SheetLoader:', SheetLoader);
console.log('Config:', SheetLoader.CONFIG);

// Force reload
SheetLoader.loadData();
```

**Kết quả mong đợi:**
```
🔄 Loading data from Google Sheets...
✅ Data loaded: 305 items
✅ Interactive glossary initialized
✅ Hover events attached
```

#### Check Master Data
```javascript
// Xem toàn bộ data
console.table(window.MasterData);

// Hoặc xem một item cụ thể
console.log(window.MasterData['ONBOARD']);
```

**Kết quả mong đợi:**
```
{
  "ONBOARD": {
    term: "ONBOARD",
    definition: "Quy trình đăng ký...",
    category: "...",
    image_url: "https://..."
  },
  ...
}
```

---

## 🔧 Quick Fixes

### Fix 1: Refresh Button không hoạt động

**Solution A: Re-initialize manually**
```javascript
// Xóa event listener cũ (nếu có)
const oldBtn = document.getElementById('refreshButton');
const newBtn = oldBtn.cloneNode(true);
oldBtn.parentNode.replaceChild(newBtn, oldBtn);

// Gắn lại event
newBtn.addEventListener('click', async function() {
    this.classList.add('spinning');
    try {
        await VideoDatabase.forceRefresh();
        this.classList.remove('spinning');
        this.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        setTimeout(() => {
            this.style.background = 'linear-gradient(135deg, #00b14f, #009944)';
        }, 1000);
    } catch (error) {
        console.error('Refresh failed:', error);
        this.classList.remove('spinning');
        this.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }
});

console.log('✅ Refresh button re-initialized');
```

**Solution B: Direct force refresh**
```javascript
// Bypass button, direct call
async function manualRefresh() {
    console.log('🚀 Manual refresh starting...');
    localStorage.removeItem('video_data_cache');
    await VideoDatabase.getData();
    location.reload();
}

manualRefresh();
```

### Fix 2: Videos không load

**Check API endpoint:**
```javascript
// Test với timeout
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

fetch(VideoDatabase.API_URL, { signal: controller.signal })
  .then(r => r.json())
  .then(d => {
    clearTimeout(timeout);
    console.log('✅ API working:', d);
  })
  .catch(e => {
    clearTimeout(timeout);
    console.error('❌ API failed:', e.message);
  });
```

**Nếu timeout hoặc CORS:**
- API có thể đang down
- Cần check Google Apps Script deployment
- Xem file `google-apps-script.js` để redeploy

### Fix 3: Hover preview không hiện

**Force re-attach events:**
```javascript
// Re-initialize glossary
function forceReinitGlossary() {
    console.log('🔄 Re-initializing interactive glossary...');

    // Clear old tooltips
    document.querySelectorAll('.tooltip').forEach(t => t.remove());

    // Re-attach events
    const terms = document.querySelectorAll('.interactive-term');
    console.log(`Found ${terms.length} terms`);

    let hoverTimer = null;

    terms.forEach(term => {
        // Remove old listeners
        const newTerm = term.cloneNode(true);
        term.parentNode.replaceChild(newTerm, term);

        // Add new listeners
        newTerm.addEventListener('mouseenter', function(e) {
            clearTimeout(hoverTimer);
            const termText = this.getAttribute('data-term');
            const termData = window.MasterData[termText];

            if (termData && termData.image_url) {
                hoverTimer = setTimeout(() => {
                    showTooltip(this, termData);
                }, 300);
            }
        });

        newTerm.addEventListener('mouseleave', function() {
            clearTimeout(hoverTimer);
            hideTooltip();
        });
    });

    console.log('✅ Glossary re-initialized');
}

forceReinitGlossary();
```

---

## 📊 Debug Checklist

Khi có vấn đề, chạy lần lượt:

```javascript
// 1. Check environment
console.log('VideoDatabase:', typeof VideoDatabase);
console.log('SheetLoader:', typeof SheetLoader);
console.log('MasterData:', typeof window.MasterData);

// 2. Check data
VideoDatabase.checkDataStatus();

// 3. Check refresh button
const btn = document.getElementById('refreshButton');
console.log('Button exists:', !!btn);
console.log('Has click listener:', getEventListeners(btn).click?.length > 0);

// 4. Test API
fetch(VideoDatabase.API_URL).then(r=>r.json()).then(console.log).catch(console.error);

// 5. Check hover
debugHover();
```

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `VideoDatabase is not defined` | Script chưa load | Reload page |
| `fetch failed` | API down hoặc CORS | Check Apps Script deployment |
| `Cache is empty` | Lần đầu load | Bình thường, sẽ fetch từ API |
| `Slot not found: vid_X` | HTML thiếu slot | Thêm `<div id="vid_X" class="video-slot"></div>` |
| `MasterData is undefined` | SheetLoader failed | Check Sheet URL và deployment |
| `Button không phản ứng` | Event listener chưa gắn | Chạy `initRefreshButton()` |

---

## 🎯 Testing Workflow

```
1. Open Console (F12)
   ↓
2. Run: VideoDatabase.checkDataStatus()
   → Verify data loaded
   ↓
3. Run: debugHover()
   → Verify hover working
   ↓
4. Click Refresh Button
   → Should see spinning animation
   → Should fetch new data
   ↓
5. Hover over colored text
   → Should see image preview
   ↓
6. Check videos rendered
   → Browser mockups should show
```

---

**Cập nhật:** 2025-12-24 | **Version:** 1.0.0
