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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  const getUserCartCacheKey = (userId: string) => `cart:${userId}`;

  const readLocalCart = (userId: string): CartItem[] => {
    const cached = localStorage.getItem(getUserCartCacheKey(userId));
    if (!cached) return [];

    try {
      return JSON.parse(cached) as CartItem[];
    } catch (error) {
      console.error("Failed to parse cached cart:", error);
      return [];
    }
  };

  const writeLocalCart = (userId: string, cartItems: CartItem[]) => {
    localStorage.setItem(getUserCartCacheKey(userId), JSON.stringify(cartItems));
  };

  // Load cart from Firestore for signed-in users and keep a per-user local cache fallback.
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        // Cart is sign-in only.
        setItems([]);
        setIsLoaded(true);
        return;
      }

      const cachedItems = readLocalCart(user.uid);

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
          writeLocalCart(user.uid, mappedDbItems);
        } else if (cachedItems.length > 0) {
          // Recover from cache when DB is empty, then re-sync in background.
          setItems(cachedItems);
          await Promise.all(
            cachedItems.map((item) =>
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
        console.error("Failed to load cart from database:", error);
        // Preserve UX if DB read fails temporarily.
        setItems(cachedItems);
      }

      setIsLoaded(true);
    };

    loadCart();
  }, [user]);

  // Mirror signed-in cart locally as a fallback cache.
  useEffect(() => {
    if (isLoaded && user) {
      writeLocalCart(user.uid, items);
    }
  }, [items, isLoaded, user]);

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    if (!user) {
      return;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      const nextItems = existingItem
        ? prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
          )
        : [...prevItems, { ...item, quantity: item.quantity || 1 }];

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

      return nextItems;
    });
  };

  const removeFromCart = (id: string) => {
    if (!user) {
      return;
    }

    removeCartItemByItemId(user.uid, id).catch((error) => {
      console.error("Failed to remove cart item:", error);
    });

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

      if (!user) {
        return nextItems;
      }

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

      return nextItems;
    });
  };

  const clearCart = () => {
    if (!user) {
      return;
    }

    clearUserCart(user.uid).catch((error) => {
      console.error("Failed to clear cart:", error);
    });

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
