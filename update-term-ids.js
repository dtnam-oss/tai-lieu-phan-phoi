/**
 * Update term IDs in HTML based on mapping
 * Run in browser console on the page
 */

const TERM_MAPPING = {
  "Shop": "term-code-001",
  "Danh sách Shop": "term-code-002",
  "mã Shop cần config": "term-code-003",
  "Chi tiết": "term-code-004",
  "Booking phân phối": "term-code-005",
  "Lưu thông tin": "term-code-006",
  "Kho và sản phẩm": "term-code-007",
  "Xem": "term-code-008",
  "Chỉnh sửa": "term-code-009",
  "Lưu sản phẩm": "term-code-010",
  "Phiếu PO": "term-code-011",
  "Đơn hàng": "term-code-012",
  "+ Phiếu PO": "term-code-014",
  "Upload phiếu": "term-code-015",
  "ảnh chụp": "term-code-016",
  "file PO": "term-code-017",
  "hanhnm12": "term-code-018",
  "ngatpth1": "term-code-019",
  "Tạo PO": "term-code-020",
  "Tạo đơn hàng": "term-code-021",
  "Đăng đơn PO": "term-code-022",
  "+ TH1 :": "term-code-023",
  "Chọn PO": "term-code-024",
  "chọn phiếu": "term-code-025",
  "+ TH2 :": "term-code-026",
  "Danh sách PO": "term-code-027",
  "Áp dụng": "term-code-028",
  "Đăng đơn": "term-code-029",
  "Tạo đơn PO": "term-code-030",
  "Đăng ĐH": "term-code-031",
  "Booking xe": "term-code-032",
  "Click để mở danh sách": "term-code-033",
  "thời gian hẹn cố định": "term-code-034",
  "nhập KL, KT hàng hoá": "term-code-035",
  "Lưu nháp": "term-code-036",
  "Chưa tiếp nhận": "term-code-037",
  "https://khachhang.ghtk.vn/": "term-code-039",
  "UT1": "term-code-042",
  "UT2": "term-code-043",
  "Có hàng phân phối": "term-code-044",
  "Xác nhận lấy hàng": "term-code-045",
  "Chốt điểm": "term-code-046",
  "Hoàn thành": "term-code-047",
  "KÉO THÊM": "term-code-048",
  "Chọn dịch vụ": "term-code-049",
  "Xác nhận": "term-code-051",
  "Lấy hàng": "term-code-052",
  "Quét phiếu": "term-code-054",
  "Tạo phiếu PO": "term-code-055",
  "chọn sản phẩm": "term-code-056",
  "tên sản phẩm": "term-code-057",
  "Thêm mới": "term-code-058",
  "Chọn số lượng > 0": "term-code-059",
  "Tạo phiếu": "term-code-062",
  "Tài xế chọn UpLoad": "term-code-064",
  "Tải lên": "term-code-065"
  // ... add more as needed
};

function updateTermIds() {
  console.log('🔄 Updating term IDs in HTML...');

  // Find all code and mark tags in tables
  const terms = document.querySelectorAll('td code, td mark, th code, th mark');
  let updated = 0;
  let notFound = 0;

  terms.forEach(term => {
    const text = term.textContent.trim();
    const termId = TERM_MAPPING[text];

    if (termId) {
      term.setAttribute('data-term-id', termId);
      updated++;
      console.log(`✅ ${text} → ${termId}`);
    } else {
      notFound++;
      console.log(`⚠️ No mapping for: "${text}"`);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⚠️ Not found: ${notFound}`);
  console.log(`   📝 Total: ${terms.length}`);
}

// Run it
updateTermIds();
