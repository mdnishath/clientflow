# Live Check Feature - Automated Setup Script (PowerShell)
# Run: .\scripts\setup-live-check.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up Live Check Automation Feature..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Playwright
Write-Host "📦 Step 1/4: Installing Playwright..." -ForegroundColor Yellow
npm install playwright
Write-Host "✓ Playwright installed" -ForegroundColor Green
Write-Host ""

# Step 2: Install Chromium
Write-Host "🌐 Step 2/4: Installing Chromium browser..." -ForegroundColor Yellow
Write-Host "Note: This will download ~100MB" -ForegroundColor Yellow
npx playwright install chromium
Write-Host "✓ Chromium installed" -ForegroundColor Green
Write-Host ""

# Step 3: Database Migration
Write-Host "🗄️  Step 3/4: Running database migration..." -ForegroundColor Yellow
npx prisma db push
npx prisma generate
Write-Host "✓ Database updated" -ForegroundColor Green
Write-Host ""

# Step 4: Create Screenshots Directory
Write-Host "📁 Step 4/4: Creating screenshots directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "public\screenshots" | Out-Null
Write-Host "✓ Screenshots directory created" -ForegroundColor Green
Write-Host ""

# Success Message
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Live Check Feature Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start dev server: npm run dev"
Write-Host "  2. Navigate to: http://localhost:3000/reviews"
Write-Host "  3. Look for the 'Live Check' button"
Write-Host "  4. Test with 1-2 reviews first"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - Setup Guide: SETUP_LIVE_CHECK.md"
Write-Host "  - API Docs: src\lib\automation\README.md"
Write-Host ""
Write-Host "💡 Tip: Check server logs during first run" -ForegroundColor Yellow
Write-Host ""
