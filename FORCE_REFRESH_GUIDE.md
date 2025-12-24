# 🔄 FORCE REFRESH & DEBUG GUIDE

## 🎯 Vấn đề đã giải quyết

**Tình huống:**
- Bạn cập nhật Google Sheets (thêm `vid_2_3`)
- Frontend vẫn hiển thị data cũ
- Do localStorage cache đang active

**Giải pháp:**
3 cách force refresh để tải data mới!

---

## 🚀 Cách 1: URL Parameter (Recommended)

### Sử dụng:
```
https://dtnam-oss.github.io/tai-lieu-phan-phoi/?reload=true
```

hoặc local:
```
file:///Users/mac/Desktop/tai-lieu-phan-phoi/index.html?reload=true
```

### Cách hoạt động:
1. Hệ thống detect `?reload=true` trong URL
2. Tự động xóa cache (`localStorage.removeItem('video_data_cache')`)
3. Fetch fresh data từ Google Sheets API
4. Render lại tất cả videos
5. Remove `?reload=true` khỏi URL (clean URL)

### Console output:
```
🔄 Force reload detected (?reload=true)
🚀 Force Refresh initiated...
✅ Cache cleared
🚀 Đã xóa cache và tải dữ liệu mới từ Sheet!
📊 Loaded 3 videos
```

---

## 🔘 Cách 2: Refresh Button (UI)

### Vị trí:
Góc dưới bên phải màn hình (fixed position)

### Hình dạng:
- Nút tròn màu xanh GHTK
- Icon refresh (mũi tên xoay tròn)
- Opacity: 0.7 (hover: 1)
- Tooltip: "Force Refresh Videos"

