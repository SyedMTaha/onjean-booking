import { db } from "@/lib/firebase";
import type { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export interface SpaBookingData {
  serviceName: string;
  duration: string;
  professionalName: string;
  appointmentDate: string;
  appointmentTime: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  totalPrice: number;
  taxesAndFees: number;
  bookingStatus: "pending" | "approved" | "rejected" | "cancelled";
  userId: string;
  createdAt: any;
  updatedAt: any;
}

type NewSpaBookingData = Omit<
  SpaBookingData,
  "userId" | "createdAt" | "updatedAt" | "bookingStatus"
>;

export async function saveSpaBooking(userId: string, bookingData: NewSpaBookingData) {
  try {
    const bookingRef = await addDoc(collection(db, "spaBookings"), {
      ...bookingData,
      userId,
      bookingStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      bookingId: bookingRef.id,
      message: "Spa booking saved successfully",
    };
  } catch (error) {
    console.error("Error saving spa booking:", error);
    const firebaseError = error as FirebaseError;
    if (firebaseError?.code === "permission-denied") {
      throw new Error("Database permission denied. Update Firestore rules to allow authenticated users to create spa bookings.");
    }
    if (firebaseError?.code === "unauthenticated") {
      throw new Error("You must be signed in to save a spa booking.");
    }
    throw new Error(firebaseError?.message || "Failed to save spa booking. Please try again.");
  }
}

export async function getAllSpaBookings() {
  try {
    const querySnapshot = await getDocs(collection(db, "spaBookings"));

    const bookings: any[] = [];
    querySnapshot.forEach((item) => {
      bookings.push({
        id: item.id,
        ...item.data(),
      });
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching all spa bookings:", error);
    throw new Error("Failed to fetch spa bookings. Please try again.");
  }
}

export async function updateSpaBookingStatus(
  bookingId: string,
  status: "approved" | "rejected" | "cancelled"
) {
  try {
    const bookingRef = doc(db, "spaBookings", bookingId);
    await updateDoc(bookingRef, {
      bookingStatus: status,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Spa booking status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating spa booking status:", error);
    throw new Error("Failed to update spa booking status. Please try again.");
  }
}
