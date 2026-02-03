import { configureStore } from "@reduxjs/toolkit";
import { reviewsReducer, type ReviewsState } from "@/lib/features/reviewsSlice";
import { profileReducer, type ProfileState } from "@/lib/features/profileSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            reviews: reviewsReducer,
            profile: profileReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

// Explicitly define RootState to ensure TypeScript can infer the types
export interface RootState {
    reviews: ReviewsState;
    profile: ProfileState;
}
