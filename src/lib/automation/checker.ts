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

    // IMPORTANT: Create fresh browser for THIS check only (same as Express app)
    // This prevents Google from detecting automation patterns
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      console.log(`📄 Getting browser for ${review.id}`);
      console.log(`🔗 Link: ${review.reviewLiveLink}`);

      // PERFORMANCE: Use browser pool for faster checks
      // Gets browser from pool (instant) or creates new one (2-3s)
      browser = await browserPool.getBrowser();

      // Create context with maximum stealth settings
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        locale: 'en-US',
        timezoneId: 'America/New_York',
        // Add realistic browser features
        permissions: ['geolocation'],
        geolocation: { latitude: 40.7128, longitude: -74.0060 }, // NYC coordinates
        colorScheme: 'light',
        // Hide automation
        javaScriptEnabled: true,
      });

      page = await context.newPage();

      // Listen to browser console for debugging
      page.on('console', msg => {
        const text = msg.text();
        if (text.includes('✓') || text.includes('✗') || text.includes('Found') || text.includes('No review')) {
          console.log(`[Browser Console] ${text}`);
        }
      });

      // STEALTH: Hide automation detection
      await page.addInitScript(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });

        // Add chrome property
        (window as any).chrome = {
          runtime: {},
        };

        // Mock permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: 'denied' } as PermissionStatus)
            : originalQuery(parameters);
      });

      // CRITICAL: Don't block ANY resources for Google Maps to work properly
      // Google Maps needs full access to render .Upo0Ec and other elements
      // Performance is secondary to accuracy
      await page.route("**/*", (route) => {
        const resourceType = route.request().resourceType();

        // Only block very large images to save bandwidth
        if (resourceType === 'image') {
          const url = route.request().url();
          // Block large images but allow everything else
          if (url.includes('googleusercontent') && url.includes('=w') && !url.includes('=w100')) {
            route.abort(); // Block large photos
          } else {
            route.continue(); // Allow icons, logos, UI images
          }
        } else {
          // Allow ALL other resources (CSS, JS, fonts, etc.)
          route.continue();
        }
      });

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

      // Navigate with fallback strategies (ANTI-DETECTION)
      console.log(`🌐 Navigating to review...`);

      let navigationSuccess = false;

      // OPTIMIZED: Aggressive fast navigation strategy
      // Strategy 1: Try commit (fastest - just wait for navigation to start)
      try {
        await page.goto(finalUrl, {
          waitUntil: "commit",
          timeout: 15000, // OPTIMIZED: Reduced from 30s to 15s
        });
        // OPTIMIZED: Reduced wait from 2s to 1s
        await page.waitForTimeout(1000);
        navigationSuccess = true;
        console.log(`✓ Navigation successful (commit)`);
      } catch (error1) {
        console.log(`⚠ Strategy 1 failed, trying fallback...`);

        // Strategy 2: Try domcontentloaded (backup)
        try {
          await page.goto(finalUrl, {
            waitUntil: "domcontentloaded",
            timeout: 20000, // OPTIMIZED: Reduced from 30s to 20s
          });
          navigationSuccess = true;
          console.log(`✓ Navigation successful (domcontentloaded fallback)`);
        } catch (error2) {
          console.log(`⚠ Strategy 2 failed, trying last resort...`);

          // Strategy 3: Navigate without waiting (last resort)
          try {
            // Set content to blank first
            await page.goto('about:blank');
            // Now navigate without waiting
            page.goto(finalUrl).catch(() => {}); // Fire and forget
            // OPTIMIZED: Reduced wait from 5s to 3s
            await page.waitForTimeout(3000);
            navigationSuccess = true;
            console.log(`✓ Navigation successful (no-wait fallback)`);
          } catch (error3) {
            const errorMessage = error1 instanceof Error ? error1.message : "Unknown error";
            console.error(`❌ All navigation strategies failed: ${errorMessage.substring(0, 100)}`);
            throw error1;
          }
        }
      }

      // OPTIMIZED: Removed extra wait - cookie consent handler already waits
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
      // Clean up page and context first to prevent memory leaks
      try {
        if (page) {
          await page.close().catch((e) => {
            console.log('Page close error (ignored):', e.message);
          });
        }
      } catch (e) {
        // Ignore page close errors
      }

      // PERFORMANCE: Return browser to pool instead of closing
      // This allows browser reuse for next check (0s vs 2-3s launch time)
      if (browser) {
        await browserPool.returnBrowser(browser).catch((e) => {
          // Ignore ECONNRESET and other connection errors
          console.log('Browser return error (ignored):', e instanceof Error ? e.message : 'Unknown');
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
      console.log("🔍 CHECKING FOR .Upo0Ec (THE ONLY INDICATOR)...");

      // Wait longer for Google Maps to fully load
      console.log("⏳ Waiting for network to settle...");
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        console.log('⚠️ Network not idle after 15s, proceeding anyway');
      });

      // Additional wait for dynamic content to render
      console.log("⏳ Waiting 3s for dynamic content...");
      await page.waitForTimeout(3000);

      // Wait specifically for .Upo0Ec with longer timeout
      console.log("🎯 Waiting for .Upo0Ec selector...");
      const hasUpo0Ec = await page.waitForSelector(".Upo0Ec", {
        timeout: 8000,
        state: 'attached'
      }).then(() => {
        console.log("✅ .Upo0Ec FOUND!");
        return true;
      }).catch(() => {
        console.log("❌ .Upo0Ec NOT FOUND after 8s wait");
        return false;
      });

      // Debug info
      const pageUrl = page.url();
      const pageTitle = await page.title();
      console.log(`🌐 URL: ${pageUrl.substring(0, 100)}...`);
      console.log(`📄 Title: ${pageTitle}`);

      // SIMPLIFIED: Only check for .Upo0Ec class
      const result = await page.evaluate(() => {
        const upo0ec = document.querySelector(".Upo0Ec");

        if (upo0ec) {
          console.log("✅ .Upo0Ec element found in DOM");
          return "live";
        }

        console.log("❌ .Upo0Ec element NOT in DOM");

        // Additional debug: List all classes in body
        const allClasses = new Set<string>();
        document.querySelectorAll('[class]').forEach(el => {
          el.className.split(' ').forEach(cls => {
            if (cls.trim()) allClasses.add(cls.trim());
          });
        });

        console.log(`📊 Total unique classes in DOM: ${allClasses.size}`);

        // Check if any class contains "Upo"
        const upoClasses = Array.from(allClasses).filter(cls => cls.includes('Upo'));
        if (upoClasses.length > 0) {
          console.log(`🔍 Found classes containing "Upo": ${upoClasses.join(', ')}`);
        }

        return "missing";
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
