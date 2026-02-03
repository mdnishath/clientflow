# Live Check Feature - Installation Checklist

## ✅ Pre-Installation

- [ ] Node.js is installed (v18+ recommended)
- [ ] PostgreSQL database is running
- [ ] Project dependencies installed (`npm install`)
- [ ] Database is migrated and working

## 📦 Installation Steps

### Step 1: Install Playwright
```bash
npm install playwright
```
- [ ] Command completed successfully
- [ ] No errors in console

### Step 2: Install Chromium Browser
```bash
npx playwright install chromium
```
- [ ] Browser downloaded (~100MB)
- [ ] Installation completed
- [ ] Note: This is a one-time download

### Step 3: Database Migration
```bash
npx prisma db push
```
- [ ] Migration applied successfully
- [ ] New fields added to Review model

```bash
npx prisma generate
```
- [ ] Prisma client regenerated
- [ ] Types updated

### Step 4: Create Screenshots Directory
```bash
# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "public\screenshots"

# Mac/Linux
mkdir -p public/screenshots
```
- [ ] Directory created at `public/screenshots`
- [ ] Permissions are correct (read/write)

### Step 5: Update .gitignore
Add to your `.gitignore`:
```
public/screenshots/*.png
public/screenshots/*.jpg
```
- [ ] Screenshots won't be committed to git

## 🧪 Verification

### Step 6: Start Development Server
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] No module import errors
- [ ] Can access http://localhost:3000

### Step 7: Check UI
Navigate to: http://localhost:3000/reviews

- [ ] "Live Check" button is visible
- [ ] Dropdown shows "Check Selected" and "Check All"
- [ ] Button styling looks correct
- [ ] No console errors in browser

### Step 8: Test Basic Functionality

**Add a test review:**
- [ ] Create a review with a Google Review link
- [ ] Review appears in the list

**Run a check:**
- [ ] Select the review (checkbox)
- [ ] Click "Live Check" → "Check Selected"
- [ ] Button shows "Checking..." state
- [ ] No errors in browser console
- [ ] No errors in server console

**Verify result:**
- [ ] Status badge appears (Live/Missing/Error)
- [ ] Last checked timestamp is shown
- [ ] Screenshot saved (if live) in `public/screenshots`
- [ ] Can click badge to see details

### Step 9: Check Server Logs
Look for these messages:
```
✓ Review xxx: LIVE
```
- [ ] Logs show check progress
- [ ] Browser launch messages appear
- [ ] No error messages

### Step 10: Verify Database
```bash
npx prisma studio
```
Open the `Review` table:
- [ ] `lastCheckedAt` field is populated
- [ ] `checkStatus` shows correct value
- [ ] `screenshotPath` is saved (if applicable)

## 🔍 Troubleshooting

### Issue: "Cannot find module 'playwright'"
**Fix:**
```bash
npm install playwright
```

### Issue: "Executable doesn't exist"
**Fix:**
```bash
npx playwright install chromium
```

### Issue: Screenshots not saving
**Fix:**
```bash
# Check directory exists
ls public/screenshots

# Create if missing
mkdir public/screenshots

# Check permissions (Mac/Linux)
chmod 755 public/screenshots
```

### Issue: Button not showing
**Check:**
- [ ] Server restarted after changes
- [ ] No TypeScript errors
- [ ] Import statements correct
- [ ] Browser cache cleared

### Issue: Checks timeout
**Fix:**
Increase timeout in `src/lib/automation/checker.ts`:
```typescript
timeout: 60000, // Increase to 60 seconds
```

### Issue: High memory usage
**Fix:**
Reduce concurrency in `src/lib/automation/service.ts`:
```typescript
this.queue = new AutomationQueue(1); // Reduce to 1
```

## 🎯 Success Criteria

All of the following should be true:

- [x] Playwright installed
- [x] Chromium browser downloaded
- [x] Database schema updated
- [x] Prisma client regenerated
- [x] Screenshots directory exists
- [x] Server starts without errors
- [x] UI button visible and functional
- [x] Can run a check on 1 review
- [x] Status updates correctly
- [x] Screenshot saves (if live)
- [x] No errors in logs

## 📚 Next Steps

Once installation is verified:

1. **Read Documentation**
   - [ ] `SETUP_LIVE_CHECK.md` - Full setup guide
   - [ ] `src/lib/automation/README.md` - API docs
   - [ ] `docs/LIVE_CHECK_QUICK_REFERENCE.md` - Quick reference

2. **Test with Real Data**
   - [ ] Add multiple reviews with real Google links
   - [ ] Run checks on 5-10 reviews
   - [ ] Verify all complete successfully
   - [ ] Check screenshots are readable

3. **Configure for Production**
   - [ ] Adjust concurrency if needed
   - [ ] Set appropriate timeout
   - [ ] Configure screenshot cleanup
   - [ ] Add monitoring

4. **Optional Customization**
   - [ ] Adjust UI styling
   - [ ] Add custom verification logic
   - [ ] Set up webhooks
   - [ ] Add analytics

## 🚀 Quick Start (After Installation)

```bash
# Start server
npm run dev

# Navigate to reviews page
# http://localhost:3000/reviews

# Select a review
# Click "Live Check" → "Check Selected"

# Wait for completion
# View status badge and screenshot
```

## 📞 Support

If you encounter issues:

1. Check this checklist again
2. Review `SETUP_LIVE_CHECK.md`
3. Check server logs for errors
4. Review `src/lib/automation/README.md`
5. Check browser console for errors

## 🎉 Installation Complete!

If all checkboxes are ticked, you're ready to use the Live Check feature!

---

**Installation Date**: _____________

**Completed By**: _____________

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
