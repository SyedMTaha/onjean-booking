import { auth, db } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: string;
  priceNumeric: number;
  description: string;
  image: string;
  subcategory?: string;
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const MENU_COLLECTION = "menuItems";

function normalizeMenuItem(docId: string, data: Record<string, any>): MenuItem {
  return {
    id: docId,
    ...data,
    available: data.available !== false,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
  } as MenuItem;
}

async function ensureMenuServiceAuth(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (!auth) {
    throw new Error("Firebase auth is not initialized in browser.");
  }

  if (auth.currentUser) {
    return;
  }

  try {
    await signInAnonymously(auth);
  } catch (authError) {
    const errorCode = (authError as { code?: string })?.code;
    throw new Error(`AUTH_ERROR:${errorCode || "unknown"}`);
  }
}

export async function getAllMenuItems(): Promise<MenuItem[]> {
  try {
    await ensureMenuServiceAuth();
    const menuCollection = collection(db, MENU_COLLECTION);
    let snapshot;

    try {
      const q = query(menuCollection, orderBy("category", "asc"), orderBy("priceNumeric", "asc"));
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(menuCollection);
    }

    const items: MenuItem[] = [];
    snapshot.forEach((itemDoc) => items.push(normalizeMenuItem(itemDoc.id, itemDoc.data())));

    items.sort((a, b) => {
      const categorySort = a.category.localeCompare(b.category);
      if (categorySort !== 0) return categorySort;
      return (a.priceNumeric || 0) - (b.priceNumeric || 0);
    });

    return items;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("AUTH_ERROR:")) {
      throw new Error("AUTH_ERROR");
    }

    const firebaseCode = (error as { code?: string } | null)?.code;
    if (firebaseCode === "permission-denied") {
      throw new Error("PERMISSION_DENIED");
    }

    throw error;
  }
}

export async function getAvailableMenuItems(): Promise<MenuItem[]> {
  try {
    await ensureMenuServiceAuth();
    const menuCollection = collection(db, MENU_COLLECTION);
    let snapshot;

    const q = query(menuCollection, where("available", "==", true), orderBy("category", "asc"), orderBy("priceNumeric", "asc"));
    snapshot = await getDocs(q);
    const items: MenuItem[] = [];
    snapshot.forEach((itemDoc) => items.push(normalizeMenuItem(itemDoc.id, itemDoc.data())));

    items.sort((a, b) => {
      const categorySort = a.category.localeCompare(b.category);
      if (categorySort !== 0) return categorySort;
      return (a.priceNumeric || 0) - (b.priceNumeric || 0);
    });

    return items;
  } catch {
    const menuCollection = collection(db, MENU_COLLECTION);
    try {
      const fallbackQuery = query(menuCollection, where("available", "==", true));
      const snapshot = await getDocs(fallbackQuery);

      const items: MenuItem[] = [];
      snapshot.forEach((itemDoc) => items.push(normalizeMenuItem(itemDoc.id, itemDoc.data())));

      items.sort((a, b) => {
        const categorySort = a.category.localeCompare(b.category);
        if (categorySort !== 0) return categorySort;
        return (a.priceNumeric || 0) - (b.priceNumeric || 0);
      });

      return items;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("AUTH_ERROR:")) {
        throw new Error("AUTH_ERROR");
      }

      const firebaseCode = (error as { code?: string } | null)?.code;
      if (firebaseCode === "permission-denied") {
        throw new Error("PERMISSION_DENIED");
      }

      throw error;
    }
  }
}

export async function addMenuItem(
  item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; itemId?: string; error?: string }> {
  try {
    await ensureMenuServiceAuth();
    const menuCollection = collection(db, MENU_COLLECTION);
    const newItemRef = doc(menuCollection);

    await setDoc(newItemRef, {
      ...item,
      available: item.available !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, itemId: newItemRef.id };
  } catch (error) {
    console.error("Error adding menu item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add menu item",
    };
  }
}

export async function updateMenuItem(
  itemId: string,
  updates: Partial<Omit<MenuItem, "id" | "createdAt" | "updatedAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureMenuServiceAuth();
    const itemDoc = doc(db, MENU_COLLECTION, itemId);
    await updateDoc(itemDoc, { ...updates, updatedAt: new Date() });
    return { success: true };
  } catch (error) {
    console.error("Error updating menu item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update menu item",
    };
  }
}

export async function deleteMenuItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureMenuServiceAuth();
    await deleteDoc(doc(db, MENU_COLLECTION, itemId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete menu item",
    };
  }
}

export async function toggleMenuItemAvailability(
  itemId: string,
  available: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateMenuItem(itemId, { available });
}
