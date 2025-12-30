#!/usr/bin/env python3
"""
Auto-fix ContentData in Google Sheets
Fixes column_name mismatch and removes invalid table_id rows
"""

import sys
import json
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
SPREADSHEET_ID = '12iEpuLYiZJAB3AyqAzVefHI3MyShiEeoUYag6gMcXH4'
SHEET_NAME = 'ContentData'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# HTML table headers mapping (from extract-table-headers.py)
TABLE_HEADERS = {
    'table-1': ['Nhóm tiêu chí', 'PO – Phân phối (Thương mại / Sản xuất)', 'SO – Shop Online / Bán sỉ'],
    'table-2': ['Bộ phận thực hiện', 'Nội dung'],
    'table-3': ['Bộ phận thực hiện', 'Nội dung'],
    'table-4': ['Bộ phận thực hiện', 'Nội dung'],
    'table-5': ['Bộ phận thực hiện', 'Nội dung'],
    'table-6': ['Bộ phận thực hiện', 'Nội dung'],
    'table-7': ['Bộ phận thực hiện', 'Nội dung'],
    'table-8': ['Bộ phận thực hiện', 'Nội dung'],
    'table-9': ['Bộ phận thực hiện', 'Nội dung'],
    'table-10': ['Bộ phận thực hiện', 'Nội dung'],
    'table-11': ['Bộ phận thực hiện', 'Nội dung'],
    'table-12': ['Bộ phận thực hiện', 'Nội dung'],
    'table-13': ['Bộ phận thực hiện', 'Nội dung'],
    'table-14': ['Bộ phận thực hiện', 'Nội dung'],
    'table-15': ['Bộ phận thực hiện', 'Nội dung'],
    'table-16': ['Bộ phận thực hiện', 'Nội dung'],
    'table-17': ['Bộ phận thực hiện', 'Nội dung'],
    'table-18': ['Bộ phận thực hiện', 'Nội dung'],
}

def parse_notion_column(column_data):
    """Extract plain_text from Notion JSON format"""
    if not column_data:
        return ''

    # If already a simple string
    if isinstance(column_data, str) and not column_data.startswith('{'):
        return column_data.strip()

    # Extract plain_text from Notion format
    import re
    match = re.search(r'plain_text=([^,}]+)', str(column_data))
    if match:
        return match.group(1).strip()

    return str(column_data).strip()

def determine_column_name(table_id, row_num, content_text):
    """
    Determine correct column name based on table_id and content

    Logic:
    - table-1: Special case with 3 columns (keep original)
    - table-2 to table-18:
      - Short content (< 50 chars) → "Bộ phận thực hiện"
      - Long content (> 50 chars) → "Nội dung"
    """
    headers = TABLE_HEADERS.get(table_id, [])

    if not headers:
        return None  # Invalid table_id

    # Special case: table-1 has 3 columns
    if table_id == 'table-1':
        # Keep original column names for table-1
        return None  # Don't modify

    # Standard tables: 2 columns
    if len(headers) != 2:
        return None

    # Determine by content length
    content_length = len(str(content_text).strip())

    if content_length < 50:
        return headers[0]  # "Bộ phận thực hiện"
    else:
        return headers[1]  # "Nội dung"

def get_sheets_service(credentials_file):
    """Initialize Google Sheets API service"""
    try:
        creds = service_account.Credentials.from_service_account_file(
            credentials_file, scopes=SCOPES)
        service = build('sheets', 'v4', credentials=creds)
        return service
    except Exception as e:
        print(f"❌ Error loading credentials: {e}")
        print("\n📋 To fix:")
        print("1. Go to: https://console.cloud.google.com/")
        print("2. Create service account")
        print("3. Download JSON key")
        print("4. Save as: google-sheets-credentials.json")
        print("5. Share Google Sheet with service account email")
        sys.exit(1)

def read_contentdata(service):
    """Read all data from ContentData sheet"""
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f'{SHEET_NAME}!A:F'
        ).execute()

        values = result.get('values', [])

        if not values:
            print("❌ No data found in ContentData sheet")
            return []

        # Parse rows
        rows = []
        header = values[0] if values else []

        for i, row in enumerate(values[1:], start=2):  # Start from row 2 (skip header)
            if len(row) < 4:
                continue

            row_data = {
                'row_index': i,
                'table_id': row[0] if len(row) > 0 else '',
                'section_name': row[1] if len(row) > 1 else '',
                'row_number': row[2] if len(row) > 2 else '',
                'column_name': row[3] if len(row) > 3 else '',
                'content_text': row[4] if len(row) > 4 else '',
                'content_html': row[5] if len(row) > 5 else '',
            }
            rows.append(row_data)

        return rows

    except HttpError as err:
        print(f"❌ Error reading sheet: {err}")
        return []

def analyze_fixes_needed(rows):
    """Analyze what needs to be fixed"""
    fixes = {
        'delete_rows': [],  # Rows to delete (table_id > 18)
        'update_columns': [],  # Rows to update column_name
        'keep_rows': [],  # Rows that are correct
    }

    for row in rows:
        table_id = row['table_id']

        # Check if table_id is valid
        if table_id not in TABLE_HEADERS:
            # Invalid table_id (table-19+)
            fixes['delete_rows'].append(row)
            continue

        # Parse column name from Notion format
        parsed_column = parse_notion_column(row['column_name'])

        # Determine correct column name
        correct_column = determine_column_name(
            table_id,
            row['row_number'],
            row['content_text']
        )

        if correct_column is None:
            # table-1 or can't determine - keep as is
            fixes['keep_rows'].append(row)
        elif parsed_column != correct_column:
            # Need to update
            row['correct_column_name'] = correct_column
            row['current_column_name'] = parsed_column
            fixes['update_columns'].append(row)
        else:
            # Already correct
            fixes['keep_rows'].append(row)

    return fixes

