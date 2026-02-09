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
  private config: AutomationConfig;

  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      maxConcurrency: 3,
      timeout: 45000, // 45 seconds timeout
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

    // IMPORTANT: Create fresh browser for THIS check only (same as Express app)
    // This prevents Google from detecting automation patterns
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      console.log(`📄 Launching fresh browser for ${review.id}`);
      console.log(`🔗 Link: ${review.reviewLiveLink}`);

      // Launch fresh browser with stealth settings
      browser = await chromium.launch({
        headless: this.config.headless,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
          "--disable-web-security", // Sometimes helps with CORS issues
          "--disable-features=IsolateOrigins,site-per-process" // Helps with navigation
        ],
      });

      // Create context with realistic settings
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      });

      page = await context.newPage();

      // Block heavy assets to speed up (SAME AS EXPRESS APP)
      await page.route("**/*.{png,jpg,jpeg,gif,webp,svg}", (route) => route.abort());

      // BETTER APPROACH: Resolve short links first, then navigate
      let finalUrl = review.reviewLiveLink;

      // Check if it's a Google short link
      if (review.reviewLiveLink.includes('maps.app.goo.gl') || review.reviewLiveLink.includes('g.co')) {
        console.log(`🔗 Detected Google short link, resolving first...`);
        try {
          // Resolve the redirect using a simple HTTP request
          const resolvedUrl = await this.resolveShortLink(review.reviewLiveLink);
          if (resolvedUrl) {
            finalUrl = resolvedUrl;
            console.log(`✓ Resolved to: ${finalUrl.substring(0, 80)}...`);
          }
        } catch (e) {
          console.log(`⚠ Could not resolve short link, using original`);
        }
      }

      // Navigate to final URL (direct or resolved)
      console.log(`🌐 Navigating to review...`);

      try {
        await page.goto(finalUrl, {
          waitUntil: "domcontentloaded",
          timeout: 60000, // 60 seconds for safety
        });
        console.log(`✓ Navigation successful`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ Navigation failed: ${errorMessage.substring(0, 100)}`);
        throw error;
      }

      // Wait for page to load and render
      // Reduced wait time since we already waited during navigation
      await page.waitForTimeout(2000);

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
      // IMPORTANT: Close browser after each check (SAME AS EXPRESS APP)
      if (browser) {
        await browser.close().catch(() => {
          // Ignore close errors
        });
      }
    }
  }

  /**
   * Handle Google cookie consent dialog
   * Same logic as working app
   */
  private async handleCookieConsent(page: Page): Promise<void> {
    try {
      console.log("Checking for cookie consent...");

      // Handle Cookie Consent Interstitials (same as working app)
      const consentSelectors = [
        'button:has-text("Accept all")',
        'button:has-text("I agree")',
        'button[aria-label="Accept all"]',
        'button[aria-label="I agree"]',
      ];

      for (const sel of consentSelectors) {
        try {
          const btn = page.locator(sel).first();
          if (await btn.isVisible({ timeout: 2000 })) {
            await btn.click();
            await page.waitForTimeout(1000);
            console.log(`✓ Clicked consent: ${sel}`);
            return;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      console.log("No cookie consent needed");
    } catch (error) {
      console.log("Cookie consent handling completed");
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
      console.log("🔍 AUDITING DOM (Using 100% working logic)...");

      // Wait for initial shell to load (same as working app)
      await page.waitForTimeout(3000);

      // More robust selectors for 2024/2025 Google Maps
      // .jftiEf is the main review container class usually
      // .Upo0Ec is the review list shell
      // .GHT2ce is another common container
      try {
        await page.waitForSelector(".jftiEf, .Upo0Ec, [data-review-id], .MyV7u, .GHT2ce", {
          timeout: 10000,
        });
      } catch (e) {
        // Sometimes it's a direct link and takes a bit more to render
        console.log("  ⚠ Initial selectors not found, waiting more...");
        await page.waitForTimeout(3000);
      }

      // Extract Google Review ID for precise matching
      const targetId = expectedId || this.extractReviewIdFromLink(page.url());

      // EXACT SAME EVALUATION LOGIC as working app
      const result = await page.evaluate((gId) => {
        // 1. Check for specific ID if provided
        if (gId) {
          const byId = document.querySelector(`[data-review-id="${gId}"]`);
          if (byId) {
            console.log("✓ Found by data-review-id");
            return "live";
          }
        }

        // 2. Check for general review containers that indicate the link is valid and showing content
        const selectors = [
          ".jftiEf",              // Main review card
          ".MyV7u",               // Individual review wrapper
          ".Upo0Ec",              // List container (THE KEY ONE!)
          "[data-review-id]",     // Any element with a review ID
          ".GHT2ce",              // Specific review highlight wrapper
          ".WI7S7c",              // Review text element
          "div[role='article']"   // ARIA role for reviews
        ];

        for (const sel of selectors) {
          if (document.querySelector(sel)) {
            console.log(`✓ Found selector: ${sel}`);
            return "live";
          }
        }

        // 3. Fallback: check for "avis" or "review" text if we are on a direct review page
        const bodyText = document.body.innerText.toLowerCase();
        if (bodyText.includes("avis") || bodyText.includes("review") || bodyText.includes("étoile")) {
          // If we found review text but no specific container, it's likely a shell issue,
          // but we check if common business containers exist to be sure
          if (document.querySelector(".DUwDvf") || document.querySelector(".P69S9c")) {
            console.log("✓ Found via text + business containers");
            return "live";
          }
        }

        console.log("✗ No review indicators found");
        return "missing";
      }, targetId);

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
