# Demo Import Data

This folder contains sample Excel files for testing the profile import feature.

## File: profile_import_demo.xlsx

This Excel file contains 6 sample GMB profiles for testing:

### Client A (Restaurant) - 3 Profiles:
1. **Pizza Palace Downtown**
   - Category: Restaurant
   - GMB Link: https://maps.google.com/?cid=123456789

2. **Burger House East**
   - Category: Restaurant  
   - GMB Link: https://maps.google.com/?cid=987654321

3. **Taco Express**
   - Category: Restaurant
   - GMB Link: https://maps.google.com/?cid=555666777

### Client B (Roofing) - 3 Profiles:
1. **Elite Roofing Solutions**
   - Category: Roofing Contractor
   - GMB Link: https://maps.google.com/?cid=111222333

2. **Peak Home Improvement**
   - Category: Roofing Contractor
   - GMB Link: https://maps.google.com/?cid=444555666

3. **Summit Roofing Services**
   - Category: Roofing Contractor
   - GMB Link: https://maps.google.com/?cid=777888999

## How to Use

1. Navigate to `/admin/profiles/import` page (admin only)
2. Download the template or use this demo file
3. Upload the Excel file
4. Review the parsed data
5. Select action for each profile (Create/Override/Skip)
6. Click "Import Profiles"

## Excel File Structure

The Excel file must have these columns:
- **businessName** (Required): Name of the business
- **gmbLink** (Optional): Google Maps URL
- **category** (Optional): Business category
- **clientName** (Required): Client name (creates new or links to existing)

## Notes

- If a client name doesn't exist, it will be created automatically
- Duplicate profiles (same businessName + clientId) will be detected
- You can choose to skip or override duplicates
