// Test Image Preview - Paste this in Browser Console

// Test 1: Check if URL is valid image
const testUrl = 'https://i.postimg.cc/SsrBk5Jg/6201954590022896843.jpg';

function isImageUrl(url) {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const imageHosts = ['image', 'imgur', 'cloudinary', 'postimg', 'imgbb', 'flickr', 'photobucket'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
           imageHosts.some(host => lowerUrl.includes(host));
}

console.log('✓ Testing URL:', testUrl);
console.log('✓ Is valid image?', isImageUrl(testUrl));

// Test 2: Check if image loads
const img = new Image();
img.onload = () => console.log('✅ Image loaded successfully!', img.width, 'x', img.height);
img.onerror = () => console.error('❌ Image failed to load');
img.src = testUrl;

// Test 3: Check master data cache
console.log('✓ Master data cache:', window.masterDataCache);
console.log('✓ Total rows:', window.masterDataCache ? window.masterDataCache.length : 0);

// Test 4: Find sample interactive term
const sampleTerm = document.querySelector('.interactive-term');
if (sampleTerm) {
    console.log('✓ Sample term found:', sampleTerm.getAttribute('data-term-id'));
    console.log('✓ Has image URL attr?', sampleTerm.getAttribute('data-image-url'));
} else {
    console.warn('⚠️ No interactive terms found');
}

// Test 5: Manually add URL to a term for testing
if (sampleTerm) {
    console.log('📝 Adding test URL to first term...');
    sampleTerm.setAttribute('data-image-url', testUrl);
    console.log('✅ Test URL added! Now hover over the first colored text to test.');
}