def apply_fixes(service, fixes, dry_run=True):
    """Apply fixes to Google Sheets"""

    print("\n" + "=" * 80)
    print("🔧 APPLYING FIXES")
    print("=" * 80)

    if dry_run:
        print("⚠️  DRY RUN MODE - No changes will be made")
        print("   Run with --apply to actually update the sheet")
    else:
        print("🚀 LIVE MODE - Changes will be applied!")

    print()

    # 1. Delete invalid rows
    delete_count = len(fixes['delete_rows'])
    if delete_count > 0:
        print(f"🗑️  DELETE {delete_count} rows (table_id > 18):")
        for row in fixes['delete_rows'][:5]:  # Show first 5
            print(f"   Row {row['row_index']}: {row['table_id']}")
        if delete_count > 5:
            print(f"   ... and {delete_count - 5} more")

        if not dry_run:
            # Sort rows in reverse order to delete from bottom up
            rows_to_delete = sorted(fixes['delete_rows'], key=lambda x: x['row_index'], reverse=True)

            batch_requests = []
            for row in rows_to_delete:
                batch_requests.append({
                    'deleteDimension': {
                        'range': {
                            'sheetId': 0,  # First sheet
                            'dimension': 'ROWS',
                            'startIndex': row['row_index'] - 1,  # 0-based
                            'endIndex': row['row_index']
                        }
                    }
                })

            try:
                service.spreadsheets().batchUpdate(
                    spreadsheetId=SPREADSHEET_ID,
                    body={'requests': batch_requests}
                ).execute()
                print(f"   ✅ Deleted {delete_count} rows")
            except HttpError as err:
                print(f"   ❌ Error deleting rows: {err}")

    print()

    # 2. Update column names
    update_count = len(fixes['update_columns'])
    if update_count > 0:
        print(f"✏️  UPDATE {update_count} column_name values:")
        for row in fixes['update_columns'][:5]:  # Show first 5
            print(f"   Row {row['row_index']} ({row['table_id']}):")
            print(f"      From: \"{row['current_column_name']}\"")
            print(f"      To:   \"{row['correct_column_name']}\"")
        if update_count > 5:
            print(f"   ... and {update_count - 5} more")

        if not dry_run:
            updates = []
            for row in fixes['update_columns']:
                # Column D (index 3) is column_name
                range_name = f"{SHEET_NAME}!D{row['row_index']}"
                updates.append({
                    'range': range_name,
                    'values': [[row['correct_column_name']]]
                })

            try:
                service.spreadsheets().values().batchUpdate(
                    spreadsheetId=SPREADSHEET_ID,
                    body={
                        'valueInputOption': 'RAW',
                        'data': updates
                    }
                ).execute()
                print(f"   ✅ Updated {update_count} cells")
            except HttpError as err:
                print(f"   ❌ Error updating cells: {err}")

    print()

    # 3. Summary
    keep_count = len(fixes['keep_rows'])
    print(f"✅ KEEP {keep_count} rows (already correct)")

    print()
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"Total rows: {delete_count + update_count + keep_count}")
    print(f"  - Delete: {delete_count}")
    print(f"  - Update: {update_count}")
    print(f"  - Keep:   {keep_count}")
    print()

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Auto-fix ContentData in Google Sheets')
    parser.add_argument('--credentials', default='google-sheets-credentials.json',
                        help='Path to Google Sheets API credentials JSON file')
    parser.add_argument('--apply', action='store_true',
                        help='Actually apply changes (default is dry-run)')

    args = parser.parse_args()

    print("=" * 80)
    print("🔧 CONTENTDATA AUTO-FIX TOOL")
    print("=" * 80)
    print()
    print(f"📊 Spreadsheet ID: {SPREADSHEET_ID}")
    print(f"📋 Sheet Name: {SHEET_NAME}")
    print(f"🔑 Credentials: {args.credentials}")
    print()

    # Initialize service
    service = get_sheets_service(args.credentials)
    print("✅ Connected to Google Sheets API")
    print()

    # Read data
    print("📖 Reading ContentData...")
    rows = read_contentdata(service)
    print(f"✅ Read {len(rows)} rows")
    print()

    # Analyze fixes
    print("🔍 Analyzing fixes needed...")
    fixes = analyze_fixes_needed(rows)

    # Apply fixes
    apply_fixes(service, fixes, dry_run=not args.apply)

    if not args.apply:
        print()
        print("💡 To apply changes, run:")
        print(f"   python3 {sys.argv[0]} --apply")
    else:
        print()
        print("✅ Changes applied successfully!")
        print()
        print("📋 Next steps:")
        print("1. Verify changes in Google Sheets")
        print("2. Build static data: Tools → Static Builder → Build")
        print("3. Test locally: http://localhost:8000/index-local.html")

if __name__ == '__main__':
    main()
