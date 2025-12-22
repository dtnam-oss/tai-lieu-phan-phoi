# 🖼️ Hướng Dẫn Image Preview - Hiển Thị Hình Ảnh Khi Hover

## Tổng Quan

Hệ thống đã được nâng cấp với tính năng **Image Preview** - hiển thị hình ảnh tự động khi người dùng di chuột vào các khối được tô màu (interactive terms).

---

## ✨ Tính Năng

### 1. **Hover Preview**
- Di chuột vào bất kỳ **interactive term** nào (text được tô màu)
- Sau **500ms**, hình ảnh sẽ tự động hiển thị
- Hình ảnh theo chuột khi di chuyển
- Tự động ẩn khi rời chuột

### 2. **Smart Loading**
- Hiển thị trạng thái "⏳ Đang tải..." khi load hình
- Hiển thị lỗi "❌ Không thể tải hình ảnh" nếu fail
- Fade-in animation mượt mà
- Tự động điều chỉnh vị trí để không bị tràn màn hình

### 3. **Database Integration**
- Tự động lấy URL hình ảnh từ Google Sheets
- Ưu tiên URL từ database trước
- Fallback sang URL trong HTML nếu không có data

---

## 🎨 CSS Styles Đã Thêm

```css
/* Image Preview Tooltip - Hover effect */
.image-preview-tooltip {
    position: fixed;
    background: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 10001;
    padding: 8px;
    max-width: 500px;
    max-height: 500px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.image-preview-tooltip.show {
    opacity: 1;
}

.image-preview-tooltip img {
    display: block;
    max-width: 100%;
    max-height: 450px;
    width: auto;
    height: auto;
    border-radius: 4px;
    object-fit: contain;
}

.image-preview-loading {
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
}

.image-preview-error {
    padding: 1rem;
    text-align: center;
    color: #e74c3c;
    font-size: 0.9rem;
}
```

**Đặc điểm:**
- `z-index: 10001`: Cao hơn tooltip thông thường (10000)
- `pointer-events: none`: Không chặn hover events
- `max-width/max-height: 500px/450px`: Giới hạn kích thước
- `object-fit: contain`: Giữ tỷ lệ hình ảnh
- Fade-in animation với `opacity` transition

---

## 🔧 JavaScript Implementation

### Cấu Trúc Code

```javascript
function initHighlightedTerms() {
    const interactiveTerms = document.querySelectorAll('.interactive-term');
    let currentTooltip = null;
    let imagePreview = null;      // ← New: Track image preview
    let hoverTimer = null;        // ← New: Delay timer

    interactiveTerms.forEach(term => {
        // Existing: Click event for tooltip
        term.addEventListener('click', function(e) { ... });

        // NEW: Hover event for image preview
        term.addEventListener('mouseenter', function(e) {
            const termId = this.getAttribute('data-term-id');
            const imageUrl = this.getAttribute('data-image-url');
            
            // Delay 500ms before showing
            hoverTimer = setTimeout(() => {
                showImagePreview(termId, imageUrl, e);
            }, 500);
        });

        term.addEventListener('mousemove', function(e) {
            if (imagePreview && imagePreview.classList.contains('show')) {
                positionImagePreview(imagePreview, e);
            }
        });

        term.addEventListener('mouseleave', function() {
            clearTimeout(hoverTimer);
            hideImagePreview();
        });
    });
}
```

### Key Functions

#### 1. `showImagePreview(termId, imageUrl, event)`
```javascript
function showImagePreview(termId, imageUrl, event) {
    // 1. Get URL from database first
    const dbData = window.SheetDB.getMasterData();
    let finalUrl = imageUrl;
    
    if (dbData && dbData.length > 0) {
        const termData = dbData.find(row => row.id_the === termId);
        if (termData && termData.url) {
            finalUrl = termData.url;
        }
    }

    // 2. Validate image URL
    if (!finalUrl || !isImageUrl(finalUrl)) {
        return; // Don't show if not image
    }

    // 3. Create preview tooltip
    imagePreview = document.createElement('div');
    imagePreview.className = 'image-preview-tooltip';
    imagePreview.innerHTML = '<div class="image-preview-loading">⏳ Đang tải...</div>';
    document.body.appendChild(imagePreview);

    // 4. Position preview
    positionImagePreview(imagePreview, event);

    // 5. Load image
    const img = new Image();
    img.onload = function() {
        if (imagePreview) {
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);
            setTimeout(() => imagePreview.classList.add('show'), 10);
        }
    };
    img.onerror = function() {
        if (imagePreview) {
            imagePreview.innerHTML = '<div class="image-preview-error">❌ Không thể tải hình ảnh</div>';
        }
    };
    img.src = finalUrl;
}
```

#### 2. `isImageUrl(url)`
```javascript
function isImageUrl(url) {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('image') || 
           lowerUrl.includes('imgur') || 
           lowerUrl.includes('cloudinary');
}
```

