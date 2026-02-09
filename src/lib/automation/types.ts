/**
 * Live Check Automation - Type Definitions
 *
 * Modular automation types for review verification
 */

export interface Review {
  id: string;
  reviewLiveLink: string | null;
  profileId: string;
  profile: {
    businessName: string;
    category?: string | null; // Allow undefined to match Redux type
    client?: {
      name?: string;
      companyName?: string;
    };
  };
  reviewText?: string | null; // For content verification
}

export interface CheckResult {
  reviewId: string;
  status: "LIVE" | "MISSING" | "ERROR";
  screenshotPath?: string;
  errorMessage?: string;
  checkedAt: Date;
}

export interface QueueJob {
  reviewId: string;
  review: Review;
  retryCount: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  total: number;
  liveCount: number;
  missingCount: number;
  errorCount: number;
  isStopped: boolean;
  progress: number; // Percentage 0-100
}

export interface AutomationConfig {
  maxConcurrency: number;
  timeout: number;
  screenshotDir: string;
  headless: boolean;
}

export type CheckStatusCallback = (reviewId: string, status: string) => void;
