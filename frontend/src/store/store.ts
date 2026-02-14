import { configureStore } from "@reduxjs/toolkit";
import type { Store } from "redux";

import cartReducer, { type CartState } from "@/store/slices/cartSlice";
import userReducer, { type UserState } from "@/store/slices/userSlice";
import serviceReducer, { type ServiceState } from "@/store/slices/serviceSlice";
import categoryReducer, { type CategoryState } from "@/store/slices/categorySlice";

export type RootState = {
  cart: CartState;
  user: UserState;
  service: ServiceState;
  category: CategoryState;
};

export type PreloadedRootState = Partial<RootState>;

export function makeStore(preloadedState?: PreloadedRootState) {
  return configureStore({
    reducer: {
      cart: cartReducer,
      user: userReducer,
      service: serviceReducer,
      category: categoryReducer,
    },
    preloadedState: preloadedState as RootState | undefined,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export type AnyStore = Store<RootState>;
