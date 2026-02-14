import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  businessVolume?: number;
  quantity: number;
};

export type CartState = {
  items: Record<string, CartItem>;
  totalQuantity: number;
  totalAmount: number;
};

const initialState: CartState = {
  items: {},
  totalQuantity: 0,
  totalAmount: 0,
};

function recalc(state: CartState) {
  let totalQuantity = 0;
  let totalAmount = 0;

  for (const item of Object.values(state.items)) {
    totalQuantity += item.quantity;
    totalAmount += item.price * item.quantity;
  }

  state.totalQuantity = totalQuantity;
  state.totalAmount = totalAmount;
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (_state, action: PayloadAction<CartState>) => {
      return action.payload;
    },
    addItem: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        price: number;
        businessVolume?: number;
        quantity?: number;
      }>
    ) => {
      const { id, name, price, businessVolume, quantity = 1 } = action.payload;
      const existing = state.items[id];

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items[id] = {
          id,
          name,
          price,
          businessVolume,
          quantity,
        };
      }

      recalc(state);
    },
    removeItem: (state, action: PayloadAction<{ id: string }>) => {
      delete state.items[action.payload.id];
      recalc(state);
    },
    updateQty: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.items[id];
      if (!item) return;

      if (quantity <= 0) {
        delete state.items[id];
      } else {
        item.quantity = quantity;
      }

      recalc(state);
    },
    clearCart: (state) => {
      state.items = {};
      recalc(state);
    },
  },
});

export const { hydrateCart, addItem, removeItem, updateQty, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
