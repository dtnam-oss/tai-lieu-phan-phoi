#!/usr/bin/env python3
"""
Extract table headers from index.html
Generate CSV mapping for ContentData sheet update
"""

import re
import csv
from bs4 import BeautifulSoup

def extract_table_headers(html_file):
    """
    Extract all table headers from HTML
    Returns: dict of {table_id: [headers]}
    """
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')

    # Find all tables with data-table-id
    tables = soup.find_all('table', attrs={'data-table-id': True})

    results = {}

    for table in tables:
        table_id = table.get('data-table-id')

        # Extract headers from <thead>
        thead = table.find('thead')
        if not thead:
            print(f"⚠️  No <thead> found in {table_id}")
            continue

        headers = []
        ths = thead.find_all('th')

        for th in ths:
            # Extract text, removing extra whitespace
            header_text = th.get_text(strip=True)

            # Also check for <strong> tags
            strong = th.find('strong')
            if strong:
                header_text = strong.get_text(strip=True)

            headers.append(header_text)

        results[table_id] = headers

        # Print summary
        print(f"✅ {table_id}: {len(headers)} columns")
        for i, header in enumerate(headers, 1):
            print(f"   Column {i}: \"{header}\"")

    return results

def generate_csv_mapping(headers_dict, output_file):
    """
    Generate CSV file with table ID and column headers
    Format: table_id, column_1, column_2, column_3, ...
    """
    # Find max number of columns
    max_cols = max(len(headers) for headers in headers_dict.values())

    # Create CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)

        # Header row
        header_row = ['table_id'] + [f'column_{i+1}' for i in range(max_cols)]
        writer.writerow(header_row)

        # Data rows
        for table_id in sorted(headers_dict.keys(), key=lambda x: int(x.split('-')[1])):
            headers = headers_dict[table_id]
            # Pad with empty strings if needed
            row = [table_id] + headers + [''] * (max_cols - len(headers))
            writer.writerow(row)

    print(f"\n✅ CSV generated: {output_file}")

def generate_google_sheet_format(headers_dict, output_file):
    """
    Generate TSV (Tab-separated) for easy paste into Google Sheets
    """
    # Find max number of columns
    max_cols = max(len(headers) for headers in headers_dict.values())

    with open(output_file, 'w', encoding='utf-8') as f:
        # Header row
        header_row = 'table_id\t' + '\t'.join(f'column_{i+1}' for i in range(max_cols))
        f.write(header_row + '\n')

        # Data rows
        for table_id in sorted(headers_dict.keys(), key=lambda x: int(x.split('-')[1])):
            headers = headers_dict[table_id]
            # Pad with empty strings if needed
            row = table_id + '\t' + '\t'.join(headers) + '\t' * (max_cols - len(headers))
            f.write(row + '\n')

    print(f"✅ TSV generated: {output_file} (ready for Google Sheets paste)")

def main():
    print("=" * 80)
    print("📊 TABLE HEADER EXTRACTION TOOL")
    print("=" * 80)
    print()

    html_file = 'index.html'
    csv_file = 'table-headers-mapping.csv'
    tsv_file = 'table-headers-mapping.tsv'

    print(f"📁 Reading: {html_file}")
    print()

    # Extract headers
    headers_dict = extract_table_headers(html_file)

    print()
    print("=" * 80)
    print(f"📊 SUMMARY: Found {len(headers_dict)} tables")
    print("=" * 80)
    print()

    # Generate CSV
    generate_csv_mapping(headers_dict, csv_file)

    # Generate TSV for Google Sheets
    generate_google_sheet_format(headers_dict, tsv_file)

    print()
    print("=" * 80)
    print("✅ DONE!")
    print("=" * 80)
    print()
    print("📋 Next steps:")
    print("1. Open: table-headers-mapping.tsv")
    print("2. Copy all content (Cmd+A, Cmd+C)")
    print("3. Go to Google Sheets ContentData")
    print("4. Create new sheet: 'Table Headers Reference'")
    print("5. Paste (Cmd+V)")
    print("6. Use this as reference to update column_name values")
    print()

if __name__ == '__main__':
    main()
