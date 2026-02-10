# Client Migration Tool - User Guide

## Overview
Ami tumhar codebase er jonno ekta **Dynamic Migration Tool** create koreci je Google Sheets theke client data easily import korte parbe with **flexible column mapping**.

## Features ✨

### 1. **Dynamic Column Mapping**
- ✅ Excel/CSV file er header automatically detect kore
- ✅ User select korte pare kon column kon field e map hobe
- ✅ Auto-detection with smart matching (business name, client name, etc.)
- ✅ Real-time preview before import

### 2. **Proper Client Segregation**
- ✅ Client Name based grouping - mixing problem solve hoye gece
- ✅ Each client er data separate client record er under a store hobe
- ✅ Multiple clients ek sheet theke import kora jabe
- ✅ Auto-create new clients if not exists

### 3. **Flexible Data Import**
- ✅ Business profiles with GMB links
- ✅ Categories
- ✅ Review data (text, status, live links, emails)
- ✅ Review scheduling (ordered count, daily limit, start date)
- ✅ CSV and Excel (.xlsx, .xls) support

### 4. **4-Step Workflow**
1. **Upload** - Drag & drop Excel/CSV file
2. **Map Columns** - Select which column maps to which field
3. **Preview** - Review data before import
4. **Results** - See detailed import results

## Files Created

### Frontend
- **[/admin/migration/page.tsx](src/app/(dashboard)/admin/migration/page.tsx)** - Main migration UI with dynamic mapping

### Backend
- **[/api/admin/migration/import/route.ts](src/app/api/admin/migration/import/route.ts)** - Enhanced import API with client segregation

### Navigation
- **[sidebar.tsx](src/components/layout/sidebar.tsx)** - Updated with "Migration Tool" link

## How to Use

### Step 1: Access the Tool
- Login as **Admin**
- Navigate to **"Migration Tool"** in the sidebar (under admin section)

### Step 2: Prepare Your Sheet
Your Google Sheet can have ANY column names. Example:

| Business Name | Client Name | GMB Link | Category | Review Text | Status | Email Used |
|--------------|-------------|----------|----------|-------------|--------|------------|
| Pizza Shop A | John Doe    | https:// | Restaurant | Great food! | PENDING | test@email.com |
| Salon B      | John Doe    | https:// | Beauty   | Loved it! | LIVE | user@email.com |
| Store C      | Jane Smith  | https:// | Retail   |           | PENDING | |

**Required Columns:**
- `Business Name` (required)
- `Client Name` (required)

**Optional Columns:**
- GMB Link
- Category
- Client Email
- Review Text
- Review Status (PENDING, LIVE, DONE, etc.)
- Live Link
- Email Used
- Reviews Ordered (number)
- Daily Limit (number)
- Start Date
- Due Date

### Step 3: Upload & Map
1. Drag & drop your Excel/CSV file
2. System will auto-detect headers
3. Review auto-mapped columns
4. Adjust mappings using dropdowns
5. Click "Preview Data"

### Step 4: Import
1. Review preview table (first 10 rows shown)
2. Click "Import X Rows"
3. Wait for processing
4. See results summary

## Important Changes from Old System

### Old System Issues:
❌ Fixed column positions (row[0], row[1], etc.)
❌ Client data mixing - ek client er profile arekta client er modhye
❌ No flexibility in sheet format
❌ Hard to migrate from different Google Sheet formats

### New System Solutions:
✅ Dynamic column mapping - any column order works
✅ Client-wise grouping - proper segregation guaranteed
✅ Flexible sheet format - column names don't matter
✅ Easy migration from any Google Sheet structure

## Example Import Flow

```
1. Upload file with 100 rows, 3 clients (John, Jane, Mike)

2. Map columns:
   - "Business" → Business Name
   - "Client" → Client Name
   - "Link" → GMB Link
   - "Type" → Category

3. Preview shows:
   - 100 rows parsed
   - 3 clients detected
   - 50 profiles for John
   - 30 profiles for Jane
   - 20 profiles for Mike

4. Import results:
   ✅ 3 clients created/updated
   ✅ 100 profiles created
   ✅ 0 errors
   ✅ Each client has ONLY their profiles
```

## Technical Details

### Backend Logic
1. Groups profiles by `clientName` first
2. For each client group:
   - Find or create client record
   - Process all profiles under that client
   - Ensures `clientId` is correct for all profiles
3. No cross-client data leakage

### Database Schema
```typescript
Client {
  id: string
  userId: string  // Admin who owns this client
  name: string
  email: string?
}

GmbProfile {
  id: string
  clientId: string  // Properly linked to client
  businessName: string
  gmbLink: string?
  category: string?
}

Review {
  id: string
  userId: string
  profileId: string
  reviewText: string?
  status: ReviewStatus
}
```

## Error Handling

The system provides detailed error messages:
- Missing required fields (business name, client name)
- Invalid data formats
- Duplicate handling
- Row-level error tracking

## Download Template

Click "Download Template" button to get a pre-formatted Excel file with all available columns.

## Testing Checklist

- [ ] Upload Excel file with multiple clients
- [ ] Verify column auto-detection
- [ ] Test manual column mapping
- [ ] Preview data before import
- [ ] Import and verify client segregation
- [ ] Check no client data mixing
- [ ] Test with CSV file
- [ ] Test with different column orders
- [ ] Test error handling (missing fields)
- [ ] Verify review creation

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify your sheet has required columns (Business Name, Client Name)
3. Ensure data format is correct (dates, numbers)
4. Contact admin for assistance

---

**Created by:** Claude Code
**Date:** 2026-02-10
**Version:** 1.0
