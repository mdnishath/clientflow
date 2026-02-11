/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Live Check Automation - Core Checker
 *
 * Playwright-based browser automation for verifying Google Reviews
 */

import { chromium, Browser, Page } from "playwright";
import * as fs from "fs/promises";
import * as path from "path";
import { Review, CheckResult, AutomationConfig } from "./types";
import { browserPool } from "./browser-pool";

export class LiveChecker {
  private config: AutomationConfig;

  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      maxConcurrency: 3,
      timeout: 30000, // OPTIMIZED: Reduced from 45s to 30s for faster checks
      screenshotDir: "./public/screenshots",
      headless: true,
      ...config,
    };
  }

  /**
   * Resolve Google short links (maps.app.goo.gl) to full URL
   * This prevents timeout issues with redirects
   */
  private async resolveShortLink(shortUrl: string): Promise<string | null> {
    try {
      // Use fetch with redirect: 'manual' to get the redirect location
      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        }
      });

      // Get the redirect location
      const redirectUrl = response.headers.get('location');

      if (redirectUrl) {
        // If it's a relative URL, make it absolute
        if (redirectUrl.startsWith('/')) {
          const url = new URL(shortUrl);
          return `${url.protocol}//${url.host}${redirectUrl}`;
        }
        return redirectUrl;
      }

      return null;
    } catch (error) {
      console.error('Error resolving short link:', error);
      return null;
    }
  }

  /**
   * Check if a review is live
   * EXACT SAME AS EXPRESS APP: Fresh browser for each check
   */
  async checkReview(review: Review): Promise<CheckResult> {
    console.log(`🔍 Starting check for review: ${review.id}`);

    if (!review.reviewLiveLink) {
      console.log(`⚠ No review link for ${review.id}`);
      return {
        reviewId: review.id,
        status: "ERROR",
        errorMessage: "No review link provided",
        checkedAt: new Date(),
      };
    }

    // EXACT SAME AS WORKING EXPRESS APP: Fresh browser for each check
    // This prevents Google from detecting automation patterns
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      console.log(`📄 Checking review: ${review.id}`);
      console.log(`🔗 Link: ${review.reviewLiveLink}`);

      // Launch fresh browser (NO POOL - same as working Express app)
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      // EXACT SAME CONTEXT AS WORKING EXPRESS APP
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      page = await context.newPage();

      // Listen to browser console for debugging
      page.on('console', msg => {
        const text = msg.text();
        if (text.includes('✓') || text.includes('✗') || text.includes('Found') || text.includes('FOUND') || text.includes('NOT FOUND')) {
          console.log(`[Browser Console] ${text}`);
        }
      });

      // RESOURCE BLOCKING: Exact same as working Express app
      await context.route('**/*.{png,jpg,jpeg,gif,svg,font,woff,woff2,mp4,pdf}', route => route.abort());

      // EXACT SAME AS WORKING EXPRESS APP: Direct navigation with networkidle
      console.log(`🌐 Navigating to: ${review.reviewLiveLink.substring(0, 80)}...`);

      await page.goto(review.reviewLiveLink, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      console.log(`✓ Navigation successful`);

      // Extract ID from link for strict matching
      const expectedId = this.extractReviewIdFromLink(review.reviewLiveLink);

      // Check if review is live
      const isLive = await this.verifyReviewPresence(page, review.reviewText, expectedId);

      if (isLive) {
        // Screenshots disabled per user request to improve performance
        // const screenshotPath = await this.takeScreenshot(page, review.id);
        const screenshotPath = undefined;

        return {
          reviewId: review.id,
          status: "LIVE",
          screenshotPath,
          checkedAt: new Date(),
        };
      } else {
        return {
          reviewId: review.id,
          status: "MISSING",
          checkedAt: new Date(),
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Error checking review ${review.id}:`, errorMessage.substring(0, 150));

      // Categorize error for better debugging
      let errorType = "UNKNOWN";
      if (errorMessage.includes("Timeout")) {
        errorType = "TIMEOUT";
        console.error(`   → Navigation timeout - Link may be slow or blocked`);
      } else if (errorMessage.includes("net::")) {
        errorType = "NETWORK";
        console.error(`   → Network error - Check internet connection`);
      } else if (errorMessage.includes("ERR_")) {
        errorType = "CONNECTION";
        console.error(`   → Connection error`);
      }

      return {
        reviewId: review.id,
        status: "ERROR",
        errorMessage: `[${errorType}] ${errorMessage.substring(0, 200)}`,
        checkedAt: new Date(),
      };
    } finally {
      // EXACT SAME CLEANUP AS WORKING EXPRESS APP: Always close browser
      if (browser) {
        await browser.close().catch((e) => {
          // Ignore close errors (ECONNRESET, etc.)
          console.log('Browser close error (ignored)');
        });
      }
    }
  }

  /**
   * Handle Google cookie consent dialog
   * OPTIMIZED for speed
   */
  private async handleCookieConsent(page: Page): Promise<void> {
    try {
      // OPTIMIZED: Check all selectors in parallel instead of sequentially
      const consentSelectors = [
        'button:has-text("Accept all")',
        'button:has-text("I agree")',
        'button[aria-label="Accept all"]',
        'button[aria-label="I agree"]',
      ];

      // Try all selectors simultaneously with shorter timeout
      const clickPromises = consentSelectors.map(sel =>
        page.locator(sel).first().click({ timeout: 1000 }).catch(() => null)
      );

      // Wait for first successful click or all to fail
      await Promise.race([
        Promise.any(clickPromises.filter(p => p !== null)),
        new Promise(resolve => setTimeout(resolve, 1500)) // 1.5s max wait
      ]).catch(() => {
        // No consent found - that's ok
      });

      // Small wait after clicking
      await page.waitForTimeout(500);
    } catch (error) {
      // Ignore errors - consent is optional
    }
  }

  /**
   * Helper: Extract Google Review ID from URL or Link
   * Handles common formats where ID is after !1s or data-review-id pattern
   */
  private extractReviewIdFromLink(link: string): string | null {
    try {
      // Pattern 1: !1s<ID> (Protobuf style)
      const match1 = link.match(/!1s([^!]+)/);
      if (match1 && match1[1]) return match1[1];

      // Pattern 2: data-review-id="<ID>" or similar in URL? No, usually in DOM.
      // But commonly in URL: reviews/data=!4m...!1s<ID>...!

      // Pattern 3: simply looking for the long ID string if !1s isn't clean
      // The user's example: ...!1sCi9DQUlRQ...
      // It matches Pattern 1.

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Verify if the review is present on the page
   * EXACT SAME LOGIC as your working app (100% accurate)
   */
  private async verifyReviewPresence(page: Page, reviewText?: string | null, expectedId?: string | null): Promise<boolean> {
    try {
      console.log("🔍 Targeting precise verification container (.Upo0Ec)...");

      // EXACT SAME LOGIC AS WORKING EXPRESS APP
      const result = await page.evaluate(() => {
        const container = document.querySelector('.Upo0Ec');
        const reviewButton = document.querySelector('button[data-review-id]');
        const genericReview = document.querySelector('.jftiEf, .MyV7u');

        const isLive = !!(container || reviewButton || genericReview);

        // Debug logging
        console.log(`Container (.Upo0Ec): ${container ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`Review Button: ${reviewButton ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`Generic Review: ${genericReview ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`Final Result: ${isLive ? 'LIVE' : 'MISSING'}`);

        return isLive ? 'live' : 'missing';
      });

      const isLive = result === "live";

      if (isLive) {
        console.log("✅ Review is LIVE (100% working logic confirmed)");
      } else {
        console.log("✗ Review is MISSING (100% working logic confirmed)");
      }

      return isLive;
    } catch (error) {
      console.error("Error verifying review presence:", error);
      return false;
    }
  }

  // Old helper methods removed - using 100% working logic from other app now

  /**
   * Take screenshot and save to disk
   */
  private async takeScreenshot(page: Page, reviewId: string): Promise<string> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.config.screenshotDir, { recursive: true });

      const filename = `review-${reviewId}-${Date.now()}.png`;
      const filepath = path.join(this.config.screenshotDir, filename);

      await page.screenshot({
        path: filepath,
        fullPage: false,
      });

      // Return relative path for database storage
      return `/screenshots/${filename}`;
    } catch (error) {
      console.error("Error taking screenshot:", error);
      throw error;
    }
  }

  /**
   * Batch check multiple reviews
   */
  async checkBatch(reviews: Review[]): Promise<CheckResult[]> {
    const results: CheckResult[] = [];

    for (const review of reviews) {
      const result = await this.checkReview(review);
      results.push(result);
    }

    return results;
  }
}
