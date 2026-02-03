# Feature: Analytics Dashboard

**Implemented:** Jan 31, 2026
**Status:** Refactored (Moved to Reports page)

## Overview
Implemented visual analytics to track review performance and status distribution using `recharts`.

## Components
-   **`OverviewChart.tsx`**: Bar chart using Recharts. Shows "Reviews Created" over time (aggregated monthly).
-   **`StatusChart.tsx`**: Donut chart showing breakdown of `LIVE`, `PENDING`, `IN_PROGRESS`, etc.

## Dashboard Integration (v1)
Initially, these charts were placed on the main Dashboard (`/`).
-   Fetches aggregation data server-side in `page.tsx`.
-   Calculates "Last 6 Months" trends.

## Refactor (v2)
-   Moved charts to dedicated `/reports` page to keep the main dashboard clean.
-   The main dashboard now only shows high-level KPI cards (Total Counts, Overdue, etc.).