**Kiểm tra:**
- File extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`
- Keywords: `image`, `imgur`, `cloudinary`

#### 3. `positionImagePreview(preview, event)`
```javascript
function positionImagePreview(preview, event) {
    const padding = 20;
    let left = event.clientX + padding;
    let top = event.clientY + padding;

    const previewRect = preview.getBoundingClientRect();

    // Adjust if goes off right edge
    if (left + previewRect.width > window.innerWidth - padding) {
        left = event.clientX - previewRect.width - padding;
    }

    // Adjust if goes off bottom edge
    if (top + previewRect.height > window.innerHeight - padding) {
        top = window.innerHeight - previewRect.height - padding;
    }

    // Keep within bounds
    left = Math.max(padding, left);
    top = Math.max(padding, top);

    preview.style.left = left + 'px';
    preview.style.top = top + 'px';
}
```

**Smart positioning:**
- Default: Bên phải + dưới con trỏ chuột (+20px)
- Nếu tràn phải: Hiển thị bên trái
- Nếu tràn dưới: Hiển thị phía trên
- Luôn giữ trong viewport với padding 20px

---

## 📊 Cách Sử Dụng

### Bước 1: Thêm URL Hình Ảnh Vào Google Sheets

Trong Google Sheets **MasterData**, cột **`url`** cần chứa link hình ảnh:

| hang_muc | id_the | ten_the | url |
|----------|--------|---------|-----|
| VẬN HÀNH | term-code-001 | Nút Tạo Đơn | https://example.com/image.png |
| ĐĂNG ĐƠN | term-blue-005 | Trường Địa Chỉ | https://i.imgur.com/abc123.jpg |

### Bước 2: Publish Google Sheets

1. File → Share → Publish to web
2. Sheet: **MasterData**
3. Format: **CSV**
4. Copy Sheet ID

### Bước 3: Cập Nhật CONFIG

```javascript
const CONFIG = {
    SHEET_ID: 'YOUR_SHEET_ID_HERE',
    SHEET_NAME: 'MasterData'
};
```

### Bước 4: Test

1. Mở trang web
2. Hover vào bất kỳ **interactive term** (text tô màu)
3. Đợi 500ms
4. Hình ảnh sẽ hiển thị nếu URL hợp lệ

---

## 🎯 URL Formats Được Hỗ Trợ

### ✅ Valid Image URLs

```
✓ https://example.com/image.png
✓ https://example.com/photo.jpg
✓ https://i.imgur.com/abc123.jpg
✓ https://res.cloudinary.com/xyz/image/upload/v123/file.png
✓ https://cdn.example.com/images/screenshot.webp
✓ https://example.com/api/get?type=image&id=123
```

### ❌ Invalid URLs

```
✗ https://example.com/document.pdf
✗ https://example.com/page
✗ (empty string)
✗ https://example.com/video.mp4
```

---

## 🔄 Workflow Diagram

```
User Hover → Wait 500ms → Check Database → Validate URL → Show Preview
     ↓                           ↓               ↓              ↓
  Start Timer          Get URL from Sheet   isImageUrl()   Load Image
                                                                ↓
                                                          Show Loading
                                                                ↓
                                                       Image Loaded?
                                                        ↙         ↘
                                                   ✓ Yes        ✗ No
                                                      ↓            ↓
                                                Display Img   Show Error
```

---

## 🎨 Example Scenarios

### Scenario 1: Hình Ảnh Từ Google Sheets

**Data:**
```csv
hang_muc,id_the,ten_the,url
VẬN HÀNH,term-code-050,Màn hình tạo đơn,https://i.imgur.com/abc123.jpg
```

**Behavior:**
1. Hover vào `term-code-050`
2. Wait 500ms
3. Fetch URL from database: `https://i.imgur.com/abc123.jpg`
4. Validate: ✓ Contains `.jpg`
5. Show loading → Load image → Display

### Scenario 2: Không Có URL

**Data:**
```csv
hang_muc,id_the,ten_the,url
VẬN HÀNH,term-code-051,Nút Submit,
```

**Behavior:**
1. Hover vào `term-code-051`
2. Wait 500ms
3. Fetch URL from database: `""` (empty)
4. Validate: ✗ No URL
5. **No preview shown** (return early)

### Scenario 3: URL Không Phải Hình Ảnh

**Data:**
```csv
hang_muc,id_the,ten_the,url
VẬN HÀNH,term-code-052,Hướng dẫn,https://docs.google.com/document/xyz
```

**Behavior:**
1. Hover vào `term-code-052`
2. Wait 500ms
3. Fetch URL: `https://docs.google.com/document/xyz`
4. Validate: ✗ Not image URL
5. **No preview shown**

---

## 🐛 Troubleshooting

### Vấn đề 1: Hình không hiển thị

