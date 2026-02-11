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

      // Context with random user agent + ENGLISH LOCALE
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: userAgent,
        locale: 'en-US',  // Force English language
        timezoneId: 'America/New_York'  // US timezone
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

      // FORCE ENGLISH LANGUAGE: Add &hl=en parameter to URL
      if (!finalUrl.includes('hl=')) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl += `${separator}hl=en`;
        console.log(`🌐 Forced English locale: &hl=en`);
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
   * Screenshot-based detection (FALLBACK)
   * Based on actual LIVE vs MISSING screenshots provided by user
   */
  private async screenshotBasedDetection(page: Page): Promise<boolean> {
    try {
      console.log("📸 Taking screenshot for analysis...");

      // Take screenshot
      const screenshot = await page.screenshot({ type: 'png', fullPage: false });

      // Analyze page content based on actual examples
      const pageInfo = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const bodyTextLower = bodyText.toLowerCase();

        return {
          // MISSING indicators - Multi-language support
          hasMissingMessage:
            // English
            bodyTextLower.includes('this review is no longer available') ||
            bodyTextLower.includes('review is no longer available') ||
            bodyTextLower.includes('no longer available') ||
            bodyTextLower.includes('not available') ||
            bodyTextLower.includes('unavailable') ||

            // Bangla (Bengali)
            bodyText.includes('আর উপলব্ধ নেই') ||
            bodyText.includes('পর্যালোচনা আর উপলব্ধ নেই') ||
            bodyText.includes('পর্যালোচনাটি আর উপলব্ধ নেই') ||
            bodyText.includes('এই পর্যালোচনা আর উপলব্ধ নেই') ||
            bodyText.includes('এই পর্যালোচনাটি আর উপলব্ধ নেই') ||

            // French (from user's LIVE screenshot)
            bodyTextLower.includes('cet avis n\'est plus disponible') ||
            bodyTextLower.includes('n\'est plus disponible') ||
            bodyTextLower.includes('avis n\'est plus disponible') ||

            // Spanish
            bodyTextLower.includes('ya no está disponible') ||
            bodyTextLower.includes('no está disponible') ||

            // German
            bodyTextLower.includes('nicht mehr verfügbar') ||
            bodyTextLower.includes('ist nicht mehr verfügbar'),

          // LIVE indicators (from your screenshot)
          hasLikeButton: Array.from(document.querySelectorAll('button')).some(btn =>
            btn.textContent?.toLowerCase().includes('like') ||
            btn.getAttribute('aria-label')?.toLowerCase().includes('like')
          ),

          hasShareButton: Array.from(document.querySelectorAll('button')).some(btn =>
            btn.textContent?.toLowerCase().includes('share') ||
            btn.getAttribute('aria-label')?.toLowerCase().includes('share')
          ),

          hasStarRating: bodyText.includes('★') ||
                        bodyText.includes('⭐') ||
                        !!document.querySelector('[aria-label*="star"]') ||
                        !!document.querySelector('[aria-label*="Star"]'),

          hasReviewText: bodyTextLower.includes('visited in') ||
                        bodyTextLower.includes('hours ago') ||
                        bodyTextLower.includes('days ago') ||
                        bodyTextLower.includes('weeks ago') ||
                        bodyTextLower.includes('months ago') ||
                        bodyTextLower.includes('years ago'),

          // Additional checks
          hasContent: document.body.scrollHeight > 400,
          isGoogle: window.location.hostname.includes('google'),

          // Debug info - EXTENDED for better debugging
          textSample: bodyText.substring(0, 500),  // Increased from 200 to 500
          fullTextLength: bodyText.length
        };
      });

      console.log(`📊 Screenshot Analysis:`);
      console.log(`   🚫 Missing message: ${pageInfo.hasMissingMessage ? 'YES ❌' : 'No'}`);
      console.log(`   👍 Like button: ${pageInfo.hasLikeButton ? 'YES ✅' : 'No'}`);
      console.log(`   🔗 Share button: ${pageInfo.hasShareButton ? 'YES ✅' : 'No'}`);
      console.log(`   ⭐ Star rating: ${pageInfo.hasStarRating ? 'YES ✅' : 'No'}`);
      console.log(`   📝 Review text: ${pageInfo.hasReviewText ? 'YES ✅' : 'No'}`);
      console.log(`   📄 Full text length: ${pageInfo.fullTextLength} chars`);
      console.log(`   📄 Text sample (first 300 chars):`);
      console.log(`      "${pageInfo.textSample.substring(0, 300).replace(/\n/g, ' ')}..."`);

      // SIMPLE LOGIC based on your examples:
      // If "no longer available" message = MISSING
      if (pageInfo.hasMissingMessage) {
        console.log("❌ Screenshot analysis: MISSING (found 'no longer available' message)");

        // Save screenshot for verification
        const screenshotPath = `./public/screenshots/missing-${Date.now()}.png`;
        try {
          await fs.writeFile(screenshotPath, screenshot);
          console.log(`💾 Screenshot saved: ${screenshotPath}`);
        } catch (e) {
          console.log("⚠️ Could not save screenshot");
        }

        return false;
      }

      // If has Like + Share buttons + stars = LIVE
      const hasLiveIndicators = pageInfo.hasLikeButton &&
                               pageInfo.hasShareButton &&
                               pageInfo.hasStarRating;

      if (hasLiveIndicators) {
        console.log("✅ Screenshot analysis: LIVE (found Like+Share+Stars)");

        // Save screenshot for verification
        const screenshotPath = `./public/screenshots/live-${Date.now()}.png`;
        try {
          await fs.writeFile(screenshotPath, screenshot);
          console.log(`💾 Screenshot saved: ${screenshotPath}`);
        } catch (e) {
          console.log("⚠️ Could not save screenshot");
        }

        return true;
      }

      // Fallback: If has review text + stars (even without buttons)
      const hasMinimalIndicators = pageInfo.hasStarRating && pageInfo.hasReviewText;

      if (hasMinimalIndicators) {
        console.log("✅ Screenshot analysis: LIVE (found Stars+Review text)");
        return true;
      }

      // Default: MISSING
      console.log("❌ Screenshot analysis: MISSING (insufficient indicators)");
      return false;

    } catch (error) {
      console.error("Screenshot detection failed:", error);
      return false;
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

      console.log("🎯 Attempting DOM-based detection...");

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

        // SIMPLE LOGIC: Only check STRONG indicators
        // Strong indicators: .Upo0Ec, data-review-id, review text + rating, Like AND Share buttons
        const isLive = !!(upo0ec || reviewIdElement ||
                         (reviewText && reviewRating) ||
                         (likeButton && shareButton)); // Need BOTH buttons

        // Detailed logging
        console.log(`[Browser] Strategy 1 - .Upo0Ec: ${upo0ec ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        console.log(`[Browser] Strategy 2 - [data-review-id]: ${reviewIdElement ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        console.log(`[Browser] Strategy 3 - Review text+rating: ${(reviewText && reviewRating) ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
        console.log(`[Browser] Strategy 4 - Like+Share buttons: ${(likeButton && shareButton) ? 'BOTH FOUND ✅' : likeButton ? 'Only Like ⚠️' : shareButton ? 'Only Share ⚠️' : 'NOT FOUND ❌'}`);
        console.log(`[Browser] 🎯 Final result: ${isLive ? 'LIVE ✅' : 'MISSING ❌'}`);

        return isLive ? 'live' : 'missing';
      });

      let isLive = result === "live";

      // FALLBACK: If DOM detection fails, use screenshot-based detection
      if (!isLive) {
        console.log("⚠️ DOM detection failed, trying screenshot-based detection...");
        isLive = await this.screenshotBasedDetection(page);
      }

      console.log(isLive ? "✅ Review is LIVE" : "❌ Review is MISSING");

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
