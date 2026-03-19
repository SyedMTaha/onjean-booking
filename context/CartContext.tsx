"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  clearUserCart,
  getUserCartItems,
  removeCartItemByItemId,
  upsertCartItem,
} from "@/lib/cartService";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const isPermissionDeniedError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String((error as { code?: unknown }).code || "") : "";
  return code === "permission-denied" || code.endsWith("/permission-denied");
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  const getUserCartCacheKey = (userId?: string) => userId ? `cart:${userId}` : `cart:guest`;

  const readLocalCart = (userId?: string): CartItem[] => {
    const cached = localStorage.getItem(getUserCartCacheKey(userId));
    if (!cached) return [];
    try {
      return JSON.parse(cached) as CartItem[];
    } catch (error) {
      console.error("Failed to parse cached cart:", error);
      return [];
    }
  };

  const writeLocalCart = (cartItems: CartItem[], userId?: string) => {
    localStorage.setItem(getUserCartCacheKey(userId), JSON.stringify(cartItems));
  };
  const clearLocalCart = (userId?: string) => {
    localStorage.removeItem(getUserCartCacheKey(userId));
  };

  // Load cart from Firestore for signed-in users and keep a per-user local cache fallback.
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        // Anonymous user: load cart from guest localStorage
        setItems(readLocalCart());
        setIsLoaded(true);
        return;
      }
      // Logged-in user: merge guest cart if exists
      const guestCart = readLocalCart();
      const cachedItems = readLocalCart(user.uid);
      let mergedItems = cachedItems;
      if (guestCart.length > 0) {
        // Merge guest cart into user cart (avoid duplicates)
        const ids = new Set(cachedItems.map(i => i.id));
        mergedItems = [...cachedItems, ...guestCart.filter(i => !ids.has(i.id))];
        writeLocalCart(mergedItems, user.uid);
        clearLocalCart(); // Remove guest cart
      }
      try {
        const dbItems = await getUserCartItems(user.uid);
        const mappedDbItems: CartItem[] = dbItems.map((item) => ({
          id: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          description: item.description,
        }));
        if (mappedDbItems.length > 0) {
          setItems(mappedDbItems);
          writeLocalCart(mappedDbItems, user.uid);
        } else if (mergedItems.length > 0) {
          setItems(mergedItems);
          await Promise.all(
            mergedItems.map((item) =>
              upsertCartItem({
                userId: user.uid,
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                description: item.description,
              })
            )
          );
        } else {
          setItems([]);
        }
      } catch (error) {
        if (!isPermissionDeniedError(error)) {
          console.error("Failed to load cart from database:", error);
        }
        setItems(mergedItems);
      }
      setIsLoaded(true);
    };
    loadCart();
  }, [user]);

  // Mirror signed-in cart locally as a fallback cache.
  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      writeLocalCart(items, user.uid);
    } else {
      writeLocalCart(items);
    }
  }, [items, isLoaded, user]);

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      const nextItems = existingItem
        ? prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
          )
        : [...prevItems, { ...item, quantity: item.quantity || 1 }];
      if (user) {
        const nextItem = nextItems.find((i) => i.id === item.id);
        if (nextItem) {
          upsertCartItem({
            userId: user.uid,
            itemId: nextItem.id,
            name: nextItem.name,
            price: nextItem.price,
            quantity: nextItem.quantity,
            image: nextItem.image,
            description: nextItem.description,
          }).catch((error) => {
            console.error("Failed to persist cart item:", error);
          });
        }
      }
      return nextItems;
    });
  };

  const removeFromCart = (id: string) => {
    if (user) {
      removeCartItemByItemId(user.uid, id).catch((error) => {
        console.error("Failed to remove cart item:", error);
      });
    }
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) => {
      const nextItems = prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      if (user) {
        const updated = nextItems.find((item) => item.id === id);
        if (updated) {
          upsertCartItem({
            userId: user.uid,
            itemId: updated.id,
            name: updated.name,
            price: updated.price,
            quantity: updated.quantity,
            image: updated.image,
            description: updated.description,
          }).catch((error) => {
            console.error("Failed to update cart quantity:", error);
          });
        }
      }
      return nextItems;
    });
  };

  const clearCart = () => {
    if (user) {
      clearUserCart(user.uid).catch((error) => {
        console.error("Failed to clear cart:", error);
      });
      clearLocalCart(user.uid);
    } else {
      clearLocalCart();
    }
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
