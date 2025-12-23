# Hướng dẫn lấy Direct URL từ Cloudinary

## 🚀 Quick Start

### 1. Upload ảnh lên Cloudinary

**Option A: Qua Web Interface**
```
1. Vào: https://console.cloudinary.com/console/media_library
2. Click "Upload" hoặc drag & drop
3. Đợi upload hoàn tất
```

**Option B: Qua Upload Widget** (như trong screenshot)
```
1. Mở Upload Widget
2. Select files
3. Click "Save Template" sau khi upload xong
```

### 2. Lấy Direct URL

#### Cách 1: Từ Media Library (Recommended)
```
1. Mở Media Library: https://console.cloudinary.com/console/media_library
2. Tìm ảnh vừa upload
3. Click vào ảnh
4. Panel bên phải → tìm "Copy URL"
5. Chọn URL format: "Original" hoặc "Auto"
```

#### Cách 2: Từ Upload Response
Sau khi upload xong, ở góc trên cùng có option "Copy Link" → Copy đó là Direct URL

#### Cách 3: Build URL thủ công
```
Format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}

Ví dụ:
- Cloud name: dtnam-cloud
- Public ID: products/shoe-001
- Format: jpg

→ URL: https://res.cloudinary.com/dtnam-cloud/image/upload/products/shoe-001.jpg
```

## 📝 Format URL của Cloudinary

### URL cơ bản:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1234567890/filename.jpg
```

### URL với transformations (Tối ưu hóa):
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_800,q_auto,f_auto/v1234567890/filename.jpg
```

### Các transformation hay dùng:

**1. Resize:**
```
w_800        → width 800px
h_600        → height 600px
w_800,h_600,c_fill → fill (crop để fit)
w_800,h_600,c_fit  → fit (không crop, giữ tỷ lệ)
```

**2. Quality & Format:**
```
q_auto       → auto quality (giảm size, giữ chất lượng)
f_auto       → auto format (WebP cho browser hỗ trợ)
q_80         → quality 80%
```

**3. Effects:**
```
e_sharpen       → làm sắc nét
e_blur:300      → blur
r_10            → border radius 10px
```

**Ví dụ hoàn chỉnh:**
```
https://res.cloudinary.com/dtnam-cloud/image/upload/w_800,h_600,c_fill,q_auto,f_auto/products/shoe-001.jpg
```

## 🎯 Best Practices cho Hover Preview

### URL tối ưu cho hover:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_400,q_auto,f_auto/image_name.jpg
```

**Tại sao?**
- `w_400`: Đủ lớn cho preview, không quá nặng
- `q_auto`: Tự động optimize quality
- `f_auto`: WebP cho modern browsers (nhẹ hơn 30%)

### Với video:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/w_400,q_auto/video_name.mp4
```

## ⚡ Workflow đề xuất

### Bước 1: Upload batch
```
1. Vào Media Library
2. Upload tất cả ảnh cùng lúc (có thể drag & drop multiple files)
3. Organize vào folders (optional)
```

### Bước 2: Copy URLs
```
1. Click vào từng ảnh
2. Copy URL với transformation:
   https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_400,q_auto,f_auto/PUBLIC_ID.jpg
3. Paste vào Google Sheets column D
```

### Bước 3: Test
```
1. Mở test-url.html
2. Paste URL
3. Verify ảnh load được
```

## 🔧 Troubleshooting

### ❌ Lỗi: "Access Denied" hoặc ảnh không hiển thị
**Giải pháp:**
1. Check settings: Console → Settings → Security
2. Đảm bảo "Restricted media types" KHÔNG block image/video
3. Enable "Resource list" = Public

### ❌ URL quá dài
**Giải pháp:** Dùng named transformations
```
1. Settings → Transformations → Add named transformation
2. Tên: "hover_preview"
3. Config: w_400,q_auto,f_auto
4. URL ngắn gọn: 
   https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/t_hover_preview/image.jpg
```

### ❌ Ảnh load chậm
**Giải pháp:**
- Thêm `q_auto` để optimize
- Giảm width: `w_400` thay vì `w_1920`
- Dùng `f_auto` để tự động chọn format nhẹ nhất

## 📊 So sánh các dịch vụ

| Service | Upload | Direct URL | Free Tier | Speed |
|---------|--------|-----------|-----------|-------|
| **Cloudinary** | ⭐⭐⭐⭐⭐ | ✅ Easy | 25GB | ⚡⚡⚡⚡⚡ |
| **Imgur** | ⭐⭐⭐⭐⭐ | ✅ Very Easy | Unlimited | ⚡⚡⚡⚡ |
| **Google Drive** | ⭐⭐⭐ | ⚠️ Need convert | 15GB | ⚡⚡⚡ |

## 🎓 Tips nâng cao

### 1. Tạo preset transformations
Tạo URL template để reuse:
```
t_hover_preview = w_400,q_auto,f_auto,c_fill
t_thumbnail = w_150,h_150,c_thumb
t_full_size = w_1200,q_auto,f_auto
```

### 2. Organize với folders
```
products/shoes/nike-001.jpg
products/bags/adidas-002.jpg
training/videos/onboarding-01.mp4
```

### 3. Auto-generate URLs
Nếu upload nhiều ảnh, có thể dùng pattern:
```
Base: https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/w_400,q_auto,f_auto/
Items:
  - products/item-001.jpg
  - products/item-002.jpg
  - products/item-003.jpg
```

## 📱 Quick Reference

**Upload:** https://console.cloudinary.com/console/media_library  
**Settings:** https://console.cloudinary.com/console/settings  
**Docs:** https://cloudinary.com/documentation/image_transformations

**URL Template:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
```

**Common transformations:**
- `w_400` = width 400px
- `q_auto` = auto quality
- `f_auto` = auto format
- `c_fill` = crop to fill
