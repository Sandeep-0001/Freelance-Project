import type { AnyStore, RootState } from "@/store/store";
import type { CartState } from "@/store/slices/cartSlice";
import type { UserState } from "@/store/slices/userSlice";

const CART_KEY = "refergrow_cart_v1";
const USER_KEY = "refergrow_user_v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function loadCartFromStorage(): CartState | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return undefined;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return undefined;

    const items = isRecord(parsed.items) ? (parsed.items as CartState["items"]) : {};
    const totalQuantity =
      typeof parsed.totalQuantity === "number" ? parsed.totalQuantity : 0;
    const totalAmount =
      typeof parsed.totalAmount === "number" ? parsed.totalAmount : 0;

    return {
      items,
      totalQuantity,
      totalAmount,
    };
  } catch {
    return undefined;
  }
}

export function saveCartToStorage(cart: CartState) {
  if (typeof window === "undefined") return;

  try {
    globalThis.window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}

export function setupCartPersistence(store: AnyStore) {
  if (typeof globalThis.window === "undefined") return;

  let last = "";

  store.subscribe(() => {
    const cart = (store.getState() as RootState).cart;
    const serialized = JSON.stringify(cart);

    if (serialized !== last) {
      last = serialized;
      saveCartToStorage(cart);
    }
  });
}

export function loadUserFromStorage(): UserState | undefined {
  if (typeof globalThis.window === "undefined") return undefined;

  try {
    const raw = globalThis.window.localStorage.getItem(USER_KEY);
    if (!raw) return undefined;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return undefined;

    const profile = parsed.profile;
    
    return {
      profile: (profile && typeof profile === 'object') ? profile as UserState['profile'] : null,
    };
  } catch {
    return undefined;
  }
}

export function saveUserToStorage(user: UserState) {
  if (typeof globalThis.window === "undefined") return;

  try {
    globalThis.window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function setupUserPersistence(store: AnyStore) {
  if (typeof globalThis.window === "undefined") return;

  let last = "";

  store.subscribe(() => {
    const user = (store.getState() as RootState).user;
    const serialized = JSON.stringify(user);

    if (serialized !== last) {
      last = serialized;
      saveUserToStorage(user);
    }
  });
}