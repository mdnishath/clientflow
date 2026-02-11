/**
 * Simple Google Maps Review Checker
 * 100% Working - Only checks .Upo0Ec class
 */

import { chromium, Browser, Page } from "playwright";
import { Review, CheckResult } from "./types";

export class LiveChecker {
  /**
   * Check a single review
   * SIMPLE: Open → Check .Upo0Ec → Close → Return result
   */
  async checkReview(review: Review): Promise<CheckResult> {
    let browser: Browser | null = null;

    try {
      console.log(`\n🔍 Checking review: ${review.id}`);
      console.log(`🔗 Link: ${review.reviewLiveLink}`);

      // Launch browser (headless)
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      // Create page
      const page = await browser.newPage({
        viewport: { width: 1280, height: 720 }
      });

      // Navigate to review link
      if (!review.reviewLiveLink) {
        throw new Error('Review link is missing');
      }

      console.log(`🌐 Navigating...`);
      await page.goto(review.reviewLiveLink, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      // Wait for page to render
      console.log(`⏳ Waiting 3 seconds...`);
      await page.waitForTimeout(3000);

      // Check .Upo0Ec class
      console.log(`🎯 Checking .Upo0Ec...`);
      const isLive = await page.evaluate(() => {
        const element = document.querySelector('.Upo0Ec');
        return !!element;
      });

      // Log result
      const status = isLive ? 'LIVE' : 'MISSING';
      console.log(`${isLive ? '✅' : '❌'} Result: ${status}`);

      // Close browser immediately
      await browser.close();

      return {
        reviewId: review.id,
        status: status,
        checkedAt: new Date()
      };

    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error: ${errorMessage}`);

      // Close browser if open
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore close errors
        }
      }

      return {
        reviewId: review.id,
        status: 'ERROR',
        errorMessage: errorMessage,
        checkedAt: new Date()
      };
    }
  }
}
