/**
 * ========================================
 * GOOGLE APPS SCRIPT - VIDEO DATABASE API
 * ========================================
 * 
 * HƯỚNG DẪN DEPLOY:
 * 1. Mở Google Sheet → Extensions → Apps Script
 * 2. Copy toàn bộ code này vào
 * 3. Click Deploy → New deployment
 * 4. Chọn type: Web app
 * 5. Execute as: Me
 * 6. Who has access: Anyone (⚠️ Quan trọng!)
 * 7. Click Deploy → Copy URL
 * 8. Paste URL vào index.html (VideoDatabase.API_URL)
 * 
 * CẤU TRÚC SHEET:
 * Tab name: "VideoData" (⚠️ Phải đúng tên này)
 * 
 * Columns:
 * A: Hang_Muc     - Tên hạng mục (ví dụ: "2.1. CẤU HÌNH SHOP")
 * B: Element_ID   - ID của div trong HTML (ví dụ: "vid_2_1")
 * C: Video_URL    - Link embed iframe (Streamable/Cloudinary)
 * D: Thumbnail    - URL ảnh thumbnail (optional, có thể trống)
 * E: Platform     - Loại platform: "streamable" hoặc "cloudinary"
 * 
 * VÍ DỤ DATA:
 * | Hang_Muc           | Element_ID | Video_URL                        | Thumbnail | Platform   |
 * |--------------------|------------|----------------------------------|-----------|------------|
 * | 2.1. CONFIG SHOP   | vid_2_1    | https://streamable.com/e/abc123? |           | streamable |
 * | 2.2. CHUẨN HÓA KHO | vid_2_2    | https://player.cloudinary.com/...  |           | cloudinary |
 */

function doGet(e) {
  try {
    // Get active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('VideoData');
    
    // Check if sheet exists
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet "VideoData" not found. Please create a tab named "VideoData"'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from sheet
    const data = sheet.getDataRange().getValues();
    
    // Check if sheet has data
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet "VideoData" is empty. Please add data rows.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const rows = data.slice(1); // Skip header row
    
    // Transform rows to JSON objects
    const videos = rows
      .filter(row => row[1] && row[1].toString().trim() !== '') // Filter rows with Element_ID
      .map(row => ({
        category: row[0] ? row[0].toString().trim() : '',
        element_id: row[1] ? row[1].toString().trim() : '',
        video_url: row[2] ? row[2].toString().trim() : '',
        thumbnail: row[3] ? row[3].toString().trim() : '',
        platform: row[4] ? row[4].toString().trim().toLowerCase() : 'streamable'
      }));
    
    // Return JSON response with CORS headers
    const output = ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: videos,
      timestamp: new Date().toISOString(),
      count: videos.length,
      sheet_name: sheet.getName(),
      total_rows: data.length - 1 // Exclude header
    }));
    
    output.setMimeType(ContentService.MimeType.JSON);
    
    return output;
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'An error occurred while fetching video data'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * TEST FUNCTION (Optional)
 * Run this function in Apps Script to test locally
 * Click Run → Check Execution log
 */
function testAPI() {
  const result = doGet();
  const content = result.getContent();
  Logger.log('API Response:');
  Logger.log(content);
  
  const parsed = JSON.parse(content);
  if (parsed.success) {
    Logger.log('✅ Success! Found ' + parsed.count + ' videos');
    parsed.data.forEach((video, i) => {
      Logger.log((i+1) + '. ' + video.category + ' (' + video.element_id + ')');
    });
  } else {
    Logger.log('❌ Error: ' + parsed.error);
  }
}

/**
 * SAMPLE DATA GENERATOR (Optional)
 * Run this function to auto-create sample data
 * ⚠️ This will overwrite existing data!
 */
function createSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create VideoData sheet if not exists
  let sheet = ss.getSheetByName('VideoData');
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  sheet = ss.insertSheet('VideoData');
  
  // Set headers
  const headers = ['Hang_Muc', 'Element_ID', 'Video_URL', 'Thumbnail', 'Platform'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  
  // Sample data
  const sampleData = [
    ['2.1. CẤU HÌNH SHOP', 'vid_2_1', 'https://streamable.com/e/oronb2?', '', 'streamable'],
    ['2.2. CHUẨN HÓA KHO', 'vid_2_2', 'https://player.cloudinary.com/embed/?cloud_name=dyaoztomv&public_id=REC-20251224120104_qvxn2x&profile=cld-default', '', 'cloudinary']
  ];
  
  sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  Logger.log('✅ Sample data created successfully!');
  SpreadsheetApp.getUi().alert('Sample data created successfully in "VideoData" sheet!');
}
