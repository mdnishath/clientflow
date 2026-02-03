#!/bin/bash

# Live Check Feature - Automated Setup Script
# Run: bash scripts/setup-live-check.sh

set -e

echo "🚀 Setting up Live Check Automation Feature..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install Playwright
echo "📦 Step 1/4: Installing Playwright..."
npm install playwright
echo -e "${GREEN}✓ Playwright installed${NC}"
echo ""

# Step 2: Install Chromium
echo "🌐 Step 2/4: Installing Chromium browser..."
echo -e "${YELLOW}Note: This will download ~100MB${NC}"
npx playwright install chromium
echo -e "${GREEN}✓ Chromium installed${NC}"
echo ""

# Step 3: Database Migration
echo "🗄️  Step 3/4: Running database migration..."
npx prisma db push
npx prisma generate
echo -e "${GREEN}✓ Database updated${NC}"
echo ""

# Step 4: Create Screenshots Directory
echo "📁 Step 4/4: Creating screenshots directory..."
mkdir -p public/screenshots
echo -e "${GREEN}✓ Screenshots directory created${NC}"
echo ""

# Success Message
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Live Check Feature Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🎯 Next Steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. Navigate to: http://localhost:3000/reviews"
echo "  3. Look for the 'Live Check' button"
echo "  4. Test with 1-2 reviews first"
echo ""
echo "📚 Documentation:"
echo "  - Setup Guide: SETUP_LIVE_CHECK.md"
echo "  - API Docs: src/lib/automation/README.md"
echo ""
echo "💡 Tip: Check server logs during first run"
echo ""
