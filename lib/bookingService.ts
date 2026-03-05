import { db } from "@/lib/firebase";
import type { FirebaseError } from "firebase/app";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export interface BookingData {
  // Dates & Room
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  roomId: number;
  roomPrice: number;
  nights: number;
  guests: string;

  // Guest Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;

  // Payment Info
  cardLast4: string;
  cardholderName: string;

  // Booking Info
  bookingStatus: "pending" | "approved" | "rejected" | "cancelled"; // Default: "pending"
  totalPrice: number;
  taxesAndFees: number;
  bookingReference?: string;

  // Metadata
  userId: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

type NewBookingData = Omit<
  BookingData,
  "userId" | "createdAt" | "updatedAt" | "bookingStatus"
>;

/**
 * Save a booking to Firestore
 * @param userId - The user's UID
 * @param bookingData - Complete booking information
 * @returns Booking reference and ID
 */
export async function saveBooking(userId: string, bookingData: NewBookingData) {
  try {
    const bookingRef = await addDoc(collection(db, "roomBookings"), {
      ...bookingData,
      userId,
      bookingStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      bookingId: bookingRef.id,
      message: "Booking saved successfully",
    };
  } catch (error) {
    console.error("Error saving booking:", error);
    const firebaseError = error as FirebaseError;
    if (firebaseError?.code === "permission-denied") {
      throw new Error("Database permission denied. Update Firestore rules to allow authenticated users to create bookings.");
    }
    if (firebaseError?.code === "unauthenticated") {
      throw new Error("You must be signed in to save a booking.");
    }
    throw new Error(firebaseError?.message || "Failed to save booking. Please try again.");
  }
}

/**
 * Get all bookings for a specific user
 * @param userId - The user's UID
 * @returns Array of booking data
 */
export async function getUserBookings(userId: string) {
  try {
    const q = query(collection(db, "roomBookings"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const bookings: any[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings. Please try again.");
  }
}

/**
 * Get all bookings (admin only)
 * @returns Array of all booking data
 */
export async function getAllBookings() {
  try {
    const querySnapshot = await getDocs(collection(db, "roomBookings"));

    const bookings: any[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    throw new Error("Failed to fetch bookings. Please try again.");
  }
}

/**
 * Update booking status (admin only)
 * @param bookingId - The booking document ID
 * @param status - New status: "approved" | "rejected" | "cancelled"
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "approved" | "rejected" | "cancelled"
) {
  try {
    const bookingRef = doc(db, "roomBookings", bookingId);
    await updateDoc(bookingRef, {
      bookingStatus: status,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Booking status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status. Please try again.");
  }
}

/**
 * Cancel a booking (user can only cancel their own)
 * @param bookingId - The booking document ID
 * @param userId - The user's UID (for verification)
 */
export async function cancelBooking(bookingId: string, userId: string) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    // In a real app, use security rules to verify userId matches
    await updateDoc(bookingRef, {
      bookingStatus: "cancelled",
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Booking cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw new Error("Failed to cancel booking. Please try again.");
  }
}
