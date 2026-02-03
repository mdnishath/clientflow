/**
 * Automation Redux Slice
 *
 * Manages live check automation queue state
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  total: number;
  liveCount: number;
  missingCount: number;
  errorCount: number;
  isStopped: boolean;
  progress: number;
}

interface AutomationState {
  stats: QueueStats;
  hasActiveChecks: boolean;
}

const initialState: AutomationState = {
  stats: {
    pending: 0,
    processing: 0,
    completed: 0,
    total: 0,
    liveCount: 0,
    missingCount: 0,
    errorCount: 0,
    isStopped: false,
    progress: 0,
  },
  hasActiveChecks: false,
};

const automationSlice = createSlice({
  name: "automation",
  initialState,
  reducers: {
    setQueueStats: (state, action: PayloadAction<QueueStats>) => {
      state.stats = action.payload;
      state.hasActiveChecks =
        action.payload.processing > 0 || action.payload.pending > 0;
    },
  },
});

export const { setQueueStats } = automationSlice.actions;

export default automationSlice.reducer;

// Selectors
export const selectQueueStats = (state: { automation: AutomationState }) =>
  state.automation.stats;
export const selectHasActiveChecks = (state: { automation: AutomationState }) =>
  state.automation.hasActiveChecks;
