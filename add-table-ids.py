#!/usr/bin/env python3
"""
Script to add data-table-id attributes to HTML tables
Maps Notion UUID to friendly IDs (table-1, table-2, etc.)
"""

import re
import sys

# Mapping: Notion UUID -> Friendly ID (Total: 18 tables)
TABLE_MAPPING = {
    "70fe4b0d-c3af-486e-8387-de3a7ced6ce4": "table-1",   # 1. ONBOARD
    "2ceec18e-70ae-80b2-9e7e-d80f760da1c2": "table-2",   # 2.1. Cấu hình shop được phép đăng đơn
    "2ceec18e-70ae-80cd-8e35-f94c0e842b35": "table-3",   # 2.2. Chuẩn hoá kho sản phẩm
    "2ceec18e-70ae-807e-838e-df7e38e8efb0": "table-4",   # 3.1. Tạo PO (PO điện tử)
    "2ceec18e-70ae-803e-9504-feeb85525d0e": "table-5",   # 3.2. Tạo Booking phân phối
    "2ceec18e-70ae-8043-a7f1-f27b4830da83": "table-6",   # 3.3. Phân phối xe tải lấy hàng
    "2ceec18e-70ae-807e-9bd7-dd2afb44fde9": "table-7",   # 4.1. PO điện tử (PO shop tạo sẵn)
    "2ceec18e-70ae-80ac-90f2-ca21a3c6c099": "table-8",   # 4.2. PO tiêu chuẩn (Shop tạo booking)
    "2ceec18e-70ae-8087-aa3a-f32aff8f25a6": "table-9",   # 4.2. PO tiêu chuẩn - Shop có PO vật lý
    "2ceec18e-70ae-80a3-91a5-c10810e8110f": "table-10",  # 4.3. Xử lý tại điểm - Không theo vật chứa
    "2ceec18e-70ae-8074-8925-ef32698e3be0": "table-11",  # 4.3. Xử lý tại điểm - Vận hành theo vật chứa
    "2ceec18e-70ae-8053-9c6b-f22573be56d2": "table-12",  # 5. HUB - Table 1
    "2ceec18e-70ae-80ed-9e7f-dfd91d7f397e": "table-13",  # 5. HUB - Table 2
    "2ceec18e-70ae-8067-936c-cd745269b96d": "table-14",  # 5. HUB - Table 3
    "2ceec18e-70ae-80d7-8068-f659ede186aa": "table-15",  # 6. KHO ĐÍCH - Table 1
    "2ceec18e-70ae-8008-b424-db5827a04d84": "table-16",  # 6. KHO ĐÍCH - Table 2
    "2ceec18e-70ae-80dc-8daa-eff73336229f": "table-17",  # 6. KHO ĐÍCH - Table 3
    "2ceec18e-70ae-80aa-b861-c6afdec35654": "table-18",  # 6. KHO ĐÍCH - Table 4
}

def add_data_table_id(html_content):
    """
    Add data-table-id attribute to tables

    Transform:
        <table id="70fe4b0d-c3af-486e-8387-de3a7ced6ce4" class="simple-table">
    To:
        <table id="70fe4b0d-c3af-486e-8387-de3a7ced6ce4" data-table-id="table-1" class="simple-table">
    """

    modified_count = 0

    for notion_uuid, friendly_id in TABLE_MAPPING.items():
        # Pattern to match: <table id="UUID" ... >
        pattern = rf'(<table\s+id="{re.escape(notion_uuid)}")'

        # Check if data-table-id already exists
        check_pattern = rf'<table\s+id="{re.escape(notion_uuid)}"[^>]*data-table-id='
        if re.search(check_pattern, html_content):
            print(f"⏭️  Skipped {friendly_id} (already has data-table-id)")
            continue

        # Replacement: add data-table-id after id
        replacement = rf'\1 data-table-id="{friendly_id}"'

        # Perform replacement
        new_content = re.sub(pattern, replacement, html_content)

        if new_content != html_content:
            modified_count += 1
            print(f"✅ Added data-table-id='{friendly_id}' to table with UUID {notion_uuid[:8]}...")
            html_content = new_content
        else:
            print(f"⚠️  Warning: Could not find table with UUID {notion_uuid[:8]}...")

    return html_content, modified_count

def main():
    input_file = '/Users/mac/Desktop/tai-lieu-phan-phoi/index.html'
    output_file = '/Users/mac/Desktop/tai-lieu-phan-phoi/index.html'

    print("🔧 Adding data-table-id attributes to HTML tables...\n")

    # Read HTML file
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        print(f"📖 Read {len(html_content):,} characters from {input_file}\n")
    except FileNotFoundError:
        print(f"❌ Error: File not found: {input_file}")
        sys.exit(1)

    # Process HTML
    modified_html, count = add_data_table_id(html_content)

    # Write back
    if count > 0:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(modified_html)
        print(f"\n✅ Successfully modified {count} tables")
        print(f"💾 Saved to: {output_file}")
    else:
        print("\n⚠️  No changes made to the file")

    print("\n" + "="*60)
    print("📊 SUMMARY:")
    print(f"   Total mappings: {len(TABLE_MAPPING)}")
    print(f"   Modified: {count}")
    print(f"   Skipped/Not found: {len(TABLE_MAPPING) - count}")
    print("="*60)

if __name__ == "__main__":
    main()
