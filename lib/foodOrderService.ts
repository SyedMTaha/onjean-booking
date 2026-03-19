import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FoodOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

export interface FoodOrderData {
  // Customer Info
  name: string;
  phone: string;

  // Order Type
  orderType: "dine-in" | "take-away" | "room-service";
  roomNumber?: string;

  // Order Details
  items: FoodOrderItem[];
  specialInstructions?: string;

  // Payment Info
  paymentMethod: "yoco" | "card" | "cash";
  paymentStatus: "succeeded" | "pending" | "failed";
  transactionId?: string;

  // Metadata — set by server, not passed in
  userId: string;
  createdAt: any;
  updatedAt: any;
}

// Everything except server-set fields
export type NewFoodOrderData = Omit<
  FoodOrderData,
  "userId" | "createdAt" | "updatedAt"
>;

// ── Service ────────────────────────────────────────────────────────────────────

/**
 * Save a food order to the Firestore "foodOrders" collection.
 *
 * @param userId    - The authenticated user's UID
 * @param orderData - All order fields except userId, createdAt, updatedAt
 * @returns         - { success, orderId, message } or throws on failure
 */
export async function saveFoodOrder(
  userId: string,
  orderData: NewFoodOrderData
): Promise<{ success: boolean; orderId: string; message: string }> {
  try {
    const orderRef = await addDoc(collection(db, "foodOrders"), {
      ...orderData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("[foodOrderService] Order saved successfully:", orderRef.id);

    return {
      success: true,
      orderId: orderRef.id,
      message: "Food order saved successfully",
    };
  } catch (error) {
    console.error("[foodOrderService] Error saving food order:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to save food order. Please try again."
    );
  }
}