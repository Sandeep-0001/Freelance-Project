import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Category = {
  _id: string;
  code: string;
  name: string;
  slug: string;
  icon?: string;   // SVG URL or icon name for UI
  image?: string;  // Optional banner/thumbnail image
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryState = {
  categories: Category[];
};

const initialState: CategoryState = {
  categories: [],
};

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    clearCategories: (state) => {
      state.categories = [];
    },
  },
});

export const { setCategories, clearCategories } = categorySlice.actions;

export default categorySlice.reducer;
