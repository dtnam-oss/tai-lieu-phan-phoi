#!/usr/bin/env python3
"""Remove all images and video links from HTML file"""

import re

# Read the HTML file
with open('/Users/mac/Desktop/tai-lieu-phan-phoi/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

original_length = len(html)

# Pattern 1: Remove figure tags with images
# <div style="display:contents" dir="..."><figure ...>...</figure></div>
html = re.sub(
    r'<div[^>]*style="display:contents"[^>]*>\s*<figure[^>]*class="image"[^>]*>.*?</figure>\s*</div>',
    '',
    html,
    flags=re.DOTALL
)

# Pattern 2: Remove standalone figure tags with images
html = re.sub(
    r'<figure[^>]*class="image"[^>]*>.*?</figure>',
    '',
    html,
    flags=re.DOTALL
)

# Pattern 3: Remove figure tags with video/file sources (Google Drive links)
html = re.sub(
    r'<div[^>]*style="display:contents"[^>]*>\s*<figure[^>]*>.*?<div class="source">.*?</div>.*?</figure>\s*</div>',
    '',
    html,
    flags=re.DOTALL
)

html = re.sub(
    r'<figure[^>]*>.*?<div class="source">.*?</div>.*?</figure>',
    '',
    html,
    flags=re.DOTALL
)

# Pattern 4: Remove image description paragraphs
html = re.sub(
    r'<div[^>]*style="display:contents"[^>]*>\s*<p[^>]*><mark[^>]*><mark[^>]*><code>Hình minh ho[aạ].*?</code></mark></mark></p>\s*</div>',
    '',
    html,
    flags=re.DOTALL
)

# Pattern 5: Remove video labels
html = re.sub(
    r'<div[^>]*style="display:contents"[^>]*>\s*<p[^>]*><code>(Shop sử dụng DVGT|Shop không sử dụng DVGT|Tài xế.*?|XLHH.*?|PO.*?|Gán.*?|Đơn.*?|Theo SKU|In.*?|Nhập kho.*?|Xuất.*?|Giao hàng.*?)</code></p>\s*</div>',
    '',
    html,
    flags=re.DOTALL
)

# Pattern 6: Remove column-list that only contains images
html = re.sub(
    r'<div[^>]*style="display:contents"[^>]*>\s*<div[^>]*class="column-list"[^>]*>.*?</div>\s*</div>',
    '',
    html,
    flags=re.DOTALL
)

# Pattern 7: Clean up multiple consecutive newlines
html = re.sub(r'\n{3,}', '\n\n', html)

# Write back
with open('/Users/mac/Desktop/tai-lieu-phan-phoi/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

removed_chars = original_length - len(html)
print(f"Original file: {original_length:,} characters")
print(f"New file: {len(html):,} characters")
print(f"Removed: {removed_chars:,} characters")
print("✓ All images and videos removed successfully!")
