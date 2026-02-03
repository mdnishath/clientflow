-- Migration: Add Live Check Fields to Review Model
-- Generated: 2026-02-02
-- Description: Adds automation tracking fields for live review verification

-- Add live check fields to reviews table
ALTER TABLE "reviews"
ADD COLUMN IF NOT EXISTS "last_checked_at" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "check_status" TEXT,
ADD COLUMN IF NOT EXISTS "screenshot_path" TEXT;

-- Add index for check_status filtering
CREATE INDEX IF NOT EXISTS "reviews_check_status_idx" ON "reviews"("check_status");

-- Add comments for documentation
COMMENT ON COLUMN "reviews"."last_checked_at" IS 'Timestamp of last automated live check';
COMMENT ON COLUMN "reviews"."check_status" IS 'Status: LIVE, MISSING, ERROR, CHECKING';
COMMENT ON COLUMN "reviews"."screenshot_path" IS 'Relative path to screenshot (e.g., /screenshots/review-xxx.png)';
