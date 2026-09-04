import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [error, setError] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0 });
      return;
    }
    try {
      const { data } = await api.get("/cart/");
      setCart(data);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1, selectedVariant = {}) => {
    setError(null);
    try {
      const { data } = await api.post("/cart/items/", {
        product: productId,
        quantity,
        selected_variant: selectedVariant,
      });
      setCart(data);
      return true;
    } catch (e) {
      setError(e.response?.data?.detail || "Could not add to cart.");
      return false;
    }
  };

  const updateItem = async (itemId, quantity) => {
    setError(null);
    try {
      const { data } = await api.put(`/cart/items/${itemId}/`, { quantity });
      setCart(data);
      return true;
    } catch (e) {
      setError(e.response?.data?.detail || "Could not update cart.");
      return false;
    }
  };

  const removeItem = async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}/`);
    setCart(data);
  };

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, addToCart, updateItem, removeItem, refreshCart, error, setError }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
