// ============================================================================
// STATIC DATA BUILDER - Generate Pre-Built Data for Frontend
// ============================================================================
// Purpose: Build static data files once when content changes
// Benefit: No API calls on page load → Ultra fast (10-50ms)
// ============================================================================

const DATABASE_ID = '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4';

// ============================================================================
// MAIN BUILD FUNCTION - Run this when content changes
// ============================================================================
function buildStaticData() {
  console.log('🔨 Starting static data build...');
  
  try {
    // 1. Fetch all data from sheets
    const masterData = fetchMasterData();
    const contentData = fetchContentData();
    const videoData = fetchVideoData();
    
    // 2. Generate JavaScript file
    const jsContent = generateStaticJS(masterData, contentData, videoData);
    
    // 3. Save to file
    const folder = DriveApp.getFolderById('YOUR_FOLDER_ID'); // Replace with actual folder ID
    saveStaticFile(folder, jsContent);
    
    // 4. Report
    Logger.log('✅ Build completed successfully!');
    Logger.log(`   📚 MasterData: ${masterData.length} items`);
    Logger.log(`   📊 ContentData: ${contentData.length} items`);
    Logger.log(`   🎥 VideoData: ${videoData.length} items`);
    Logger.log(`   📦 Total size: ${Math.round(jsContent.length / 1024)} KB`);
    
    return {
      success: true,
      stats: {
        masterData: masterData.length,
        contentData: contentData.length,
        videoData: videoData.length,
        fileSize: jsContent.length
      }
    };
    
  } catch (error) {
    Logger.log('❌ Build failed: ' + error.message);
    throw error;
  }
}

// ============================================================================
// FETCH FUNCTIONS - Get data from sheets
// ============================================================================

function fetchMasterData() {
  const sheet = SpreadsheetApp.openById(DATABASE_ID)
    .getSheetByName('MasterData');
  
  if (!sheet) {
    Logger.log('⚠️ MasterData sheet not found');
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const result = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const [hang_muc, id_the, ten_the, url] = data[i];
    
    if (!id_the) continue; // Skip empty rows
    
    result.push({
      hang_muc: hang_muc || '',
      id_the: id_the,
      ten_the: ten_the || '',
      url: url || ''
    });
  }
  
  return result;
}

function fetchContentData() {
  const sheet = SpreadsheetApp.openById(DATABASE_ID)
    .getSheetByName('ContentData');
  
  if (!sheet) {
    Logger.log('⚠️ ContentData sheet not found');
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const result = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    // Support both formats:
    // Old: table_id, section_name, row_num, column_name, content_text, content_html
    // New (Notion): table_id, section_name, row_number, column_name (JSON), content_text
    const [table_id, section_name, row_number_or_num, column_name, content_text, content_html] = data[i];
    
    if (!table_id) continue; // Skip empty rows
    
    result.push({
      table_id: table_id,
      section_name: section_name || '',
      row_number: row_number_or_num, // Support both row_number and row_num
      row_num: row_number_or_num,     // Keep compatibility
      column_name: String(column_name || ''), // Keep as-is, will be parsed in frontend
      content_text: content_text || '',
      content_html: content_html || content_text || ''
    });
  }
  
  return result;
}

function fetchVideoData() {
  const sheet = SpreadsheetApp.openById(DATABASE_ID)
    .getSheetByName('VideoData');
  
  if (!sheet) {
    Logger.log('⚠️ VideoData sheet not found');
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const result = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const [element_id, hang_muc, video_url, thumbnail, platform] = data[i];
    
    if (!element_id) continue; // Skip empty rows
    
    result.push({
      Element_ID: element_id,
      Hang_Muc: hang_muc || '',
      Video_URL: video_url || '',
      Thumbnail: thumbnail || '',
      platform: platform || 'youtube'
    });
  }
  
  return result;
}

// ============================================================================
// GENERATE STATIC JS FILE
// ============================================================================

