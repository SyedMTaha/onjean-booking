import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type FoodOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
};

export type FoodOrder = {
  userId: string;
  userEmail: string;
  userName: string;
  items: FoodOrderItem[];
  totalPrice: number;
  paymentId: string;
  paymentStatus: string;
  orderStatus: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  createdAt: any;
  updatedAt: any;
};

/**
 * Save a food order to Firestore
 */
export async function saveFoodOrder(
  userId: string,
  userEmail: string,
  userName: string,
  items: FoodOrderItem[],
  totalPrice: number,
  paymentId: string
): Promise<string> {
  // Ensure authentication in browser
  if (typeof window !== "undefined" && auth && !auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous sign-in failed for food order", error);
      throw new Error("Authentication required to place order.");
    }
  }
  try {
    console.log("saveFoodOrder called", { userId, db });
    const orderData: FoodOrder = {
      userId,
      userEmail,
      userName,
      items,
      totalPrice,
      paymentId,
      paymentStatus: "paid",
      orderStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ordersCollection = collection(db, "foodOrders");
    const docRef = await addDoc(ordersCollection, orderData);

    return docRef.id;
  } catch (error) {
    console.error("Error saving food order:", error);
    throw new Error("Failed to save order");
  }
}
