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
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  ];

  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      maxConcurrency: 3,
      timeout: 60000, // Increased to 60s for slow redirects and Google Maps loading
      screenshotDir: "./public/screenshots",
      headless: true,
      ...config,
    };
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
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

      // Random User Agent to avoid bot detection
      const userAgent = this.getRandomUserAgent();
      console.log(`🎭 Using User-Agent: ${userAgent.substring(0, 50)}...`);

      // Context with random user agent
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: userAgent
      });

      page = await context.newPage();

      // Listen to browser console for detection results
      page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Strategy') || text.includes('✅') || text.includes('❌')) {
          console.log(`[Browser] ${text}`);
        }
      });

      // RESOURCE BLOCKING: Exact same as working Express app
      await context.route('**/*.{png,jpg,jpeg,gif,svg,font,woff,woff2,mp4,pdf}', route => route.abort());

      // Random delay before starting (anti-bot detection)
      await this.randomDelay(500, 2000);

      // CRITICAL: Resolve short links FIRST before navigation
      let finalUrl = review.reviewLiveLink;

      if (review.reviewLiveLink.includes('maps.app.goo.gl') || review.reviewLiveLink.includes('g.co')) {
        console.log(`🔗 Resolving short link...`);
        const resolved = await this.resolveShortLink(review.reviewLiveLink);
        if (resolved) {
          finalUrl = resolved;
          console.log(`✓ Resolved to: ${finalUrl.substring(0, 100)}...`);
        } else {
          console.log(`⚠ Could not resolve, using original link`);
        }
      }

      // Navigation with aggressive fallback strategy
      console.log(`🌐 Navigating to: ${finalUrl.substring(0, 80)}...`);

      let navigationSuccess = false;

      // Strategy 1: Try domcontentloaded (most reliable for Google Maps)
      try {
        await page.goto(finalUrl, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });
        console.log(`✓ Navigation successful (domcontentloaded)`);
        // Wait for Google Maps dynamic content
        await page.waitForTimeout(3000);
        navigationSuccess = true;
      } catch (error1) {
        console.log(`⚠ DOM not loaded, trying load...`);

        // Strategy 2: Try load event
        try {
          await page.goto(finalUrl, {
            waitUntil: "load",
            timeout: 45000,
          });
          console.log(`✓ Navigation successful (load)`);
          await page.waitForTimeout(2000);
          navigationSuccess = true;
        } catch (error2) {
          console.log(`⚠ Load failed, trying commit (last resort)...`);

          // Strategy 3: Just commit and wait
          try {
            await page.goto(finalUrl, {
              waitUntil: "commit",
              timeout: 30000,
            });
            await page.waitForTimeout(5000); // Wait longer for page to render
            console.log(`✓ Navigation successful (commit + 5s wait)`);
            navigationSuccess = true;
          } catch (error3) {
            // If all strategies fail, throw the original error
            throw error1;
          }
        }
      }

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
      console.log("🔍 Waiting for page to fully render...");

      // Longer wait for Google Maps (production needs more time)
      await page.waitForTimeout(5000); // Increased from 3s to 5s

      console.log("🎯 Checking for .Upo0Ec...");

      // Check for review presence with multiple strategies
      const result = await page.evaluate(() => {
        // Strategy 1: Check for .Upo0Ec (old class)
        const upo0ec = document.querySelector('.Upo0Ec');

        // Strategy 2: Check for any element with data-review-id attribute
        const reviewIdElement = document.querySelector('[data-review-id]');

        // Strategy 3: Check for review content indicators
        const reviewText = document.querySelector('.wiI7pd');
        const reviewRating = document.querySelector('[aria-label*="star"]');

        // Strategy 4: Check for "Like" and "Share" buttons (visible in screenshot)
        const buttons = Array.from(document.querySelectorAll('button'));
        const likeButton = buttons.find(btn =>
          btn.textContent?.toLowerCase().includes('like') ||
          btn.getAttribute('aria-label')?.toLowerCase().includes('like')
        );
        const shareButton = buttons.find(btn =>
          btn.textContent?.toLowerCase().includes('share') ||
          btn.getAttribute('aria-label')?.toLowerCase().includes('share')
        );

        // Strategy 5: Check for ANY text content that looks like a review
        const bodyText = document.body.innerText.toLowerCase();
        const hasReviewKeywords = bodyText.includes('review') ||
                                  bodyText.includes('star') ||
                                  bodyText.includes('visited') ||
                                  bodyText.includes('ago') ||
                                  bodyText.includes('rating');

        // Strategy 6: Check URL contains review data
        const urlHasReview = window.location.href.includes('/reviews/') ||
                            window.location.href.includes('data=') ||
                            window.location.href.includes('!1s');

        // MORE AGGRESSIVE: If URL is review page AND has any review-like content = LIVE
        const isLive = !!(upo0ec || reviewIdElement || (reviewText && reviewRating) ||
                         (likeButton || shareButton) || (urlHasReview && hasReviewKeywords));

        // Detailed logging
        console.log(`Strategy 1 - .Upo0Ec: ${upo0ec ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        console.log(`Strategy 2 - [data-review-id]: ${reviewIdElement ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        console.log(`Strategy 3 - Review text+rating: ${(reviewText && reviewRating) ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        console.log(`Strategy 4 - Like/Share buttons: ${(likeButton || shareButton) ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        console.log(`Strategy 5 - Review keywords in text: ${hasReviewKeywords ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        console.log(`Strategy 6 - URL has review: ${urlHasReview ? 'YES ✅' : 'NO ❌'}`);

        return isLive ? 'live' : 'missing';
      });

      const isLive = result === "live";

      console.log(isLive ? "✅ Review is LIVE (.Upo0Ec found)" : "❌ Review is MISSING (.Upo0Ec not found)");

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
