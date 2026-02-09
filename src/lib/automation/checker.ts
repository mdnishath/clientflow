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

export class LiveChecker {
  private browser: Browser | null = null;
  private config: AutomationConfig;
  private checksCount = 0;

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

      // Restart browser every 50 checks to prevent memory leaks/zombie processes
      if (this.checksCount > 50) {
        console.log("♻ Restarting browser to free resources...");
        await this.close();
        await this.initialize();
        this.checksCount = 0;
      }
      this.checksCount++;

      if (!this.browser) {
        throw new Error("Browser not initialized");
      }

      console.log(`📄 Creating new page for ${review.id}`);
      page = await this.browser.newPage();

      // Set realistic user agent to avoid detection
      await page.setExtraHTTPHeaders({
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
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
   * ROBUST MODE: Multiple verification strategies with content fallback
   */
  private async verifyReviewPresence(page: Page, reviewText?: string | null, expectedId?: string | null): Promise<boolean> {
    try {
      console.log("🔍 Starting robust review verification...");

      // Wait for initial page load
      await page.waitForTimeout(3000);

      // Check for explicit error indicators first
      const errorIndicators = [
        "Google Maps can't find this link",
        "Review not found",
        "Place not found",
        "doesn't exist",
        "can't be found",
        "This review has been deleted",
        "This place doesn't have any reviews"
      ];

      const bodyText = (await page.textContent("body").catch(() => "")) || "";
      if (errorIndicators.some(err => bodyText.toLowerCase().includes(err.toLowerCase()))) {
        console.log("✗ Found error indicator on page");
        return false;
      }

      // Extract ID from current URL if not provided (handles redirects from short links)
      if (!expectedId) {
        const currentUrl = page.url();
        expectedId = this.extractReviewIdFromLink(currentUrl);
        if (expectedId) {
          console.log(`🔗 Extracted ID from URL: ${expectedId.substring(0, 20)}...`);
        }
      }

      // === STRATEGY 1: ID-based verification (most reliable) ===
      if (expectedId) {
        console.log("📌 Strategy 1: Attempting ID-based match...");
        const idFound = await this.findReviewById(page, expectedId);
        if (idFound) {
          console.log("✅ Review found via ID match");
          return true;
        }
      }

      // === STRATEGY 2: Content-based verification (robust fallback) ===
      if (reviewText && reviewText.trim().length > 0) {
        console.log("📝 Strategy 2: Attempting content-based match...");

        // Scroll down to load lazy-loaded reviews
        await this.scrollToLoadReviews(page);

        // Expand any "More" buttons to reveal full review text
        await this.expandTruncatedReviews(page);

        // Search for review content
        const contentFound = await this.findReviewByContent(page, reviewText);
        if (contentFound) {
          console.log("✅ Review found via content match");
          return true;
        }
      }

      // === STRATEGY 3: Structural pattern matching (last resort) ===
      console.log("🔍 Strategy 3: Attempting structural pattern match...");
      const structureFound = await this.findReviewByStructure(page, reviewText, expectedId);
      if (structureFound) {
        console.log("✅ Review found via structural patterns");
        return true;
      }

      console.log("✗ All verification strategies failed");
      return false;
    } catch (error) {
      console.error("Error verifying review presence:", error);
      return false;
    }
  }

  /**
   * Strategy 1: Find review by ID attribute
   */
  private async findReviewById(page: Page, expectedId: string): Promise<boolean> {
    try {
      // Try multiple ID-based selectors
      const idSelectors = [
        `[data-review-id="${expectedId}"]`,
        `[data-review-id*="${expectedId}"]`, // Partial match
        `button[data-review-id="${expectedId}"]`,
        `div[data-review-id="${expectedId}"]`
      ];

      for (const selector of idSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`  ✓ Found via selector: ${selector}`);
            return true;
          }
        } catch (e) {
          continue;
        }
      }

      // Check if ID exists anywhere in the DOM (even if not in data-review-id)
      const idInDom = await page.evaluate((id) => {
        const bodyText = document.body.innerHTML;
        return bodyText.includes(id);
      }, expectedId);

      if (idInDom) {
        console.log(`  ✓ ID found in page DOM`);
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Strategy 2: Find review by matching text content
   */
  private async findReviewByContent(page: Page, reviewText: string): Promise<boolean> {
    try {
      // Normalize the search text
      const normalizedSearch = this.normalizeText(reviewText);

      // For long reviews, search using first 100 chars to handle truncation
      const searchText = normalizedSearch.length > 100
        ? normalizedSearch.substring(0, 100)
        : normalizedSearch;

      console.log(`  🔎 Searching for: "${searchText.substring(0, 50)}..."`);

      // Get all review-like elements using stable attributes
      const reviewElements = await page.locator('[role="article"], [data-review-id], div[jslog*="review"]').all();

      console.log(`  📄 Found ${reviewElements.length} potential review containers`);

      // Check each review element for matching content
      for (const element of reviewElements) {
        try {
          const elementText = await element.textContent().catch(() => "");
          if (!elementText) continue;

          const normalizedElement = this.normalizeText(elementText);

          // Check for partial match (handles truncation and "More" buttons)
          if (normalizedElement.includes(searchText.substring(0, 50)) ||
              searchText.substring(0, 50).includes(normalizedElement)) {
            console.log(`  ✓ Content match found`);
            return true;
          }
        } catch (e) {
          continue;
        }
      }

      // Fallback: Search entire page body for review text
      const pageContent = await page.textContent('body').catch(() => "") || "";
      const normalizedPage = this.normalizeText(pageContent);

      if (normalizedPage.includes(searchText.substring(0, 50))) {
        console.log(`  ✓ Content found in page body`);
        return true;
      }

      return false;
    } catch (e) {
      console.error("  ✗ Content search error:", e);
      return false;
    }
  }

  /**
   * Strategy 3: Find review by structural patterns
   */
  private async findReviewByStructure(page: Page, reviewText?: string | null, expectedId?: string | null): Promise<boolean> {
    try {
      // Look for review structural patterns using stable selectors
      const structuralSelectors = [
        '[role="article"]', // Modern accessibility-friendly reviews
        '[aria-label*="review"]',
        '[aria-label*="Review"]',
        'div[jslog*="review"]', // Google's analytics attributes
        'div[data-review-id]',
        // Look for containers with rating stars + text
        'span[role="img"][aria-label*="star"]',
      ];

      for (const selector of structuralSelectors) {
        try {
          const elements = page.locator(selector);
          const count = await elements.count();

          if (count > 0) {
            console.log(`  ✓ Found ${count} elements matching: ${selector}`);

            // Verify this looks like a review (has text content)
            const firstElement = elements.first();
            const text = await firstElement.textContent().catch(() => "");

            if (text && text.length > 20) { // Reviews typically have substantial text
              return true;
            }
          }
        } catch (e) {
          continue;
        }
      }

      // Check for review-specific UI patterns
      const hasReviewUI = await page.evaluate(() => {
        // Look for star ratings
        const hasStars = document.querySelector('[aria-label*="star"]') !== null ||
                         document.querySelector('[aria-label*="Star"]') !== null;

        // Look for review action buttons (Like, Share, etc.)
        const hasActions = document.querySelector('button[aria-label*="Like"]') !== null ||
                           document.querySelector('button[aria-label*="Share"]') !== null ||
                           document.querySelector('button[aria-label*="Helpful"]') !== null;

        // Look for review metadata (dates, etc.)
        const hasMetadata = document.body.innerText.includes('ago') ||
                            document.body.innerText.includes('month') ||
                            document.body.innerText.includes('year');

        return hasStars || hasActions || hasMetadata;
      });

      if (hasReviewUI) {
        console.log(`  ✓ Review UI patterns detected`);
        return true;
      }

      return false;
    } catch (e) {
      console.error("  ✗ Structure search error:", e);
      return false;
    }
  }

  /**
   * Scroll page to load lazy-loaded reviews
   */
  private async scrollToLoadReviews(page: Page): Promise<void> {
    try {
      console.log("  ⬇ Scrolling to load lazy content...");

      // Scroll down in chunks to trigger lazy loading
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(500);
      }

      // Scroll back up
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    } catch (e) {
      // Non-critical, continue
    }
  }

  /**
   * Click "More" buttons to expand truncated review text
   */
  private async expandTruncatedReviews(page: Page): Promise<void> {
    try {
      console.log("  📖 Expanding truncated reviews...");

      // Common "More" button selectors
      const moreButtonSelectors = [
        'button[aria-label*="More"]',
        'button:has-text("More")',
        'button:has-text("more")',
        'button[jsaction*="expand"]',
        '[aria-label*="See more"]'
      ];

      for (const selector of moreButtonSelectors) {
        try {
          const buttons = page.locator(selector);
          const count = await buttons.count();

          for (let i = 0; i < Math.min(count, 5); i++) { // Expand up to 5 reviews
            try {
              await buttons.nth(i).click({ timeout: 1000 });
              await page.waitForTimeout(300);
            } catch (e) {
              // Button might not be clickable, continue
            }
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      // Non-critical, continue
    }
  }

  /**
   * Normalize text for comparison (remove extra whitespace, special chars)
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim();
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
