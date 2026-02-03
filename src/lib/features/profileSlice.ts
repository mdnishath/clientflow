import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface GmbProfile {
    id: string;
    businessName: string;
    gmbLink: string | null;
    category: string | null;
    isArchived: boolean;
    client: {
        id: string;
        name: string;
    };
    _count: { reviews: number };
}

export interface ProfileState {
    data: GmbProfile | null;
    loading: "idle" | "pending" | "succeeded" | "failed";
    error: string | null;
}

const initialState: ProfileState = {
    data: null,
    loading: "idle",
    error: null,
};

export const fetchProfile = createAsyncThunk(
    "profile/fetchProfile",
    async (profileId: string) => {
        const res = await fetch(`/api/profiles/${profileId}`);
        if (!res.ok) {
            throw new Error("Profile not found");
        }
        return res.json();
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.data = null;
            state.loading = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = "pending";
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = "succeeded";
                state.data = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = "failed";
                state.error = action.error.message || "Failed to fetch profile";
            });
    },
});

export const { clearProfile } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
