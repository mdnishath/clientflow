/**
 * Redux Store Configuration
 */

import { configureStore } from "@reduxjs/toolkit";
import reviewsReducer from "./slices/reviewsSlice";
import automationReducer from "./slices/automationSlice";

export const store = configureStore({
  reducer: {
    reviews: reviewsReducer,
    automation: automationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allow dates in state
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
