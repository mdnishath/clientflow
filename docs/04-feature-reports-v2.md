# Feature: Reports V2 (Advanced Analytics)

**Implemented:** Jan 31, 2026
**Status:** Complete

## Overview
Transformed the Reports page into an interactive Analytics Hub.

## Key Features
1.  **Filters**:
    -   **Date Range**: Custom date picker (using `react-day-picker` + Popover).
    -   **Client Selector**: Filter data by specific client.
    -   **URL State**: Filters update URL search params (`?from=...&to=...&clientId=...`) for shareability.

2.  **Advanced Metrics**:
    -   **Success Rate**: % of reviews that went `LIVE`.
    -   **Top Clients**: Leaderboard of clients with most reviews in the selected period.
    -   **Status Breakout**: Detailed counts of all statuses.

3.  **Technical Implementation**:
    -   **`ReportsFilters.tsx`**: Client component managing URL updates.
    -   **`DateRangePicker.tsx`**: Reusable date UI component.
    -   **`reports/page.tsx`**: Server Component. Fetches data based on `searchParams`. Dynamic aggregation logic based on date range.
