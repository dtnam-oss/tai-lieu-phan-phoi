# 📤 Hướng Dẫn Publish Google Sheet

## ❌ Lỗi Hiện Tại

```
Access to fetch at 'https://accounts.google.com/ServiceLogin...' has been blocked by CORS policy
```

**Nguyên nhân:** Google Sheet chưa được publish to web (vẫn ở chế độ private)

---

## ✅ Cách Sửa (5 Phút)

### 1️⃣ Mở Google Sheet

URL hiện tại:
```
https://docs.google.com/spreadsheets/d/12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4/edit
```

### 2️⃣ Publish to Web

1. Vào menu: **File** → **Share** → **Publish to web**
2. Tab **Link**:
   - Sheet: Chọn **"MasterData"** (hoặc "Entire Document")
   - Format: Chọn **"Web page"** hoặc **"CSV"**
3. ✅ Check box: **"Automatically republish when changes are made"**
4. Click **"Publish"**
5. Confirm: "Are you sure?" → **OK**

### 3️⃣ Hoặc Share Publicly (Cách 2)

1. Click nút **"Share"** (góc trên phải)
2. Click **"Change to anyone with the link"**
3. Chọn: **"Anyone with the link"** + **"Viewer"**
4. Click **"Done"**

---

## 🔍 Kiểm Tra Đã Publish Chưa

### Test URL này trong browser:

```
https://docs.google.com/spreadsheets/d/12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4/gviz/tq?tqx=out:json&sheet=MasterData
```

**✅ Thành công:** Nếu thấy JSON data (dù khó đọc)
```json
/*O_o*/
google.visualization.Query.setResponse({...
```

**❌ Thất bại:** Nếu redirect về login page

---

## 📊 Permissions Cần Thiết

| Setting | Value |
|---------|-------|
| Who has access | Anyone with the link |
| Access level | Viewer |
| Published to web | ✅ Yes |
| Auto-republish | ✅ Enabled |

---

## 🐛 Nếu Vẫn Lỗi

### Check 1: Sheet Name
- Đảm bảo tab name trong Google Sheets là **"MasterData"** (đúng chính tả)
- Không có khoảng trắng thừa

### Check 2: Sheet ID
Trong file `index.html` dòng 2258:
```javascript
SHEET_ID: '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4'
```

### Check 3: Data Format
Sheet phải có 4 columns:
- `hang_muc`
- `id_the`
- `ten_the`
- `url`

---

## 🎯 Sau Khi Publish

1. **Clear cache**: Ctrl+Shift+R (hoặc Cmd+Shift+R trên Mac)
2. **Refresh page**: F5
3. Check Console: Phải thấy:
   ```
   ✓ Fetched MasterData from Google Sheets (N rows)
   ✅ Content loaded successfully!
   ```

---

## 🔒 Security Note

**Public sharing an toàn không?**
- ✅ **An toàn** nếu data không nhạy cảm
- ✅ Read-only access (người khác không edit được)
- ✅ Chỉ xem được data, không xem được edit history
- ⚠️ **Không public** nếu data có thông tin nhạy cảm (passwords, personal info, etc.)

---

## 🚀 Next Steps

Sau khi publish xong:
1. Test URL trong browser
2. Refresh website
3. Hover vào các interactive terms để test image preview
4. Check Console logs để confirm data loaded

**Mọi thứ sẽ hoạt động sau khi publish! 🎉**
