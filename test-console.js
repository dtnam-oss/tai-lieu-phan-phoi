/* 
 * GOOGLE SHEETS DATABASE CONFIGURATION
 * Copy đoạn code này vào Console để test nhanh
 */

// 1. Kiểm tra kết nối
console.log('🔍 Checking Google Sheets connection...');
console.log('Sheet ID:', SheetDB.config.SHEET_ID);

// 2. Test refresh
SheetDB.refresh().then(() => {
    console.log('✅ Refresh successful!');
}).catch(err => {
    console.error('❌ Refresh failed:', err);
});

// 3. Xem tất cả elements có ID
console.log('📋 All elements with IDs:');
document.querySelectorAll('[id]').forEach(el => {
    if (el.id) {
        console.log(`- ${el.id} (${el.tagName})`);
    }
});

// 4. Test cập nhật 1 element
SheetDB.updateElement('section-onboard', 'TEST CONTENT - 1. ONBOARD', 'text');

// 5. Clear cache
SheetDB.clearCache();
console.log('🗑️ Cache cleared');

/* 
 * HƯỚNG DẪN SỬ DỤNG:
 * 
 * 1. Mở Console (F12)
 * 2. Copy toàn bộ file này
 * 3. Paste vào Console và Enter
 * 4. Xem kết quả
 * 
 * COMMANDS:
 * - SheetDB.refresh()              : Refresh toàn bộ nội dung
 * - SheetDB.clearCache()           : Xóa cache
 * - SheetDB.updateElement(id, content, type) : Cập nhật 1 element
 * - SheetDB.config                 : Xem config hiện tại
 */