**Nguyên nhân:**
- URL không hợp lệ
- URL không chứa extension hình ảnh
- CORS policy block
- Image 404

**Giải pháp:**
1. Kiểm tra URL trong Google Sheets
2. Test URL trực tiếp trong browser
3. Đảm bảo image có extension: `.jpg`, `.png`, etc.
4. Sử dụng image hosting: Imgur, Cloudinary
5. Mở Console để xem errors

### Vấn đề 2: Preview bị chậm

**Nguyên nhân:**
- Image size quá lớn
- Network slow
- Many images loading simultaneously

**Giải pháp:**
1. Compress images before upload
2. Use CDN
3. Optimize image size (max 500KB recommended)
4. Increase hover delay from 500ms to 1000ms:
   ```javascript
   hoverTimer = setTimeout(() => {
       showImagePreview(termId, imageUrl, e);
   }, 1000); // Increase to 1 second
   ```

### Vấn đề 3: Preview bị tràn màn hình

**Nguyên nhân:**
- Image quá lớn
- Viewport nhỏ (mobile)

**Giải pháp:**
- CSS đã có `max-width: 500px` và `max-height: 450px`
- Smart positioning tự động điều chỉnh
- Nếu vẫn tràn, giảm max-width:
  ```css
  .image-preview-tooltip {
      max-width: 300px;
      max-height: 300px;
  }
  ```

---

## 📱 Responsive Behavior

### Desktop (> 768px)
- Preview max-width: **500px**
- Preview max-height: **450px**
- Padding: **20px**
- Hover delay: **500ms**

### Tablet (768px - 1024px)
- Same as desktop
- May need to reduce max-width to 400px

### Mobile (< 768px)
- ⚠️ **Hover không hoạt động trên touch devices**
- Chỉ có click tooltip (existing feature)

**Future Enhancement:**
```javascript
// Detect touch device
const isTouchDevice = 'ontouchstart' in window;

if (!isTouchDevice) {
    // Add hover events
    term.addEventListener('mouseenter', ...);
}
```

---

## 🚀 Performance Considerations

### 1. **Lazy Loading**
- Image chỉ load khi hover
- Không preload tất cả images
- Memory efficient

### 2. **Throttling**
- 500ms delay trước khi show preview
- Tránh spam requests khi di chuột nhanh

### 3. **Cleanup**
- `hideImagePreview()` remove element khỏi DOM
- `clearTimeout(hoverTimer)` khi mouseleave
- Không leak memory

### 4. **Z-Index Hierarchy**
```
Navigation: z-index: 100
Tooltip: z-index: 10000
Image Preview: z-index: 10001  ← Highest
```

---

## 🔮 Future Enhancements

### 1. **Image Zoom**
```javascript
imagePreview.addEventListener('click', function() {
    // Open lightbox with full-size image
    openLightbox(img.src);
});
```

### 2. **Multiple Images**
```javascript
// Support array of URLs
if (termData && termData.urls && Array.isArray(termData.urls)) {
    // Show image carousel
    showImageCarousel(termData.urls);
}
```

### 3. **Video Preview**
```javascript
function isVideoUrl(url) {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('youtube');
}
```

### 4. **Preloading**
```javascript
// Preload images for visible terms
const visibleTerms = getVisibleTerms();
preloadImages(visibleTerms);
```

---

## 📝 Summary

### Đã Implement:
- ✅ Hover detection với 500ms delay
- ✅ Database integration (Google Sheets)
- ✅ URL validation (image extensions + keywords)
- ✅ Loading states (loading, error, success)
- ✅ Smart positioning (auto-adjust cho viewport)
- ✅ Smooth animations (fade-in)
- ✅ Cleanup on mouseleave

### Cần Làm Tiếp:
- ⏳ Tạo Google Sheet với data thật
- ⏳ Upload sample images lên hosting
- ⏳ Test với real data
- ⏳ Optimize cho mobile (touch events)
- ⏳ Add error logging

---

## 🎓 Testing Checklist

- [ ] Hover vào term → Preview hiển thị sau 500ms
- [ ] Di chuột trong term → Preview theo chuột
- [ ] Mouseleave → Preview ẩn ngay lập tức
- [ ] URL hợp lệ → Image load thành công
- [ ] URL không hợp lệ → Không show preview
- [ ] Image load chậm → Show "Đang tải..."
- [ ] Image 404 → Show "Không thể tải hình ảnh"
- [ ] Preview ở edge phải → Auto move sang trái
- [ ] Preview ở bottom → Auto move lên trên
- [ ] Click vào term → Tooltip vẫn hoạt động bình thường
- [ ] Multiple terms → Mỗi term show preview riêng
- [ ] Close tooltip → Preview không ảnh hưởng

---

**🎉 Ready to Use!** Hệ thống image preview đã hoàn chỉnh và sẵn sàng test với data thật.
