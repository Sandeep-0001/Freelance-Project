"use client";

import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { makeStore, type AppStore } from "@/store/store";
import { loadCartFromStorage, setupCartPersistence, loadUserFromStorage, setupUserPersistence } from "@/store/persistence";
import { hydrateCart } from "@/store/slices/cartSlice";
import { setUserProfile } from "@/store/slices/userSlice";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    setupCartPersistence(store);
    setupUserPersistence(store);

    const cart = loadCartFromStorage();
    if (cart) {
      store.dispatch(hydrateCart(cart));
    }

    const user = loadUserFromStorage();
    if (user) {
      store.dispatch(setUserProfile(user.profile));
    }
  }, [store]);

  return (
    <Provider store={store}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Provider>
  );
}