### Interactions:
- **Hover:** Scale(1.1) + rotate 90°
- **Click:** Spinning animation
- **Success:** Flash green (#10b981)
- **Error:** Flash red (#ef4444)

### Demo:
```
[Refresh Button]
     ↓
  [Click]
     ↓
[Spinning animation 800ms]
     ↓
[Success: Green flash]
     ↓
[Videos re-rendered]
```

---

## 💻 Cách 3: Console Commands

### Command 1: Force Refresh
```javascript
forceRefreshVideos()
```

**Output:**
```
🚀 Force Refresh initiated...
✅ Cache cleared
🚀 Đã xóa cache và tải dữ liệu mới từ Sheet!
📊 Loaded 3 videos
```

### Command 2: Check Status
```javascript
checkVideoStatus()
```

**Output:**
```
════════════════════════════════════════════════════════════════════════════════
🔍 VIDEO DATA STATUS CHECK
════════════════════════════════════════════════════════════════════════════════
📦 Data Source: CACHE (localStorage)
⏰ Cache Age: 2 minutes ago
📊 Videos in Cache: 3
🔄 Cache Status: ✅ Fresh

📹 Videos loaded:
  1. vid_2_1 - 2.1. CHUẨN HÓA KHO (cloudinary)
  2. vid_2_2 - 2.2. CHUẨN HÓA KHO (streamable)
  3. vid_2_3 - 2.3. ONBOARD (youtube)

🔗 API Endpoint: https://script.google.com/macros/s/AKfycb...
💡 Force Refresh: Add ?reload=true to URL or click refresh button
════════════════════════════════════════════════════════════════════════════════
```

### Command 3: Direct Access
```javascript
VideoDatabase.forceRefresh()  // Advanced
VideoDatabase.checkDataStatus()  // Advanced
```

---

## 🔧 Platform Support (Mới!)

Hệ thống giờ hỗ trợ nhiều video platforms:

### Supported Platforms:

#### 1. **Cloudinary** 
```javascript
{
  platform: "cloudinary",
  video_url: "https://res.cloudinary.com/..."
}
```
- Autoplay enabled
- Accelerometer + gyroscope support

#### 2. **Streamable**
```javascript
{
  platform: "streamable",
  video_url: "https://streamable.com/e/abc123"
}
```
- Embed format tự động
- Default settings

#### 3. **YouTube**
```javascript
{
  platform: "youtube",
  video_url: "https://www.youtube.com/embed/abc123"
}
```
- Picture-in-picture support
- Accelerometer + gyroscope

#### 4. **Vimeo**
```javascript
{
  platform: "vimeo",
  video_url: "https://player.vimeo.com/video/123456"
}
```
- Standard Vimeo player

#### 5. **Generic/Other**
```javascript
{
  platform: "other",
  video_url: "https://..."
}
```
- Fallback for any platform

### Console Output khi load:
```
🎥 Loading video: Tutorial 1 [Platform: cloudinary]
📹 Cloudinary video - autoplay enabled
✅ Video loaded: Tutorial 1 (cloudinary)
```

---

## 🐛 Debug Workflow

### Scenario 1: Thêm video mới vào Sheet

**Bước 1:** Update Google Sheets
```
VideoData tab:
- Row 4: vid_2_3 | 2.3. ONBOARD | https://... | streamable
```

**Bước 2:** Force Refresh (chọn 1 trong 3 cách)
- Option A: Add `?reload=true` to URL
- Option B: Click refresh button
- Option C: Run `forceRefreshVideos()` in console

**Bước 3:** Verify
```javascript
checkVideoStatus()
// Should show: 📊 Videos in Cache: 3
```

---

### Scenario 2: Video không hiển thị

**Step 1: Check Console**
```
F12 → Console tab
```

**Step 2: Run Debug**
```javascript
checkVideoStatus()
```

**Check output:**
- **Data Source:** Cache hay Live API?
- **Cache Age:** Có quá cũ không? (>5 phút = stale)
- **Video Count:** Có đủ videos không?
- **Cache Status:** Fresh hay Stale?

**Step 3: Force Refresh**
```javascript
forceRefreshVideos()
```

**Step 4: Check lại**
```javascript
checkVideoStatus()
```

---

### Scenario 3: API Error

**Nếu thấy lỗi:**
```
❌ Failed to load videos: HTTP 403: Forbidden
```

**Alert popup sẽ hiện:**
```
❌ Lỗi khởi tạo hệ thống video:

HTTP 403: Forbidden

Vui lòng kiểm tra:
1. Google Apps Script API URL
2. Kết nối internet
3. Console (F12) để xem chi tiết
```

**Troubleshooting:**
1. Check API URL: `VideoDatabase.API_URL`
2. Test API directly: 
   ```bash
   curl "https://script.google.com/macros/s/..."
   ```
3. Verify Google Apps Script deployment:
   - Execute as: "Me"
   - Access: "Anyone"

---

## 📊 Cache Strategy

### Timeline:

```
┌─────────────────────────────────────────────────┐
│ Time: 0min          Cache: EMPTY                │
│ Action: First visit                             │
│ Result: Fetch from API → Save to cache         │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│ Time: 1min          Cache: FRESH                │
│ Action: Page reload                             │
│ Result: Load from cache (instant)              │
│         Background: Check API for updates       │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│ Time: 5min          Cache: OPTIMAL              │
│ Action: Page reload                             │
│ Result: Load from cache + revalidate           │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│ Time: 60min         Cache: STALE                │
│ Action: Page reload                             │
│ Result: Clear cache → Fetch fresh              │
└─────────────────────────────────────────────────┘
```

### Cache Key:
```javascript
localStorage.getItem('video_data_cache')
```

### Cache Structure:
```json
{
  "data": [
    {
      "element_id": "vid_2_1",
      "category": "2.1. CHUẨN HÓA KHO",
      "video_url": "https://...",
      "platform": "cloudinary",
      "thumbnail": "https://..."
    }
  ],
  "timestamp": 1703414400000
}
```

---

## 🎨 Refresh Button Styling

### CSS Specs:
```css
Position: Fixed (bottom: 24px, right: 24px)
Size: 48px × 48px (circle)
Background: linear-gradient(135deg, #00b14f, #009944)
Shadow: 0 4px 12px rgba(0,177,79,0.3)
Opacity: 0.7 (hover: 1.0)
Z-index: 9999

Hover:
- Scale: 1.1
- Rotate: 90deg
- Shadow: 0 6px 20px rgba(0,177,79,0.4)

Active (Click):
- Scale: 0.95
- Rotate: 180deg

Spinning (Loading):
- Animation: 360deg rotation, 1s infinite
```

### Icon:
Material Design refresh icon (SVG):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
</svg>
```

---

## 🔑 Quick Reference

### Update Video Data:

```
1. Open Google Sheets
   ↓
2. Update VideoData tab
   ↓
3. Force Refresh (pick one):
   - Add ?reload=true to URL
   - Click refresh button
   - Run forceRefreshVideos()
   ↓
4. Verify with checkVideoStatus()
```

### Console Commands:

| Command | Function |
|---------|----------|
| `checkVideoStatus()` | Show data source & video list |
| `forceRefreshVideos()` | Clear cache & reload |
| `VideoDatabase.API_URL` | Show API endpoint |
| `VideoDatabase.getCache()` | View cache data |
| `localStorage.removeItem('video_data_cache')` | Manual cache clear |

### Error Codes:

| Error | Meaning | Solution |
|-------|---------|----------|
| `HTTP 403` | Permission denied | Check Apps Script access |
| `HTTP 404` | API not found | Verify API URL |
| `HTTP 500` | Server error | Check Apps Script code |
| `CORS error` | Cross-origin blocked | Apps Script should auto-handle |
| `Cache null` | No cached data | Normal on first visit |

---

## 📝 Testing Checklist

- [ ] Add video to Google Sheets
- [ ] Try Method 1: `?reload=true` in URL
- [ ] Check console output
- [ ] Try Method 2: Click refresh button
- [ ] Verify spinning animation
- [ ] Try Method 3: `forceRefreshVideos()` command
- [ ] Run `checkVideoStatus()` to verify
- [ ] Check video count increased
- [ ] Test different platforms (cloudinary, streamable, youtube)
- [ ] Verify platform-specific console logs

---

## 🚀 Production Usage

### For End Users:
- Refresh button always visible
- Click to reload if content not updating

### For Developers:
- Use `?reload=true` during development
- Run `checkVideoStatus()` for debugging
- Check console for platform-specific logs

### For Content Managers:
1. Update Google Sheets
2. Wait 5 minutes (automatic revalidation)
3. Or: Share URL with `?reload=true` to users for immediate update

---

**Last updated:** 2025-12-24  
**Version:** 2.0  
**Features:** Force Refresh, Debug Tools, Multi-Platform Support
