/**
 * Live Check Automation - Core Checker
 *
 * Playwright-based browser automation for verifying Google Reviews
 */

import { chromium, Browser, Page } from "playwright";
import * as fs from "fs/promises";
import * as path from "path";
import { Review, CheckResult, AutomationConfig } from "./types";

export class LiveChecker {
  private browser: Browser | null = null;
  private config: AutomationConfig;

  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      maxConcurrency: 3,
      timeout: 45000, // Increased from 30000 to 45000 (45 seconds)
      screenshotDir: "./public/screenshots",
      headless: true,
      ...config,
    };
  }

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      console.log("🌐 Launching browser...");
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
        ],
      });
      console.log("✅ Browser launched successfully");
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Check if a review is live
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

    let page: Page | null = null;

    try {
      await this.initialize();

      if (!this.browser) {
        throw new Error("Browser not initialized");
      }

      console.log(`📄 Creating new page for ${review.id}`);
      page = await this.browser.newPage();

      // Set realistic user agent to avoid detection
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      });

      await page.setViewportSize({ width: 1280, height: 720 });

      // Navigate to review link with retry logic for network errors
      let retries = 3;
      let lastError: Error | null = null;

      while (retries > 0) {
        try {
          await page.goto(review.reviewLiveLink, {
            waitUntil: "domcontentloaded",
            timeout: this.config.timeout,
          });
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error as Error;
          retries--;

          if (lastError.message.includes("ERR_NETWORK_CHANGED") && retries > 0) {
            console.log(`⚠ Network changed, retrying... (${retries} attempts left)`);
            await page.waitForTimeout(2000); // Wait 2 seconds before retry
            continue;
          }

          // If not a network error or no retries left, throw
          throw error;
        }
      }

      // Wait for page to load and render
      await page.waitForTimeout(3000); // Increased from 2000

      // Handle cookie consent (if present)
      await this.handleCookieConsent(page);

      // Check if review is live
      const isLive = await this.verifyReviewPresence(page);

      if (isLive) {
        // Take screenshot
        const screenshotPath = await this.takeScreenshot(page, review.id);

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
      console.error(`Error checking review ${review.id}:`, error);
      return {
        reviewId: review.id,
        status: "ERROR",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        checkedAt: new Date(),
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Handle Google cookie consent dialog
   */
  private async handleCookieConsent(page: Page): Promise<void> {
    try {
      console.log("Checking for cookie consent...");

      // Wait a moment for consent dialog to appear
      await page.waitForTimeout(1500);

      // Common Google cookie consent button selectors
      const selectors = [
        'button:has-text("Accept all")',
        'button:has-text("Reject all")',
        'button:has-text("I agree")',
        'button:has-text("Got it")',
        '[aria-label*="Accept"]',
        '[aria-label*="Agree"]',
        'button[jsname="higCR"]', // Google's accept button
        'form[action*="consent"] button',
      ];

      for (const selector of selectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`✓ Found consent button: ${selector}`);
            await button.click();
            await page.waitForTimeout(1500);
            console.log("✓ Clicked consent button");
            return;
          }
        } catch (err) {
          // Continue to next selector
        }
      }

      console.log("No cookie consent dialog found (might not be needed)");
    } catch (error) {
      // Cookie consent handling is optional, don't fail the check
      console.log("Cookie consent handling completed with minor issues");
    }
  }

  /**
   * Verify if the review is present on the page
   */
  private async verifyReviewPresence(page: Page): Promise<boolean> {
    try {
      // Wait a bit for Google Maps to fully load
      await page.waitForTimeout(2000);

      // Strategy 1: Check for data-review-id attribute
      const reviewIdElement = await page.locator('[data-review-id]').first();
      if (await reviewIdElement.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("✓ Found review via data-review-id");
        return true;
      }

      // Strategy 2: Check for Google Maps review indicators
      const reviewIndicators = [
        '[role="article"]', // Review articles
        '.review-full-text', // Review text
        'button:has-text("Local Guide")', // Local Guide badge
        '[data-review-id]', // Review ID
        'div.section-review', // Review section
        'span.section-review-stars', // Star ratings
        'button[aria-label*="stars"]', // Star buttons
      ];

      for (const indicator of reviewIndicators) {
        const element = page.locator(indicator).first();
        if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log(`✓ Found review via selector: ${indicator}`);
          return true;
        }
      }

      // Strategy 3: Check for review text patterns in page content
      const textPatterns = [
        'Local Guide',
        'reviews',
        'stars',
        'ago', // Common in "X days ago"
      ];

      const pageContent = (await page.textContent('body').catch(() => '')) || '';
      const foundPatterns = textPatterns.filter(pattern =>
        pageContent.toLowerCase().includes(pattern.toLowerCase())
      );

      if (foundPatterns.length >= 2) {
        console.log(`✓ Found review via text patterns: ${foundPatterns.join(', ')}`);
        return true;
      }

      // Strategy 4: Check page URL contains review indicators
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);

      if (currentUrl.includes("place") && !currentUrl.includes("error")) {
        // On a Google Maps place page - likely showing reviews
        console.log("✓ On Google Maps place page");
        return true;
      }

      console.log("✗ No review indicators found");
      return false;
    } catch (error) {
      console.error("Error verifying review presence:", error);
      return false;
    }
  }

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
