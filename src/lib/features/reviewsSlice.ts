import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Review {
    id: string;
    reviewText: string | null;
    reviewLiveLink: string | null;
    emailUsed: string | null;
    status: string;
    dueDate: string | null;
    completedAt: string | null;
    notes: string | null;
    createdAt: string;
    checkStatus?: string | null;
    lastCheckedAt?: string | null;
    screenshotPath?: string | null;
    isArchived?: boolean;
    profile: {
        id: string;
        businessName: string;
        gmbLink: string | null;
        category?: string | null;
        client?: {
            name: string;
        };
    };
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ReviewsState {
    items: Review[];
    meta: PaginationMeta | null;
    loading: "idle" | "pending" | "succeeded" | "failed";
    error: string | null;
    checkingIds: string[]; // Reviews currently being checked (optimistic)
    isAutoRefreshing: boolean;
}

const initialState: ReviewsState = {
    items: [],
    meta: null,
    loading: "idle",
    error: null,
    checkingIds: [],
    isAutoRefreshing: false,
};

interface FetchReviewsParams {
    profileId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export const fetchReviews = createAsyncThunk(
    "reviews/fetchReviews",
    async (params: FetchReviewsParams = {}) => {
        const query = new URLSearchParams();
        if (params.profileId) query.set("profileId", params.profileId);
        if (params.status && params.status !== "all") query.set("status", params.status);
        if (params.search) query.set("search", params.search);
        query.set("page", (params.page || 1).toString());
        query.set("limit", (params.limit || 10).toString());

        const res = await fetch(`/api/reviews?${query}`);
        if (!res.ok) {
            throw new Error("Failed to fetch reviews");
        }
        return res.json();
    }
);

interface UpdateStatusPayload {
    reviewId: string;
    status: string;
}

export const updateReviewStatus = createAsyncThunk(
    "reviews/updateStatus",
    async ({ reviewId, status }: UpdateStatusPayload, { rejectWithValue }) => {
        const res = await fetch(`/api/reviews/${reviewId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });

        if (!res.ok) {
            return rejectWithValue("Failed to update status");
        }

        return { reviewId, status };
    }
);

const reviewsSlice = createSlice({
    name: "reviews",
    initialState,
    reducers: {
        optimisticStatusUpdate: (
            state,
            action: PayloadAction<{ reviewId: string; status: string }>
        ) => {
            const review = state.items.find((r) => r.id === action.payload.reviewId);
            if (review) {
                review.status = action.payload.status;
            }
        },
        revertStatusUpdate: (
            state,
            action: PayloadAction<{ reviewId: string; status: string }>
        ) => {
            const review = state.items.find((r) => r.id === action.payload.reviewId);
            if (review) {
                review.status = action.payload.status;
            }
        },
        clearReviews: (state) => {
            state.items = [];
            state.meta = null;
            state.loading = "idle";
            state.error = null;
        },
        // ===== LIVE CHECK ACTIONS =====
        startCheckingReviews: (state, action: PayloadAction<string[]>) => {
            console.log("🚀 Redux: Starting check for reviews:", action.payload);
            state.checkingIds = action.payload;
        },
        updateCheckStatus: (
            state,
            action: PayloadAction<{ id: string; checkStatus: string; lastCheckedAt?: string }>
        ) => {
            const { id, checkStatus, lastCheckedAt } = action.payload;
            console.log(`🔄 Redux: Updating review ${id} to ${checkStatus}`);
            const review = state.items.find((r) => r.id === id);
            if (review) {
                review.checkStatus = checkStatus;
                if (lastCheckedAt) review.lastCheckedAt = lastCheckedAt;
                // Remove from checking list if final status
                if (checkStatus !== "CHECKING") {
                    state.checkingIds = state.checkingIds.filter((rid) => rid !== id);
                }
            }
        },
        clearCheckingStatuses: (state) => {
            console.log("🧹 Redux: Clearing all checking statuses");
            state.checkingIds = [];
        },
        setAutoRefreshing: (state, action: PayloadAction<boolean>) => {
            state.isAutoRefreshing = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.loading = "pending";
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = "succeeded";
                state.items = action.payload.data;
                state.meta = action.payload.meta;

                // CRITICAL: Auto-remove completed reviews from checkingIds
                const updatedCheckingIds: string[] = [];
                state.checkingIds.forEach((reviewId) => {
                    const review = action.payload.data.find((r: Review) => r.id === reviewId);
                    if (review) {
                        // Keep in checkingIds only if still CHECKING or no status yet
                        if (!review.checkStatus || review.checkStatus === "CHECKING") {
                            updatedCheckingIds.push(reviewId);
                            console.log(`🔵 Review ${reviewId} still checking`);
                        } else {
                            console.log(`✅ Review ${reviewId} completed with ${review.checkStatus} - REMOVING from checkingIds`);
                        }
                    }
                });
                state.checkingIds = updatedCheckingIds;
                console.log(`📊 CheckingIds updated: ${updatedCheckingIds.length} still checking`);
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.error.message || "Failed to fetch reviews";
            })
            .addCase(updateReviewStatus.fulfilled, (state, action) => {
                const review = state.items.find((r) => r.id === action.payload.reviewId);
                if (review) {
                    review.status = action.payload.status;
                }
            });
    },
});

export const {
    optimisticStatusUpdate,
    revertStatusUpdate,
    clearReviews,
    startCheckingReviews,
    updateCheckStatus,
    clearCheckingStatuses,
    setAutoRefreshing,
} = reviewsSlice.actions;
export const reviewsReducer = reviewsSlice.reducer;
