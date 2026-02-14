import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserProfile = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  referralCode?: string;
} & Record<string, unknown>;

export type UserState = {
  profile: UserProfile | null;
};

const initialState: UserState = {
  profile: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    clearUserProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;

export default userSlice.reducer;