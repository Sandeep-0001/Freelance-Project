import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Service = {
  _id: string;
  name: string;
  slug: string; // SEO + clean URLs
  image: string;
  gallery?: string[];
  price: number;
  originalPrice?: number;
  currency?: "INR" | "USD";
  discountPercent?: number;
  shortDescription?: string;
  description?: string; 
  businessVolume: number;
  status?: "active" | "inactive" | "out_of_stock";
  isFeatured?: boolean;
  categoryId?: string;
  tags?: string[];
  rating?: number;  // Avg rating (0–5)
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ServiceState = {
  services: Service[];
};

const initialState: ServiceState = {
  services: [],
};

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.services = action.payload;
    },
    clearServices: (state) => {
      state.services = [];
    },
  },
});

export const { setServices, clearServices } = serviceSlice.actions;

export default serviceSlice.reducer;
