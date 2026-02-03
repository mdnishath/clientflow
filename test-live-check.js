/**
 * Debug script to test live check with visible browser
 * Run: node test-live-check.js
 */

const { chromium } = require('playwright');

async function testCheck() {
  console.log('🚀 Starting test check...');

  const browser = await chromium.launch({
    headless: false, // Show browser!
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set user agent
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  // Test URL - replace with your actual review link
  const testUrl = 'https://maps.app.goo.gl/T59SoJvJy2rYbW7x7';

  console.log('📍 Navigating to:', testUrl);

  try {
    await page.goto(testUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });

    console.log('✅ Page loaded!');
    console.log('Current URL:', page.url());

    // Wait to see what happens
    await page.waitForTimeout(5000);

    // Check for review indicators
    const indicators = [
      '[data-review-id]',
      '[role="article"]',
      'button:has-text("Local Guide")',
    ];

    for (const selector of indicators) {
      const found = await page.locator(selector).first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`${selector}: ${found ? '✅ Found' : '❌ Not found'}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('📸 Screenshot saved: test-screenshot.png');

    // Keep browser open for inspection
    console.log('\n👀 Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Test complete!');
  }
}

testCheck();
