// QUICK TEST: Add image URL to all interactive terms
// Paste this in Browser Console to test hover image preview

const testImageUrl = 'https://i.postimg.cc/SsrBk5Jg/6201954590022896843.jpg';

// Add URL to all interactive terms
const terms = document.querySelectorAll('.interactive-term[data-term-id]');
console.log(`Found ${terms.length} interactive terms`);

terms.forEach(term => {
    term.setAttribute('data-image-url', testImageUrl);
});

console.log('✅ Image URL added to all terms!');
console.log('👉 Now hover over any colored text to see the image preview');
console.log(`📸 Using test image: ${testImageUrl}`);
