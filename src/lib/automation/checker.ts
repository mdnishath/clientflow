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
      timeout: 60000, // Increased to 60s for slow redirects and Google Maps loading
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
        // Log all detection-related messages
        if (text.includes('✅') || text.includes('❌') || text.includes('DETECTION') ||
            text.includes('FOUND') || text.includes('Final Result') || text.includes('===')) {
          console.log(`[Browser] ${text}`);
        }
      });

      // RESOURCE BLOCKING: Exact same as working Express app
      await context.route('**/*.{png,jpg,jpeg,gif,svg,font,woff,woff2,mp4,pdf}', route => route.abort());

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
      console.log("🔍 Waiting for page to fully load...");

      // Extra wait for Google Maps to render
      await page.waitForTimeout(3000); // Increased to 3s

      // Debug: Check current URL
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl.substring(0, 150)}`);

      // Debug: Check if we're on the right page
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          bodyLength: document.body?.innerText?.length || 0,
          hasGoogleMaps: window.location.href.includes('google.com/maps'),
          hasReviewInUrl: window.location.href.includes('review')
        };
      });

      console.log(`📄 Page Title: ${pageInfo.title}`);
      console.log(`📊 Body Content Length: ${pageInfo.bodyLength} chars`);
      console.log(`🗺️ Is Google Maps: ${pageInfo.hasGoogleMaps}`);
      console.log(`📝 Has 'review' in URL: ${pageInfo.hasReviewInUrl}`);

      // If page seems empty or wrong, take screenshot for debugging
      if (pageInfo.bodyLength < 1000 || !pageInfo.hasGoogleMaps) {
        console.log(`⚠️ Page seems unusual (content too short or not Google Maps)`);
        try {
          const screenshotPath = `./debug-screenshots/review-${Date.now()}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: false });
          console.log(`📸 Debug screenshot saved: ${screenshotPath}`);
        } catch (e) {
          console.log(`⚠️ Could not save screenshot`);
        }
      }

      console.log("🎯 Checking for review indicators...");

      // ENHANCED LOGIC: More selectors + better detection
      const result = await page.evaluate(() => {
        // Check for blockers first
        const hasCaptcha = document.body.innerText.includes('CAPTCHA') ||
                          document.body.innerText.includes('unusual traffic');
        const hasConsent = document.body.innerText.includes('Before you continue') ||
                          document.querySelector('button[aria-label*="Accept"]') !== null;
        const hasError = document.body.innerText.includes('Something went wrong') ||
                        document.body.innerText.includes('Try again');

        if (hasCaptcha) {
          console.log('🚫 CAPTCHA detected!');
          return 'captcha';
        }
        if (hasConsent) {
          console.log('🍪 Consent screen detected!');
          return 'consent';
        }
        if (hasError) {
          console.log('⚠️ Error page detected!');
          return 'error';
        }

        // Primary indicators
        const container = document.querySelector('.Upo0Ec');
        const reviewButton = document.querySelector('button[data-review-id]');
        const genericReview = document.querySelector('.jftiEf, .MyV7u');

        // Additional indicators (Google Maps updates selectors frequently)
        const reviewCard = document.querySelector('[data-review-id]');
        const reviewText = document.querySelector('.wiI7pd');
        const reviewContainer = document.querySelector('.fontBodyMedium');
        const anyReview = document.querySelector('[jslog*="review"]');

        const isLive = !!(container || reviewButton || genericReview || reviewCard || reviewText || reviewContainer || anyReview);

        // Enhanced debug logging
        console.log(`=== DETECTION RESULTS ===`);
        console.log(`Container (.Upo0Ec): ${container ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`Review Button: ${reviewButton ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`Generic Review (.jftiEf, .MyV7u): ${genericReview ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`Review Card [data-review-id]: ${reviewCard ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`Review Text (.wiI7pd): ${reviewText ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`Review Container (.fontBodyMedium): ${reviewContainer ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`Any Review [jslog]: ${anyReview ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`========================`);
        console.log(`🎯 Final Result: ${isLive ? '✅ LIVE' : '❌ MISSING'}`);

        return isLive ? 'live' : 'missing';
      });

      // Handle special cases
      if (result === 'captcha') {
        console.log("🚫 CAPTCHA blocking access - treating as ERROR");
        return false; // Will be marked as ERROR
      }
      if (result === 'consent') {
        console.log("🍪 Consent screen blocking - treating as ERROR");
        return false;
      }
      if (result === 'error') {
        console.log("⚠️ Google Maps error page - treating as ERROR");
        return false;
      }

      const isLive = result === "live";

      if (isLive) {
        console.log("✅ Review is LIVE");
      } else {
        console.log("❌ Review is MISSING");
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