function generateStaticJS(masterData, contentData, videoData) {
  const timestamp = new Date().toISOString();
  const version = Date.now();
  
  // Escape single quotes in strings for safe JavaScript embedding
  const escapeString = (str) => {
    return JSON.stringify(str);
  };
  
  const js = `// ============================================================================
// STATIC DATA - Auto-Generated
// ============================================================================
// Generated: ${timestamp}
// Version: ${version}
// DO NOT EDIT MANUALLY - Run buildStaticData() to regenerate
// ============================================================================

window.STATIC_DATA = {
  version: ${version},
  generatedAt: "${timestamp}",
  
  // ========================================
  // MASTER DATA - For hover previews (${masterData.length} items)
  // ========================================
  masterData: ${JSON.stringify(masterData, null, 2)},
  
  // ========================================
  // CONTENT DATA - For table cells (${contentData.length} items)
  // ========================================
  contentData: ${JSON.stringify(contentData, null, 2)},
  
  // ========================================
  // VIDEO DATA - For video embeds (${videoData.length} items)
  // ========================================
  videoData: ${JSON.stringify(videoData, null, 2)}
};

// ============================================================================
// HELPER FUNCTIONS - Quick lookups
// ============================================================================

// Get master data by id_the
window.STATIC_DATA.getMasterById = function(id_the) {
  return this.masterData.find(item => item.id_the === id_the);
};

// Get all content for a specific table
window.STATIC_DATA.getContentByTable = function(table_id) {
  return this.contentData.filter(item => item.table_id === table_id);
};

// Get video by element ID
window.STATIC_DATA.getVideoById = function(element_id) {
  return this.videoData.find(item => item.Element_ID === element_id);
};

// Statistics
window.STATIC_DATA.getStats = function() {
  return {
    masterData: this.masterData.length,
    contentData: this.contentData.length,
    videoData: this.videoData.length,
    version: this.version,
    age: Math.round((Date.now() - this.version) / 1000 / 60) + ' minutes'
  };
};

console.log('📦 Static data loaded:', window.STATIC_DATA.getStats());
`;
  
  return js;
}

// ============================================================================
// SAVE FILE - Option 1: Google Drive
// ============================================================================

function saveStaticFile(folder, content) {
  const fileName = 'static-data.js';
  
  // Check if file exists
  const files = folder.getFilesByName(fileName);
  
  if (files.hasNext()) {
    // Update existing file
    const file = files.next();
    file.setContent(content);
    Logger.log(`✅ Updated: ${file.getUrl()}`);
  } else {
    // Create new file
    const file = folder.createFile(fileName, content, MimeType.JAVASCRIPT);
    Logger.log(`✅ Created: ${file.getUrl()}`);
  }
}

// ============================================================================
// ALTERNATIVE: Return as downloadable content
// ============================================================================

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'download_static_data') {
    // Generate and return static data for download
    const masterData = fetchMasterData();
    const contentData = fetchContentData();
    const videoData = fetchVideoData();
    const jsContent = generateStaticJS(masterData, contentData, videoData);
    
    return ContentService
      .createTextOutput(jsContent)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  // Default: Return build status
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Static Data Builder',
      endpoint: 'Add ?action=download_static_data to download',
      lastBuild: PropertiesService.getScriptProperties().getProperty('lastBuildTime')
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// SCHEDULED BUILD - Optional time-based trigger
// ============================================================================

function scheduledBuild() {
  try {
    buildStaticData();
    PropertiesService.getScriptProperties()
      .setProperty('lastBuildTime', new Date().toISOString());
  } catch (error) {
    // Send email notification on failure
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: '❌ Static Data Build Failed',
      body: 'Error: ' + error.message
    });
  }
}

// ============================================================================
// MANUAL BUILD UI - Create menu in Google Sheets
// ============================================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔨 Static Builder')
    .addItem('Build Static Data', 'buildStaticDataUI')
    .addItem('Download Static File', 'downloadStaticFile')
    .addItem('View Build Stats', 'showBuildStats')
    .addToUi();
}

function buildStaticDataUI() {
  const ui = SpreadsheetApp.getUi();
  
  const result = ui.alert(
    'Build Static Data?',
    'This will generate a new static-data.js file from current sheets data.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (result === ui.Button.YES) {
    try {
      const stats = buildStaticData();
      ui.alert(
        '✅ Build Completed',
        `MasterData: ${stats.stats.masterData} items\n` +
        `ContentData: ${stats.stats.contentData} items\n` +
        `VideoData: ${stats.stats.videoData} items\n\n` +
        `File size: ${Math.round(stats.stats.fileSize / 1024)} KB`,
        ui.ButtonSet.OK
      );
    } catch (error) {
      ui.alert('❌ Build Failed', error.message, ui.ButtonSet.OK);
    }
  }
}

function downloadStaticFile() {
  const ui = SpreadsheetApp.getUi();
  const scriptUrl = ScriptApp.getService().getUrl();
  
  ui.alert(
    '📥 Download Static File',
    'Open this URL in browser:\n\n' + 
    scriptUrl + '?action=download_static_data',
    ui.ButtonSet.OK
  );
}

function showBuildStats() {
  const ui = SpreadsheetApp.getUi();
  const lastBuild = PropertiesService.getScriptProperties()
    .getProperty('lastBuildTime') || 'Never';
  
  const masterCount = SpreadsheetApp.openById(DATABASE_ID)
    .getSheetByName('MasterData').getLastRow() - 1;
  const contentCount = SpreadsheetApp.openById(DATABASE_ID)
    .getSheetByName('ContentData').getLastRow() - 1;
  
  ui.alert(
    '📊 Build Statistics',
    `Last Build: ${lastBuild}\n\n` +
    `Current Data:\n` +
    `  MasterData: ${masterCount} rows\n` +
    `  ContentData: ${contentCount} rows`,
    ui.ButtonSet.OK
  );
}
