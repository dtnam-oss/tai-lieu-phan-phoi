#!/usr/bin/env python3
"""
HTML Refactoring Script
Removes display:contents wrappers and creates clean semantic HTML structure
"""

import re

def clean_html_structure(input_file, output_file):
    print("🔧 Starting HTML Refactoring...")
    
    # Read the original file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"📄 Original file size: {len(content)} characters")
    
    # Extract the head section (everything before <body>)
    head_match = re.search(r'(<html>.*?<body[^>]*>)', content, re.DOTALL)
    if not head_match:
        print("❌ Could not find head section")
        return
    
    head_section = head_match.group(1)
    
    # Extract the navigation bar
    nav_match = re.search(r'(<nav[^>]*>.*?</nav>)', content, re.DOTALL)
    if not nav_match:
        print("❌ Could not find navigation")
        return
    
    nav_section = nav_match.group(1)
    
    # Extract the article content
    article_match = re.search(r'<article[^>]*>(.*?)</article>', content, re.DOTALL)
    if not article_match:
        print("❌ Could not find article content")
        return
    
    article_content = article_match.group(1)
    print(f"📦 Article content: {len(article_content)} characters")
    
    # Extract the script section (everything after </div> before </body>)
    script_match = re.search(r'(</div>\s*<!-- End Document Paper Container -->.*?</body></html>)', content, re.DOTALL)
    if not script_match:
        print("❌ Could not find script section")
        return
    
    script_section = script_match.group(1)
    
    # Clean the article content - remove display:contents wrappers
    print("🧹 Removing display:contents wrappers...")
    
    # Remove <div style="display:contents" ...>...</div> wrappers using regex
    cleaned_content = article_content
    
    # Strategy: Replace opening <div style="display:contents"...> and closing </div>
    # Multiple passes to handle nested structures
    max_iterations = 20
    for iteration in range(max_iterations):
        before = cleaned_content
        # Remove <div style="display:contents" dir="auto"> and <div style="display:contents" dir="ltr">
        cleaned_content = re.sub(
            r'<div\s+style="display:contents"\s+dir="(auto|ltr)">',
            '',
            cleaned_content
        )
        # Remove orphaned </div> tags carefully - but this is tricky
        # Better approach: mark the divs for removal first
        if before == cleaned_content:
            break
        print(f"  Iteration {iteration + 1}: Removed display:contents opening tags")
    
    # Now we need to remove the corresponding closing </div> tags
    # Count opening tags we removed and remove same number of closing tags
    # This is complex, so let's use a different approach:
    
    # Alternative: Use more specific patterns to remove the wrapper divs
    print("🔄 Using alternative cleaning method...")
    
    # Pattern 1: <div style="display:contents" dir="..."><CONTENT></div>
    # We'll extract just the CONTENT part
    
    # Start fresh
    cleaned_content = article_content
    
    # Remove specific wrapper patterns around semantic elements
    patterns = [
        # h3 wrapped in div
        (r'<div\s+style="display:contents"\s+dir="auto"><(h3[^>]*>.*?</h3>)</div>', r'<\1'),
        # hr wrapped in div
        (r'<div\s+style="display:contents"\s+dir="auto"><(hr[^>]*/?)></div>', r'<\1>'),
        # p wrapped in div
        (r'<div\s+style="display:contents"\s+dir="auto"><(p[^>]*>.*?</p>)</div>', r'<\1'),
        # table wrapped in div
        (r'<div\s+style="display:contents"\s+dir="ltr"><(table[^>]*>.*?</table>)</div>', r'<\1'),
        # Empty divs
        (r'<div\s+style="display:contents"\s+dir="auto"></div>', ''),
        # thead wrapped
        (r'<div\s+style="display:contents"\s+dir="ltr"><(thead[^>]*>.*?</thead>)</div>', r'<\1'),
        # tbody wrapped  
        (r'<div\s+style="display:contents"\s+dir="ltr"><(tbody[^>]*>.*?</tbody>)</div>', r'<\1'),
        # tr wrapped
        (r'<div\s+style="display:contents"\s+dir="ltr"><(tr[^>]*>.*?</tr>)</div>', r'<\1'),
        # column-list wrappers
        (r'<div\s+style="display:contents"\s+dir="auto"><(div[^>]*class="column-list"[^>]*>.*?</div>)</div>', r'<\1'),
        # Generic nested div content wrappers
        (r'<div\s+style="display:contents"\s+dir="(auto|ltr)"><(div[^>]*>.*?</div>)</div>', r'<\2'),
    ]
    
    for pattern, replacement in patterns:
        cleaned_content = re.sub(pattern, replacement, cleaned_content, flags=re.DOTALL)
        print(f"  Applied pattern: {pattern[:50]}...")
    
    print(f"✅ Cleaned content: {len(cleaned_content)} characters")
    
    # Update CSS in head section for new requirements
    head_section = update_css(head_section)
    
    # Rebuild the HTML with proper structure
    new_html = f"""{head_section}

{nav_section}

<!-- Document Paper Container -->
<main class="document-paper">
{cleaned_content}
</main>
<!-- End Document Paper Container -->

<span style="font-size:14px;padding-top:2em"></span>
<script>
"""
    
    # Extract just the script content from script_section
    script_content_match = re.search(r'<script>(.*?)</script>', script_section, re.DOTALL)
    if script_content_match:
        script_content = script_content_match.group(1)
        new_html += script_content + "\n</script>\n</body></html>"
    else:
        new_html += "\n</script>\n</body></html>"
    
    # Write the refactored HTML
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_html)
    
    print(f"✅ Refactored HTML written to: {output_file}")
    print(f"📊 New file size: {len(new_html)} characters")

def update_css(head_section):
    """Update CSS for new Document Pro design"""
    
    # Replace the document-paper CSS
    css_updates = {
        'max-width: 1280px !important;': 'max-width: 1440px !important;',
        'padding: 40px !important;': 'padding: 60px 80px !important;',
        'margin: 100px auto 40px auto !important;': 'margin: 40px auto !important;',
    }
    
    for old, new in css_updates.items():
        head_section = head_section.replace(old, new)
    
    # Add new table CSS if not present
    if 'word-wrap: break-word;' not in head_section:
        # Find the end of document-paper styles
        insert_pos = head_section.find('/* ========================================')
        if insert_pos > 0:
            insert_pos = head_section.find('*/', insert_pos) + 2
            
            new_table_css = """

/* Reset Table triệt để bên trong document */
.document-paper table {
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 14px;
}

.document-paper th, 
.document-paper td {
    border: 1px solid #e0e0e0;
    padding: 12px 16px;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

/* Quy tắc cột 30-70 áp dụng toàn cục */
.document-paper table tr > *:first-child { width: 30% !important; }
.document-paper table tr > *:nth-child(2) { width: 70% !important; }

/* Ngoại lệ cho bảng 3 cột (Onboard) */
.document-paper table:first-of-type tr > *:first-child { width: 20% !important; }
.document-paper table:first-of-type tr > *:nth-child(2) { width: 40% !important; }
.document-paper table:first-of-type tr > *:nth-child(3) { width: 40% !important; }
"""
            head_section = head_section[:insert_pos] + new_table_css + head_section[insert_pos:]
    
    return head_section

if __name__ == '__main__':
    input_file = 'index.html'
    output_file = 'index_refactored.html'
    
    try:
        clean_html_structure(input_file, output_file)
        print("\n✅ REFACTORING COMPLETE!")
        print(f"📁 Output: {output_file}")
        print("\n💡 Review the refactored file, then rename it to index.html")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
