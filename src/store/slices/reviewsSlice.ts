/**
 * Reviews Redux Slice
 *
 * Manages review state with real-time checking status updates
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Review {
  id: string;
  reviewText: string | null;
  reviewLiveLink: string | null;
  emailUsed: string | null;
  status: string;
  dueDate: string | null;
  notes: string | null;
  isArchived?: boolean;
  createdAt: string;
  lastCheckedAt?: string | null;
  checkStatus?: string | null;
  screenshotPath?: string | null;
  profile: {
    id: string;
    businessName: string;
    gmbLink: string | null;
    category: string | null;
    client: {
      name: string;
    };
  };
}

interface ReviewsState {
  items: Review[];
  checkingIds: Set<string>; // Reviews currently being checked (optimistic)
  isLoading: boolean;
  isAutoRefreshing: boolean;
}

const initialState: ReviewsState = {
  items: [],
  checkingIds: new Set(),
  isLoading: false,
  isAutoRefreshing: false,
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    // Set all reviews
    setReviews: (state, action: PayloadAction<Review[]>) => {
      console.log("📝 Redux: Setting reviews", action.payload.length);
      state.items = action.payload;

      // Remove from checkingIds if review has final status
      action.payload.forEach((review) => {
        if (
          state.checkingIds.has(review.id) &&
          review.checkStatus &&
          review.checkStatus !== "CHECKING"
        ) {
          console.log(
            `✅ Redux: Review ${review.id} completed with ${review.checkStatus}, removing from checking set`
          );
          state.checkingIds.delete(review.id);
        }
      });
    },

    // Mark reviews as checking (optimistic)
    startCheckingReviews: (state, action: PayloadAction<string[]>) => {
      console.log("🚀 Redux: Starting check for reviews:", action.payload);
      action.payload.forEach((id) => state.checkingIds.add(id));
    },

    // Update single review status from database
    updateReviewStatus: (
      state,
      action: PayloadAction<{ id: string; checkStatus: string; lastCheckedAt?: string }>
    ) => {
      const { id, checkStatus, lastCheckedAt } = action.payload;
      console.log(`🔄 Redux: Updating review ${id} to ${checkStatus}`);

      const review = state.items.find((r) => r.id === id);
      if (review) {
        review.checkStatus = checkStatus;
        if (lastCheckedAt) review.lastCheckedAt = lastCheckedAt;

        // Remove from checking set if final status
        if (checkStatus !== "CHECKING") {
          state.checkingIds.delete(id);
        }
      }
    },

    // Clear all checking statuses
    clearCheckingStatuses: (state) => {
      console.log("🧹 Redux: Clearing all checking statuses");
      state.checkingIds.clear();
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set auto-refresh state
    setAutoRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isAutoRefreshing = action.payload;
    },
  },
});

export const {
  setReviews,
  startCheckingReviews,
  updateReviewStatus,
  clearCheckingStatuses,
  setLoading,
  setAutoRefreshing,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;

// Selectors
export const selectReviews = (state: { reviews: ReviewsState }) => state.reviews.items;
export const selectCheckingIds = (state: { reviews: ReviewsState }) =>
  state.reviews.checkingIds;
export const selectIsLoading = (state: { reviews: ReviewsState }) =>
  state.reviews.isLoading;
export const selectIsAutoRefreshing = (state: { reviews: ReviewsState }) =>
  state.reviews.isAutoRefreshing;

// Helper to check if a review is being checked
export const isReviewChecking = (
  state: { reviews: ReviewsState },
  reviewId: string
): boolean => {
  const review = state.reviews.items.find((r) => r.id === reviewId);
  return (
    review?.checkStatus === "CHECKING" || state.reviews.checkingIds.has(reviewId)
  );
};
