# Hướng dẫn Extract Data từ Interactive Terms

## 📌 Mục đích
Extract danh sách các terms (thuật ngữ) có chức năng hover để cập nhật ID vào Google Sheets hàng loạt.

## 🚀 Cách sử dụng

### Bước 1: Mở trang web
Truy cập: https://dtnam-oss.github.io/tai-lieu-phan-phoi/?reload=true

*(Thêm `?reload=true` để clear cache và load phiên bản mới nhất)*

### Bước 2: Đợi page load xong
Đợi khoảng 5-10 giây để trang load xong và JavaScript tạo các interactive terms.

Bạn sẽ thấy các từ được highlight màu xanh lá như:
- "Phiếu PO"
- "Đơn hàng"
- "Booking phân phối"
- v.v.

### Bước 3: Click nút "📊 Extract Data"
Góc trên bên phải màn hình có nút màu xanh "📊 Extract Data"

Click vào nút đó.

### Bước 4: Xem kết quả
Modal sẽ hiện ra với:
- **Statistics**: Số lượng terms, có bao nhiêu terms đã có ID, bao nhiêu chưa có
- **Data**: Danh sách đầy đủ theo format tab-separated
  ```
  hang_muc    id_the    ten_the    url
  1. ONBOARD  PO-001    Phiếu PO   https://...
  2. ĐĂNG ĐƠN DO-002    Đơn hàng   https://...
  ...
  ```

### Bước 5: Copy data
Có 2 cách:

**Cách 1: Copy tự động (khuyến nghị)**
- Click nút "📋 Copy"
- Hệ thống tự động copy vào clipboard
- Mở Google Sheets
- Select cell A1
- Paste bằng Cmd+V (Mac) hoặc Ctrl+V (Windows)

**Cách 2: Copy thủ công**
- Select toàn bộ text trong box
- Cmd+C (Mac) hoặc Ctrl+C (Windows)
- Paste vào Google Sheets

### Bước 6: Download CSV (optional)
Nếu muốn lưu file CSV:
- Click nút "💾 Download CSV"
- File sẽ tự động download với tên: `terms_data_2024-01-15.csv`

## 📊 Format dữ liệu

| Cột | Mô tả | Ví dụ |
|-----|-------|-------|
| `hang_muc` | Tiêu đề section chứa term | "1. ONBOARD" |
| `id_the` | ID của term (nếu có) | "PO-001" hoặc rỗng |
| `ten_the` | Tên hiển thị của term | "Phiếu PO" |
| `url` | URL hình ảnh (nếu có) | "https://..." hoặc rỗng |

## ⚠️ Lưu ý

1. **Đợi page load xong**: Nếu click Extract ngay khi vừa mở trang, có thể chưa tìm thấy terms. Đợi 5-10 giây.

2. **Clear cache**: Nếu không thấy nút Extract, thêm `?reload=true` vào URL hoặc hard refresh:
   - Mac: Cmd + Shift + R
   - Windows: Ctrl + Shift + R

3. **Format paste**: Khi paste vào Google Sheets:
   - Data sẽ tự động chia thành 4 cột
   - Không cần format gì thêm
   - Có thể paste nhiều lần để so sánh

4. **Update ID**: Sau khi có danh sách terms chưa có ID:
   - Copy list "Terms chưa có ID" từ statistics
   - Update vào Google Sheets
   - Push lên GitHub
   - Extract lại để kiểm tra

## 🔧 Troubleshooting

### Vấn đề: "Không tìm thấy interactive terms nào"
**Nguyên nhân**: Page chưa load xong JavaScript
**Giải pháp**: 
- Đợi thêm 10 giây
- Click "🔄 Extract" lại
- Hard refresh page (Cmd+Shift+R)

### Vấn đề: Không thấy nút Extract
**Nguyên nhân**: Browser cache cũ
**Giải pháp**:
- Thêm `?reload=true` vào URL
- Hoặc hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Hoặc clear browser cache

### Vấn đề: Copy không hoạt động
**Nguyên nhân**: Browser chặn clipboard access
**Giải pháp**:
- Cho phép clipboard access trong browser settings
- Hoặc copy thủ công: Select text → Cmd+C

## 📝 Workflow update ID hàng loạt

1. Extract data từ trang → Copy vào Sheet1
2. Google Sheets Sheet2 có cột ID chuẩn
3. VLOOKUP để match ID theo tên term
4. Update lại vào Sheet chuẩn
5. Push Sheet → GitHub → Reload page
6. Extract lại để verify

## 🎯 Video demo
*(Có thể quay video ngắn 1-2 phút demo các bước trên)*

---

Ngày tạo: 2024-01-15
Phiên bản: 1.0
